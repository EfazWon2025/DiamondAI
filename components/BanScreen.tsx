import React, { useState, useEffect } from 'react';
import { Icon } from './Icon.tsx';

interface BanScreenProps {
    banExpiresAt: number;
}

const calculateTimeLeft = (endTime: number) => {
    const difference = endTime - Date.now();
    let timeLeft = {
        hours: '00',
        minutes: '00',
        seconds: '00'
    };

    if (difference > 0) {
        timeLeft = {
            hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
            minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0'),
            seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, '0')
        };
    }
    return timeLeft;
};

const BanScreen: React.FC<BanScreenProps> = ({ banExpiresAt }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(banExpiresAt));

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft(banExpiresAt);
            setTimeLeft(newTimeLeft);
            if (newTimeLeft.hours === '00' && newTimeLeft.minutes === '00' && newTimeLeft.seconds === '00') {
                 if (banExpiresAt <= Date.now()) {
                    localStorage.removeItem('banExpiresAt');
                    window.location.reload();
                 }
            }
        }, 1000);
        return () => clearTimeout(timer);
    });

    return (
        <div className="bg-darker text-light min-h-screen font-inter flex items-center justify-center text-center p-4">
            <div className="bg-dark p-8 md:p-12 rounded-2xl shadow-2xl shadow-accent/20 border border-accent/30 max-w-2xl w-full animate-[fadeInUp_0.5s_ease-out]">
                <Icon name="xCircle" className="w-20 h-20 text-accent mx-auto mb-6" />
                <h1 className="text-3xl md:text-4xl font-poppins font-bold text-accent mb-4">Access Restricted</h1>
                <p className="text-light-text mb-6 max-w-md mx-auto">
                    Your account has been temporarily suspended due to a violation of our platform's terms of service. 
                    Please refrain from submitting prompts that could harm the platform.
                </p>
                <div className="bg-darker rounded-lg p-6">
                    <p className="text-sm uppercase tracking-widest text-light-text mb-3">Suspension lifts in</p>
                    <div className="flex justify-center gap-4 text-4xl md:text-6xl font-mono font-bold">
                        <div>
                            <span>{timeLeft.hours}</span>
                            <span className="block text-xs font-sans font-normal tracking-normal">Hours</span>
                        </div>
                        <span className="text-accent">:</span>
                        <div>
                            <span>{timeLeft.minutes}</span>
                            <span className="block text-xs font-sans font-normal tracking-normal">Minutes</span>
                        </div>
                        <span className="text-accent">:</span>
                        <div>
                            <span>{timeLeft.seconds}</span>
                            <span className="block text-xs font-sans font-normal tracking-normal">Seconds</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BanScreen;