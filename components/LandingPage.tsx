import React from 'react';
import { Header } from './Header.tsx';
import { Hero } from './Hero.tsx';
import { Features } from './Features.tsx';
import { IdePreview } from './IdePreview.tsx';
import { Footer } from './Footer.tsx';

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