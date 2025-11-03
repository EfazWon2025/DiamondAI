import React from 'react';
import { ForgeIcon, FabricIcon, SpigotIcon, NeoForgeIcon } from './icons/PlatformIcons';

const platformFeatures = [
    {
        icon: ForgeIcon,
        platform: 'Forge',
        description: 'Create powerful mods with the most popular modding platform.',
        versions: '1.12.2 - 1.20.1',
        color: 'text-orange-500'
    },
    {
        icon: FabricIcon,
        platform: 'Fabric',
        description: 'Lightweight and modern modding with excellent performance.',
        versions: '1.14 - 1.20.4',
        color: 'text-blue-400'
    },
    {
        icon: SpigotIcon,
        platform: 'Spigot/Paper',
        description: 'Build server plugins with an extensive API and plugin ecosystem.',
        versions: '1.8 - 1.20.4',
        color: 'text-green-500'
    },
    {
        icon: NeoForgeIcon,
        platform: 'NeoForge',
        description: 'Next-generation modding with modern features and tooling.',
        versions: '1.20.1+',
        color: 'text-purple-500'
    }
];

const FeatureCard: React.FC<{ icon: React.ElementType; platform: string; description: string; versions: string; color: string }> = ({ icon: Icon, platform, description, versions, color }) => (
    <div className="bg-dark rounded-2xl p-8 transition-all duration-300 border border-secondary/20 hover:border-primary/50 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20">
        <div className={`w-16 h-16 bg-darker rounded-xl flex items-center justify-center mb-5 border border-secondary/20 ${color}`}>
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-poppins font-bold mb-4">{platform}</h3>
        <p className="text-light-text mb-4">{description}</p>
        <span className="inline-block mt-4 py-1 px-4 rounded-full text-xs font-semibold bg-secondary/20 text-secondary">{versions}</span>
    </div>
);

export const Features: React.FC = () => {
    return (
        <section id="features" className="py-24 px-[5%] bg-darker">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-4">One IDE, All Platforms</h2>
                <p className="text-light-text">From Forge mods to Paper plugins, Diamond AI provides a unified and professional-grade toolset for all major Minecraft platforms.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {platformFeatures.map(feature => <FeatureCard key={feature.platform} {...feature} />)}
            </div>
        </section>
    );
};