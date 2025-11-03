import { useState, useEffect } from 'react';
import type { ConsoleLogEntry } from '../types';

const MAX_LOGS = 200;

/**
 * Simulates a WebSocket connection for receiving console logs for a specific project.
 * In a real application, this would connect to a WebSocket server.
 * @param projectId The ID of the project to stream logs for.
 */
export const useConsoleStream = (projectId: string | null) => {
    const [logs, setLogs] = useState<ConsoleLogEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!projectId) return;

        console.log(`Simulating WebSocket connection for project: ${projectId}`);
        setIsConnected(true);
        setLogs([{
            level: 'CMD',
            message: `Connecting to console for project ${projectId}...`,
            source: 'System',
            timestamp: new Date().toLocaleTimeString(),
        }]);

        let messageCount = 0;
        // FIX: Explicitly type the `messages` array to ensure `level` is of type `ConsoleLogEntry['level']`,
        // resolving the type error where a generic `string` was inferred.
        const messages: Omit<ConsoleLogEntry, 'timestamp'>[] = [
            { level: 'INFO', message: 'Backend library: LWJGL version 3.3.1 SNAPSHOT', source: 'main' },
            { level: 'INFO', message: 'MinecraftForge v43.2.0 Initialized', source: 'main' },
            { level: 'INFO', message: 'HELLO FROM COMMON SETUP', source: 'ExampleMod' },
            { level: 'INFO', message: 'Done! For help, type "help"', source: 'Server thread' }
        ];

        const interval = setInterval(() => {
            if (messageCount < messages.length) {
                const mockLog: ConsoleLogEntry = {
                    ...messages[messageCount],
                    timestamp: new Date().toLocaleTimeString(),
                };
                 setLogs(prevLogs => [...prevLogs, mockLog].slice(-MAX_LOGS));
                 messageCount++;
            }
        }, 1500);

        // Cleanup on unmount or projectId change
        return () => {
            console.log(`Simulating WebSocket disconnection for project: ${projectId}`);
            clearInterval(interval);
            setIsConnected(false);
            setLogs([]);
        };
    }, [projectId]);

    return { logs, isConnected };
};