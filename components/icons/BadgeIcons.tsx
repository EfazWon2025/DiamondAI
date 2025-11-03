import React from 'react';

export const BugHunterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 z" fill="#FF6B6B" stroke="none" />
        <line x1="1" y1="12" x2="23" y2="12" stroke="#F8F9FA" strokeWidth="1.5" />
    </svg>
);

export const InnovatorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" fill="#7B68EE" stroke="none" />
        <path d="M12 16 L12 12 M12 8 L12 7" stroke="#F8F9FA" strokeWidth="3" />
        <path d="M15.5 14.5 L12 12 L8.5 14.5" stroke="#F8F9FA" strokeWidth="2" fill="none" />
    </svg>
);

export const PerfectionistIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#FFD700" stroke="#F8F9FA" strokeWidth="1"/>
    </svg>
);

export const PopularIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="#00FF88" stroke="none" />
        <circle cx="9" cy="7" r="4" fill="#00FF88" stroke="none" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="#F8F9FA" strokeWidth="1.5"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="#F8F9FA" strokeWidth="1.5"/>
    </svg>
);