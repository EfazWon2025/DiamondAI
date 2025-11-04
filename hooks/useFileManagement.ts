import { useState, useEffect, useCallback } from 'react';
import type { Project, FileTreeNode, AIFileModification } from '../types';
import { getProjectFiles, getFileContent, writeFileContent, renameFileOrFolder, deleteFileOrFolder, createFile } from '../services/api.ts';

export const useFileManagement = (project: Project, addToast: (message: string, type?: 'success' | 'info' | 'error') => void) => {
    const [fileTree, setFileTree] = useState<FileTreeNode | null>(null);
    const [fileContents, setFileContents] = useState<Record<string, string>>({});
    const [openFiles, setOpenFiles] = useState<FileTreeNode[]>([]);
    const [activePath, setActivePath] = useState<string>('');
    const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
    
    const findFileInTree = useCallback((node: FileTreeNode, fileExtension: string): FileTreeNode | null => {
        if (node.type === 'file' && node.name.endsWith(fileExtension)) return node;
        if (node.children) {
            for (const child of node.children) {
                const found = findFileInTree(child, fileExtension);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const refreshProjectFiles = useCallback(async () => {
        try {
            const tree = await getProjectFiles(project.id);
            setFileTree(tree);
            return tree;
        } catch {
            addToast('Failed to load project files.', 'error');
            return null;
        }
    }, [project.id, addToast]);


    useEffect(() => {
        refreshProjectFiles().then(tree => {
             if (tree) {
                const mainJavaFile = findFileInTree(tree, '.java');
                if (mainJavaFile) handleFileSelect(mainJavaFile);
            }
        });
    }, [project.id]); // Dependency simplified to prevent re-running on every function change

    const handleFileSelect = async (file: FileTreeNode) => {
        if (file.type !== 'file') return;
        
        if (!openFiles.some(f => f.path === file.path)) setOpenFiles(prev => [...prev, file]);
        setActivePath(file.path);

        if (fileContents[file.path] === undefined) {
            try {
                const content = await getFileContent(project.id, file.path);
                setFileContents(prev => ({ ...prev, [file.path]: content }));
            } catch {
                addToast(`Failed to load ${file.name}`, 'error');
            }
        }
    };

    const handleCloseFile = (path: string) => {
        const remainingFiles = openFiles.filter(f => f.path !== path);
        setOpenFiles(remainingFiles);
        
        if (activePath === path) {
            setActivePath(remainingFiles.length > 0 ? remainingFiles[0].path : 'visual-builder');
        }

        if (dirtyFiles.has(path)) {
            if (window.confirm("You have unsaved changes. Are you sure you want to close this file and discard them?")) {
                 setDirtyFiles(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(path);
                    return newSet;
                });
            } else {
                // If user cancels, add the file back to open files
                setOpenFiles(prev => [...prev, openFiles.find(f => f.path === path)!]);
                return;
            }
        }
    };

    const saveFile = async (path: string) => {
        if (!dirtyFiles.has(path)) return;
        try {
            await writeFileContent(project.id, path, fileContents[path]);
            setDirtyFiles(prev => {
                const newSet = new Set(prev);
                newSet.delete(path);
                return newSet;
            });
            addToast(`${path.split('/').pop()} saved.`, 'success');
        } catch {
            addToast(`Failed to save ${path.split('/').pop()}`, 'error');
        }
    };

    const handleCodeChange = (path: string, newCode: string, instantSave = false) => {
        if (path === 'visual-builder' || fileContents[path] === newCode) return;
        
        setFileContents(prev => ({ ...prev, [path]: newCode }));

        if (instantSave) {
            saveFile(path);
        } else {
             setDirtyFiles(prev => new Set(prev).add(path));
        }
    };

    const getAllPaths = (node: FileTreeNode): string[] => {
        let paths = [node.path];
        if (node.children) {
            for (const child of node.children) {
                paths = paths.concat(getAllPaths(child));
            }
        }
        return paths;
    };

    const handleAiApplyMultipleChanges = async (modifications: AIFileModification[]) => {
        try {
            const newContentsUpdate = { ...fileContents };

            // Step 1: Apply all file modifications (create or update)
            for (const mod of modifications) {
                // Note: We don't need to check if the file exists here. The backend `createFile`
                // should handle it, but for the local simulation, `writeFileContent` is sufficient
                // as long as we refresh the tree from the source of truth afterward.
                await writeFileContent(project.id, mod.path, mod.content);
                newContentsUpdate[mod.path] = mod.content;
            }
            
            setFileContents(newContentsUpdate);
            setDirtyFiles(new Set());

            // Step 2: Refresh the entire file tree to get the latest structure. This is the crucial step.
            const newTree = await refreshProjectFiles();
            if (!newTree) throw new Error("Failed to refresh file tree after applying AI changes.");

            // Step 3: Open the modified/created files in tabs using the new, correct tree
            const findNodeByPath = (node: FileTreeNode, path: string): FileTreeNode | null => {
                if (node.path === path) return node;
                if (node.children) {
                    for (const child of node.children) {
                        const found = findNodeByPath(child, path);
                        if (found) return found;
                    }
                }
                return null;
            };

            const filesToOpen: FileTreeNode[] = [];
            for (const mod of modifications) {
                const node = findNodeByPath(newTree, mod.path);
                if (node && node.type === 'file') filesToOpen.push(node);
                else { // If the node is not found, it means it's a new file. We need to create it in the UI temporarily until the next full refresh if needed.
                    await createFile(project.id, mod.path); // Ensure backend has it
                }
            }
             
            // Re-refresh after explicit creations, just in case. This is robust.
            const finalTree = await refreshProjectFiles();
            if(!finalTree) return;

            setOpenFiles(prevOpenFiles => {
                const openFilePaths = new Set(prevOpenFiles.map(f => f.path));
                const newFilesToAdd = modifications
                    .map(mod => findNodeByPath(finalTree, mod.path))
                    .filter((node): node is FileTreeNode => node !== null && !openFilePaths.has(node.path));
                return [...prevOpenFiles, ...newFilesToAdd];
            });
            
            if (modifications.length > 0) setActivePath(modifications[modifications.length - 1].path);
            
            addToast("AI changes applied successfully!", "success");
        } catch (error) {
             addToast(error instanceof Error ? error.message : "Failed to apply AI changes.", "error");
        }
    };
    
    const handleAiRestoreChanges = (filesToRestore: Record<string, string>) => {
        setFileContents(prev => ({ ...prev, ...filesToRestore }));
        setDirtyFiles(prev => {
            const newSet = new Set(prev);
            Object.keys(filesToRestore).forEach(path => newSet.add(path));
            return newSet;
        });
    };

    const traverseAndModify = useCallback((root: FileTreeNode | null, targetPath: string, modifyFn: (node: FileTreeNode) => FileTreeNode | null): FileTreeNode | null => {
        if (!root) return null;
        if (root.path === targetPath) return modifyFn(root);
        if (root.children) {
            const newChildren: FileTreeNode[] = [];
            let hasChanged = false;
            for (const child of root.children) {
                const result = traverseAndModify(child, targetPath, modifyFn);
                if (result !== child) hasChanged = true;
                if (result) newChildren.push(result);
            }
            if (hasChanged) return { ...root, children: newChildren };
        }
        return root;
    }, []);

    const renameNode = useCallback(async (oldPath: string, newPath: string) => {
        const originalTree = fileTree;
        const updatePaths = (node: FileTreeNode, oldBasePath: string, newBasePath: string): FileTreeNode => {
            const updatedPath = node.path.replace(oldBasePath, newBasePath);
            const newNode = { ...node, path: updatedPath, name: updatedPath.split('/').pop()! };
            if (newNode.children) {
                newNode.children = newNode.children.map(child => updatePaths(child, oldBasePath, newBasePath));
            }
            return newNode;
        };
        
        setFileTree(currentTree => traverseAndModify(currentTree, oldPath, (node) => updatePaths(node, oldPath, newPath)));
        
        try {
            const { success, newFileContents } = await renameFileOrFolder(project.id, oldPath, newPath);
            if (success) {
                await refreshProjectFiles(); // Refresh from source of truth after successful rename
                setFileContents(prev => {
                    const updatedContents = { ...prev };
                    Object.keys(newFileContents).forEach(path => {
                        updatedContents[path] = newFileContents[path];
                    });
                    return updatedContents;
                });
            } else throw new Error("API rename failed.");
        } catch (e) {
            setFileTree(originalTree);
            addToast('Failed to rename item.', 'error');
            throw e;
        }
    }, [fileTree, project.id, addToast, traverseAndModify, refreshProjectFiles]);

    const deleteNode = useCallback(async (path: string) => {
        const originalTree = fileTree;
        
        setFileTree(currentTree => traverseAndModify(currentTree, path, () => null));

        try {
            const { success } = await deleteFileOrFolder(project.id, path);
            if (success) {
                await refreshProjectFiles(); // Refresh from source of truth
            } else throw new Error("API delete failed.");
        } catch (e) {
            setFileTree(originalTree);
            addToast('Failed to delete item.', 'error');
            throw e;
        }
    }, [fileTree, project.id, addToast, traverseAndModify, refreshProjectFiles]);


    return {
        fileTree,
        fileContents,
        openFiles,
        activePath,
        dirtyFiles,
        setActivePath,
        handleFileSelect,
        handleCloseFile,
        handleCodeChange,
        handleAiApplyMultipleChanges,
        handleAiRestoreChanges,
        findFileInTree,
        saveFile,
        renameNode,
        deleteNode,
    };
};
