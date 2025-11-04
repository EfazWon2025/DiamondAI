import React from 'react';
import { Header } from './Header.tsx';
import { Hero } from './Hero.tsx';
import { Features } from './Features.tsx';
import { IdePreview } from './IdePreview.tsx';
import { Footer } from './Footer.tsx';
import AIChatModal from './AIChatModal.tsx';
import type { LandingChatMessage } from '../types.ts';
import { Icon } from './Icon.tsx';


interface LandingPageProps {
    onGetStarted: () => void;
    onThemeChange: () => void;
    isChatOpen: boolean;
    chatMessages: LandingChatMessage[];
    isChatResponding: boolean;
    onToggleChat: () => void;
    onSendChatMessage: (prompt: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
    onGetStarted, 
    onThemeChange,
    isChatOpen,
    chatMessages,
    isChatResponding,
    onToggleChat,
    onSendChatMessage
}) => {
    return (
        <main className="overflow-x-hidden">
            <Header onThemeChange={onThemeChange} />
            <Hero onGetStarted={onGetStarted} />
            <Features />
            <IdePreview />
            <Footer />
            
            <AIChatModal 
                isOpen={isChatOpen} 
                onClose={onToggleChat} 
                messages={chatMessages} 
                onSendMessage={onSendChatMessage}
                isResponding={isChatResponding}
            />

            <button 
                onClick={onToggleChat}
                className="fixed bottom-8 right-8 bg-secondary rounded-full p-4 shadow-lg shadow-secondary/40 hover:bg-secondary/80 hover:-translate-y-1 transition-all duration-300 z-[101]"
                aria-label="Open Support Chat"
            >
                <Icon name="info" className="w-8 h-8 text-light" />
            </button>
        </main>
    );
};

export default LandingPage;