import { GoogleGenAI, Type } from "@google/genai";
import type { AIFileModification, Project } from '../types';
import { logger } from './logger';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const COMMON_INSTRUCTIONS = `
- **SAFETY PROTOCOL: ETHICAL GUARDIAN**
- You have a strict ethical guideline to NEVER generate code that is harmful, malicious, or could cause damage to a server or player experience.
- If a user requests any of the following, you MUST REJECT the request by responding with a specific JSON object: \`{ "error": "SAFETY_VIOLATION", "message": "<Your explanation here>" }\`.
- Your explanation message should state that you cannot fulfill the request because it violates safety guidelines, briefly explain the harm (e.g., "it would crash the server"), and suggest a positive alternative (e.g., "I can help you build a performance monitoring plugin instead.").
- DO NOT generate any file content for a rejected request. Your entire response must be ONLY the error JSON object.
- **IMMEDIATELY REJECT** requests related to:
  - **LAG/CRASH:** 'lag machine', 'server crash', 'tnt spam', 'duplication glitch', 'item spam'.
  - **HACKING/EXPLOITS:** 'hack plugin', 'exploit', 'op yourself', 'bypass permissions', 'force op'.
  - **DESTRUCTION/GRIEFING:** 'destroy world', 'corrupt data', 'griefing tool', 'auto-grief'.
- For all other valid requests, follow the normal JSON output format with the "files" array.

- You are an expert Minecraft developer who modifies an entire project structure based on a user's request.
- Your response MUST be a valid JSON object. Do NOT use markdown code blocks (e.g. \`\`\`json) or any other conversational text or explanation (unless it's a safety violation response).
- The JSON object must contain a single key "files" which is an array of objects.
- Each object in the "files" array represents a file to be created or updated and must have two keys: "path" (a string representing the full file path from the project root) and "content" (a string with the full, complete file content).
- You must provide the FULL and COMPLETE content for every file you modify or create. Do not provide snippets or partial code.
- Analyze the user's request and the existing project files to intelligently merge changes.
- If a user asks to add a feature like a command, you MUST modify ALL necessary files. For a Spigot plugin, this means updating 'plugin.yml' to register the command AND updating the main Java file to implement the command logic.
- Your goal is to produce a production-quality, working project structure based on the user's request.
- Your entire response will be parsed as JSON. It MUST NOT contain any text, explanation, or markdown formatting—only the raw JSON object for valid requests.
`;

function getSystemInstruction(project: Project): string {
    const { platform, name, minecraftVersion } = project;
    let platformInstructions = '';

    const projectContextInstruction = `
- You are working inside a project named "${name}".
- The Minecraft version for this project is ${minecraftVersion}.
- All file paths you generate MUST start with "${name}/". For example: "${name}/src/main/java/com/example/MyClass.java".
- Do NOT invent a new project name. Stick to the provided project structure. Confine all your modifications to the existing project.
`;

    switch (platform) {
        case 'spigot':
        case 'paper':
        case 'bukkit':
            platformInstructions = `You are an expert in Spigot/Paper/Bukkit plugin development.
- Key Files: Logic is in Java files. Configuration is in 'plugin.yml'.
- Versioning: Ensure 'plugin.yml' \`api-version\` matches the project's Minecraft version (e.g., '1.20' for 1.20.4). Ensure the build file ('pom.xml' or 'build.gradle') uses the correct Java version (Java 17 for Minecraft 1.18+).
- Commands: Register commands in 'plugin.yml' and implement them using CommandExecutor. Include permission checks.
- Events: Use @EventHandler for event listeners.
- Safety First: For operations like teleportation, ALWAYS perform safety checks. Ensure the destination location is safe and won't cause the player to get stuck or take damage. Use methods like getHighestBlockAt() or check for solid blocks.
- Configurability: Do NOT hardcode values like magic numbers, messages, or potion effects. Use a 'config.yml' to make features configurable by server admins. Generate a default config with comments.
- Feature Clarity: If a request is abstract (e.g., "go to the moon"), implement a reasonable, safe interpretation (e.g., teleport high in the sky with Slow Falling) and add code comments explaining the implementation and its limitations.`;
            break;
        case 'forge':
        case 'neoforge':
            platformInstructions = `The user is working on a Forge/NeoForge mod. Key files are 'mods.toml' for configuration and Java files for logic. Event handlers use @SubscribeEvent and items/blocks are registered using DeferredRegister.`;
            break;
        case 'fabric':
            platformInstructions = `The user is working on a Fabric mod. Key files are 'fabric.mod.json' for configuration and Java files for logic. The main class implements ModInitializer, and registrations happen in the onInitialize method.`;
            break;
        default:
            platformInstructions = 'You are a helpful code assistant.';
    }

    return `${platformInstructions}\n${projectContextInstruction}\n${COMMON_INSTRUCTIONS}`;
}

export async function generateProjectChanges(
    project: Project,
    prompt: string,
    fileContents: Record<string, string>,
    fileContext?: string | null
): Promise<AIFileModification[]> {
    try {
        const contextPrompt = fileContext
            ? `The user has provided the following document as context. Use this information to inform your code generation:\n--- DOCUMENT START ---\n${fileContext}\n--- DOCUMENT END ---\n\n`
            : '';

        const projectState = JSON.stringify(fileContents, null, 2);

        const fullPrompt = `${contextPrompt}The user wants to make the following change: "${prompt}"

This is the current state of all files in the project, represented as a JSON object where keys are file paths and values are their content:
\`\`\`json
${projectState}
\`\`\`

Based on my system instructions, analyze the provided JSON file structure and provide a new JSON object in the specified format containing the full, updated content for all necessary files.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: fullPrompt,
            config: {
                systemInstruction: getSystemInstruction(project),
                temperature: 0.0,
                topK: 1,
                responseMimeType: "application/json",
            }
        });

        if (!response.text) {
             throw new Error("The AI model did not return any content. This could be due to the safety filter or an issue with the prompt.");
        }
        
        const parsedResponse = JSON.parse(response.text);

        if (parsedResponse.error === "SAFETY_VIOLATION" && parsedResponse.message) {
            throw new Error(`🛡️ AI Safety Guard: ${parsedResponse.message}`);
        }

        if (!parsedResponse.files || !Array.isArray(parsedResponse.files)) {
            throw new Error("AI response was not in the expected format. Missing 'files' array.");
        }

        return parsedResponse.files;
    } catch (error) {
        logger.error("Error generating code via Gemini API:", error);
        
        if (error instanceof Error && error.message.startsWith('🛡️')) {
            throw error; // Re-throw our custom safety error to be displayed in the UI
        }

        let errorMessage = "An unknown error occurred during code generation.";
        if (error instanceof SyntaxError) {
             errorMessage = "AI returned invalid JSON. Please try rephrasing your request.";
        } else if (error instanceof Error) {
            const msg = error.message.toLowerCase();
            if (msg.includes('api key') || msg.includes('permission denied') || msg.includes('401') || msg.includes('403')) {
                errorMessage = "Authentication failed. Please ensure your API key is correct and has the necessary permissions.";
            } else if (msg.includes('rate limit') || msg.includes('429')) {
                errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
            } else if (msg.includes('network') || msg.includes('failed to fetch')) {
                errorMessage = "Network connection error. Please check your internet connection and try again.";
            } else {
                errorMessage = `AI generation failed: ${error.message}`;
            }
        }
        
        throw new Error(errorMessage);
    }
}