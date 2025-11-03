import React from 'react';
import { RocketIcon } from './icons/RocketIcon';

interface CtaProps {
    onGetStarted: () => void;
}

export const Cta: React.FC<CtaProps> = ({ onGetStarted }) => {
    return (
        <section className="py-24 px-[5%] bg-gradient-to-r from-secondary to-purple-800 text-center">
            <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-5">Ready to Start Creating?</h2>
            <p className="max-w-xl mx-auto mb-8 text-lg text-light-text">
                Go from idea to a fully functional Minecraft plugin in minutes. No setup required.
            </p>
            <button onClick={onGetStarted} className="flex items-center gap-3 bg-primary text-darker py-4 px-8 rounded-full font-bold text-lg transition-all duration-300 hover:bg-primary/90 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40 mx-auto">
                <RocketIcon className="w-6 h-6" />
                Get Started For Free
            </button>
        </section>
    );
};