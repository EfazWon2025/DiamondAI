// Define types for the Web Speech API to resolve 'Cannot find name SpeechRecognition' error.
// These types are experimental and not included in TypeScript's default DOM library.
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList extends ArrayLike<SpeechRecognitionResult> {}

interface SpeechRecognitionResult extends ArrayLike<{ readonly transcript: string }> {
  readonly isFinal: boolean;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import { generatePlanStream, generateProjectChanges } from '../../services/geminiService.ts';
import { processFile } from '../../services/fileProcessor.ts';
import type { Project, ToastMessage, AIFileModification } from '../../types';
import { Icon } from '../Icon.tsx';
import { CodeEditor } from './CodeEditor.tsx';

const CodeSkeletonLoader: React.FC = () => (
  <div className="p-4 space-y-3">
    <div className="h-4 bg-dark rounded w-1/3 animate-pulse"></div>
    <div className="h-4 bg-dark rounded w-3/4 animate-pulse"></div>
    <div className="h-4 bg-dark rounded w-1/2 animate-pulse"></div>
  </div>
);

const ThinkingIndicator: React.FC<{ title: string }> = ({ title }) => (
    <div className="p-4 flex flex-col items-center justify-center text-light-text">
        <div className="flex items-center gap-2">
            <Icon name="sparkles" className="w-5 h-5 text-primary animate-pulse" />
            <span className="font-semibold">{title}</span>
        </div>
        <div className="mt-3 w-full bg-dark rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-1.5 rounded-full animate-backgroundPan" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(to right, #00FF88 0%, #7B68EE 50%, #00FF88 100%)'}}></div>
        </div>
        <p className="text-xs mt-2">This may take a few moments.</p>
    </div>
);


interface ChatTurn {
    id: string;
    prompt: string;
    plan?: string;
    modifications?: AIFileModification[];
    status: 'plan_pending' | 'plan_completed' | 'code_pending' | 'code_completed' | 'applied' | 'error' | 'discarded';
    errorMessage?: string;
    fileContextName?: string;
    fileContextContent?: string | null;
}

const UserMessage: React.FC<{ turn: ChatTurn }> = ({ turn }) => (
    <div className="flex justify-end mb-4">
        <div className="bg-secondary/80 text-light p-3 rounded-lg max-w-lg shadow-md">
            <p className="whitespace-pre-wrap">{turn.prompt}</p>
            {turn.fileContextName && (
                <div className="mt-2 text-xs bg-secondary/50 p-1.5 rounded-md flex items-center gap-2">
                    <Icon name="fileText" className="w-4 h-4" />
                    <span>{turn.fileContextName}</span>
                </div>
            )}
        </div>
    </div>
);

const AiMessage: React.FC<{ turn: ChatTurn; onGenerateCode: () => void; onApply: () => void; onDiscard: () => void; }> = ({ turn, onGenerateCode, onApply, onDiscard }) => {
    const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
    const { plan, status } = turn;

    const [thinkingText, formalPlanText] = useMemo(() => {
        if (!plan) return ['', ''];
        
        const planParts = plan.split(/^(?=##\s*Plan)/m);
        let thinking = planParts[0] || '';
        let formal = planParts.length > 1 ? planParts.slice(1).join('') : '';

        thinking = thinking.replace(/^##\s*Thinking\s*$/m, '').trim();

        // If the stream is done and there's no explicit 'Plan' section, assume the whole text is the plan.
        if (!formal && thinking && status === 'plan_completed') {
            formal = thinking;
            thinking = '';
        }
        
        return [thinking, formal];
    }, [plan, status]);

    const renderContent = () => {
        switch (status) {
            case 'plan_pending':
            case 'plan_completed':
                if (status === 'plan_pending' && !plan) {
                    return <ThinkingIndicator title="AI is generating a plan..." />;
                }
                return (
                    <div className="flex flex-col min-h-0">
                         <div className="max-h-96 overflow-y-auto p-3 prose prose-sm prose-invert max-w-none rounded-t-md">
                            {thinkingText && (
                                <div className="mb-4 bg-dark p-3 rounded-md border border-secondary/10">
                                    <button 
                                        onClick={() => setIsThinkingExpanded(prev => !prev)} 
                                        className="w-full flex items-center justify-between text-left font-semibold text-light-text hover:text-light"
                                        aria-expanded={isThinkingExpanded}
                                        aria-controls="thinking-content"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Icon name="sparkles" className="w-4 h-4 text-primary"/>
                                            AI Thinking Process
                                        </span>
                                        <Icon name={isThinkingExpanded ? "chevronDown" : "chevronRight"} className="w-5 h-5 transition-transform" />
                                    </button>
                                    {isThinkingExpanded && (
                                        <div id="thinking-content" className="mt-3 pt-3 border-t border-secondary/20">
                                            <ReactMarkdown>{thinkingText}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            )}
                            <ReactMarkdown>{formalPlanText || ''}</ReactMarkdown>
                            {status === 'plan_pending' && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1"></span>}
                        </div>
                        {status === 'plan_completed' && (
                            <div className="p-2 flex justify-end items-center gap-2 border-t border-secondary/10">
                                <button onClick={onDiscard} className="px-3 py-1 bg-dark text-light-text rounded hover:bg-dark/50 border border-secondary/20 font-semibold text-xs">Discard</button>
                                <button onClick={onGenerateCode} className="px-3 py-1 bg-secondary text-light rounded hover:bg-secondary/80 font-bold text-xs flex items-center gap-1"><Icon name="fileCode" className="w-3 h-3" />Generate Code</button>
                            </div>
                        )}
                    </div>
                );
            case 'code_pending':
                return <ThinkingIndicator title="AI is writing code..." />;
            case 'error':
                 return <div className="p-3 text-accent whitespace-pre-wrap">{turn.errorMessage}</div>;
            case 'code_completed':
            case 'applied':
            case 'discarded':
                const codeToDisplay = turn.modifications
                    ?.map(mod => `// Path: ${mod.path}\n\n${mod.content}`)
                    .join('\n\n// ----------------------------------------\n\n') || '';
                return (
                    <div className="flex flex-col min-h-0">
                        <div className="max-h-96 overflow-y-auto rounded-t-md">
                            <CodeEditor value={codeToDisplay} onChange={() => {}} readOnly />
                        </div>
                        <div className="p-2 flex justify-end items-center gap-2 border-t border-secondary/10">
                            {turn.status === 'code_completed' && (
                                <>
                                    <button onClick={onDiscard} className="px-3 py-1 bg-dark text-light-text rounded hover:bg-dark/50 border border-secondary/20 font-semibold text-xs">Discard</button>
                                    <button onClick={onApply} className="px-3 py-1 bg-primary text-darker rounded hover:bg-primary/80 font-bold text-xs">Apply Changes</button>
                                </>
                            )}
                            {turn.status === 'applied' && (
                                <span className="text-primary text-xs font-bold px-2 py-0.5 bg-primary/20 rounded-full flex items-center gap-1"><Icon name="checkCircle2" className="w-3 h-3" />Applied</span>
                            )}
                             {turn.status === 'discarded' && (
                                <span className="text-light-text/70 text-xs font-semibold px-2 py-0.5">Discarded</span>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex justify-start mb-4">
            <div className="bg-darker p-1 rounded-lg w-full shadow-md border border-secondary/10">
                {renderContent()}
            </div>
        </div>
    );
};


interface AICodeAssistantProps {
  project: Project | null;
  fileContents: Record<string, string>;
  onApplyChanges: (modifications: AIFileModification[]) => void;
  addToast: (message: string, type?: ToastMessage['type']) => void;
}

export const AICodeAssistant: React.FC<AICodeAssistantProps> = ({ project, fileContents, onApplyChanges, addToast }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatLog, setChatLog] = useState<ChatTurn[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isFileProcessing, setIsFileProcessing] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const hasLoadedProject = Object.keys(fileContents).length > 0;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog, isGenerating]);

  useEffect(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
        recognitionRef.current = new SpeechRecognitionAPI();
        const rec = recognitionRef.current;
        if (!rec) return;

        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setPrompt(transcript);
        };
        rec.onend = () => setIsListening(false);
        rec.onerror = (event) => console.error('Speech recognition error:', event.error);
    }
  }, []);

  const toggleListening = () => {
    if (recognitionRef.current) {
        if (isListening) recognitionRef.current.stop();
        else { recognitionRef.current.start(); setIsListening(true); }
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsFileProcessing(true);
      try {
        const content = await processFile(file);
        setUploadedFile(file);
        setFileContent(content);
        addToast(`Attached: ${file.name}`, 'info');
      } catch (error) {
        console.error("Error processing file:", error);
        addToast(error instanceof Error ? error.message : 'Failed to process file', 'error');
        handleRemoveFile();
      } finally {
        setIsFileProcessing(false);
      }
    }
  };

  const handleRemoveFile = () => {
      setUploadedFile(null); setFileContent(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleAttachClick = () => fileInputRef.current?.click();

  const handleGeneratePlan = async () => {
    if (!prompt.trim() || !project || !hasLoadedProject) return;

    setIsGenerating(true);
    const newTurn: ChatTurn = {
        id: Date.now().toString(),
        prompt,
        plan: '', // Start with an empty plan for streaming
        status: 'plan_pending',
        fileContextName: uploadedFile?.name,
        fileContextContent: fileContent,
    };
    setChatLog(prev => [newTurn, ...prev]);
    setPrompt('');
    handleRemoveFile();

    try {
        const stream = generatePlanStream(project, newTurn.prompt, fileContents, newTurn.fileContextContent);
        for await (const chunk of stream) {
            setChatLog(prev => prev.map(t => 
                t.id === newTurn.id 
                ? { ...t, plan: (t.plan || '') + chunk } 
                : t
            ));
        }
        // After the stream is done, update the status to completed
        setChatLog(prev => prev.map(t => 
            t.id === newTurn.id 
            ? { ...t, status: 'plan_completed' } 
            : t
        ));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        setChatLog(prev => prev.map(t => t.id === newTurn.id ? { ...t, errorMessage, status: 'error' } : t));
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleGenerateCode = async (turnId: string) => {
    const turn = chatLog.find(t => t.id === turnId);
    if (!turn || !turn.plan || !project) return;
    
    setChatLog(prev => prev.map(t => t.id === turnId ? { ...t, status: 'code_pending' } : t));
    
    try {
      const modifications = await generateProjectChanges(project, turn.prompt, fileContents, turn.plan, turn.fileContextContent);
      setChatLog(prev => prev.map(t => t.id === turnId ? { ...t, modifications, status: 'code_completed' } : t));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      
      if (errorMessage.includes('Platform Security Violation')) {
          const banDuration = 5 * 60 * 60 * 1000; // 5 hours
          const expirationTime = Date.now() + banDuration;
          localStorage.setItem('banExpiresAt', expirationTime.toString());
          addToast(errorMessage, 'error');
          
          setTimeout(() => {
              window.location.reload();
          }, 2000);
      } else {
          setChatLog(prev => prev.map(t => t.id === turnId ? { ...t, errorMessage, status: 'error' } : t));
      }
    }
  };


  const handleApplyChanges = (turnId: string) => {
    const turn = chatLog.find(t => t.id === turnId);
    if (!turn || !turn.modifications || turn.modifications.length === 0) return;
    onApplyChanges(turn.modifications);
    setChatLog(prev => prev.map(t => t.id === turnId ? { ...t, status: 'applied' } : t));
  };

  const handleDiscard = (turnId: string) => {
    setChatLog(prev => prev.map(t => t.id === turnId ? { ...t, status: 'discarded' } : t));
  };
  
  const canGenerate = !isGenerating && prompt.trim().length > 0 && hasLoadedProject;
  
  return (
    <div className="h-full flex flex-col bg-dark text-sm">
      <div className="p-3 border-b border-secondary/10 shrink-0">
          <h2 className="text-xs font-bold uppercase tracking-wider text-light-text flex items-center gap-2">
            <Icon name="sparkles" className="w-4 h-4 text-primary" />
            AI Assistant
          </h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto flex flex-col-reverse">
        <div ref={chatEndRef} />
        {isGenerating && chatLog[0]?.status === 'plan_pending' && <AiMessage turn={chatLog[0]} onGenerateCode={()=>{}} onApply={() => {}} onDiscard={() => {}} />}
        {chatLog.slice(isGenerating ? 1 : 0).map(turn => (
            <React.Fragment key={turn.id}>
                <AiMessage turn={turn} onGenerateCode={() => handleGenerateCode(turn.id)} onApply={() => handleApplyChanges(turn.id)} onDiscard={() => handleDiscard(turn.id)} />
                <UserMessage turn={turn} />
            </React.Fragment>
        ))}
        {chatLog.length === 0 && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-center text-light-text p-4 m-auto">
                <Icon name="sparkles" className="w-16 h-16 text-secondary/10" />
                <h3 className="mt-4 font-bold text-light">AI Assistant Ready</h3>
                <p className="mt-1 max-w-xs">{hasLoadedProject ? "Describe the changes you want to make to your project." : "Loading project files..."}</p>
            </div>
        )}
      </div>

      <div className="p-4 border-t border-secondary/20 shrink-0">
        {uploadedFile && (
            <div className="mb-2 flex items-center justify-between text-xs bg-darker p-2 rounded-md border border-secondary/20">
                <div className="flex items-center gap-2 truncate">
                    <Icon name="fileText" className="w-4 h-4 text-secondary flex-shrink-0" />
                    <span className="truncate text-light-text" title={uploadedFile.name}>{uploadedFile.name}</span>
                </div>
                <button onClick={handleRemoveFile} className="p-1 rounded-full hover:bg-light/10"><Icon name="xCircle" className="w-4 h-4 text-light-text" /></button>
            </div>
        )}
        <div className="relative">
            <textarea
              value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder={hasLoadedProject ? "e.g., 'add a /heal command'" : "Waiting for project to load..."}
              className="w-full bg-darker border border-secondary/20 rounded-lg p-3 pr-20 resize-none focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
              rows={2} disabled={isGenerating || !hasLoadedProject}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && canGenerate) { e.preventDefault(); handleGeneratePlan(); } }}
            />
            <div className="absolute right-2 top-2 flex items-center gap-1">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.docx,.txt" className="hidden" />
                <button onClick={handleAttachClick} title="Attach File" className="p-1.5 rounded-full hover:bg-secondary/20" disabled={isGenerating || isFileProcessing}>
                    {isFileProcessing ? (
                        <div className="w-5 h-5 border-2 border-light-text/50 border-t-primary rounded-full animate-spin"></div>
                    ) : (
                        <Icon name="paperclip" className="w-5 h-5 text-light-text" />
                    )}
                </button>
                <button onClick={toggleListening} title="Use Voice Input" className={`p-1.5 rounded-full transition-colors ${isListening ? 'bg-accent/20' : 'hover:bg-secondary/20'}`} disabled={!recognitionRef.current || isGenerating || isFileProcessing}>
                    <Icon name={isListening ? 'microphoneOff' : 'microphone'} className={`w-5 h-5 ${isListening ? 'text-accent' : 'text-light-text'}`} />
                </button>
            </div>
        </div>
        <button onClick={handleGeneratePlan} disabled={!canGenerate} className="w-full mt-2 bg-primary text-darker font-bold py-2.5 px-4 rounded-lg transition-all duration-300 hover:bg-primary/80 disabled:bg-gray-600 disabled:text-light-text/50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            <Icon name="sparkles" className="w-4 h-4" />Create Plan
        </button>
      </div>
    </div>
  );
};
