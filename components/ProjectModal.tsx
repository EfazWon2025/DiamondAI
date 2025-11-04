import React, { useState, useEffect } from 'react';
import type { Project, MinecraftPlatform, MinecraftVersion } from '../types';
import { PLATFORMS, getPlatformVersions } from '../services/platforms';

const QualityMeter: React.FC<{ level: 'basic' | 'good' | 'excellent' }> = ({ level }) => {
    const levels = {
        basic: { width: '33%', color: 'bg-accent', text: 'Basic' },
        good: { width: '66%', color: 'bg-yellow-500', text: 'Good' },
        excellent: { width: '100%', color: 'bg-primary', text: 'Excellent' },
    };
    const current = levels[level];
    return (
        <div className="mt-2">
            <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-semibold text-light-text">Prompt Quality</span>
                <span className={`font-bold ${level === 'excellent' ? 'text-primary' : level === 'good' ? 'text-yellow-500' : 'text-accent'}`}>{current.text}</span>
            </div>
            <div className="w-full bg-darker rounded-full h-2"><div className={`h-2 rounded-full transition-all duration-500 ${current.color}`} style={{ width: current.width }} /></div>
        </div>
    );
};

const TemplateButtons: React.FC<{ onInsert: (text: string) => void }> = ({ onInsert }) => {
    const templates = [
        { name: 'Economy System', text: "I want an economy plugin with:\n• Player balances and transaction history\n• Shops where players can buy/sell items\n• A jobs system with daily rewards\n• Admin commands to manage the economy" },
        { name: 'Minigame Arena', text: "A minigame plugin for a PvP arena with:\n• A waiting lobby\n• A kit selection GUI\n• A countdown timer to start the game\n• A scoreboard to track kills and deaths" },
        { name: 'Teleport System', text: "A teleportation plugin that includes:\n• /sethome and /home commands\n• /warp <name> and /setwarp <name> for admins\n• A /tpa <player> command to request teleportation" },
    ];
    return (
        <div className="mt-4">
            <p className="text-sm font-semibold mb-2 text-light-text">🚀 Quick Start Templates:</p>
            <div className="flex flex-wrap gap-2">
                {templates.map(t => <button type="button" key={t.name} onClick={() => onInsert(t.text)} className="bg-secondary/20 text-secondary text-xs font-semibold py-1 px-3 rounded-full hover:bg-secondary/40 transition-colors">{t.name}</button>)}
            </div>
        </div>
    );
};

