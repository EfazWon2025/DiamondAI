import React from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { Features } from './Features';
import { Dashboard } from './Dashboard';
import { Tutorials } from './Tutorials';
import { IdePreview } from './IdePreview';
import { Cta } from './Cta';
import { Footer } from './Footer';
import { BuildPlan } from './BuildPlan';

interface LandingPageProps {
    onGetStarted: () => void;
    onGoToEnterprise: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onGoToEnterprise }) => {
    return (
        <main className="overflow-x-hidden">
            <Header onGoToEnterprise={onGoToEnterprise} />
            <Hero onGetStarted={onGetStarted} />
            <Dashboard />
            <Features />
            <Tutorials />
            <IdePreview />
            <BuildPlan />
            <Cta onGetStarted={onGetStarted} />
            <Footer onGoToEnterprise={onGoToEnterprise} />
        </main>
    );
};

export default LandingPage;
