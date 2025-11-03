import React from 'react';
import { Header } from './Header';
import { Hero } from './Hero';
import { Features } from './Features';
import { IdePreview } from './IdePreview';
import { Footer } from './Footer';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    return (
        <main className="overflow-x-hidden">
            <Header />
            <Hero onGetStarted={onGetStarted} />
            <Features />
            <IdePreview />
            <Footer />
        </main>
    );
};

export default LandingPage;