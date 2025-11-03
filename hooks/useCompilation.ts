import { useState } from 'react';
import type { Project, BuildResult, MinecraftPlatform } from '../types';
import { compileProject, downloadBuild } from '../services/api';

export const useCompilation = (project: Project, addToast: (message: string, type?: 'success' | 'info' | 'error') => void) => {
    const [compilationStatus, setCompilationStatus] = useState<{ isCompiling: boolean; result: BuildResult | null }>({ isCompiling: false, result: null });
    
    const getCompilationMessage = (platform: MinecraftPlatform, success: boolean): string => {
        if (success) {
            const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
            return `${platformName} ${platform.match(/^(forge|fabric|neoforge)$/) ? 'mod' : 'plugin'} compiled successfully!`;
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
    
    return {
        compilationStatus,
        handleCompileProject
    };
};
