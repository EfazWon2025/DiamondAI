import React, { useState, lazy, Suspense } from 'react';
import type { Project, ToastMessage } from './types';
import { Toast } from './components/Toast';
import { createProject as apiCreateProject } from './services/api';

const LandingPage = lazy(() => import('./components/LandingPage').then(m => ({ default: m.LandingPage })));
const ProjectModal = lazy(() => import('./components/ProjectModal').then(m => ({ default: m.ProjectModal })));
const IdeView = lazy(() => import('./components/IdeView').then(m => ({ default: m.IdeView })));
const EnterpriseDashboard = lazy(() => import('./components/EnterpriseDashboard').then(m => ({ default: m.EnterpriseDashboard })));


const App: React.FC = () => {
    const [view, setView] = useState<'landing' | 'ide' | 'enterprise'>('landing');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [project, setProject] = useState<Project | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = (message: string, type: ToastMessage['type'] = 'success') => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleGetStarted = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

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

    const handleExitIde = () => {
        setProject(null);
        setView('landing');
    };

    const handleGoToEnterprise = () => {
        setView('enterprise');
    };

    const handleExitEnterprise = () => {
        setView('landing');
    };
    
    const LoadingFallback = () => (
      <div className="bg-darker text-light min-h-screen font-inter flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    return (
        <div className="bg-darker text-light min-h-screen font-inter">
            <Suspense fallback={<LoadingFallback />}>
                {view === 'landing' && <LandingPage onGetStarted={handleGetStarted} onGoToEnterprise={handleGoToEnterprise} />}
                {view === 'ide' && project && <IdeView project={project} onExit={handleExitIde} addToast={addToast} />}
                {view === 'enterprise' && <EnterpriseDashboard onExit={handleExitEnterprise} />}
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