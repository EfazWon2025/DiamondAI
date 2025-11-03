import React from 'react';

const featureData = {
    "INTELLIGENT CODE EDITOR": [
        "Smart autocomplete for Minecraft classes",
        "Event handler templates (@SubscribeEvent)",
        "Registry system helpers (DeferredRegister)",
        "Configuration file generation (mods.toml)",
        "Mixin support with bytecode preview"
    ],
    "VISUAL DEVELOPMENT TOOLS": [
        "Blockstate JSON visual editor",
        "3D model preview with rotation",
        "Texture editor with Minecraft palette",
        "Recipe builder (shaped, shapeless, smelting)",
        "Loot table editor with conditions"
    ],
    "ADVANCED DEBUGGING SYSTEM": [
        "Hot-reload code changes without restart",
        "Breakpoints in event handlers during gameplay",
        "Entity state inspection (NBT, position)",
        "Network packet monitoring"
    ],
    "SMART COMPILATION": [
        "Incremental compilation",
        "Pre-compile validation",
        "Crash report analyzer with fixes",
        "Mapping conflict resolver"
    ],
    "TESTING ENVIRONMENT": [
        "Dedicated test server instance",
        "Automated test scenarios",
        "Multi-player simulation",
        "Performance benchmarking"
    ],
    "WORKFLOW OPTIMIZATION": [
        "Forge vs Fabric project setup",
        "One-click build and test",
        "Update JSON generator",
        "CurseForge integration"
    ]
};


const FeatureColumn: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div className="bg-dark p-6 rounded-lg border border-secondary/20">
        <h3 className="text-xl font-poppins font-bold mb-4 text-primary">{title}</h3>
        <ul className="space-y-3 text-light-text">
            {items.map(item => (
                <li key={item} className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-1 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);

export const BuildPlan: React.FC = () => {
    return (
        <section id="execution-plan" className="py-24 px-[5%] bg-darker">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-4">A Specialized IDE for Minecraft Modding</h2>
                <p className="text-light-text">We eliminate the complexity of Minecraft modding by providing integrated tools for coding, asset creation, debugging, and deployment.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {Object.entries(featureData).map(([title, items]) => (
                    <FeatureColumn key={title} title={title} items={items} />
                ))}
            </div>
             <div className="mt-16 text-center max-w-3xl mx-auto p-6 bg-dark rounded-lg border border-primary/20">
                <h3 className="text-2xl font-poppins font-bold text-primary mb-3">Core Purpose</h3>
                <p className="text-light-text">To be a specialized IDE that eliminates the complexity of Minecraft modding by providing integrated tools for coding, asset creation,debugging, and deployment, targeting new and experienced modders alike.</p>
            </div>
        </section>
    );
};
