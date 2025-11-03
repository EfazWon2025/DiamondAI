import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Project, ToastMessage, FileTreeNode, AIHistoryItem, BuildResult, MinecraftPlatform } from '../types';
import { generatePluginCode } from '../services/geminiService';
import { getProjectFiles, getFileContent, writeFileContent, executeBuildCommand, compileProject, downloadBuild } from '../services/api';
import { PLATFORMS } from '../services/platforms';
import { DiamondIcon } from './icons/DiamondIcon';
import { FileExplorer } from './ide/FileExplorer';
import { BottomPanel } from './ide/BottomPanel';
import { StatusBar } from './ide/StatusBar';
import { AssetPreview } from './ide/AssetPreview';
import { XCircleIcon, PlayCircleIcon, ServerIcon, HammerIcon, BoltIcon, FileCodeIcon, PuzzleIcon } from './icons/IdeIcons';
import { AiAssistant } from './ide/AiAssistant';
import { VisualBuilder } from './VisualBuilder';

const CodeEditor: React.FC<{
    content: string;
    breakpoints: number[];
    onToggleBreakpoint: (line: number) => void;
    activeLine: number;
    autocomplete: { show: boolean, x: number, y: number, suggestions: string[] } | null;
    highlightFn: (text: string) => string;
}> = ({ content, breakpoints, onToggleBreakpoint, activeLine, autocomplete, highlightFn }) => {
    return (
        <div className="relative h-full font-mono text-sm bg-darker overflow-auto">
            {autocomplete?.show && (
                <div className="absolute z-30 bg-dark border border-secondary/50 rounded-md shadow-lg" style={{ top: autocomplete.y, left: autocomplete.x }}>
                    <ul className="py-1">
                        {autocomplete.suggestions.map(sugg => (
                            <li key={sugg} className="px-3 py-1 text-xs hover:bg-secondary/20 cursor-pointer">{sugg}</li>
                        ))}
                    </ul>
                </div>
            )}
            {content.split('\n').map((line, i) => (
                <div key={i} className={`flex ${activeLine === i + 1 ? 'bg-secondary/10' : ''}`}>
                    <div className="w-12 text-right pr-2 text-light-text/30 select-none flex items-center justify-end">
                        <span className="mr-2">{i + 1}</span>
                         <div 
                            className="w-4 h-4 flex items-center justify-center cursor-pointer"
                            onClick={() => onToggleBreakpoint(i + 1)}
                        >
                            {breakpoints.includes(i + 1) && <div className="w-2 h-2 rounded-full bg-accent"></div>}
                        </div>
                    </div>
                    <code className="flex-1 whitespace-pre" dangerouslySetInnerHTML={{ __html: highlightFn(line) || ' ' }} />
                </div>
            ))}
        </div>
    );
};

const Tab: React.FC<{ name: string; path: string; isActive: boolean; onSelect: (path: string) => void; onClose: ((path: string) => void) | null; icon: React.ReactElement }> = ({ name, path, isActive, onSelect, onClose, icon }) => {
    return (
        <div
            onClick={() => onSelect(path)}
            className={`flex items-center gap-2 py-2 px-4 text-sm cursor-pointer border-r border-dark ${isActive ? 'bg-darker text-light' : 'bg-dark text-light-text hover:bg-dark/80'}`}
        >
            {icon}
            <span>{name}</span>
            {onClose && <button
                onClick={(e) => { e.stopPropagation(); onClose(path); }}
                className="ml-2 p-0.5 rounded hover:bg-light/20"
            >
                <XCircleIcon className="w-4 h-4" />
            </button>}
        </div>
    );
};

interface IdeViewProps {
    project: Project;
    onExit: () => void;
    addToast: (message: string, type?: ToastMessage['type']) => void;
}

