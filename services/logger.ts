import type { LogLevel, LogEntry } from '../types';

class LoggerService {
    private logs: LogEntry[] = [];
    private subscribers: ((logs: LogEntry[]) => void)[] = [];
    private readonly MAX_LOGS = 100;

    private addLog(level: LogLevel, message: string, options?: { details?: any; source?: LogEntry['source'] }) {
        const { details, source } = options || {};
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toLocaleTimeString(),
            source: source || 'System',
            details: details ? (typeof details === 'string' ? details : JSON.stringify(details, null, 2)) : undefined,
        };
        this.logs.unshift(entry);
        if (this.logs.length > this.MAX_LOGS) {
            this.logs.pop();
        }
        
        const formattedMessage = `[${entry.timestamp}] [${entry.source}/${level}] ${message}`;
        switch (level) {
            case 'INFO':
                console.log(formattedMessage, details || '');
                break;
            case 'WARN':
                console.warn(formattedMessage, details || '');
                break;
            case 'ERROR':
                console.error(formattedMessage, details || '');
                break;
        }
        
        this.notifySubscribers();
    }

    private notifySubscribers() {
        for (const subscriber of this.subscribers) {
            subscriber([...this.logs]);
        }
    }

    public subscribe(callback: (logs: LogEntry[]) => void): () => void {
        this.subscribers.push(callback);
        callback([...this.logs]); // Immediately notify with current logs
        
        return () => { // Return an unsubscribe function
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    public info(message: string, options?: { details?: any; source?: LogEntry['source'] }) {
        this.addLog('INFO', message, options);
    }

    public warn(message: string, options?: { details?: any; source?: LogEntry['source'] }) {
        this.addLog('WARN', message, options);
    }

    public error(message: string, options?: { details?: any; source?: LogEntry['source'] }) {
        const details = options?.details instanceof Error ? `${options.details.name}: ${options.details.message}\n${options.details.stack}` : options?.details;
        this.addLog('ERROR', message, { ...options, details });
    }
}

export const logger = new LoggerService();