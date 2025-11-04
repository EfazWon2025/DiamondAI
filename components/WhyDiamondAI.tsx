import React from 'react';
import { Icon, IconName } from './Icon.tsx';

const benefitData = [
    {
        icon: 'clipboardList' as IconName,
        title: 'AI-Generated Plans',
        description: "Before writing a single line of code, the AI presents a detailed, step-by-step plan for your approval. You'll always know what's about to happen.",
    },
    {
        icon: 'sparkles' as IconName,
        title: 'See The Thinking Process',
        description: "Our AI streams its entire thought process in real-time. Understand the 'why' behind its decisions, not just the 'what'.",
    },
    {
        icon: 'hammer' as IconName,
        title: 'You Are In Control',
        description: 'Code is only generated after you explicitly approve the plan. No surprises, no unwanted changes. You have the final say.',
    }
];

const BenefitCard: React.FC<{ icon: IconName; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-darker rounded-2xl p-8 text-center transition-all duration-300 border border-secondary/10 hover:border-primary/40 hover:-translate-y-2 hover:shadow-2xl hover:shadow-secondary/20">
        <div className="w-16 h-16 bg-dark rounded-full flex items-center justify-center mb-6 mx-auto border-2 border-secondary/20 text-primary">
            <Icon name={icon} className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-poppins font-bold mb-3">{title}</h3>
        <p className="text-light-text text-sm">{description}</p>
    </div>
);


const WhyDiamondAI: React.FC = () => {
    return (
        <section id="why-ai" className="py-24 px-[5%] bg-dark">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-4">Transparent & Controllable AI</h2>
                <p className="text-light-text">Unlike other tools that just give you code, Diamond AI gives you a front-row seat to the development process. You're not just a spectator; you're the director.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {benefitData.map(benefit => <BenefitCard key={benefit.title} {...benefit} />)}
            </div>
        </section>
    );
};

export default WhyDiamondAI;
