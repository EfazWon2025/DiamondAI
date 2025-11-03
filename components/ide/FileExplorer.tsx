import React, { useState, useEffect, useRef } from 'react';
import type { FileTreeNode, Project } from '../../types';
import { createFile, createFolder } from '../../services/api';
import { Icon, IconName } from '../Icon';

const getFileIcon = (fileType?: FileTreeNode['fileType']): { name: IconName; color: string } => {
    switch (fileType) {
        case 'java': return { name: 'java', color: 'text-orange-400' };
        case 'json': return { name: 'json', color: 'text-yellow-400' };
        case 'png': return { name: 'png', color: 'text-blue-400' };
        case 'gradle': return { name: 'gradle', color: 'text-green-400' };
        case 'toml':
        case 'properties':
             return { name: 'fileCode', color: 'text-purple-400' };
        default: return { name: 'fileCode', color: 'text-light-text' };
    }
};

const ContextMenu: React.FC<{ x: number; y: number; node: FileTreeNode; onClose: () => void; onAction: (action: 'newFile' | 'newFolder', node: FileTreeNode) => void; }> = ({ x, y, node, onClose, onAction }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} style={{ top: y, left: x }} className="fixed bg-dark border border-secondary/20 rounded-md shadow-lg z-50 text-sm py-1">
            {node.type === 'folder' && (
                <>
                    <button onClick={() => onAction('newFile', node)} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-secondary/20">
                        <Icon name="filePlus" className="w-4 h-4" /> New File
                    </button>
                    <button onClick={() => onAction('newFolder', node)} className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-secondary/20">
                        <Icon name="folderPlus" className="w-4 h-4" /> New Folder
                    </button>
                </>
            )}
        </div>
    );
};

const NewItemInput: React.FC<{ type: 'file' | 'folder'; level: number; onSubmit: (name: string) => void; onCancel: () => void; }> = ({ type, level, onSubmit, onCancel }) => {
    const [name, setName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) onSubmit(name.trim());
    };
    
    const { name: iconName, color } = getFileIcon();

    return (
        <form onSubmit={handleSubmit} style={{ paddingLeft: `${level * 16 + 8}px` }} className="py-1">
            <div className="flex items-center">
                <div className="w-4 mr-1"></div>
                {type === 'folder' ? <Icon name="folder" className="w-4 h-4 mr-1 text-secondary" /> : <Icon name={iconName} className={`w-4 h-4 mr-1 ${color}`} />}
                <input ref={inputRef} type="text" value={name} onChange={(e) => setName(e.target.value)} onBlur={onCancel} onKeyDown={(e) => e.key === 'Escape' && onCancel()} className="bg-darker text-light outline-none border border-primary rounded-sm px-1 w-full" />
            </div>
        </form>
    );
};

const FileTreeRecursive: React.FC<{ node: FileTreeNode; onFileSelect: (node: FileTreeNode) => void; level: number; onContextMenu: (e: React.MouseEvent, node: FileTreeNode) => void; creating: { parentPath: string; type: 'file' | 'folder'; } | null; handleCreateNode: (name: string) => void; cancelCreate: () => void; }> = ({ node, onFileSelect, level, onContextMenu, creating, handleCreateNode, cancelCreate }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isFolder = node.type === 'folder';
    const { name: iconName, color } = getFileIcon(node.fileType);

    return (
        <div>
            <div onClick={isFolder ? () => setIsOpen(!isOpen) : () => onFileSelect(node)} onContextMenu={(e) => onContextMenu(e, node)} className="flex items-center py-1 px-2 rounded-md hover:bg-secondary/10 cursor-pointer" style={{ paddingLeft: `${level * 16 + 8}px` }}>
                {isFolder ? <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} className="w-4 h-4 mr-1 shrink-0" /> : <div className="w-4 mr-1"></div>}
                {isFolder ? <Icon name={isOpen ? 'folderOpen' : 'folder'} className="w-4 h-4 mr-1 text-secondary" /> : <Icon name={iconName} className={`w-4 h-4 mr-1 ${color}`} />}
                <span className="truncate">{node.name}</span>
            </div>
            {isFolder && isOpen && (
                <div>
                    {node.children?.map(child => <FileTreeRecursive key={child.path} {...{ node: child, onFileSelect, level: level + 1, onContextMenu, creating, handleCreateNode, cancelCreate }} />)}
                    {creating && creating.parentPath === node.path && (<NewItemInput type={creating.type} level={level + 1} onSubmit={handleCreateNode} onCancel={cancelCreate} />)}
                </div>
            )}
        </div>
    );
};

interface FileExplorerProps {
    project: Project;
    onFileSelect: (node: FileTreeNode) => void;
    projectStructure: FileTreeNode | null;
    addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ project, onFileSelect, projectStructure, addToast }) => {
    const [localTree, setLocalTree] = useState<FileTreeNode | null>(projectStructure);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileTreeNode } | null>(null);
    const [creating, setCreating] = useState<{ parentPath: string; type: 'file' | 'folder' } | null>(null);

    useEffect(() => { setLocalTree(projectStructure); }, [projectStructure]);

    const handleContextMenu = (e: React.MouseEvent, node: FileTreeNode) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.pageX, y: e.pageY, node });
    };

    const handleContextMenuAction = (action: 'newFile' | 'newFolder', node: FileTreeNode) => {
        setContextMenu(null);
        setCreating({ parentPath: node.path, type: action === 'newFile' ? 'file' : 'folder' });
    };

    const handleCreateNode = async (name: string) => {
        if (!creating || !localTree) return;
        const { parentPath, type } = creating;
        const fullPath = `${parentPath}/${name}`;
        
        const addNodeToTree = (root: FileTreeNode, parentPath: string, newNode: FileTreeNode): FileTreeNode => {
            if (root.path === parentPath) {
                const newChildren = [...(root.children || []), newNode].sort((a, b) => (a.type !== b.type) ? (a.type === 'folder' ? -1 : 1) : a.name.localeCompare(b.name));
                return { ...root, children: newChildren };
            }
            if (root.children) return { ...root, children: root.children.map(child => addNodeToTree(child, parentPath, newNode)) };
            return root;
        };

        try {
            const { success, newNode } = type === 'file' ? await createFile(project.id, fullPath) : await createFolder(project.id, fullPath);
            if (success && newNode) {
                setLocalTree(prevTree => addNodeToTree(prevTree!, parentPath, newNode));
                addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} '${name}' created.`, 'success');
            }
        } catch (error) {
            addToast('Failed to create item.', 'error');
        } finally {
            setCreating(null);
        }
    };

    return (
        <aside className="w-full h-full bg-dark flex flex-col shrink-0 border-r border-secondary/10">
            <div className="p-3 border-b border-secondary/10"><h2 className="text-xs font-bold uppercase tracking-wider text-light-text">Explorer</h2></div>
            <div className="flex-grow p-2 overflow-y-auto">
                 {localTree ? <FileTreeRecursive node={localTree} onFileSelect={onFileSelect} level={0} onContextMenu={handleContextMenu} creating={creating} handleCreateNode={handleCreateNode} cancelCreate={() => setCreating(null)} /> : <p className="p-2 text-sm text-light-text">Loading project...</p>}
            </div>
            {contextMenu && <ContextMenu {...contextMenu} onClose={() => setContextMenu(null)} onAction={handleContextMenuAction} />}
        </aside>
    );
};
