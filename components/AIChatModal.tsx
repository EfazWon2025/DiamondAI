import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import type { LandingChatMessage } from '../types.ts';
import { Icon } from './Icon.tsx';

interface AIChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    messages: LandingChatMessage[];
    onSendMessage: (prompt: string) => void;
    isResponding: boolean;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, messages, onSendMessage, isResponding }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300); // Focus after transition
        }
    }, [isOpen]);

    const handleSend = () => {
        if (input.trim() && !isResponding) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div 
            className={`fixed bottom-[104px] right-8 w-[calc(100vw-4rem)] max-w-md h-[70vh] max-h-[500px] z-[100] transition-all duration-300 ease-out origin-bottom-right ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-16 scale-95 pointer-events-none'}`}
            aria-hidden={!isOpen}
            role="dialog"
            aria-labelledby="ai-chat-title"
        >
            <div className="bg-dark rounded-2xl shadow-2xl shadow-black/40 border border-secondary/20 w-full h-full flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-secondary/10 shrink-0">
                    <div className="flex items-center gap-2">
                        <Icon name="sparkles" className="w-6 h-6 text-primary" />
                        <h2 id="ai-chat-title" className="font-poppins font-bold text-lg">Diamond AI Support</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-light/10" aria-label="Close chat">
                        <Icon name="xCircle" className="w-6 h-6 text-light-text" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"><Icon name="diamond" className="w-5 h-5 text-light" /></div>}
                            <div className={`p-3 rounded-xl max-w-sm prose prose-sm prose-invert ${msg.role === 'user' ? 'bg-secondary/90 text-light rounded-br-none' : 'bg-darker rounded-bl-none'}`}>
                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                {msg.isStreaming && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1 align-bottom"></span>}
                            </div>
                        </div>
                    ))}
                    {isResponding && messages[messages.length - 1]?.role === 'user' && (
                         <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0"><Icon name="diamond" className="w-5 h-5 text-light" /></div>
                              <div className="p-3 rounded-xl max-w-sm bg-darker rounded-bl-none">
                                  <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 bg-primary/70 rounded-full animate-pulse delay-0"></span>
                                      <span className="w-2 h-2 bg-primary/70 rounded-full animate-pulse delay-150"></span>
                                      <span className="w-2 h-2 bg-primary/70 rounded-full animate-pulse delay-300"></span>
                                  </div>
                              </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <footer className="p-4 border-t border-secondary/10 shrink-0">
                    <div className="relative">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="How can I help you?"
                            className="w-full bg-darker border border-secondary/20 rounded-lg p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
                            rows={1}
                            disabled={isResponding}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isResponding || !input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-primary text-darker disabled:bg-gray-600 disabled:text-light-text/50 transition-colors"
                            aria-label="Send message"
                        >
                            <Icon name="rocket" className="w-5 h-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AIChatModal;