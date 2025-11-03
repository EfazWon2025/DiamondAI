import type { 
    Project, 
    FileTreeNode, 
    BuildResult,
    MinecraftPlatform
} from '../types';

// In a real app, this would point to the backend server.
const API_BASE_URL = 'http://localhost:3001/api'; 

// --- Project ---
export async function createProject(projectDetails: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    // This is a placeholder. A real implementation would post to the backend
    // and receive a new project object with a database-generated ID.
    console.log("Simulating project creation via API:", projectDetails);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    return {
        ...projectDetails,
        id: `proj_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
}

// --- Files ---
export async function getProjectFiles(projectId: string): Promise<FileTreeNode> {
     console.log(`Fetching files for project ${projectId} from API...`);
     // This mock returns a structure similar to the original hardcoded one.
     // A real backend would construct this from the actual file system.
     await new Promise(resolve => setTimeout(resolve, 500));
     const safeProjectName = projectId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
     return {
        name: projectId,
        type: 'folder',
        path: '/',
        children: [
            {
                name: 'src', type: 'folder', path: 'src', children: [
                    { name: 'main', type: 'folder', path: 'src/main', children: [
                        { name: 'java', type: 'folder', path: 'src/main/java', children: [
                             { name: 'com', type: 'folder', path: 'src/main/java/com', children: [
                                { name: 'example', type: 'folder', path: 'src/main/java/com/example', children: [
                                     { name: safeProjectName, type: 'folder', path: `src/main/java/com/example/${safeProjectName}`, children: [
                                        { name: `${safeProjectName.charAt(0).toUpperCase() + safeProjectName.slice(1)}.java`, type: 'file', path: `src/main/java/com/example/${safeProjectName}/${safeProjectName.charAt(0).toUpperCase() + safeProjectName.slice(1)}.java`, fileType: 'java' }
                                     ]}
                                ]}
                            ]}
                        ]},
                        { name: 'resources', type: 'folder', path: 'src/main/resources', children: [
                             { name: 'mods.toml', type: 'file', path: 'src/main/resources/mods.toml', fileType: 'toml' }
                        ]}
                    ]}
                ]
            },
            { name: 'build.gradle', type: 'file', path: 'build.gradle', fileType: 'gradle' }
        ]
    };
}

export async function getFileContent(projectId: string, filePath: string, platform: MinecraftPlatform, projectName: string): Promise<string> {
    console.log(`Fetching content for file ${filePath} from API for project ${projectId} (${platform})...`);
    await new Promise(resolve => setTimeout(resolve, 200));

    const safeProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '');
    const mainClassName = safeProjectName.charAt(0).toUpperCase() + safeProjectName.slice(1);
    const packageName = `com.example.${safeProjectName.toLowerCase()}`;

    if (filePath.endsWith('.java')) {
        switch (platform) {
            case 'forge':
            case 'neoforge':
                return `package ${packageName};

import com.mojang.logging.LogUtils;
import net.minecraftforge.fml.common.Mod;
import org.slf4j.Logger;

@Mod("${safeProjectName.toLowerCase()}")
public class ${mainClassName} {
    private static final Logger LOGGER = LogUtils.getLogger();

    public ${mainClassName}() {
        LOGGER.info("Hello from ${mainClassName}!");
    }
}`;
            case 'fabric':
                return `package ${packageName};

import net.fabricmc.api.ModInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class ${mainClassName} implements ModInitializer {
    public static final Logger LOGGER = LoggerFactory.getLogger("${safeProjectName.toLowerCase()}");

	@Override
	public void onInitialize() {
        LOGGER.info("Hello from ${mainClassName}!");
	}
}`;
            case 'spigot':
            case 'paper':
            case 'bukkit':
                return `package ${packageName};

import org.bukkit.plugin.java.JavaPlugin;

public final class ${mainClassName} extends JavaPlugin {
    @Override
    public void onEnable() {
        getLogger().info("Enabled ${mainClassName}!");
    }

    @Override
    public void onDisable() {
        // Plugin shutdown logic
    }
}`;
            default:
                 return `// Default Java template for ${filePath}`;
        }
    }
    if (filePath.endsWith('.gradle')) return `// build.gradle content for a ${platform} project.\nplugins { id 'java' }`;
    return `// Content for ${filePath}`;
}


export async function writeFileContent(projectId: string, filePath: string, content: string): Promise<void> {
    console.log(`Writing ${content.length} chars to ${filePath} via API for project ${projectId}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    // In a real app, a PUT request would be sent here.
}

// --- Build ---
export async function executeBuildCommand(projectId: string, command: string): Promise<{message: string}> {
    console.log(`Executing command '${command}' for project ${projectId} via API...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { message: `Command ${command} executed successfully.` };
}

export async function compileProject(projectId: string): Promise<BuildResult> {
    console.log(`Compiling project ${projectId} via API...`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    return {
        success: true,
        buildId: `build_${Date.now()}`,
        message: 'Compilation successful!',
        downloadUrl: `/api/projects/${projectId}/download/build_${Date.now()}`,
        fileName: `${projectId}.jar`,
        fileSize: 12345,
        compatibleServers: ['Forge', 'Spigot']
    };
}

export async function downloadBuild(projectId: string, buildId: string, fileName: string): Promise<void> {
    console.log(`Downloading build ${buildId} for project ${projectId}...`);
    
    // Simulate fetching the file blob from a server endpoint
    await new Promise(resolve => setTimeout(resolve, 500));
    const dummyJarContent = `This is a simulated JAR file for ${fileName}. It was generated for project ${projectId}.`;
    const blob = new Blob([dummyJarContent], { type: 'application/java-archive' });
    
    // Create a temporary link element and trigger the download
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up the temporary link and element
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
