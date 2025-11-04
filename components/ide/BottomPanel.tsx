import React, { useState, useEffect, useRef } from 'react';
import { Icon, IconName } from '../Icon.tsx';
import type { ConsoleLogEntry, LogEntry } from '../../types';
import { useConsoleStream } from '../../hooks/useConsoleStream.ts';
import { useVirtualization } from '../../hooks/useVirtualization.ts';
import { logger } from '../../services/logger.ts';

const GradleTask: React.FC<{ icon: IconName, name: string, description: string }> = ({ icon, name, description }) => (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/10 cursor-pointer">
        <Icon name={icon} className="w-5 h-5 text-primary flex-shrink-0"/>
        <div>
            <p className="font-mono font-semibold">{name}</p>
            <p className="text-light-text/70">{description}</p>
        </div>
    </div>
);

const GradlePanel: React.FC = () => (
    <div className="p-3 text-xs h-full overflow-y-auto">
        <h3 className="font-bold text-light mb-2"> Gradle Tasks</h3>
        <GradleTask icon="playCircle" name="runClient" description="Launches the Minecraft client with your mod."/>
        <GradleTask icon="server" name="runServer" description="Launches the dedicated server with your mod."/>
        <GradleTask icon="hammer" name="build" description="Builds the mod JAR file for distribution."/>
    </div>
);


const CONSOLE_ITEM_HEIGHT = 18; // px

const ConsoleLog: React.FC<ConsoleLogEntry & { style?: React.CSSProperties }> = ({ level, message, source, timestamp, style }) => {
    const color = level === 'WARN' ? 'text-yellow-400' : level === 'ERROR' ? 'text-accent' : level === 'CMD' ? 'text-primary' : 'text-light-text';
    return (
        <div className={`flex items-center ${color} whitespace-nowrap overflow-hidden`} style={style}>
            <span className="text-light-text/50 mr-2">[{timestamp}]</span>
            <span className="font-bold mr-2">[{source}/{level}]:</span>
            <span className="truncate">{message}</span>
        </div>
    );
};

const MinecraftConsole: React.FC<{ logs: ConsoleLogEntry[] }> = ({ logs }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { visibleItems, paddingTop, totalHeight, range } = useVirtualization<ConsoleLogEntry>(logs, CONSOLE_ITEM_HEIGHT, containerRef);
    const atBottomRef = useRef(true);

    useEffect(() => {
        const container = containerRef.current;
        if (container && atBottomRef.current) container.scrollTop = totalHeight;
    }, [logs.length, totalHeight]);
    
    const handleScroll = () => {
        const container = containerRef.current;
        if (container) atBottomRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < CONSOLE_ITEM_HEIGHT;
    };

    return (
        <div ref={containerRef} className="font-mono text-xs p-3 h-full overflow-y-auto" onScroll={handleScroll}>
            <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
                <div style={{ position: 'absolute', top: `${paddingTop}px`, width: '100%' }}>
                    {visibleItems.map((log, index) => (
                        <ConsoleLog key={range.start + index} {...log} style={{ height: CONSOLE_ITEM_HEIGHT }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ProblemsPanel: React.FC = () => {
    const [problems, setProblems] = useState<LogEntry[]>([]);

    useEffect(() => {
        const unsubscribe = logger.subscribe((allLogs) => {
            setProblems(allLogs.filter(log => log.level === 'ERROR' || log.level === 'WARN'));
        });
        return () => unsubscribe();
    }, []);
    
    const getIcon = (level: 'WARN' | 'ERROR') => {
        if (level === 'ERROR') return <Icon name="error" className="w-4 h-4 text-accent" />;
        return <Icon name="warning" className="w-4 h-4 text-yellow-400" />;
    };

    return (
        <div className="p-3 text-xs h-full overflow-y-auto">
            {problems.length === 0 ? (
                <div className="flex items-center justify-center h-full text-light-text">
                    No problems have been detected.
                </div>
            ) : (
                <div className="space-y-2 font-mono">
                    {problems.map((problem, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <div className="flex-shrink-0 mt-0.5">{getIcon(problem.level as 'WARN' | 'ERROR')}</div>
                            <div>
                                <p className="text-light whitespace-pre-wrap">{problem.message}</p>
                                {problem.details && (
                                    <pre className="text-light-text/70 whitespace-pre-wrap text-[10px] mt-1 p-2 bg-dark rounded">{problem.details.split('\n')[0]}</pre>
                                )}
                                <p className="text-light-text/50 text-[10px]">{problem.timestamp} [{problem.source || 'System'}]</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface BottomPanelProps {
    height: number;
    projectId: string | null;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ height, projectId }) => {
    const [activeTab, setActiveTab] = useState<'console' | 'problems' | 'gradle'>('problems');
    const { logs } = useConsoleStream(projectId);
    const [problemCount, setProblemCount] = useState(0);

    useEffect(() => {
        const unsubscribe = logger.subscribe((allLogs) => {
            const newCount = allLogs.filter(log => log.level === 'ERROR' || log.level === 'WARN').length;
            if (newCount > problemCount) setActiveTab('problems');
            setProblemCount(newCount);
        });
        return () => unsubscribe();
    }, [problemCount]);


    return (
        <div style={{ height: `${height}px` }} className="bg-dark flex flex-col flex-shrink-0 min-h-[50px] max-h-[60vh]">
            <div className="flex items-center border-b border-secondary/10 text-xs font-semibold">
                <button onClick={() => setActiveTab('console')} className={`py-2 px-4 ${activeTab === 'console' ? 'text-light bg-darker' : 'text-light-text hover:bg-darker/50'}`}>MINECRAFT CONSOLE</button>
                <button onClick={() => setActiveTab('problems')} className={`py-2 px-4 flex items-center gap-1.5 ${activeTab === 'problems' ? 'text-light bg-darker' : 'text-light-text hover:bg-darker/50'}`}>
                    PROBLEMS
                    {problemCount > 0 && <span className="px-1.5 py-0.5 text-xs font-bold rounded-full bg-accent text-light">{problemCount}</span>}
                </button>
                <button onClick={() => setActiveTab('gradle')} className={`py-2 px-4 ${activeTab === 'gradle' ? 'text-light bg-darker' : 'text-light-text hover:bg-darker/50'}`}>GRADLE</button>
            </div>
            <div className="flex-grow bg-darker overflow-hidden">
                {activeTab === 'gradle' && <GradlePanel />}
                {activeTab === 'console' && <MinecraftConsole logs={logs} />}
                {activeTab === 'problems' && <ProblemsPanel />}
            </div>
        </div>
    );
};