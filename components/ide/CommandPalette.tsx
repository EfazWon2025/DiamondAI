import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { FileTreeNode } from '../../types';
import { Icon } from '../Icon.tsx';

interface CommandPaletteProps {
    fileTree: FileTreeNode | null;
    onFileSelect: (file: FileTreeNode) => void;
    onClose: () => void;
}

const getFileIconName = (fileType?: FileTreeNode['fileType']) => {
    switch (fileType) {
        case 'java': return 'java';
        case 'json': return 'json';
        case 'png': return 'png';
        case 'gradle': return 'gradle';
        default: return 'fileCode';
    }
};

const flattenFileTree = (node: FileTreeNode): FileTreeNode[] => {
    const files: FileTreeNode[] = [];
    if (node.type === 'file') {
        files.push(node);
    }
    if (node.children) {
        for (const child of node.children) {
            files.push(...flattenFileTree(child));
        }
    }
    return files;
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ fileTree, onFileSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const allFiles = useMemo(() => (fileTree ? flattenFileTree(fileTree) : []), [fileTree]);

    const filteredFiles = useMemo(() => {
        if (!searchTerm) return allFiles;
        return allFiles.filter(file => file.path.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allFiles, searchTerm]);

    useEffect(() => {
        inputRef.current?.focus();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowDown') {
                setActiveIndex(prev => Math.min(prev + 1, filteredFiles.length - 1));
            }
            if (e.key === 'ArrowUp') {
                setActiveIndex(prev => Math.max(prev - 1, 0));
            }
            if (e.key === 'Enter' && filteredFiles[activeIndex]) {
                onFileSelect(filteredFiles[activeIndex]);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredFiles, activeIndex, onClose, onFileSelect]);
    
    useEffect(() => {
        setActiveIndex(0);
    }, [searchTerm]);

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex justify-center pt-24" onClick={onClose}>
            <div className="bg-dark rounded-lg w-full max-w-2xl h-fit max-h-[70vh] flex flex-col shadow-2xl shadow-primary/20 border border-secondary/20 animate-[fadeInUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
                <div className="p-3 border-b border-secondary/10 flex items-center gap-2">
                    <Icon name="search" className="w-5 h-5 text-light-text" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search for a file..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-light outline-none"
                    />
                </div>
                <ul className="overflow-y-auto">
                    {filteredFiles.map((file, index) => (
                        <li
                            key={file.path}
                            onClick={() => onFileSelect(file)}
                            className={`flex items-center gap-3 p-3 border-b border-secondary/10 cursor-pointer ${activeIndex === index ? 'bg-secondary/20' : 'hover:bg-secondary/10'}`}
                        >
                            <Icon name={getFileIconName(file.fileType)} className="w-5 h-5 text-secondary flex-shrink-0" />
                            <div className="truncate">
                                <span className="text-light font-semibold">{file.name}</span>
                                <p className="text-xs text-light-text truncate">{file.path.replace(fileTree?.name + '/', '')}</p>
                            </div>
                        </li>
                    ))}
                     {filteredFiles.length === 0 && (
                        <li className="text-center p-8 text-light-text">No files found.</li>
                     )}
                </ul>
            </div>
        </div>
    );
};