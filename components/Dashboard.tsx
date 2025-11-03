import React from 'react';
import { BugHunterIcon, InnovatorIcon, PerfectionistIcon, PopularIcon } from './icons/BadgeIcons';
import { UsersIcon } from './icons/UsersIcon';
import { TokenIcon } from './icons/CubeIcon';
import { BoltIcon } from './icons/BoltIcon';
import { DailyLoginIcon, TutorialIcon, CommunityHelpIcon, PremiumFeatureIcon, BoostIcon } from './icons/WalletIcons';

const StatCard: React.FC<{ icon: React.ElementType, value: string, label: string, tokenReward: string }> = ({ icon: Icon, value, label, tokenReward }) => (
    <div className="bg-dark/50 rounded-lg p-4 flex items-center gap-4 border border-secondary/10">
        <Icon className="w-8 h-8 text-secondary" />
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

const ActionCard: React.FC<{ icon: React.ElementType; title: string; description: string; }> = ({ icon: Icon, title, description }) => (
    <div className="bg-dark/50 p-4 rounded-lg flex items-center gap-4 border border-secondary/10">
        <div className="w-12 h-12 bg-secondary/10 rounded-lg flex-shrink-0 flex items-center justify-center">
            <Icon className="w-6 h-6 text-secondary" />
        </div>
        <div>
            <h5 className="font-bold">{title}</h5>
            <p className="text-xs text-light-text">{description}</p>
        </div>
    </div>
);

const UnlockableCard: React.FC<{ icon: React.ElementType; title: string; cost: number; type: 'Feature' | 'Boost' }> = ({ icon: Icon, title, cost, type }) => (
     <div className="bg-dark/50 p-4 rounded-lg border border-secondary/10 text-center transition-transform duration-300 hover:-translate-y-1">
        <Icon className="w-10 h-10 text-primary mx-auto mb-3" />
        <h5 className="font-bold">{title}</h5>
        <p className={`text-xs ${type === 'Feature' ? 'text-light-text' : 'text-accent'} mb-3`}>{type === 'Feature' ? 'One-time Unlock' : 'Temporary Boost'}</p>
        <button className="w-full flex items-center justify-center gap-2 bg-primary text-darker py-2 rounded-lg font-bold text-sm hover:bg-primary/80 transition-colors">
            <TokenIcon className="w-4 h-4" />
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
                            <TokenIcon className="w-10 h-10 text-primary" />
                            <span className="text-5xl font-poppins font-bold">1,280</span>
                        </div>
                        <p className="text-sm text-light-text mt-1">Tokens Available</p>
                    </div>

                    <div className="bg-dark rounded-2xl p-6 border border-secondary/20">
                        <h3 className="text-xl font-poppins font-bold mb-4">Ways to Earn</h3>
                        <div className="space-y-3">
                            <ActionCard icon={DailyLoginIcon} title="Daily Login" description="Earn tokens just for showing up." />
                            <ActionCard icon={TutorialIcon} title="Complete Tutorials" description="Level up your skills and get rewarded." />
                            <ActionCard icon={CommunityHelpIcon} title="Help the Community" description="Share your knowledge and earn." />
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & Spending */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard icon={BoltIcon} value="28" label="Plugins Created" tokenReward="+280" />
                        <StatCard icon={UsersIcon} value="74" label="Helps Provided" tokenReward="+74" />
                    </div>

                    <div className="bg-dark rounded-2xl p-6 border border-secondary/20">
                        <h3 className="text-xl font-poppins font-bold mb-4">Spend Your Tokens</h3>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <UnlockableCard icon={PremiumFeatureIcon} title="Voice Input" cost={50} type="Feature" />
                             <UnlockableCard icon={BoostIcon} title="2x Gen Speed" cost={5} type="Boost" />
                            <UnlockableCard icon={PremiumFeatureIcon} title="Team Collab" cost={150} type="Feature" />
                            <UnlockableCard icon={BoostIcon} title="Priority Queue" cost={3} type="Boost" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};