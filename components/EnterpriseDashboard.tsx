import React from 'react';
import { Icon, IconName } from './Icon';

interface EnterpriseDashboardProps {
    onExit: () => void;
}

const StatCard: React.FC<{ title: string; value: string; change: string; icon: IconName }> = ({ title, value, change, icon }) => (
    <div className="bg-dark p-6 rounded-lg border border-secondary/20">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm text-light-text">{title}</p>
                <p className="text-3xl font-bold font-poppins my-1">{value}</p>
                <p className={`text-xs ${change.startsWith('+') ? 'text-primary' : 'text-accent'}`}>{change}</p>
            </div>
            <Icon name={icon} className="w-6 h-6 text-secondary" />
        </div>
    </div>
);

const TeamMember: React.FC<{ avatar: string; name: string; role: string; status: 'Online' | 'Offline' }> = ({ avatar, name, role, status }) => (
    <div className="flex items-center justify-between p-3 hover:bg-darker/50 rounded-md">
        <div className="flex items-center gap-3">
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full" loading="lazy" />
            <div>
                <p className="font-semibold">{name}</p>
                <p className="text-xs text-light-text">{role}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status === 'Online' ? 'bg-primary' : 'bg-light-text/50'}`}></div>
            <span className="text-sm text-light-text">{status}</span>
        </div>
    </div>
);

const SecurityFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-center gap-3">
        <Icon name="checkCircle" className="w-5 h-5 text-primary" />
        <span>{children}</span>
    </li>
);

const EnterpriseDashboard: React.FC<EnterpriseDashboardProps> = ({ onExit }) => {
    return (
        <div className="min-h-screen bg-darker p-4 sm:p-6 md:p-8 animate-[fadeInUp_0.5s_ease-out]">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                    <Icon name="diamond" className="w-7 h-7 text-primary" />
                    <h1 className="text-2xl md:text-3xl font-poppins font-bold">Enterprise Dashboard</h1>
                </div>
                <button onClick={onExit} className="bg-secondary/80 hover:bg-secondary text-light py-2 px-4 rounded-lg font-semibold transition-colors duration-300">
                    Back to Main Site
                </button>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-dark rounded-lg p-6 border border-secondary/20">
                        <h2 className="text-xl font-bold mb-4 font-poppins flex items-center gap-2"><Icon name="analytics" className="w-5 h-5" /> Usage Analytics</h2>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard title="Plugins Generated" value="1,402" change="+12% this month" icon="template" />
                            <StatCard title="Active Users" value="23" change="+2 new" icon="team" />
                            <StatCard title="API Calls" value="1.8M" change="-5% this month" icon="billing" />
                        </div>
                    </div>
                    <div className="bg-dark rounded-lg p-6 border border-secondary/20">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold font-poppins flex items-center gap-2"><Icon name="team" className="w-5 h-5" /> Team Members</h2>
                            <button className="bg-primary text-darker font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary/80 transition-colors">Invite Member</button>
                        </div>
                        <div className="space-y-2">
                           <TeamMember avatar="https://randomuser.me/api/portraits/men/75.jpg" name="John Doe" role="Administrator" status="Online" />
                           <TeamMember avatar="https://randomuser.me/api/portraits/women/75.jpg" name="Jane Smith" role="Developer" status="Online" />
                           <TeamMember avatar="https://randomuser.me/api/portraits/men/76.jpg" name="Mike Johnson" role="Developer" status="Offline" />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-dark rounded-lg p-6 border border-secondary/20">
                         <h2 className="text-xl font-bold mb-4 font-poppins flex items-center gap-2"><Icon name="billing" className="w-5 h-5" /> Subscription</h2>
                        <div className="bg-darker p-4 rounded-md mb-4">
                            <p className="font-bold text-lg text-primary">Enterprise Plan</p>
                            <p className="text-sm text-light-text">Next billing date: 30 July 2024</p>
                        </div>
                        <button className="w-full bg-secondary text-light font-semibold py-2.5 rounded-lg hover:bg-secondary/80 transition-colors">Manage Subscription</button>
                    </div>
                     <div className="bg-dark rounded-lg p-6 border border-secondary/20">
                        <h2 className="text-xl font-bold mb-4 font-poppins flex items-center gap-2"><Icon name="security" className="w-5 h-5" /> Security & Compliance</h2>
                        <ul className="space-y-3 text-sm text-light-text">
                            <SecurityFeature>Enterprise-grade security</SecurityFeature>
                            <SecurityFeature>Compliance certifications</SecurityFeature>
                            <SecurityFeature>Detailed audit logs</SecurityFeature>
                            <SecurityFeature>End-to-end data encryption</SecurityFeature>
                            <SecurityFeature>Automated backup systems</SecurityFeature>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EnterpriseDashboard;
