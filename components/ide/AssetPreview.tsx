import React, { useState } from 'react';
import type { FileTreeNode } from '../../types';
import { Icon } from '../Icon';

const ModelPreview: React.FC = () => (
    <div className="w-full h-64 flex items-center justify-center bg-darker rounded-lg overflow-hidden">
        <style>{`
            @keyframes spin { from { transform: rotateY(0deg) rotateX(10deg); } to { transform: rotateY(360deg) rotateX(10deg); } }
            .cube { width: 100px; height: 100px; position: relative; transform-style: preserve-3d; animation: spin 12s linear infinite; }
            .face { position: absolute; width: 100px; height: 100px; background: #7B68EE30; border: 1px solid #7B68EE; }
            .front  { transform: translateZ(50px); } .back   { transform: rotateY(180deg) translateZ(50px); }
            .right  { transform: rotateY(90deg) translateZ(50px); } .left   { transform: rotateY(-90deg) translateZ(50px); }
            .top    { transform: rotateX(90deg) translateZ(50px); } .bottom { transform: rotateX(-90deg) translateZ(50px); }
        `}</style>
        <div className="cube">
            <div className="face front"></div><div className="face back"></div>
            <div className="face right"></div><div className="face left"></div>
            <div className="face top"></div><div className="face bottom"></div>
        </div>
    </div>
);

const TexturePreview: React.FC = () => {
    const [zoom, setZoom] = useState(10);
    return (
        <div className="w-full">
            <div className="w-full h-64 flex items-center justify-center bg-darker rounded-lg overflow-hidden p-4">
                <div className="w-16 h-16 bg-pink-500" style={{ imageRendering: 'pixelated', backgroundImage: `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABYSURBVDhPnYy7DcAgDAMx/v/P7gQSk1pwKsmgEC5HhmAFWjBCO2jAWrTgnHED3pTiA3a+xAP0iJ8f4b0fsZ8f8e/x+MH4fB4fE+9n/K8/Gg9Y6crpEy2wDAAAAABJRU5ErkJggg==)`, transform: `scale(${zoom})`, transition: 'transform 0.1s ease' }} />
            </div>
            <div className="flex items-center gap-2 mt-2">
                <button onClick={() => setZoom(z => Math.max(1, z - 1))} className="p-1 bg-darker rounded hover:bg-secondary/30"><Icon name="zoomOut" className="w-4 h-4" /></button>
                <input type="range" min="1" max="20" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full h-1 bg-darker rounded-lg appearance-none cursor-pointer" />
                <button onClick={() => setZoom(z => Math.min(20, z + 1))} className="p-1 bg-darker rounded hover:bg-secondary/30"><Icon name="zoomIn" className="w-4 h-4" /></button>
                <span className="text-xs w-12 text-center">{Math.round(zoom * 100)}%</span>
            </div>
        </div>
    );
};

interface AssetPreviewProps {
    activeFile: FileTreeNode | undefined;
}

export const AssetPreview: React.FC<AssetPreviewProps> = ({ activeFile }) => {
    const renderContent = () => {
        if (!activeFile) {
            return (
                <div className="h-full flex flex-col items-center justify-center text-center text-light-text">
                    <Icon name="diamond" className="w-24 h-24 text-secondary/10 mx-auto"/>
                    <p className="mt-4">Select an asset file to see a preview.</p>
                </div>
            );
        }
        if (activeFile.fileType === 'json') {
            return (
                <div>
                    <h3 className="font-bold mb-2">3D Model Preview</h3>
                    <p className="text-xs text-light-text mb-3">Displaying model for <span className="text-primary">{activeFile.name}</span>.</p>
                    <ModelPreview />
                </div>
            );
        }
        if (activeFile.fileType === 'png') {
            return (
                <div>
                    <h3 className="font-bold mb-2">Texture Preview</h3>
                    <p className="text-xs text-light-text mb-3">Displaying texture for <span className="text-primary">{activeFile.name}</span>.</p>
                    <TexturePreview />
                </div>
            );
        }
        return (
            <div className="h-full flex flex-col items-center justify-center text-center text-light-text">
                <Icon name="fileCode" className="w-24 h-24 text-secondary/10 mx-auto"/>
                <p className="mt-4 text-lg font-bold">{activeFile.name}</p>
                <p className="mt-1">No preview available for this file type.</p>
            </div>
        );
    };

    return (
        <aside className="w-full h-full bg-dark flex flex-col border-l border-secondary/10">
            <div className="p-3 border-b border-secondary/10">
                <h2 className="text-xs font-bold uppercase tracking-wider text-light-text">Asset Preview</h2>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                {renderContent()}
            </div>
        </aside>
    );
};
