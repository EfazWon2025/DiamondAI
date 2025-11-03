import React, { useState } from 'react';
import type { Project, ToastMessage, FileTreeNode } from '../types';
import { PLATFORMS } from '../services/platforms';
import { Icon } from './Icon';
import { FileExplorer } from './ide/FileExplorer';
import { BottomPanel } from './ide/BottomPanel';
import { StatusBar } from './ide/StatusBar';
import { AssetPreview } from './ide/AssetPreview';
import { AICodeAssistant } from './ide/AICodeAssistant';
import { VisualBuilder } from './VisualBuilder';
import { CodeEditor } from './ide/CodeEditor';
import { useFileManagement } from '../hooks/useFileManagement';
import { usePanelResizing } from '../hooks/usePanelResizing';
import { useCompilation } from '../hooks/useCompilation';
import { executeBuildCommand } from '../services/api';

const Tab: React.FC<{ name: string; path: string; isActive: boolean; onSelect: (path: string) => void; onClose: ((path: string) => void) | null; icon: React.ReactElement }> = ({ name, path, isActive, onSelect, onClose, icon }) => (
    <div onClick={() => onSelect(path)} className={`flex items-center gap-2 py-2 px-4 text-sm cursor-pointer border-r border-dark ${isActive ? 'bg-darker text-light' : 'bg-dark text-light-text hover:bg-dark/80'}`}>
        {icon}
        <span>{name}</span>
        {onClose && <button onClick={(e) => { e.stopPropagation(); onClose(path); }} className="ml-2 p-0.5 rounded hover:bg-light/20"><Icon name="xCircle" className="w-4 h-4" /></button>}
    </div>
);

interface IdeViewProps {
    project: Project;
    onExit: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => void;
}

