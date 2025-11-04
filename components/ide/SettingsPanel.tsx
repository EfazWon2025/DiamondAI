import React from 'react';
import { Icon } from '../Icon.tsx';

const SettingRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex items-center justify-between py-2">
        <label className="text-sm font-semibold text-light-text">{label}</label>
        {children}
    </div>
);

export const SettingsPanel: React.FC = () => {
    return (
        <div className="h-full bg-dark text-light-text">
            <div className="p-3 border-b border-secondary/10">
                <h2 className="text-xs font-bold uppercase tracking-wider">Settings</h2>
            </div>
            <div className="p-4 space-y-4">
                <SettingRow label="IDE Theme">
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-darker rounded border-2 border-primary text-light">Dark</button>
                        <button className="px-3 py-1 text-xs bg-gray-200 text-dark rounded border-2 border-transparent opacity-50 cursor-not-allowed">Light</button>
                    </div>
                </SettingRow>

                <SettingRow label="AI Model">
                    <select className="w-1/2 p-1.5 bg-darker border border-secondary/20 rounded text-xs text-light focus:outline-none focus:ring-1 focus:ring-secondary">
                        <option>gemini-2.5-pro</option>
                        <option>gemini-2.5-flash</option>
                    </select>
                </SettingRow>

                <SettingRow label="Auto-save Changes">
                     <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked/>
                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-secondary/30 cursor-pointer"></label>
                    </div>
                    <style>{`.toggle-checkbox:checked { right: 0; border-color: #00FF88; } .toggle-checkbox:checked + .toggle-label { background-color: #00FF88; }`}</style>
                </SettingRow>
                
                 <SettingRow label="Voice Input Language">
                    <select className="w-1/2 p-1.5 bg-darker border border-secondary/20 rounded text-xs text-light focus:outline-none focus:ring-1 focus:ring-secondary">
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Spanish</option>
                    </select>
                </SettingRow>
            </div>
        </div>
    );
};