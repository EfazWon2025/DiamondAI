import React from 'react';
import { Icon } from './Icon.tsx';

interface ApiKeySelectionScreenProps {
    onSelectKey: () => void;
    isLoading: boolean;
}

const ApiKeySelectionScreen: React.FC<ApiKeySelectionScreenProps> = ({ onSelectKey, isLoading }) => {
    return (
        <div className="bg-darker text-light min-h-screen font-inter flex items-center justify-center text-center p-4">
            <div className="bg-dark p-8 md:p-12 rounded-2xl shadow-2xl shadow-secondary/20 border border-secondary/30 max-w-2xl w-full animate-[fadeInUp_0.5s_ease-out]">
                <Icon name="sparkles" className="w-20 h-20 text-primary mx-auto mb-6" />
                <h1 className="text-3xl md:text-4xl font-poppins font-bold text-light mb-4">
                    Unlock Advanced AI Features
                </h1>
                <p className="text-light-text mb-8 max-w-md mx-auto">
                    To access powerful generative AI features, including Veo video generation models, you need to select an API key. This key will be used for billing purposes.
                </p>
                <div className="bg-darker rounded-lg p-6 flex flex-col items-center">
                    {isLoading ? (
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    ) : (
                        <button
                            onClick={onSelectKey}
                            className="w-full max-w-sm bg-primary text-darker font-bold py-3 px-6 rounded-full transition-all duration-300 hover:bg-primary/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2"
                            aria-label="Select Veo API Key"
                            disabled={isLoading}
                        >
                            <Icon name="key" className="w-5 h-5" />
                            Select Veo API Key
                        </button>
                    )}
                    <a
                        href="https://ai.google.dev/gemini-api/docs/billing"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 text-secondary text-sm hover:underline"
                    >
                        Learn more about Veo API billing
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ApiKeySelectionScreen;