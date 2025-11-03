// FIX: Define types for the Web Speech API to resolve 'Cannot find name SpeechRecognition' error.
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

import React, { useState, useEffect, useRef } from 'react';
import { generatePluginCode } from '../../services/geminiService';
import type { Project, AIHistoryItem } from '../../types';
import { Icon } from '../Icon';
import { CodeEditor } from './CodeEditor';

const CodeSkeletonLoader: React.FC = () => (
  <div className="p-4 space-y-3">
    <div className="h-4 bg-dark rounded w-1/3 animate-pulse"></div>
    <div className="h-4 bg-dark rounded w-3/4 animate-pulse"></div>
    <div className="h-4 bg-dark rounded w-1/2 animate-pulse"></div>
    <div className="h-4 bg-dark rounded w-5/6 animate-pulse"></div>
    <div className="h-4 bg-dark rounded w-2/3 animate-pulse"></div>
    <div className="h-4 bg-dark rounded w-3/5 animate-pulse"></div>
  </div>
);

const PromptSuggestions: React.FC<{ onSelect: (prompt: string) => void }> = ({ onSelect }) => {
  const suggestions = [
    "Give players 5 diamonds when they join",
    "Strike lightning when a player says 'thor'",
    "Create a /heal command",
    "Make players fly with /fly",
  ];
  return (
    <div className="p-4 border-t border-secondary/10 shrink-0">
        <h4 className="text-sm font-bold text-light mb-2">✨ Try these ideas</h4>
        <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
                <button key={s} onClick={() => onSelect(s)} className="text-xs bg-dark text-light-text py-1 px-3 rounded-full hover:bg-secondary/20 hover:text-light transition-colors">
                    {s}
                </button>
            ))}
        </div>
    </div>
  );
};

interface AICodeAssistantProps {
  project: Project | null;
  originalCode: string;
  onApplyChanges: (newCode: string) => void;
}

export const AICodeAssistant: React.FC<AICodeAssistantProps> = ({ project, originalCode, onApplyChanges }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [history, setHistory] = useState<AIHistoryItem[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => { setGeneratedCode(null); }, [originalCode]);

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
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    }
  };

  const handleGenerateCode = async () => {
    if (!prompt.trim() || !project || !originalCode) return;
    
    setIsGenerating(true);
    setGeneratedCode(null);
    try {
      const newCode = await generatePluginCode(project, prompt, originalCode, history);
      setGeneratedCode(newCode);
      setHistory(prev => [{ id: Date.now().toString(), prompt, code: newCode, timestamp: new Date(), applied: false }, ...prev.slice(0, 19)]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setGeneratedCode(`// Error generating code: ${errorMessage}\n\n// Your original code is safe.\n${originalCode}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyChanges = () => {
    if (generatedCode && !generatedCode.startsWith('// Error')) {
      onApplyChanges(generatedCode);
      setGeneratedCode(null);
      setPrompt('');
      setHistory(prev => {
        const newHistory = [...prev];
        const item = newHistory.find(item => item.code === generatedCode);
        if (item) item.applied = true;
        return newHistory;
      });
    }
  };
  
  const canGenerate = !isGenerating && prompt.trim().length > 0 && originalCode.length > 0;

  const renderContent = () => {
    if (isGenerating) {
        return <CodeSkeletonLoader />;
    }
    if (generatedCode !== null) {
      return (
        <div className="flex-grow flex flex-col bg-darker min-h-0">
          <div className="p-3 flex justify-between items-center shrink-0 border-b border-secondary/20">
            <h3 className="font-bold text-light flex items-center gap-2"><Icon name="sparkles" className="w-4 h-4 text-primary" />AI Generated Preview</h3>
            <div className="flex gap-2">
              <button onClick={() => setGeneratedCode(null)} className="px-3 py-1 bg-dark text-light-text rounded hover:bg-dark/50 border border-secondary/20 font-semibold">Discard</button>
              <button onClick={handleApplyChanges} className="px-3 py-1 bg-primary text-darker rounded hover:bg-primary/80 font-bold">Apply</button>
            </div>
          </div>
          <div className="flex-grow min-h-0"><CodeEditor value={generatedCode} onChange={() => {}} readOnly /></div>
        </div>
      );
    }
    if (history.length > 0) {
      return (
        <div className="p-4 flex-grow overflow-y-auto">
          <h4 className="font-bold text-light mb-3">Recent Generations</h4>
          <div className="space-y-2">
            {history.map(item => (
              <div key={item.id} onClick={() => { setGeneratedCode(item.code); setPrompt(item.prompt); }} className={`p-3 rounded-lg border cursor-pointer hover:bg-darker/50 transition-colors ${item.applied ? 'border-primary/30 bg-primary/10' : 'border-secondary/20'}`} title="Click to restore this suggestion">
                <p className="text-light-text font-medium truncate" title={item.prompt}>{item.prompt}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-light-text/50 text-xs">{item.timestamp.toLocaleTimeString()}</span>
                  {item.applied && <span className="text-primary text-xs font-bold px-2 py-0.5 bg-primary/20 rounded-full">Applied</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-light-text p-4">
          <Icon name="sparkles" className="w-16 h-16 text-secondary/10" />
          <h3 className="mt-4 font-bold text-light">AI Assistant Ready</h3>
          <p className="mt-1 max-w-xs">{originalCode.length > 0 ? "Describe the changes you want to make." : "Select a file to get started."}</p>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col bg-dark text-sm">
      <div className="p-4 border-b border-secondary/20 shrink-0">
        <div className="relative">
            <textarea
              value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder={originalCode.length > 0 ? "e.g., 'give player 3 diamonds on join'" : "Select a Java file to start"}
              className="w-full bg-darker border border-secondary/20 rounded-lg p-3 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
              rows={3} disabled={isGenerating || !originalCode.length}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && canGenerate) { e.preventDefault(); handleGenerateCode(); } }}
            />
            <button onClick={toggleListening} title="Use Voice Input" className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors ${isListening ? 'bg-accent/20' : 'hover:bg-secondary/20'}`} disabled={!recognitionRef.current}>
                <Icon name={isListening ? 'microphoneOff' : 'microphone'} className={`w-5 h-5 ${isListening ? 'text-accent' : 'text-light-text'}`} />
            </button>
        </div>
        <button onClick={handleGenerateCode} disabled={!canGenerate} className="w-full mt-2 bg-primary text-darker font-bold py-2.5 px-4 rounded-lg transition-all duration-300 hover:bg-primary/80 disabled:bg-gray-600 disabled:text-light-text/50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isGenerating ? <><div className="w-4 h-4 border-2 border-darker border-t-transparent rounded-full animate-spin"></div>Generating...</> : <><Icon name="sparkles" className="w-4 h-4" />Generate Code</>}
        </button>
      </div>
      <div className="flex-grow flex flex-col min-h-0">
        {renderContent()}
        {!isGenerating && generatedCode === null && history.length === 0 && (
            <PromptSuggestions onSelect={setPrompt} />
        )}
      </div>
    </div>
  );
};