const IdeView: React.FC<IdeViewProps> = ({ project, onExit, addToast }) => {
    const { fileTree, fileContents, openFiles, activePath, setActivePath, handleFileSelect, handleCloseFile, handleCodeChange, handleAiApplyChanges, findFileInTree } = useFileManagement(project, addToast);
    const { panelWidths, bottomPanelHeight, handleMouseDownVertical, handleMouseDownHorizontal, ideContainerRef } = usePanelResizing();
    const { compilationStatus, handleCompileProject } = useCompilation(project, addToast);
    
    const [rightPanelTab, setRightPanelTab] = useState<'ai' | 'assets'>('ai');
    const platformConfig = PLATFORMS[project.platform];
    const currentFile = openFiles.find(f => f.path === activePath);

    const handleBlockDrop = (codeSnippet: string) => {
        if (!fileTree) return;
        const targetFileNode = findFileInTree(fileTree, '.java');
        if (!targetFileNode) return addToast("Main Java file not found!", "error");
        
        const currentCode = fileContents[targetFileNode.path] || '';
        const insertionIndex = currentCode.lastIndexOf('}', currentCode.lastIndexOf('}') - 1);
        const snippetWithIndent = codeSnippet.split('\n').map(line => '    ' + line).join('\n');
        const newCode = insertionIndex !== -1
            ? `${currentCode.slice(0, insertionIndex)}${snippetWithIndent}\n${currentCode.slice(insertionIndex)}`
            : `${currentCode}\n${snippetWithIndent}`;

        handleCodeChange(targetFileNode.path, newCode, true); // Instantly save block drops
        addToast(`Code block added to ${targetFileNode.name}!`, 'success');
        setActivePath(targetFileNode.path);
    };

    const handleBuildCommand = async (command: string) => {
        addToast(`Executing task: ${command}...`, 'info');
        try {
            await executeBuildCommand(project.id, command);
            addToast(`Task ${command} started successfully. Check console for output.`, 'success');
        } catch (error) {
            addToast(`Failed to start task: ${command}`, 'error');
        }
    };

    const getBuildCommands = () => project.platform.match(/^(spigot|paper|bukkit)$/)
        ? [{ command: 'test', label: 'Run Tests', iconName: 'playCircle' as const }]
        : [{ command: 'runClient', label: 'Run Client', iconName: 'playCircle' as const }, { command: 'runServer', label: 'Run Server', iconName: 'server' as const }];

    return (
        <div className="h-screen w-screen bg-darker flex flex-col font-sans text-sm">
            <header className="bg-dark flex justify-between items-center px-4 py-2 border-b border-secondary/10 shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <Icon name="diamond" className="w-6 h-6 text-primary" />
                    <div>
                        <h1 className="text-xl font-poppins font-bold">{project.name}</h1>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${platformConfig.color} bg-darker border border-current`}>{platformConfig.displayName} {project.minecraftVersion}</span>
                            <span className="text-xs text-light-text capitalize">{project.template} template</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getBuildCommands().map(({ command, label, iconName }) => (
                        <button key={command} onClick={() => handleBuildCommand(command)} className="flex items-center gap-2 bg-darker text-light-text py-1.5 px-3 rounded-md hover:bg-secondary/20 hover:text-light" disabled={compilationStatus.isCompiling}>
                            <Icon name={iconName} className="w-4 h-4" /> {label}
                        </button>
                    ))}
                     <button onClick={handleCompileProject} className="flex items-center gap-2 bg-primary text-darker font-bold py-1.5 px-3 rounded-md hover:bg-primary/80 disabled:bg-gray-600" disabled={compilationStatus.isCompiling}>
                        <Icon name="hammer" className="w-4 h-4" /> {compilationStatus.isCompiling ? 'Compiling...' : 'Build & Download'}
                    </button>
                </div>
                <button onClick={onExit} className="bg-accent/80 hover:bg-accent text-light py-2 px-4 rounded-lg font-semibold transition-colors duration-300">Exit IDE</button>
            </header>

            <div ref={ideContainerRef} className="flex flex-grow overflow-hidden gpu-accelerate">
                <div style={{ width: `${panelWidths.left}px` }}><FileExplorer project={project} onFileSelect={handleFileSelect} projectStructure={fileTree} addToast={addToast} /></div>
                <div onMouseDown={() => handleMouseDownVertical(0)} className="w-2 cursor-col-resize bg-dark hover:bg-secondary transition-colors" />

                <main className="flex-grow flex flex-col overflow-hidden" style={{ width: `${panelWidths.middle}px` }}>
                    <div className="bg-dark shrink-0 border-b border-secondary/10 flex">
                        {openFiles.map(file => <Tab key={file.path} name={file.name} path={file.path} isActive={activePath === file.path} onSelect={setActivePath} onClose={handleCloseFile} icon={<Icon name="fileCode" className="w-4 h-4 text-secondary" />} />)}
                        <Tab name="Visual Builder" path="visual-builder" isActive={activePath === 'visual-builder'} onSelect={setActivePath} onClose={null} icon={<Icon name="puzzle" className="w-4 h-4 text-primary" />} />
                    </div>
                    <div className="flex-grow overflow-auto relative bg-darker">
                        {activePath === 'visual-builder' ? <VisualBuilder onBlockDrop={handleBlockDrop} /> : currentFile ? <CodeEditor value={fileContents[activePath] || ''} onChange={(newCode) => handleCodeChange(activePath, newCode)} language={currentFile.fileType === 'java' ? 'java' : 'plaintext'} /> : (
                            <div className="h-full flex items-center justify-center text-center text-light-text">
                                <div><Icon name="diamond" className="w-24 h-24 text-secondary/10 mx-auto"/><p className="mt-4">Select a file or the Visual Builder to begin.</p></div>
                            </div>
                        )}
                    </div>
                    <div onMouseDown={handleMouseDownHorizontal} className="w-full h-2 bg-dark border-t border-secondary/10 cursor-row-resize shrink-0" />
                    <BottomPanel height={bottomPanelHeight} projectId={project?.id ?? null} />
                </main>
                
                <div onMouseDown={() => handleMouseDownVertical(1)} className="w-2 cursor-col-resize bg-dark hover:bg-secondary transition-colors" />
                
                <div style={{ width: `${panelWidths.right}px` }} className="flex flex-col">
                    <div className="shrink-0 bg-dark border-b border-secondary/10 flex text-xs font-semibold">
                        <button onClick={() => setRightPanelTab('ai')} className={`py-2 px-4 ${rightPanelTab === 'ai' ? 'text-light bg-darker' : 'text-light-text hover:bg-darker/50'}`}>AI ASSISTANT</button>
                        <button onClick={() => setRightPanelTab('assets')} className={`py-2 px-4 ${rightPanelTab === 'assets' ? 'text-light bg-darker' : 'text-light-text hover:bg-darker/50'}`}>ASSET PREVIEW</button>
                    </div>
                    <div className="flex-grow overflow-auto">
                        {rightPanelTab === 'ai' && <AICodeAssistant project={project} originalCode={fileContents[activePath] || ''} onApplyChanges={(code) => handleAiApplyChanges(activePath, code)} />}
                        {rightPanelTab === 'assets' && <AssetPreview activeFile={currentFile} />}
                    </div>
                </div>
            </div>
            <StatusBar branch="main" />
        </div>
    );
};

export default IdeView;
