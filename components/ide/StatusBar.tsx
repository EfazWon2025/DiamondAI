import React from 'react';
import { Icon, IconName } from '../Icon';

interface StatusBarProps {
    branch: string;
}

const StatusBarItem: React.FC<{ children?: React.ReactNode; icon?: IconName; }> = ({ children, icon }) => (
    <div className="flex items-center gap-1.5 px-3 h-full hover:bg-secondary/20 cursor-pointer">
        {icon && <Icon name={icon} className="w-3.5 h-3.5" />}
        {children}
    </div>
);

export const StatusBar: React.FC<StatusBarProps> = ({ branch }) => {
    return (
        <footer className="bg-dark text-light-text text-xs flex justify-between items-center h-6 border-t border-secondary/10 flex-shrink-0 z-20">
            <div className="flex items-center h-full">
                <StatusBarItem icon="gitBranch">{branch}</StatusBarItem>
            </div>
            <div className="flex items-center h-full">
                <StatusBarItem>UTF-8</StatusBarItem>
                <StatusBarItem>Java</StatusBarItem>
                <StatusBarItem icon="error">1</StatusBarItem>
                <StatusBarItem icon="warning">1</StatusBarItem>
                <StatusBarItem icon="bell" />
            </div>
        </footer>
    );
};
