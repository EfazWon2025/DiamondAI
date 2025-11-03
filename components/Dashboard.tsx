import React from 'react';
import { Icon, IconName } from './Icon';

const StatCard: React.FC<{ icon: IconName, value: string, label: string, tokenReward: string }> = ({ icon, value, label, tokenReward }) => (
    <div className="bg-dark/50 rounded-lg p-4 flex items-center gap-4 border border-secondary/10">
        <Icon name={icon} className="w-8 h-8 text-secondary" />
        <div>
            <p className="text-2xl font-bold font-poppins">{value}</p>
            <p className="text-sm text-light-text">{label}</p>
        </div>
        <div className="ml-auto text-right">
            <p className="text-lg font-bold text-primary">{tokenReward}</p>
            <p className="text-xs text-primary/70">Earned</p>
        </div>
    </div>
);

const ActionCard: React.FC<{ icon: IconName; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-dark/50 p-4 rounded-lg flex items-center gap-4 border border-secondary/10">
        <div className="w-12 h-12 bg-secondary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
            <Icon name={icon} className="w-6 h-6 text-secondary" />
        </div>
        <div>
            <h5 className="font-bold">{title}</h5>
            <p className="text-xs text-light-text">{description}</p>
        </div>
    </div>
);

const UnlockableCard: React.FC<{ icon: IconName; title: string; cost: number; type: 'Feature' | 'Boost' }> = ({ icon, title, cost, type }) => (
     <div className="bg-dark/50 p-4 rounded-lg border border-secondary/10 text-center transition-transform duration-300 hover:-translate-y-1">
        <Icon name={icon} className="w-10 h-10 text-primary mx-auto mb-3" />
        <h5 className="font-bold">{title}</h5>
        <p className={`text-xs ${type === 'Feature' ? 'text-light-text' : 'text-accent'} mb-3`}>{type === 'Feature' ? 'One-time Unlock' : 'Temporary Boost'}</p>
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-darker py-2 rounded-lg font-bold text-sm hover:bg-primary/80 transition-colors">
            <Icon name="token" className="w-4 h-4" />
            {cost}
        </button>
    </div>
);

export const Dashboard: React.FC = () => {
    return (
        <section id="dashboard" className="py-24 px-[5%] bg-darker">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-4">Creator Dashboard</h2>
                <p className="text-light-text">The central hub of your journey. Earn tokens, unlock features, and track your progress.</p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Wallet & Earning */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-dark rounded-2xl p-6 border border-primary/20 text-center">
                        <h3 className="text-xl font-poppins font-bold mb-2">My Wallet</h3>
                        <div className="flex items-center justify-center gap-3">
                            <Icon name="token" className="w-10 h-10 text-primary" />
                            <span className="text-5xl font-poppins font-bold">1,280</span>
                        </div>
                        <p className="text-sm text-light-text mt-1">Tokens Available</p>
                    </div>

                    <div className="bg-dark rounded-2xl p-6 border border-secondary/20">
                        <h3 className="text-xl font-poppins font-bold mb-4">Ways to Earn</h3>
                        <div className="space-y-3">
                            <ActionCard icon="dailyLogin" title="Daily Login" description="Earn tokens just for showing up." />
                            <ActionCard icon="tutorial" title="Complete Tutorials" description="Level up your skills and get rewarded." />
                            <ActionCard icon="communityHelp" title="Help the Community" description="Share your knowledge and earn." />
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Spending */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard icon="bolt" value="28" label="Plugins Created" tokenReward="+280" />
                        <StatCard icon="users" value="74" label="Helps Provided" tokenReward="+74" />
                    </div>

                    <div className="bg-dark rounded-2xl p-6 border border-secondary/20">
                        <h3 className="text-xl font-poppins font-bold mb-4">Spend Your Tokens</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <UnlockableCard icon="premiumFeature" title="Voice Input" cost={50} type="Feature" />
                             <UnlockableCard icon="boost" title="2x Gen Speed" cost={5} type="Boost" />
                            <UnlockableCard icon="premiumFeature" title="Team Collab" cost={150} type="Feature" />
                            <UnlockableCard icon="boost" title="Priority Queue" cost={3} type="Boost" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