export const IdeView: React.FC<IdeViewProps> = ({ project, onExit, addToast }) => {
    const [fileTree, setFileTree] = useState<FileTreeNode | null>(null);
    const [fileContents, setFileContents] = useState<Record<string, string>>({});
    const [openFiles, setOpenFiles] = useState<FileTreeNode[]>([]);
    const [activePath, setActivePath] = useState<string>('');
    const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
    const [activeLine, setActiveLine] = useState(1);
    const [breakpoints, setBreakpoints] = useState<number[]>([]);
    const [autocomplete, setAutocomplete] = useState<{ show: boolean, x: number, y: number, suggestions: string[] } | null>(null);
    
    const [panelWidths, setPanelWidths] = useState({ left: 256, middle: window.innerWidth - 256 - 350, right: 350 });
    const [bottomPanelHeight, setBottomPanelHeight] = useState(250);

    const [rightPanelTab, setRightPanelTab] = useState<'ai' | 'assets'>('ai');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiHistory, setAiHistory] = useState<AIHistoryItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [compilationStatus, setCompilationStatus] = useState<{ isCompiling: boolean; result: BuildResult | null }>({ isCompiling: false, result: null });

    const isResizingVertical = useRef<number | null>(null);
    const isResizingHorizontal = useRef(false);
    const ideContainerRef = useRef<HTMLDivElement>(null);
    const saveTimeoutRef = useRef<number | null>(null);

    const platformConfig = PLATFORMS[project.platform];

    const findFileInTree = (node: FileTreeNode, fileName: string): FileTreeNode | null => {
        if (node.type === 'file' && node.name.includes(fileName)) return node; // More flexible find
        if (node.type === 'folder' && node.children) {
            for (const child of node.children) {
                const found = findFileInTree(child, fileName);
                if (found) return found;
            }
        }
        return null;
    };
    
    useEffect(() => {
        if (project) {
            getProjectFiles(project.id).then(tree => {
                setFileTree(tree);
                const mainJavaFile = findFileInTree(tree, '.java');
                if (mainJavaFile) {
                    handleFileSelect(mainJavaFile);
                }
            }).catch(err => {
                console.error(err);
                addToast('Failed to load project files.', 'error');
            });
        }
    }, [project]);

    const handleFileSelect = async (file: FileTreeNode) => {
        if (file.type === 'file') {
            if (!openFiles.some(f => f.path === file.path)) {
                setOpenFiles(prev => [...prev, file]);
            }
            setActivePath(file.path);

            if (!fileContents[file.path]) {
                try {
                    const content = await getFileContent(project.id, file.path, project.platform, project.name);
                    setFileContents(prev => ({ ...prev, [file.path]: content }));
                } catch (error) {
                    addToast(`Failed to load ${file.name}`, 'error');
                }
            }
        }
    };

    const handleCloseFile = (path: string) => {
        const newOpenFiles = openFiles.filter(f => f.path !== path);
        setOpenFiles(newOpenFiles);
        if (activePath === path) {
            setActivePath(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].path : 'visual-builder');
        }
    };
    
    const getCurrentFile = () => openFiles.find(f => f.path === activePath);

    const handleGenerateCode = async () => {
        if (!aiPrompt.trim()) return addToast("Please enter a prompt.", 'error');
        if (activePath === 'visual-builder' || !getCurrentFile()) return addToast("Please select a code file to modify.", 'error');

        setIsGenerating(true);
        addToast("AI is generating code...", 'info');
        try {
            const currentFile = getCurrentFile()!;
            const currentCode = fileContents[currentFile.path] || '';
            const newCode = await generatePluginCode(project.id, aiPrompt, currentCode, aiHistory);
            
            setFileContents(prev => ({ ...prev, [currentFile.path]: newCode }));
            await writeFileContent(project.id, currentFile.path, newCode);
            
            setAiHistory(prev => [...prev, { prompt: aiPrompt, code: newCode }]);
            setAiPrompt('');
            addToast("Code generated and saved successfully!", 'success');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            addToast(errorMessage, 'error');
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleBlockDrop = (codeSnippet: string) => {
        if (!fileTree) return;
        const targetFileNode = findFileInTree(fileTree, '.java');
        if (!targetFileNode) {
            addToast("Main Java file not found!", "error");
            return;
        }
        const targetFile = targetFileNode.path;

        setFileContents(prev => {
            const currentCode = prev[targetFile] || '';
            const insertionMarker = 'public'; // A generic marker
            const insertionIndex = currentCode.lastIndexOf('}', currentCode.lastIndexOf('}')-1);
            
            let newCode;
            const snippetWithIndent = codeSnippet.split('\n').map(line => '    ' + line).join('\n');
            
            if (insertionIndex !== -1) {
                newCode = currentCode.slice(0, insertionIndex) + snippetWithIndent + '\n' + currentCode.slice(insertionIndex);
            } else {
                newCode = currentCode + '\n' + snippetWithIndent;
            }
            writeFileContent(project.id, targetFile, newCode);
            return { ...prev, [targetFile]: newCode };
        });

        addToast(`Code block added to ${targetFileNode.name}!`, 'success');
        setActivePath(targetFile);
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
    
    const getCompilationMessage = (platform: MinecraftPlatform, success: boolean): string => {
        if (success) {
            const messages: Record<MinecraftPlatform, string> = {
                forge: 'Forge mod compiled successfully! Ready for Minecraft.',
                fabric: 'Fabric mod compiled successfully! Compatible with Fabric loader.',
                spigot: 'Spigot plugin compiled! Drop into your plugins folder.',
                paper: 'Paper plugin ready! Optimized for Paper servers.',
                bukkit: 'Bukkit plugin compiled! Works with all Bukkit-based servers.',
                neoforge: 'NeoForge mod compiled! Next-gen modding ready.'
            };
            return messages[platform];
        }
        return `Compilation failed for ${platform}. Check console for errors.`;
    };

    const handleCompileProject = async () => {
        setCompilationStatus({ isCompiling: true, result: null });
        addToast('Starting compilation...', 'info');
        try {
            const result = await compileProject(project.id);
            setCompilationStatus({ isCompiling: false, result });
            
            const message = getCompilationMessage(project.platform, result.success);
            addToast(message, result.success ? 'success' : 'error');

            if (result.success && result.buildId && result.fileName) {
                await downloadBuild(project.id, result.buildId, result.fileName);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown compilation error.';
            addToast(errorMessage, 'error');
            setCompilationStatus({ isCompiling: false, result: null });
        }
    };

    const handleMouseDownVertical = (dividerIndex: number) => { isResizingVertical.current = dividerIndex; };
    const handleMouseDownHorizontal = () => { isResizingHorizontal.current = true; };
    const handleMouseUp = useCallback(() => {
        isResizingVertical.current = null;
        isResizingHorizontal.current = false;
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizingVertical.current !== null && ideContainerRef.current) {
            const rect = ideContainerRef.current.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            setPanelWidths(prev => {
                const totalWidth = prev.left + prev.middle + prev.right;
                if (isResizingVertical.current === 0) {
                    const newLeft = Math.max(200, Math.min(mouseX, totalWidth - prev.right - 200));
                    return { ...prev, left: newLeft, middle: totalWidth - newLeft - prev.right };
                } else { 
                    const newRight = Math.max(200, Math.min(totalWidth - mouseX, totalWidth - prev.left - 200));
                    return { ...prev, right: newRight, middle: totalWidth - prev.left - newRight };
                }
            });
        }
        if (isResizingHorizontal.current) {
            setBottomPanelHeight(window.innerHeight - e.clientY);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);
    
    const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        const path = activePath;
        
        if (path !== 'visual-builder') {
            setFileContents(prev => ({ ...prev, [path]: text }));
            
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            saveTimeoutRef.current = window.setTimeout(() => {
                writeFileContent(project.id, path, text);
            }, 1000);
        }

        const pos = e.target.selectionStart;
        const line = (text.substring(0, pos).match(/\n/g) || []).length + 1;
        const column = pos - text.lastIndexOf('\n', pos - 1);
        setCursorPosition({ line, column });
        setActiveLine(line);
    };

    const highlight = useCallback((text: string, platform: MinecraftPlatform) => {
        let highlighted = text
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/\b(package|import|public|class|extends|@Override|void|new|final|private|protected|static|return|implements|enum|interface)\b/g, '<span class="text-purple-400">$&</span>')
            .replace(/(".*?")/g, '<span class="text-orange-400">$&</span>')
            .replace(/(\/\/.*)/g, '<span class="text-green-500/70">$&</span>')
            .replace(/\b(true|false|this|null)\b/g, '<span class="text-red-400">$&</span>')
            .replace(/\b(\d+\.?\d*)\b/g, '<span class="text-teal-300">$&</span>');

        const platformKeywords: Record<MinecraftPlatform, string[]> = {
            forge: ['@Mod', '@SubscribeEvent', 'ForgeRegistries', 'FMLCommonSetupEvent', 'Dist', 'SidedProxy'],
            fabric: ['@Environment', 'FabricLoader', 'FabricItemGroup', 'FabricItemSettings', 'ClientModInitializer', 'DedicatedServerModInitializer'],
            spigot: ['@EventHandler', 'Bukkit', 'PluginBase', 'CommandExecutor', 'TabCompleter', 'JavaPlugin'],
            paper: ['@EventHandler', 'Paper', 'Component', 'Adventure', 'JavaPlugin'],
            bukkit: ['@EventHandler', 'Bukkit', 'PluginBase', 'JavaPlugin'],
            neoforge: ['@Mod', '@EventBusSubscriber', 'NeoForge', 'NeoForgeRegistries', 'FMLCommonSetupEvent'],
        };

        const keywords = platformKeywords[platform] || [];
        keywords.forEach(keyword => {
            highlighted = highlighted.replace(new RegExp(`\\b${keyword}\\b`, 'g'), '<span class="text-cyan-400">$&</span>');
        });

        return highlighted;
    }, []);

    const getBuildCommands = () => {
        switch (project.platform) {
            case 'forge':
            case 'neoforge':
            case 'fabric':
                return [
                    { command: 'runClient', label: 'Run Client', icon: PlayCircleIcon },
                    { command: 'runServer', label: 'Run Server', icon: ServerIcon },
                ];
            case 'spigot':
            case 'paper':
            case 'bukkit':
                return [
                     { command: 'test', label: 'Run Tests', icon: PlayCircleIcon }
                ];
            default:
                return [];
        }
    };

    return (
        <div className="h-screen w-screen bg-darker flex flex-col font-sans text-sm">
            <header className="bg-dark flex justify-between items-center px-4 py-2 border-b border-secondary/10 flex-shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <DiamondIcon className="w-6 h-6 text-primary" />
                    <div>
                        <h1 className="text-xl font-poppins font-bold">{project.name}</h1>
                        <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${platformConfig.color} bg-darker border border-current`}>
                                {platformConfig.displayName} {project.minecraftVersion}
                            </span>
                            <span className="text-xs text-light-text capitalize">
                                {project.template} template
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {getBuildCommands().map(({ command, label, icon: Icon }) => (
                        <button 
                            key={command}
                            onClick={() => handleBuildCommand(command)}
                            className="flex items-center gap-2 bg-darker text-light-text py-1.5 px-3 rounded-md hover:bg-secondary/20 hover:text-light"
                            disabled={compilationStatus.isCompiling}
                        >
                            <Icon className="w-4 h-4" /> 
                            {label}
                        </button>
                    ))}
                     <button 
                        onClick={handleCompileProject} 
                        className="flex items-center gap-2 bg-primary text-darker font-bold py-1.5 px-3 rounded-md hover:bg-primary/80 disabled:bg-gray-600"
                        disabled={compilationStatus.isCompiling}
                    >
                        <HammerIcon className="w-4 h-4" /> 
                        {compilationStatus.isCompiling ? 'Compiling...' : 'Build & Download'}
                    </button>
                </div>
                <button onClick={onExit} className="bg-accent/80 hover:bg-accent text-light py-2 px-4 rounded-lg font-semibold transition-colors duration-300">Exit IDE</button>
            </header>

            <div ref={ideContainerRef} className="flex flex-grow overflow-hidden gpu-accelerate">
                <div style={{ width: `${panelWidths.left}px` }}>
                    <FileExplorer onFileSelect={handleFileSelect} projectStructure={fileTree} />
                </div>
                
                <div onMouseDown={() => handleMouseDownVertical(0)} className="w-2 cursor-col-resize bg-dark hover:bg-secondary transition-colors" />

                <main className="flex-grow flex flex-col overflow-hidden" style={{ width: `${panelWidths.middle}px` }}>
                     <div className="flex-grow flex flex-col">
                        <div className="bg-dark flex-shrink-0 border-b border-secondary/10 flex">
                            {openFiles.map(file => (
                                <Tab key={file.path} name={file.name} path={file.path} isActive={activePath === file.path} onSelect={setActivePath} onClose={handleCloseFile} icon={<FileCodeIcon className="w-4 h-4 text-secondary" />} />
                            ))}
                             <Tab name="Visual Builder" path="visual-builder" isActive={activePath === 'visual-builder'} onSelect={setActivePath} onClose={null} icon={<PuzzleIcon className="w-4 h-4 text-primary" />} />
                        </div>
                        <div className="flex-grow overflow-auto relative bg-darker">
                           {activePath !== 'visual-builder' && getCurrentFile() ? (
                               <>
                                <textarea
                                    value={fileContents[activePath] || ''}
                                    onChange={handleTextareaInput}
                                    onClick={(e) => handleTextareaInput(e as any)}
                                    onKeyUp={(e) => handleTextareaInput(e as any)}
                                    spellCheck="false"
                                    className="absolute inset-0 z-10 w-full h-full p-0 bg-transparent text-transparent caret-primary resize-none border-none outline-none overflow-auto whitespace-pre leading-relaxed tracking-wide font-mono text-sm"
                                    style={{ paddingLeft: '3rem' }}
                                />
                                <CodeEditor
                                   content={fileContents[activePath] || ''}
                                   breakpoints={breakpoints}
                                   onToggleBreakpoint={(line) => setBreakpoints(p => p.includes(line) ? p.filter(l => l !== line) : [...p, line])}
                                   activeLine={activeLine}
                                   autocomplete={autocomplete}
                                   highlightFn={(text) => highlight(text, project.platform)}
                                />
                               </>
                           ) : activePath === 'visual-builder' ? (
                                <VisualBuilder onBlockDrop={handleBlockDrop} />
                           ) : (
                               <div className="h-full flex items-center justify-center text-center text-light-text">
                                   <div>
                                       <DiamondIcon className="w-24 h-24 text-secondary/10 mx-auto"/>
                                       <p className="mt-4">Select a file or the Visual Builder to begin.</p>
                                   </div>
                               </div>
                           )}
                        </div>
                    </div>
                    
                    <div onMouseDown={handleMouseDownHorizontal} className="w-full h-2 bg-dark border-t border-secondary/10 cursor-row-resize flex-shrink-0" />
                    <BottomPanel height={bottomPanelHeight} projectId={project?.id ?? null} />
                </main>
                
                <div onMouseDown={() => handleMouseDownVertical(1)} className="w-2 cursor-col-resize bg-dark hover:bg-secondary transition-colors" />
                
                <div style={{ width: `${panelWidths.right}px` }} className="flex flex-col">
                    <div className="flex-shrink-0 bg-dark border-b border-secondary/10 flex text-xs font-semibold">
                         <button onClick={() => setRightPanelTab('ai')} className={`py-2 px-4 ${rightPanelTab === 'ai' ? 'text-light bg-darker' : 'text-light-text hover:bg-darker/50'}`}>AI ASSISTANT</button>
                         <button onClick={() => setRightPanelTab('assets')} className={`py-2 px-4 ${rightPanelTab === 'assets' ? 'text-light bg-darker' : 'text-light-text hover:bg-darker/50'}`}>ASSET PREVIEW</button>
                    </div>
                    <div className="flex-grow overflow-auto">
                        {rightPanelTab === 'ai' && <AiAssistant prompt={aiPrompt} setPrompt={setAiPrompt} history={aiHistory} onSubmit={handleGenerateCode} isLoading={isGenerating}/>}
                        {rightPanelTab === 'assets' && <AssetPreview activeFile={getCurrentFile()} />}
                    </div>
                </div>

            </div>
            <StatusBar branch="main" cursorPosition={cursorPosition} />
        </div>
    );
};