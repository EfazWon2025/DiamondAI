import React from 'react';
import { SparklesIcon } from '../icons/SparklesIcon';
import { AIHistoryItem } from '../../types';

interface AiAssistantProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    history: AIHistoryItem[];
    onSubmit: () => void;
    isLoading: boolean;
}

const HistoryItem: React.FC<{ item: AIHistoryItem }> = ({ item }) => (
    <div className="mb-4">
        <p className="text-xs font-semibold text-light-text mb-1 p-2 bg-dark rounded-md">You:</p>
        <p className="text-sm p-2 bg-dark rounded-md mb-2">{item.prompt}</p>
        <p className="text-xs font-semibold text-primary mb-1 p-2 bg-dark rounded-md">AI Generated Code:</p>
        <pre className="text-xs p-2 bg-darker rounded-md max-h-40 overflow-auto font-mono"><code>{item.code.substring(0, 300)}{item.code.length > 300 && '...'}</code></pre>
    </div>
);


export const AiAssistant: React.FC<AiAssistantProps> = ({ prompt, setPrompt, history, onSubmit, isLoading }) => {
    return (
        <div className="h-full flex flex-col p-4 bg-dark">
            <div className="flex-grow overflow-y-auto pr-2">
                {history.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-light-text">
                        <SparklesIcon className="w-16 h-16 text-secondary/20" />
                        <h3 className="mt-4 font-bold text-light">AI Assistant</h3>
                        <p className="mt-1 text-sm">Describe the changes you want to make to the current file.</p>
                    </div>
                ) : (
                    [...history].reverse().map((item, index) => <HistoryItem key={index} item={item} />)
                )}
            </div>
            <div className="flex-shrink-0 pt-4 border-t border-secondary/10">
                <div className="relative">
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., 'give the player a diamond when they join'"
                        className="w-full bg-darker border border-secondary/20 rounded-lg p-3 pr-24 resize-none focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
                        rows={3}
                        disabled={isLoading}
                    />
                    <button
                        onClick={onSubmit}
                        disabled={isLoading || !prompt.trim()}
                        className="absolute right-2 bottom-2 bg-primary text-darker font-bold py-2 px-4 rounded-full text-sm transition-all duration-300 hover:bg-primary/80 disabled:bg-gray-600 disabled:text-light-text/50 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-darker border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4" />
                                Generate
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
