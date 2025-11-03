import React, { useState } from 'react';
import type { FileTreeNode } from '../../types';
import { ChevronDownIcon, ChevronRightIcon, FolderIcon, FolderOpenIcon, JavaIcon, JsonIcon, PngIcon, GradleIcon, FileCodeIcon } from '../icons/IdeIcons';

const getFileIcon = (fileType?: FileTreeNode['fileType']) => {
    switch (fileType) {
        case 'java': return <JavaIcon className="w-4 h-4 text-orange-400" />;
        case 'json': return <JsonIcon className="w-4 h-4 text-yellow-400" />;
        case 'png': return <PngIcon className="w-4 h-4 text-blue-400" />;
        case 'gradle': return <GradleIcon className="w-4 h-4 text-green-400" />;
        case 'toml':
        case 'properties':
             return <FileCodeIcon className="w-4 h-4 text-purple-400" />;
        default: return <FileCodeIcon className="w-4 h-4 text-light-text" />;
    }
};

const FileTree: React.FC<{ node: FileTreeNode; onFileSelect: (node: FileTreeNode) => void; level: number }> = ({ node, onFileSelect, level }) => {
    const [isOpen, setIsOpen] = useState(true);

    const handleToggle = () => {
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        }
    };

    const isFolder = node.type === 'folder';

    return (
        <div>
            <div
                onClick={isFolder ? handleToggle : () => onFileSelect(node)}
                className="flex items-center py-1 px-2 rounded-md hover:bg-secondary/10 cursor-pointer"
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                {isFolder ? (
                    isOpen ? 
                        <ChevronDownIcon className="w-4 h-4 mr-1 flex-shrink-0" /> : 
                        <ChevronRightIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                ) : (
                    <div className="w-4 mr-1"></div>
                )}
                
                {isFolder ? (
                    isOpen ? 
                        <FolderOpenIcon className="w-4 h-4 mr-1 text-secondary" /> : 
                        <FolderIcon className="w-4 h-4 mr-1 text-secondary" />
                ) : (
                    <div className="w-4 h-4 mr-1 flex items-center justify-center">{getFileIcon(node.fileType)}</div>
                )}

                <span className="truncate">{node.name}</span>
            </div>
            {isFolder && isOpen && node.children && (
                <div>
                    {node.children.map(child => <FileTree key={child.path} node={child} onFileSelect={onFileSelect} level={level + 1} />)}
                </div>
            )}
        </div>
    );
};


interface FileExplorerProps {
    onFileSelect: (node: FileTreeNode) => void;
    projectStructure: FileTreeNode | null;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect, projectStructure }) => {
    return (
        <aside className="w-full h-full bg-dark flex flex-col flex-shrink-0 border-r border-secondary/10">
            <div className="p-3 border-b border-secondary/10">
                <h2 className="text-xs font-bold uppercase tracking-wider text-light-text">Explorer</h2>
            </div>
            <div className="flex-grow p-2 overflow-y-auto">
                 {projectStructure ? (
                    <FileTree node={projectStructure} onFileSelect={onFileSelect} level={0} />
                ) : (
                    <p className="p-2 text-sm text-light-text">Loading project...</p>
                )}
            </div>
        </aside>
    );
};