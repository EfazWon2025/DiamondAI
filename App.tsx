import React, { useState, lazy, Suspense, useEffect, useRef, useCallback } from 'react';
import type { Project, ToastMessage, LandingChatMessage } from './types';
import { Toast } from './components/Toast';
import { createProject as apiCreateProject } from './services/api';
import { GoogleGenAI } from "@google/genai";
import type { Chat } from "@google/genai";


const LandingPage = lazy(() => import('./components/LandingPage.tsx'));
const ProjectModal = lazy(() => import('./components/ProjectModal.tsx'));
const IdeView = lazy(() => import('./components/IdeView.tsx'));
const BanScreen = lazy(() => import('./components/BanScreen.tsx'));
const ApiKeySelectionScreen = lazy(() => import('./components/ApiKeySelectionScreen.tsx')); // New import

const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'ide' | 'keySelection'>('keySelection'); // Initial view set to keySelection
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [project, setProject] = useState<Project | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    // Moved up to be available for useEffects and useCallback
    const addToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const [banExpiresAt, setBanExpiresAt] = useState<number | null>(null);
    
    const themes = ['diamond', 'ruby', 'sapphire', 'emerald'];
    const [currentTheme, setCurrentTheme] = useState(themes[0]);

    // State for Landing Page AI Chat
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState<LandingChatMessage[]>([]);
    const [isChatResponding, setIsChatResponding] = useState(false);
    const chatSessionRef = useRef<Chat | null>(null);

    // New states for Veo API Key Selection
    const [veoApiKeySelected, setVeoApiKeySelected] = useState<boolean | null>(null); // null means not yet checked
    const [isKeySelectionLoading, setIsKeySelectionLoading] = useState(false); // For showing spinner during key selection

    const LANDING_PAGE_CHAT_INSTRUCTIONS = `You are a 24/7 support assistant for Diamond AI, an AI-powered IDE. Your primary role is to help existing and potential users by answering their questions about the platform, troubleshooting common issues, and providing guidance on using the IDE's features. Be patient, clear, and professional. Your goal is to provide excellent customer support. Do not generate code.`;

    // Initial check for Veo API Key
    useEffect(() => {
        const checkVeoKey = async () => {
            setIsKeySelectionLoading(true);
            try {
                const hasSelected = await window.aistudio.hasSelectedApiKey();
                setVeoApiKeySelected(hasSelected);
                setView(hasSelected ? 'landing' : 'keySelection');
            } catch (e) {
                console.error("Error checking API key status:", e);
                setVeoApiKeySelected(false); // Assume not selected on error
                setView('keySelection');
                addToast("Failed to check API key status. Please try again.", "error");
            } finally {
                setIsKeySelectionLoading(false);
            }
        };
        checkVeoKey();
    }, [addToast]); // Add addToast to dependencies

    const handleSelectVeoApiKey = useCallback(async () => {
        setIsKeySelectionLoading(true);
        try {
            await window.aistudio.openSelectKey();
            // Assume success immediately to mitigate race condition
            setVeoApiKeySelected(true);
            setView('landing'); // Proceed to landing page
            addToast("API key selected successfully!", "success");
        } catch (e) {
            console.error("Error opening API key selection dialog:", e);
            setVeoApiKeySelected(false);
            addToast("Failed to open API key selection. Please try again.", "error");
        } finally {
            setIsKeySelectionLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        // Initialize chat with a welcome message
        if (isChatOpen && chatMessages.length === 0) {
            setChatMessages([
                {
                    id: 'init',
                    role: 'model',
                    text: "Welcome to Diamond AI Support! How can I help you today? Whether you have a question about our features or need help getting started, I'm here for you 24/7. 💬",
                }
            ]);
        }
    }, [isChatOpen, chatMessages.length]);


    const handleToggleChat = () => setIsChatOpen(prev => !prev);

    const handleSendChatMessage = async (prompt: string) => {
        if (!prompt.trim()) return;

        const userMessage: LandingChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: prompt,
        };
        setChatMessages(prev => [...prev, userMessage]);
        setIsChatResponding(true);

        const modelResponseId = (Date.now() + 1).toString();
        const modelMessage: LandingChatMessage = {
            id: modelResponseId,
            role: 'model',
            text: '',
            isStreaming: true
        };
        setChatMessages(prev => [...prev, modelMessage]);

        try {
            if (!chatSessionRef.current) {
                // IMPORTANT: Create GoogleGenAI instance right before API call
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 
                chatSessionRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: LANDING_PAGE_CHAT_INSTRUCTIONS },
                });
            }
            
            const stream = await chatSessionRef.current.sendMessageStream({ message: prompt });

            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setChatMessages(prev => prev.map(msg => 
                    msg.id === modelResponseId ? { ...msg, text: fullResponse } : msg
                ));
            }

        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            // Specific check for Veo API key related error
            if (errorMessage.includes("Requested entity was not found.")) {
                setVeoApiKeySelected(false);
                setView('keySelection');
                addToast("Your API key may be invalid or expired. Please select it again.", "error");
            } else {
                setChatMessages(prev => prev.map(msg => 
                    msg.id === modelResponseId ? { ...msg, text: errorMessage } : msg
                ));
            }
        } finally {
            setIsChatResponding(false);
            setChatMessages(prev => prev.map(msg => 
                msg.id === modelResponseId ? { ...msg, isStreaming: false } : msg
            ));
        }
    };


    useEffect(() => {
        const savedTheme = localStorage.getItem('diamond-ai-theme') || themes[0];
        if (themes.includes(savedTheme)) {
            setCurrentTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, [themes]);

    const handleThemeChange = () => {
        const currentIndex = themes.indexOf(currentTheme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        setCurrentTheme(nextTheme);
        localStorage.setItem('diamond-ai-theme', nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
    };

    useEffect(() => {
        const isDevelopment = window.location.hostname === 'localhost' ||
                              window.location.hostname === '127.0.0.1' ||
                              window.self !== window.top; // Detect if running inside an iframe (common in online IDEs/previewers)

        const checkBanStatus = () => {
            // This function will only be called in production environments.
            const storedBanEnd = localStorage.getItem('banExpiresAt');
            if (storedBanEnd) {
                const banEndTime = parseInt(storedBanEnd, 10);
                if (banEndTime > Date.now()) {
                    setBanExpiresAt(banEndTime);
                } else {
                    localStorage.removeItem('banExpiresAt');
                    setBanExpiresAt(null);
                }
            } else {
                setBanExpiresAt(null);
            }
        };

        if (isDevelopment) {
            // For easier testing, immediately clear any ban on reload in a dev environment.
            // We clear both localStorage and the component's state directly.
            localStorage.removeItem('banExpiresAt');
            setBanExpiresAt(null);
            console.warn("DEV MODE: Ban check bypassed and cleared on reload.");
        } else {
            // For production, check the ban status on mount and then periodically.
            checkBanStatus();
            const interval = setInterval(checkBanStatus, 5000);
            return () => clearInterval(interval);
        }
    }, []);


    const handleGetStarted = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleExitIde = () => { setProject(null); setView('landing'); };
    
    const handleCreateProject = async (projectDetails: Omit<Project, 'id' | 'createdAt'>) => {
        try {
            addToast("Creating project & generating code with AI...", "info");
            // IMPORTANT: Create GoogleGenAI instance right before API call if needed for Veo,
            // but for createProject, the AI service itself handles it, so no change here.
            const newProject = await apiCreateProject(projectDetails);
            setProject(newProject);
            setIsModalOpen(false);
            setView('ide');
            addToast("Project generated successfully!", "success");
        } catch (error) {
            console.error("Failed to create project:", error);
            // The error messages from our services are designed to be user-friendly.
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during project creation.";
            // Specific check for Veo API key related error
            if (errorMessage.includes("Requested entity was not found.")) {
                setVeoApiKeySelected(false);
                setView('keySelection');
                addToast("Your API key may be invalid or expired. Please select it again.", "error");
            } else {
                addToast(errorMessage, 'error');
            }
        }
    };

    const LoadingFallback = () => (
      <div className="bg-darker text-light min-h-screen font-inter flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    let contentToRender;

    if (banExpiresAt && banExpiresAt > Date.now()) {
        contentToRender = <BanScreen banExpiresAt={banExpiresAt} />;
    } else if (veoApiKeySelected === null || isKeySelectionLoading) {
        // Show initial loading while checking API key or if loading the dialog
        contentToRender = <LoadingFallback />;
    } else if (view === 'keySelection') {
        contentToRender = <ApiKeySelectionScreen onSelectKey={handleSelectVeoApiKey} isLoading={isKeySelectionLoading} />;
    } else if (view === 'landing') {
        contentToRender = (
            <LandingPage 
                onGetStarted={handleGetStarted} 
                onThemeChange={handleThemeChange} 
                isChatOpen={isChatOpen}
                chatMessages={chatMessages}
                isChatResponding={isChatResponding}
                onToggleChat={handleToggleChat}
                onSendChatMessage={handleSendChatMessage}
            />
        );
    } else if (view === 'ide' && project) {
        contentToRender = <IdeView project={project} onExit={handleExitIde} addToast={addToast} />;
    } else {
        // Fallback or unexpected state, could redirect to landing or error
        contentToRender = <LoadingFallback />;
    }

    return (
        <div className="bg-darker text-light min-h-screen font-inter">
            <Suspense fallback={<LoadingFallback />}>
                {contentToRender}
                {isModalOpen && <ProjectModal onClose={handleCloseModal} onCreate={handleCreateProject} />}
            </Suspense>

            <div aria-live="assertive" className="fixed inset-0 flex flex-col items-end px-4 py-6 pointer-events-none sm:p-6 z-[200] space-y-2">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
                ))}
            </div>
        </div>
    );
};

export default App;