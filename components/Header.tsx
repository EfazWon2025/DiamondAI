import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Discord', href: '#' },
        { name: 'Docs', href: '#' },
        { name: 'Features', href: '#features' },
        { name: 'IDE', href: '#ide' },
        { name: 'Privacy', href: '#' },
        { name: 'Terms', href: '#' }
    ];

    return (
        <header className={`fixed top-0 left-0 w-full flex justify-between items-center px-[5%] z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-darker/90 backdrop-blur-lg border-b border-primary/10' : 'py-5 bg-transparent'}`}>
            <a href="#" className="flex items-center text-3xl font-poppins font-bold text-light no-underline">
                <Icon name="diamond" className="w-8 h-8 text-primary mr-2" />
                Diamond<span className="text-primary">AI</span>
            </a>
            <nav className="hidden md:flex items-center">
                <ul className="flex list-none font-medium">
                    {navLinks.map(item => (
                        <li key={item.name} className="ml-8">
                            <a href={item.href} className="text-light-text relative transition-colors duration-300 hover:text-primary after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full">{item.name}</a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex items-center gap-4">
                <button className="hidden md:block bg-secondary text-light border-none py-2.5 px-6 rounded-full font-semibold cursor-pointer transition-all duration-300 hover:bg-secondary/80 hover:-translate-y-1 hover:shadow-lg hover:shadow-secondary/30">
                    Sign In
                </button>
            </div>
        </header>
    );
};
