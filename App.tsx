import React, { useState, lazy, Suspense, useEffect } from 'react';
import type { Project, ToastMessage } from './types';
import { Toast } from './components/Toast';
import { createProject as apiCreateProject } from './services/api';

const LandingPage = lazy(() => import('./components/LandingPage.tsx'));
const ProjectModal = lazy(() => import('./components/ProjectModal.tsx'));
const IdeView = lazy(() => import('./components/IdeView.tsx'));
const BanScreen = lazy(() => import('./components/BanScreen.tsx'));


const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'ide'>('landing');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [project, setProject] = useState<Project | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    const [banExpiresAt, setBanExpiresAt] = useState<number | null>(null);

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


    const addToast = (message: string, type: ToastMessage['type'] = 'success') => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleGetStarted = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    const handleExitIde = () => { setProject(null); setView('landing'); };
    
    const handleCreateProject = async (projectDetails: Omit<Project, 'id' | 'createdAt'>) => {
        try {
            addToast("Creating your project workspace...", "info");
            const newProject = await apiCreateProject(projectDetails);
            setProject(newProject);
            setIsModalOpen(false);
            setView('ide');
            addToast("Project created successfully!", "success");
        } catch (error) {
            console.error("Failed to create project:", error);
            addToast("Could not create project. Please try again.", 'error');
        }
    };

    const LoadingFallback = () => (
      <div className="bg-darker text-light min-h-screen font-inter flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    return (
        <div className="bg-darker text-light min-h-screen font-inter">
            <Suspense fallback={<LoadingFallback />}>
                {banExpiresAt && banExpiresAt > Date.now() ? (
                    <BanScreen banExpiresAt={banExpiresAt} />
                ) : (
                    <>
                        {view === 'landing' && <LandingPage onGetStarted={handleGetStarted} />}
                        {view === 'ide' && project && <IdeView project={project} onExit={handleExitIde} addToast={addToast} />}
                        {isModalOpen && <ProjectModal onClose={handleCloseModal} onCreate={handleCreateProject} />}
                    </>
                )}
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