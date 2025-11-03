import React, { useState } from 'react';
import type { Block, WorkspaceBlock } from '../types';
import { Icon } from './Icon';

const TOOLBOX_BLOCKS: Block[] = [
    { 
        id: 'event-join', 
        name: 'On Player Join', 
        category: 'events', 
        content: `    @EventHandler
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        player.sendMessage("Welcome, " + player.getName() + "!");
        // Your logic here
    }` 
    },
    { id: 'player-heal', name: 'Heal Player', category: 'player', content: '        player.setHealth(20.0);' },
    { id: 'player-feed', name: 'Feed Player', category: 'player', content: '        player.setFoodLevel(20);' },
    { 
        id: 'logic-if-perm', 
        name: 'If Has Permission', 
        category: 'logic', 
        content: `        if (player.hasPermission("myplugin.use")) {
            // Your logic here
        }` 
    },
];

interface VisualBuilderProps {
    onBlockDrop: (codeSnippet: string) => void;
}

export const VisualBuilder: React.FC<VisualBuilderProps> = ({ onBlockDrop }) => {
    const [workspaceBlocks, setWorkspaceBlocks] = useState<WorkspaceBlock[]>([]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, block: Block) => {
        e.dataTransfer.setData('application/json', JSON.stringify(block));
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const blockData = e.dataTransfer.getData('application/json');
        if (blockData) {
            try {
                const block: Block = JSON.parse(blockData);
                const newBlock: WorkspaceBlock = { id: `ws-${Date.now()}`, block };
                setWorkspaceBlocks(prev => [...prev, newBlock]);
                onBlockDrop(block.content);
            } catch (error) {
                console.error("Failed to parse dropped block data:", error);
            }
        }
    };
    
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const categories = {
        events: { name: "Events", color: "text-red-400" },
        player: { name: "Player Actions", color: "text-blue-400" },
        logic: { name: "Logic", color: "text-green-400" },
    };
    
    return (
        <div className="h-full flex bg-darker">
            <div className="w-64 bg-dark border-r border-secondary/10 p-4 overflow-y-auto">
                <h3 className="text-lg font-poppins font-bold mb-4">Toolbox</h3>
                {Object.entries(categories).map(([key, {name, color}]) => (
                    <div key={key} className="mb-4">
                        <h4 className={`font-semibold text-sm mb-2 ${color}`}>{name}</h4>
                        <div className="space-y-2">
                            {TOOLBOX_BLOCKS.filter(b => b.category === key).map(block => (
                                <div
                                    key={block.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, block)}
                                    className="p-2 rounded-md bg-darker border border-secondary/20 cursor-grab flex items-center gap-2 hover:border-primary transition-colors"
                                >
                                    <Icon name="puzzle" className={`w-4 h-4 flex-shrink-0 ${color}`} />
                                    <span className="text-xs font-semibold text-light">{block.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div 
                className="flex-1 p-8 bg-grid-pattern flex flex-col items-start"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {workspaceBlocks.length === 0 ? (
                    <div className="m-auto text-center bg-dark/80 backdrop-blur-sm p-8 rounded-lg">
                        <Icon name="puzzle" className="w-16 h-16 text-secondary mx-auto mb-4"/>
                        <h3 className="text-2xl font-poppins font-bold">Visual Builder</h3>
                        <p className="text-light-text mt-2">Drag and drop blocks from the toolbox to build your plugin logic.</p>
                    </div>
                ) : (
                    workspaceBlocks.map(wsBlock => (
                        <div key={wsBlock.id} className="p-3 mb-2 rounded-lg bg-dark border border-secondary/30 shadow-lg animate-[fadeInUp_0.3s_ease-out]">
                             <h4 className={`text-sm font-bold flex items-center gap-2 ${categories[wsBlock.block.category].color}`}>
                                <Icon name="puzzle" className="w-4 h-4" /> {wsBlock.block.name}
                            </h4>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
