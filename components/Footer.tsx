import React from 'react';
import { Icon } from './Icon';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-dark py-8 px-[5%]">
            <div className="text-center pt-8 border-t border-secondary/10 text-light-text">
                <p>&copy; {new Date().getFullYear()} Diamond AI. All rights reserved.</p>
            </div>
        </footer>
    );
};