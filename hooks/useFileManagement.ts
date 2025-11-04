import { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, FileTreeNode, AIFileModification } from '../types';
import { getProjectFiles, getFileContent, writeFileContent, renameFileOrFolder, deleteFileOrFolder, createFile } from '../services/api';

const useOptimisticTreeUpdate = (initialTree: FileTreeNode | null, addToast: (message: string, type?: 'success' | 'info' | 'error') => void) => {
    const [tree, setTree] = useState<FileTreeNode | null>(initialTree);

    useEffect(() => {
        setTree(initialTree);
    }, [initialTree]);
    
    const traverseAndModify = useCallback((root: FileTreeNode | null, targetPath: string, modifyFn: (node: FileTreeNode) => FileTreeNode | null): FileTreeNode | null => {
        if (!root) return null;
        if (root.path === targetPath) return modifyFn(root);

        if (root.children) {
            const newChildren: FileTreeNode[] = [];
            let modified = false;
            for (const child of root.children) {
                const result = traverseAndModify(child, targetPath, modifyFn);
                if (result !== child) modified = true;
                if (result) newChildren.push(result);
            }
             if (modified) return { ...root, children: newChildren };
        }
        return root;
    }, []);

    const renameNode = useCallback(async (oldPath: string, newPath: string) => {
        const updatePaths = (node: FileTreeNode, oldBasePath: string, newBasePath: string): FileTreeNode => {
            const updatedPath = node.path.replace(oldBasePath, newBasePath);
            const newNode = { ...node, path: updatedPath, name: updatedPath.split('/').pop()! };
            if (newNode.children) {
                newNode.children = newNode.children.map(child => updatePaths(child, oldBasePath, newBasePath));
            }
            return newNode;
        };

        const originalTree = tree;
        setTree(currentTree => traverseAndModify(currentTree, oldPath, (node) => updatePaths(node, oldPath, newPath)));
        try {
            await renameFileOrFolder(originalTree!.path.split('/')[0], oldPath, newPath);
        } catch (e) {
            setTree(originalTree); // Revert on failure
            throw e;
        }
    }, [tree, traverseAndModify]);

    const deleteNode = useCallback(async (path: string) => {
        const originalTree = tree;
        setTree(currentTree => traverseAndModify(currentTree, path, () => null));
        try {
            await deleteFileOrFolder(originalTree!.path.split('/')[0], path);
        } catch (e) {
            setTree(originalTree); // Revert on failure
            throw e;
        }
    }, [tree, traverseAndModify]);

    return { tree, setTree, renameNode, deleteNode };
};


export const useFileManagement = (project: Project, addToast: (message: string, type?: 'success' | 'info' | 'error') => void) => {
    const [initialFileTree, setInitialFileTree] = useState<FileTreeNode | null>(null);
    const { tree: fileTree, setTree: setOptimisticTree } = useOptimisticTreeUpdate(initialFileTree, addToast);
    
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
            setInitialFileTree(tree);
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
    }, [project, findFileInTree, refreshProjectFiles]);

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
        setOpenFiles(prev => prev.filter(f => f.path !== path));
        if (activePath === path) {
            setActivePath(prev => openFiles.length > 1 ? openFiles.filter(f => f.path !== path)[0].path : 'visual-builder');
        }
        setDirtyFiles(prev => {
            const newSet = new Set(prev);
            newSet.delete(path);
            return newSet;
        });
    };

    const saveFile = async (path: string) => {
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
        if (path === 'visual-builder') return;
        
        setFileContents(prev => ({ ...prev, [path]: newCode }));

        if (instantSave) {
            saveFile(path);
        } else {
             setDirtyFiles(prev => new Set(prev).add(path));
        }
    };

    const handleAiApplyMultipleChanges = async (modifications: AIFileModification[]) => {
        try {
            const newContents = { ...fileContents };
            const existingFilePaths = new Set(Object.keys(fileContents));
            
            for (const mod of modifications) {
                if (existingFilePaths.has(mod.path)) {
                    await writeFileContent(project.id, mod.path, mod.content);
                } else {
                    await createFile(project.id, mod.path);
                    await writeFileContent(project.id, mod.path, mod.content);
                }
                newContents[mod.path] = mod.content;
            }
            
            setFileContents(newContents);
            
            // Open newly created/modified files
            modifications.forEach(mod => {
                 if (fileTree) {
                    const findNode = (node: FileTreeNode, path: string): FileTreeNode | null => {
                        if (node.path === path) return node;
                        if (node.children) {
                            for(const child of node.children) {
                                const found = findNode(child, path);
                                if (found) return found;
                            }
                        }
                        return null;
                    };
                    const node = findNode(fileTree, mod.path);
                    if (node && node.type === 'file' && !openFiles.some(f => f.path === node.path)) {
                        setOpenFiles(prev => [...prev, node]);
                    }
                 }
            });

            if (modifications.length > 0) {
                 setActivePath(modifications[modifications.length - 1].path);
            }
            
            setDirtyFiles(new Set()); // All files are saved
            await refreshProjectFiles(); // Refresh tree to show new files
            addToast("AI changes applied successfully!", "success");

        } catch (error) {
             addToast(error instanceof Error ? error.message : "Failed to apply AI changes.", "error");
        }
    };

    const { renameNode, deleteNode } = useOptimisticTreeUpdate(initialFileTree, addToast);

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
        findFileInTree,
        saveFile,
        renameNode,
        deleteNode,
    };
};