import { GoogleGenAI } from "@google/genai";
import type { AIHistoryItem, Project } from '../types';
import { logger } from './logger';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const COMMON_INSTRUCTIONS = `
- You MUST return the ENTIRE, complete, and updated Java file content.
- Your response must be ONLY the raw Java code. Do NOT use markdown code blocks (e.g. \`\`\`java) or any other conversational text or explanation.
- Ensure all necessary imports are present to make the code compile.
- Analyze the user's request and the existing code to intelligently merge the changes. Do not just append code at the end of the file.
- If a user asks to add a feature, you must implement it fully within the class structure provided.
- Your goal is to produce production-quality, working code based on the user's request.
- Your entire response will be written directly to a .java file and compiled. It MUST NOT contain any text, explanation, or markdown formatting—only the raw Java code for the complete file.
`;


function getSystemInstruction(project: Project): string {
    const { platform, name: projectName } = project;
    const safeProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '');
    const mainClassName = safeProjectName.charAt(0).toUpperCase() + safeProjectName.slice(1);
    const packageName = `com.example.${safeProjectName.toLowerCase()}`;
    
    let platformInstructions = '';

    switch (platform) {
        case 'spigot':
        case 'paper':
        case 'bukkit':
            platformInstructions = `You are an expert Minecraft Spigot plugin developer. You write clean, efficient, and modern Java code using the Spigot/Paper/Bukkit API.
The main plugin class is named '${mainClassName}' and it extends 'JavaPlugin'. The package is '${packageName}'.

Follow these rules STRICTLY:
1. **Events:** Implement \`Listener\`, use \`@EventHandler\`, and register events in \`onEnable()\` with \`getServer().getPluginManager().registerEvents(this, this);\`.
2. **Commands:** Register commands in \`onEnable()\` using \`getCommand("your_command").setExecutor(this);\`. The main class must implement \`CommandExecutor\`.
3. **Imports:** Add all required imports (e.g., \`org.bukkit.event.Listener\`, event classes).
4. **Code Structure:** Intelligently integrate new code. Do not add placeholder methods.`;
            break;
        
        case 'forge':
        case 'neoforge':
            platformInstructions = `You are an expert Minecraft Forge/NeoForge mod developer. You write clean and modern Java code using the Forge/NeoForge API.
The main mod class is named '${mainClassName}' and is annotated with @Mod("${safeProjectName.toLowerCase()}"). The package is '${packageName}'.

Follow these rules STRICTLY:
1. **Event Bus:** Register event handlers in the constructor: \`MinecraftForge.EVENT_BUS.register(this);\`.
2. **Event Handlers:** Annotate methods with \`@SubscribeEvent\`.
3. **Registration:** Use \`DeferredRegister\` for items, blocks, etc., and register it to the mod event bus in the constructor.
4. **Imports:** Add all required imports (e.g., \`net.minecraftforge.fml.common.Mod\`, \`net.minecraftforge.eventbus.api.SubscribeEvent\`).
5. **Code Structure:** Integrate new features logically. Do not add placeholder methods.`;
            break;

        case 'fabric':
            platformInstructions = `You are an expert Minecraft Fabric mod developer. You write clean and modern Java code using the Fabric API.
The main mod class is named '${mainClassName}' and implements 'ModInitializer'. The entry point is the 'onInitialize' method. The package is '${packageName}'.

Follow these rules STRICTLY:
1. **Entry Point:** All initialization logic goes inside \`onInitialize()\`.
2. **Events (Callbacks):** Register callbacks in \`onInitialize()\`. E.g., \`ServerPlayConnectionEvents.JOIN.register(...);\`.
3. **Commands:** Register commands using \`CommandRegistrationCallback.EVENT.register(...);\`.
4. **Registration:** Register items and blocks in \`onInitialize()\` using \`Registry.register(...);\`.
5. **Imports:** Add all required imports (e.g., \`net.fabricmc.api.ModInitializer\`).
6. **Code Structure:** All registration logic goes in \`onInitialize()\`. Do not add placeholder methods.`;
            break;

        default:
            platformInstructions = 'You are a helpful code assistant. Return only the complete, updated code.';
    }

    return `${platformInstructions}\n${COMMON_INSTRUCTIONS}`;
}

export async function generatePluginCode(
    project: Project,
    prompt: string,
    currentCode: string,
    history: Omit<AIHistoryItem, 'id' | 'timestamp' | 'applied'>[],
    fileContext?: string | null
): Promise<string> {
    try {
        const contextPrompt = fileContext
            ? `The user has provided the following document as context. Use this information to inform your code generation:\n--- DOCUMENT START ---\n${fileContext}\n--- DOCUMENT END ---\n\n`
            : '';

        const fullPrompt = `${contextPrompt}The user wants to make the following change: "${prompt}"

This is the current code of the file they are editing:
---
${currentCode}
---

Based on my system instructions, please provide the full, updated code for the entire file with the requested changes properly integrated. Remember to add all necessary imports and follow the platform's conventions.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                systemInstruction: getSystemInstruction(project),
                temperature: 0.0,
                topK: 1,
            }
        });
        
        let code = response.text.trim();
        const match = /```(?:java)?\s*([\s\S]+?)\s*```/.exec(code);
        if (match) {
            code = match[1].trim();
        } else if (code.startsWith("```")) {
            code = code.replace(/^```(?:java)?\s*\n?/, '').replace(/\n?```$/, '');
        }

        return code;
    } catch (error) {
        logger.error("Error generating code via Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate code: ${error.message}`);
        }
        throw new Error("An unknown error occurred during code generation.");
    }
}