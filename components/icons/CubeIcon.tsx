import React from 'react';

export const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
        <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
);

export const TokenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v.093c-1.46.18-2.5.962-2.5 2.157 0 1.195 1.04 1.977 2.5 2.157v1.093c-1.46.18-2.5.962-2.5 2.157 0 1.195 1.04 1.977 2.5 2.157V18a.75.75 0 001.5 0v-.093c1.46-.18 2.5-.962 2.5-2.157 0-1.195-1.04-1.977-2.5-2.157v-1.093c1.46-.18 2.5-.962 2.5-2.157 0-1.195-1.04-1.977-2.5-2.157V6z" clipRule="evenodd" />
    </svg>
);