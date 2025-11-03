import { GoogleGenAI } from "@google/genai";
import type { AIHistoryItem, Project } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function getSystemInstruction(platform: Project['platform'], projectName: string): string {
    const safeProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '');
    const mainClassName = safeProjectName.charAt(0).toUpperCase() + safeProjectName.slice(1);
    const packageName = `com.example.${safeProjectName.toLowerCase()}`;

    const commonInstructions = `
- You MUST return the ENTIRE, complete, and updated Java file content.
- Your response must be ONLY the raw Java code. Do NOT use markdown code blocks (e.g. \`\`\`java) or any other conversational text.
- Ensure all necessary imports are present to make the code compile.
- Analyze the user's request and the existing code to intelligently merge the changes. Do not just append code at the end of the file.
- If a user asks to add a feature, you must implement it fully within the class structure provided.
- Your goal is to produce production-quality, working code based on the user's request.
`;

    switch (platform) {
        case 'spigot':
        case 'paper':
        case 'bukkit':
            return `You are an expert Minecraft Spigot plugin developer. You write clean, efficient, and modern Java code using the Spigot/Paper/Bukkit API.
The main plugin class is named '${mainClassName}' and it extends 'JavaPlugin'. The package is '${packageName}'.

CRITICAL INSTRUCTIONS:
- To add event listeners: The class must implement 'Listener'. The event handler method must be public, void, have one argument (the event), and be annotated with '@EventHandler'. You MUST register the listener in the onEnable() method, for example: 'getServer().getPluginManager().registerEvents(this, this);'.
- To add commands: Implement the 'onCommand' method. Ensure you handle the command arguments and sender correctly.
- Example of a correct PlayerJoinEvent handler:
  @EventHandler
  public void onPlayerJoin(PlayerJoinEvent event) {
      Player player = event.getPlayer();
      player.sendMessage("Welcome!");
  }
${commonInstructions}`;
        case 'forge':
        case 'neoforge':
            return `You are an expert Minecraft Forge/NeoForge mod developer. You write clean and modern Java code using the Forge/NeoForge API.
The main mod class is named '${mainClassName}' and is annotated with @Mod("${safeProjectName.toLowerCase()}"). The package is '${packageName}'.

CRITICAL INSTRUCTIONS:
- To add event listeners: Use the Forge event bus. Methods should be annotated with '@SubscribeEvent'. If it's a static method, the class containing it should be annotated with '@Mod.EventBusSubscriber(modid = "${safeProjectName.toLowerCase()}", bus = Mod.EventBusSubscriber.Bus.MOD)'.
- The constructor of the main class is the primary entry point for registration.
- Example of a correct PlayerLoggedInEvent handler:
  @SubscribeEvent
  public static void onPlayerLogin(PlayerEvent.PlayerLoggedInEvent event) {
      Player player = event.getEntity();
      player.sendSystemMessage(Component.literal("Welcome!"));
  }
${commonInstructions}`;
        case 'fabric':
            return `You are an expert Minecraft Fabric mod developer. You write clean and modern Java code using the Fabric API.
The main mod class is named '${mainClassName}' and implements 'ModInitializer'. The entry point is the 'onInitialize' method. The package is '${packageName}'.

CRITICAL INSTRUCTIONS:
- To add event listeners: Use Fabric's callback system. For example, for player join: 'ServerPlayConnectionEvents.JOIN.register((handler, sender, server) -> { ... });'. This registration MUST happen inside the 'onInitialize' method.
- Example of a correct Player Join event:
  @Override
  public void onInitialize() {
    ServerPlayConnectionEvents.JOIN.register((handler, sender, server) -> {
      ServerPlayerEntity player = handler.player;
      player.sendMessage(Text.of("Welcome!"));
    });
  }
${commonInstructions}`;
        default:
            return `You are a helpful code assistant. Return only the complete, updated code. ${commonInstructions}`;
    }
}

export async function generatePluginCode(
    project: Project,
    prompt: string,
    currentCode: string,
    history: Omit<AIHistoryItem, 'id' | 'timestamp' | 'applied'>[]
): Promise<string> {
    try {
        const model = 'gemini-2.5-pro';
        const systemInstruction = getSystemInstruction(project.platform, project.name);
        
        const fullPrompt = `The user wants to make the following change: "${prompt}"

This is the current code of the file they are editing:
---
${currentCode}
---

Based on my system instructions, please provide the full, updated code for the entire file with the requested changes properly integrated. Remember to add all necessary imports and follow the platform's conventions.`;

        const response = await ai.models.generateContent({
            model: model,
            contents: fullPrompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.0, // Set to 0 for maximum predictability in code generation
                topK: 1,
            }
        });
        
        let code = response.text.trim();
        
        // Aggressive cleanup to ensure only code is returned
        if (code.startsWith("```java")) {
            code = code.substring(7).trim();
        } else if (code.startsWith("```")) {
            code = code.substring(3).trim();
        }
        
        if (code.endsWith("```")) {
            code = code.slice(0, -3).trim();
        }

        return code;
    } catch (error) {
        console.error("Error generating code via Gemini API:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate code: ${error.message}`);
        }
        throw new Error("An unknown error occurred during code generation.");
    }
}
