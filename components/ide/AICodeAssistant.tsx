import React, { useState, useEffect } from 'react';
import { generatePluginCode } from '../../services/geminiService';
import type { Project, AIHistoryItem } from '../../types';
import { Icon } from '../Icon';
import { CodeEditor } from './CodeEditor';

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
  
  useEffect(() => { setGeneratedCode(null); }, [originalCode]);

  const handleGenerateCode = async () => {
    if (!prompt.trim() || !project || !originalCode) return;
    
    setIsGenerating(true);
    setGeneratedCode('// Generating new code, please wait...');
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
        <textarea
          value={prompt} onChange={(e) => setPrompt(e.target.value)}
          placeholder={originalCode.length > 0 ? "e.g., 'give player 3 diamonds on join'" : "Select a Java file to start"}
          className="w-full bg-darker border border-secondary/20 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
          rows={3} disabled={isGenerating || !originalCode.length}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && canGenerate) { e.preventDefault(); handleGenerateCode(); } }}
        />
        <button onClick={handleGenerateCode} disabled={!canGenerate} className="w-full mt-2 bg-primary text-darker font-bold py-2.5 px-4 rounded-lg transition-all duration-300 hover:bg-primary/80 disabled:bg-gray-600 disabled:text-light-text/50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isGenerating ? <><div className="w-4 h-4 border-2 border-darker border-t-transparent rounded-full animate-spin"></div>Generating...</> : <><Icon name="sparkles" className="w-4 h-4" />Generate Code</>}
        </button>
      </div>
      <div className="flex-grow flex flex-col min-h-0">{renderContent()}</div>
    </div>
  );
};
