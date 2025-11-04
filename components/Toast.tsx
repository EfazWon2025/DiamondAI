import React, { useEffect, useState } from 'react';
import type { ToastMessage } from '../types';
import { Icon } from './Icon.tsx';

interface ToastProps {
    toast: ToastMessage;
    onDismiss: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true); // Animate in
        const timer = setTimeout(() => {
            handleDismiss();
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id]);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(() => onDismiss(toast.id), 300); // Wait for animation out
    };
    
    const icons = {
        success: <Icon name="checkCircle2" className="w-6 h-6 text-primary" />,
        info: <Icon name="info" className="w-6 h-6 text-secondary" />,
        error: <Icon name="xCircle" className="w-6 h-6 text-accent" />
    };
    
    const borderColors = {
        success: 'border-primary/50',
        info: 'border-secondary/50',
        error: 'border-accent/50'
    };

    return (
        <div
            className={`flex items-center gap-4 w-full max-w-sm p-4 rounded-lg shadow-lg bg-dark border ${borderColors[toast.type]} transition-all duration-300 transform ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
            role="alert"
        >
            <div className="flex-shrink-0">
                {icons[toast.type]}
            </div>
            <p className="flex-1 text-sm font-medium text-light">{toast.message}</p>
            <button onClick={handleDismiss} className="text-light-text hover:text-light flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
            </button>
        </div>
    );
};