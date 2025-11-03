import React, { useState, useEffect, useRef } from 'react';
import { PlayCircleIcon, ServerIcon, HammerIcon } from '../icons/IdeIcons';
import type { ConsoleLogEntry } from '../../types';
import { useConsoleStream } from '../../hooks/useConsoleStream';

const GradleTask: React.FC<{ icon: React.ElementType, name: string, description: string }> = ({ icon: Icon, name, description }) => (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/10 cursor-pointer">
        <Icon className="w-5 h-5 text-primary flex-shrink-0"/>
        <div>
            <p className="font-mono font-semibold">{name}</p>
            <p className="text-light-text/70">{description}</p>
        </div>
    </div>
);

const GradlePanel: React.FC = () => (
    <div className="p-3 text-xs h-full overflow-y-auto">
        <h3 className="font-bold text-light mb-2"> Gradle Tasks</h3>
        <GradleTask icon={PlayCircleIcon} name="runClient" description="Launches the Minecraft client with your mod."/>
        <GradleTask icon={ServerIcon} name="runServer" description="Launches the dedicated server with your mod."/>
        <GradleTask icon={HammerIcon} name="build" description="Builds the mod JAR file for distribution."/>
    </div>
);


const ConsoleLog: React.FC<ConsoleLogEntry> = ({ level, message, source, timestamp }) => {
    const color = level === 'INFO' ? 'text-light-text' : level === 'WARN' ? 'text-yellow-400' : level === 'ERROR' ? 'text-accent' : 'text-primary';
    return (
        <p className={`${color}`}>
            <span className="text-light-text/50">[{timestamp}]</span>
            <span className="font-bold"> [{source}/{level}]: </span>
            {message}
        </p>
    );
};

const MinecraftConsole: React.FC<{ logs: ConsoleLogEntry[] }> = ({ logs }) => {
    const consoleEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
     <div className="font-mono text-xs p-3 h-full overflow-y-auto">
        {logs.map((log, i) => <ConsoleLog key={i} {...log} />)}
        <div ref={consoleEndRef} />
     </div>
    );
};

interface BottomPanelProps {
    height: number;
    projectId: string | null;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({ height, projectId }) => {
    const [activeTab, setActiveTab] = useState<'gradle' | 'console'>('console');
    const { logs } = useConsoleStream(projectId);

    return (
        <div style={{ height: `${height}px` }} className="bg-dark flex flex-col flex-shrink-0 min-h-[50px] max-h-[60vh]">
            <div className="flex items-center border-b border-secondary/10 text-xs font-semibold">
                <button 
                    onClick={() => setActiveTab('gradle')}
                    className={`py-2 px-4 ${activeTab === 'gradle' ? 'text-light bg-darker' : 'text-light-text hover:bg-darker/50'}`}
                >
                    GRADLE
                </button>
                 <button 
                    onClick={() => setActiveTab('console')}
                    className={`py-2 px-4 ${activeTab === 'console' ? 'text-light bg-darker' : 'text-light-text hover:bg-darker/50'}`}
                >
                    MINECRAFT CONSOLE
                </button>
            </div>
            <div className="flex-grow bg-darker overflow-hidden">
                {activeTab === 'gradle' && <GradlePanel />}
                {activeTab === 'console' && <MinecraftConsole logs={logs} />}
            </div>
        </div>
    );
};