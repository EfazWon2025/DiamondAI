import React from 'react';

export const ForgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12,2L2,7V17L12,22L22,17V7L12,2M11,15.5V11.33L5.5,8.33L11,11.33V15.5M12,10.08L17.5,7.08L12,4.08L6.5,7.08L12,10.08M13,15.5V11.33L18.5,8.33L13,11.33V15.5Z" />
    </svg>
);

export const NeoForgeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
);

export const FabricIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <rect x="3" y="3" width="8" height="8" rx="1"/>
        <rect x="13" y="3" width="8" height="8" rx="1"/>
        <rect x="3" y="13" width="8" height="8" rx="1"/>
        <rect x="13" y="13" width="8" height="8" rx="1"/>
    </svg>
);

export const SpigotIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12C20,13.42 19.5,14.73 18.67,15.83L8.17,5.33C9.27,4.5 10.58,4 12,4M5.33,8.17L15.83,18.67C14.73,19.5 13.42,20 12,20A8,8 0 0,1 4,12C4,10.58 4.5,9.27 5.33,8.17Z" />
    </svg>
);

export const PaperIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
    </svg>
);

export const BukkitIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M21,16.5C21,16.5 21,17.28 21,17.38C21,18.83 17.5,20 12,20C6.5,20 3,18.83 3,17.38C3,17.28 3,16.5 3,16.5V7.5C3,7.5 3,6.72 3,6.62C3,5.17 6.5,4 12,4C17.5,4 21,5.17 21,6.62C21,6.72 21,7.5 21,7.5V16.5M12,6C8.5,6 6,7 6,8.5V15.5C6,17 8.5,18 12,18C15.5,18 18,17 18,15.5V8.5C18,7 15.5,6 12,6Z" />
    </svg>
);