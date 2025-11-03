import React from 'react';
import { Icon } from './Icon';

const FooterLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
    <li><a href={href} className="text-light-text hover:text-primary transition-colors duration-300">{children}</a></li>
);

interface FooterProps {
    onGoToEnterprise: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onGoToEnterprise }) => {
    return (
        <footer className="bg-dark pt-20 pb-8 px-[5%]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div className="pr-4">
                    <h3 className="text-2xl font-poppins font-bold mb-4">Diamond AI</h3>
                    <p className="text-light-text mb-6">The definitive way to create Minecraft plugins with AI.</p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 bg-darker rounded-full flex items-center justify-center text-light-text hover:bg-secondary hover:text-light transition-all duration-300"><Icon name="twitter" className="w-5 h-5" /></a>
                        <a href="#" className="w-10 h-10 bg-darker rounded-full flex items-center justify-center text-light-text hover:bg-secondary hover:text-light transition-all duration-300"><Icon name="discord" className="w-5 h-5" /></a>
                        <a href="#" className="w-10 h-10 bg-darker rounded-full flex items-center justify-center text-light-text hover:bg-secondary hover:text-light transition-all duration-300"><Icon name="github" className="w-5 h-5" /></a>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Products</h3>
                    <ul className="space-y-3">
                        <FooterLink href="#">Minecraft IDE</FooterLink>
                        <FooterLink href="#">Discord Bot IDE</FooterLink>
                        <li>
                            <button onClick={onGoToEnterprise} className="text-light-text hover:text-primary transition-colors duration-300 text-left w-full">
                                Enterprise Solutions
                            </button>
                        </li>
                        <FooterLink href="#">Cloud Deployment</FooterLink>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Resources</h3>
                    <ul className="space-y-3">
                        <FooterLink href="#">Documentation</FooterLink>
                        <FooterLink href="#">Tutorials</FooterLink>
                        <FooterLink href="#">API Reference</FooterLink>
                        <FooterLink href="#">Community</FooterLink>
                    </ul>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-4">Company</h3>
                    <ul className="space-y-3">
                        <FooterLink href="#">About Us</FooterLink>
                        <FooterLink href="#">Pricing</FooterLink>
                        <FooterLink href="#">Blog</FooterLink>
                        <FooterLink href="#">Contact</FooterLink>
                    </ul>
                </div>
            </div>
            <div className="text-center pt-8 border-t border-secondary/10 text-light-text">
                <p>&copy; {new Date().getFullYear()} Diamond AI. All rights reserved.</p>
            </div>
        </footer>
    );
};
