import { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, FileTreeNode } from '../types';
import { getProjectFiles, getFileContent, writeFileContent } from '../services/api';

export const useFileManagement = (project: Project, addToast: (message: string, type?: 'success' | 'info' | 'error') => void) => {
    const [fileTree, setFileTree] = useState<FileTreeNode | null>(null);
    const [fileContents, setFileContents] = useState<Record<string, string>>({});
    const [openFiles, setOpenFiles] = useState<FileTreeNode[]>([]);
    const [activePath, setActivePath] = useState<string>('');
    const saveTimeoutRef = useRef<number | null>(null);

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

    useEffect(() => {
        getProjectFiles(project.id).then(tree => {
            setFileTree(tree);
            const mainJavaFile = findFileInTree(tree, '.java');
            if (mainJavaFile) handleFileSelect(mainJavaFile);
        }).catch(() => addToast('Failed to load project files.', 'error'));
    }, [project, findFileInTree]);

    const handleFileSelect = async (file: FileTreeNode) => {
        if (file.type !== 'file') return;
        
        if (!openFiles.some(f => f.path === file.path)) setOpenFiles(prev => [...prev, file]);
        setActivePath(file.path);

        if (!fileContents[file.path]) {
            try {
                const content = await getFileContent(project.id, file.path);
                setFileContents(prev => ({ ...prev, [file.path]: content }));
            } catch {
                addToast(`Failed to load ${file.name}`, 'error');
            }
        }
    };

    const handleCloseFile = (path: string) => {
        const newOpenFiles = openFiles.filter(f => f.path !== path);
        setOpenFiles(newOpenFiles);
        if (activePath === path) {
            // FIX: Replaced .at(-1) with standard array access for wider compatibility.
            setActivePath(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1]!.path : 'visual-builder');
        }
    };

    const handleCodeChange = (path: string, newCode: string, instantSave = false) => {
        if (path === 'visual-builder') return;
        
        setFileContents(prev => ({ ...prev, [path]: newCode }));
        
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        
        if (instantSave) {
            writeFileContent(project.id, path, newCode).catch(() => addToast("Failed to save changes.", "error"));
        } else {
            saveTimeoutRef.current = window.setTimeout(() => {
                writeFileContent(project.id, path, newCode);
            }, 1000);
        }
    };

    const handleAiApplyChanges = (path: string, newCode: string) => {
        if (path !== 'visual-builder' && path !== '') {
            handleCodeChange(path, newCode, true);
            addToast("AI changes applied and saved.", "success");
        } else {
            addToast("No active file to apply changes to.", "error");
        }
    };

    return {
        fileTree,
        fileContents,
        openFiles,
        activePath,
        setActivePath,
        handleFileSelect,
        handleCloseFile,
        handleCodeChange,
        handleAiApplyChanges,
        findFileInTree
    };
};