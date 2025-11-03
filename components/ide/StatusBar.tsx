import React from 'react';
import { GitBranchIcon, BellIcon, ErrorIcon, WarningIcon } from '../icons/IdeIcons';

interface StatusBarProps {
    branch: string;
    cursorPosition: { line: number, column: number };
}

// FIX: Made `children` optional to allow for icon-only status bar items.
const StatusBarItem: React.FC<{ children?: React.ReactNode; icon?: React.ElementType; }> = ({ children, icon: Icon }) => (
    <div className="flex items-center gap-1.5 px-3 h-full hover:bg-secondary/20 cursor-pointer">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {children}
    </div>
);

export const StatusBar: React.FC<StatusBarProps> = ({ branch, cursorPosition }) => {
    return (
        <footer className="bg-dark text-light-text text-xs flex justify-between items-center h-6 border-t border-secondary/10 flex-shrink-0 z-20">
            <div className="flex items-center h-full">
                <StatusBarItem icon={GitBranchIcon}>{branch}</StatusBarItem>
            </div>
            <div className="flex items-center h-full">
                <StatusBarItem>Ln {cursorPosition.line}, Col {cursorPosition.column}</StatusBarItem>
                <StatusBarItem>UTF-8</StatusBarItem>
                <StatusBarItem>Java</StatusBarItem>
                <StatusBarItem icon={ErrorIcon}>1</StatusBarItem>
                <StatusBarItem icon={WarningIcon}>1</StatusBarItem>
                <StatusBarItem icon={BellIcon} />
            </div>
        </footer>
    );
};