const PlatformCard: React.FC<{ platformKey: MinecraftPlatform; isSelected: boolean; onSelect: (platform: MinecraftPlatform) => void; }> = ({ platformKey, isSelected, onSelect }) => {
    const platformConfig = PLATFORMS[platformKey];
    return (
        <div onClick={() => onSelect(platformKey)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${ isSelected ? 'border-primary bg-primary/10' : 'border-secondary/20 bg-dark hover:border-secondary/50'}`}>
            <div className="flex items-center gap-3 mb-2">
                <div className={platformConfig.color}>{platformConfig.icon}</div>
                <h3 className="font-semibold text-light">{platformConfig.displayName}</h3>
            </div>
            <p className="text-xs text-light-text">Versions: {platformConfig.versions.slice(0, 3).join(', ')}...</p>
        </div>
    );
};

interface ProjectModalProps {
    onClose: () => void;
    onCreate: (project: Omit<Project, 'id' | 'createdAt'>) => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [platform, setPlatform] = useState<MinecraftPlatform>('forge');
    const [minecraftVersion, setMinecraftVersion] = useState<MinecraftVersion>('1.20.1');
    const [description, setDescription] = useState('');
    const [template, setTemplate] = useState<'basic' | 'advanced' | 'custom'>('basic');
    const [nameError, setNameError] = useState<string | null>(null);
    const [promptQuality, setPromptQuality] = useState<'basic' | 'good' | 'excellent'>('basic');

    const MAX_DESC_LENGTH = 4000;
    const MAX_NAME_LENGTH = 50;

    useEffect(() => {
        const versions = getPlatformVersions(platform);
        setMinecraftVersion(versions[0]);
    }, [platform]);

    useEffect(() => {
        if (name.length > 0 && name.length < 3) setNameError('Name must be at least 3 characters.');
        else if (name.length > MAX_NAME_LENGTH) setNameError(`Name cannot exceed ${MAX_NAME_LENGTH} characters.`);
        else if (name.length > 0 && !/^[a-zA-Z0-9_]+$/.test(name)) setNameError('Use only letters, numbers, and underscores.');
        else setNameError(null);
    }, [name]);
    
    useEffect(() => {
        const len = description.length;
        if (len < 50) setPromptQuality('basic');
        else if (len < 150) setPromptQuality('good');
        else setPromptQuality('excellent');
    }, [description]);
    
    const isFormValid = name.trim() && !nameError && description.trim() && promptQuality !== 'basic';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid) onCreate({ name, platform, minecraftVersion, description, template });
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-[fadeInUp_0.3s_ease-out]">
            <div className="bg-dark rounded-2xl p-8 max-w-4xl w-full shadow-2xl shadow-secondary/20 border border-secondary/20 max-h-[90vh] overflow-y-auto">
                <h2 className="text-3xl font-poppins font-bold mb-6">Create New Minecraft Project</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="projectName" className="block mb-2 font-medium text-light-text">Project Name</label>
                        <div className="relative">
                            <input id="projectName" type="text" value={name} onChange={(e) => setName(e.target.value)} className={`w-full p-3 bg-darker border rounded-lg focus:outline-none focus:ring-2 ${ nameError ? 'border-accent focus:ring-accent' : 'border-secondary/20 focus:ring-secondary' }`} placeholder="MyAwesomePlugin" maxLength={MAX_NAME_LENGTH} required />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-light-text/50">{name.length}/{MAX_NAME_LENGTH}</span>
                        </div>
                        {nameError && <p className="text-accent text-xs mt-1">{nameError}</p>}
                    </div>
                    
                    <div>
                        <label className="block mb-3 font-medium text-light-text">Minecraft Platform</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {(Object.keys(PLATFORMS) as MinecraftPlatform[]).map(key => <PlatformCard key={key} platformKey={key} isSelected={platform === key} onSelect={setPlatform} />)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="minecraftVersion" className="block mb-2 font-medium text-light-text">Minecraft Version</label>
                            <select id="minecraftVersion" value={minecraftVersion} onChange={(e) => setMinecraftVersion(e.target.value as MinecraftVersion)} className="w-full p-3 bg-darker border border-secondary/20 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-secondary">
                                {getPlatformVersions(platform).map(version => <option key={version} value={version}>{version}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="projectTemplate" className="block mb-2 font-medium text-light-text">Project Template</label>
                            <select id="projectTemplate" value={template} onChange={(e) => setTemplate(e.target.value as any)} className="w-full p-3 bg-darker border border-secondary/20 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-secondary">
                                <option value="basic">Basic Starter</option><option value="advanced">Advanced Features</option><option value="custom">Custom Setup</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="projectDescription" className="block mb-2 font-medium text-light-text">Project Description</label>
                        <div className="relative bg-darker border border-secondary/20 rounded-lg p-3 focus-within:ring-2 focus-within:ring-secondary">
                            <textarea id="projectDescription" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-transparent resize-y min-h-[120px] max-h-[300px] outline-none placeholder:text-light-text/40" placeholder="💬 Describe your plugin/mod idea in detail..." maxLength={MAX_DESC_LENGTH}/>
                            <span className="absolute bottom-2 right-3 text-xs text-light-text/50">{description.length}/{MAX_DESC_LENGTH}</span>
                        </div>
                        <QualityMeter level={promptQuality} />
                        <TemplateButtons onInsert={(text) => setDescription(prev => prev ? `${prev}\n\n${text}` : text)} />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="bg-transparent text-light border-2 border-secondary/50 py-2.5 px-6 rounded-full font-semibold transition-all duration-300 hover:bg-secondary/10">Cancel</button>
                        <button type="submit" disabled={!isFormValid} className="bg-primary text-darker border-none py-2.5 px-6 rounded-full font-bold transition-all duration-300 hover:bg-primary/80 hover:-translate-y-1 disabled:bg-gray-600 disabled:text-light-text/50 disabled:cursor-not-allowed disabled:hover:-translate-y-0">Create Project</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModal;
