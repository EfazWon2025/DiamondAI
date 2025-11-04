import React, { useState, useEffect } from 'react';
import { Icon } from './Icon.tsx';

const getCycleClass = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'bg-sky-400'; // Morning
    if (hour >= 12 && hour < 17) return 'bg-blue-500'; // Afternoon
    if (hour >= 17 && hour < 20) return 'bg-orange-500'; // Sunset
    return 'bg-indigo-900'; // Night
};

const AnimatedBackground: React.FC = () => {
    const [cycleClass, setCycleClass] = useState('bg-indigo-900');

    useEffect(() => {
        setCycleClass(getCycleClass());
        const timer = setInterval(() => {
             setCycleClass(getCycleClass());
        }, 60000); // Check every minute
        return () => clearInterval(timer);
    }, []);
    
    return (
        <div className={`absolute top-0 left-0 w-full h-full overflow-hidden z-0 transition-colors duration-[2000ms] ${cycleClass}`}>
             <div className="absolute inset-0 bg-gradient-to-b from-darker/80 via-darker/50 to-darker/80" />
            {Array.from({ length: 20 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-primary/10 rounded-lg animate-float"
                    style={{
                        width: `${Math.random() * 80 + 20}px`,
                        height: `${Math.random() * 80 + 20}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 15 + 10}s`,
                        animationDelay: `${Math.random() * -10}s`
                    }}
                />
            ))}
        </div>
    );
};

export const Hero: React.FC<{ onGetStarted: () => void; }> = ({ onGetStarted }) => {
    return (
        <section className="min-h-screen flex items-center justify-center px-[5%] relative overflow-hidden text-center">
             <AnimatedBackground />
            <div className="max-w-4xl z-10">
                <h1 className="text-5xl md:text-7xl font-poppins font-extrabold mb-5 leading-tight animate-[fadeInUp_1s_ease-out]">
                    Describe → Generate → Play
                </h1>
                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-light-text animate-[fadeInUp_1s_ease-out_0.2s]">
                    The simplest way to create Minecraft plugins. Just describe your idea in plain English, and our AI will write the code for you in seconds.
                </p>
                <div className="flex flex-col items-center gap-6 animate-[fadeInUp_1s_ease-out_0.4s]">
                    <button onClick={onGetStarted} className="w-full max-w-sm flex items-center justify-center gap-3 bg-primary text-darker py-4 px-8 rounded-full font-bold text-lg transition-all duration-300 hover:bg-primary/90 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/40">
                        <Icon name="rocket" className="w-6 h-6" />
                        Create Your First Plugin - FREE
                    </button>
                    <div className="text-sm text-light-text">
                        <span className="font-semibold text-primary">12,847</span> plugins generated today
                    </div>
                </div>
            </div>
        </section>
    );
};