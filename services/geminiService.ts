import * as api from './api';
import type { AIHistoryItem } from '../types';

export async function generatePluginCode(
    projectId: string,
    prompt: string,
    currentCode: string,
    history: AIHistoryItem[]
): Promise<string> {
    try {
        const newCode = await api.generateCode(projectId, prompt, currentCode, history);
        return newCode;
    } catch (error) {
        console.error("Error generating code via backend service:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate code: ${error.message}`);
        }
        throw new Error("An unknown error occurred during code generation.");
    }
}

export async function analyzeCodeForPlatform(projectId: string, code: string): Promise<string> {
    try {
        const analysis = await api.analyzeCode(projectId, code);
        return analysis;
    } catch (error) {
        console.error("Error analyzing code via backend service:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to analyze code: ${error.message}`);
        }
        throw new Error("An unknown error occurred during code analysis.");
    }
}