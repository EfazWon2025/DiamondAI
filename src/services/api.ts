import type { 
    Project, 
    FileTreeNode, 
    BuildResult,
    MinecraftPlatform
} from '../types';

// --- Real File System using localStorage ---

interface ProjectFileSystem {
    files: FileTreeNode;
    fileContents: Record<string, string>;
}

class FileSystemManager {
    private projectsData: Record<string, ProjectFileSystem> = {};
    private readonly storageKey = 'diamond_ai_file_system';

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) {
                this.projectsData = JSON.parse(storedData);
            }
        } catch (error) {
            console.error("Failed to load file system from localStorage:", error);
            this.projectsData = {};
        }
    }

    private saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.projectsData));
        } catch (error) {
            console.error("Failed to save file system to localStorage:", error);
        }
    }

    private generateInitialStructureAndContent(project: Project): ProjectFileSystem {
        const { name: projectName, platform } = project;
        const safeProjectName = projectName.replace(/[^a-zA-Z0-9]/g, '');
        const lowerCaseProjectName = safeProjectName.toLowerCase();
        const mainClassName = safeProjectName.charAt(0).toUpperCase() + safeProjectName.slice(1);
        const mainClassFile = `${mainClassName}.java`;
        const packageName = `com.example.${lowerCaseProjectName}`;

        const basePath = projectName;
        const packagePath = `src/main/java/com/example/${lowerCaseProjectName}`;
        const resourcesPath = 'src/main/resources';
        const mainJavaFileFullPath = `${basePath}/${packagePath}/${mainClassFile}`;
        const gradleFilePath = `${basePath}/build.gradle`;
        const tomlFilePath = `${basePath}/${resourcesPath}/mods.toml`;

        const files: FileTreeNode = {
            name: projectName,
            type: 'folder',
            path: basePath,
            children: [
                { name: 'src', type: 'folder', path: `${basePath}/src`, children: [
                    { name: 'main', type: 'folder', path: `${basePath}/src/main`, children: [
                        { name: 'java', type: 'folder', path: `${basePath}/src/main/java`, children: [
                             { name: 'com', type: 'folder', path: `${basePath}/src/main/java/com`, children: [
                                { name: 'example', type: 'folder', path: `${basePath}/src/main/java/com/example`, children: [
                                     { name: lowerCaseProjectName, type: 'folder', path: `${basePath}/${packagePath}`, children: [
                                        { name: mainClassFile, type: 'file', path: mainJavaFileFullPath, fileType: 'java' }
                                     ]}
                                ]}
                            ]}
                        ]},
                        { name: 'resources', type: 'folder', path: `${basePath}/${resourcesPath}`, children: [
                             { name: 'mods.toml', type: 'file', path: tomlFilePath, fileType: 'toml' }
                        ]}
                    ]}
                ]
            },
            { name: 'build.gradle', type: 'file', path: gradleFilePath, fileType: 'gradle' }
        ]};

        const fileContents: Record<string, string> = {};
        let mainClassContent = '';
        switch (platform) {
            case 'forge':
            case 'neoforge':
                mainClassContent = `package ${packageName};\n\nimport com.mojang.logging.LogUtils;\nimport net.minecraftforge.fml.common.Mod;\nimport org.slf4j.Logger;\n\n@Mod("${lowerCaseProjectName}")\npublic class ${mainClassName} {\n    private static final Logger LOGGER = LogUtils.getLogger();\n\n    public ${mainClassName}() {\n        LOGGER.info("Hello from ${mainClassName}!");\n    }\n}`;
                break;
            case 'fabric':
                mainClassContent = `package ${packageName};\n\nimport net.fabricmc.api.ModInitializer;\nimport org.slf4j.Logger;\nimport org.slf4j.LoggerFactory;\n\npublic class ${mainClassName} implements ModInitializer {\n    public static final Logger LOGGER = LoggerFactory.getLogger("${lowerCaseProjectName}");\n\n\t@Override\n\tpublic void onInitialize() {\n        LOGGER.info("Hello from ${mainClassName}!");\n\t}\n}`;
                break;
            default: // spigot, paper, bukkit
                mainClassContent = `package ${packageName};\n\nimport org.bukkit.plugin.java.JavaPlugin;\n\npublic final class ${mainClassName} extends JavaPlugin {\n    @Override\n    public void onEnable() {\n        getLogger().info("Enabled ${mainClassName}!");\n    }\n\n    @Override\n    public void onDisable() {\n        // Plugin shutdown logic\n    }\n}`;
        }
        fileContents[mainJavaFileFullPath] = mainClassContent;
        fileContents[gradleFilePath] = `// build.gradle for a ${platform} project.\nplugins { id 'java' }`;
        fileContents[tomlFilePath] = `# mods.toml for ${projectName}`;
        return { files, fileContents };
    }

    public initializeProject(project: Project) {
        if (!this.projectsData[project.id]) {
            this.projectsData[project.id] = this.generateInitialStructureAndContent(project);
            this.saveToStorage();
        }
    }

    public getProjectFiles(projectId: string): FileTreeNode {
        if (!this.projectsData[projectId]) throw new Error(`Project ${projectId} not found.`);
        return this.projectsData[projectId].files;
    }

    public getFileContent(projectId: string, filePath: string): string {
        if (!this.projectsData[projectId]) throw new Error(`Project ${projectId} not found.`);
        return this.projectsData[projectId].fileContents[filePath] ?? ``;
    }

    public writeFileContent(projectId: string, filePath: string, content: string) {
        if (!this.projectsData[projectId]) throw new Error(`Project ${projectId} not found.`);
        this.projectsData[projectId].fileContents[filePath] = content;
        this.saveToStorage();
    }
    
    private addNodeToTree(root: FileTreeNode, parentPath: string, newNode: FileTreeNode): FileTreeNode {
        if (root.path === parentPath && root.type === 'folder') {
            const newChildren = [...(root.children || []), newNode].sort((a, b) => {
                if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
                return a.name.localeCompare(b.name);
            });
            return { ...root, children: newChildren };
        }
        if (root.children) {
            return { ...root, children: root.children.map(child => this.addNodeToTree(child, parentPath, newNode)) };
        }
        return root;
    }

    public createFile(projectId: string, filePath: string): { success: boolean; newFile: FileTreeNode } {
        if (!this.projectsData[projectId]) throw new Error(`Project ${projectId} not found.`);
        
        const pathParts = filePath.split('/');
        const name = pathParts.pop()!;
        const parentPath = pathParts.join('/');
        
        const extension = name.split('.').pop();
        const fileTypeMap: { [key: string]: FileTreeNode['fileType'] } = { java: 'java', yml: 'yml', json: 'json', png: 'png', gradle: 'gradle', toml: 'toml', properties: 'properties' };
        const fileType = extension && fileTypeMap[extension] ? fileTypeMap[extension] : 'unknown';
        const newFileNode: FileTreeNode = { name, path: filePath, type: 'file', fileType };

        const projectFS = this.projectsData[projectId];
        projectFS.files = this.addNodeToTree(projectFS.files, parentPath, newFileNode);
        projectFS.fileContents[filePath] = '';
        this.saveToStorage();

        return { success: true, newFile: newFileNode };
    }

    public createFolder(projectId: string, folderPath: string): { success: boolean; newFolder: FileTreeNode } {
        if (!this.projectsData[projectId]) throw new Error(`Project ${projectId} not found.`);
        
        const pathParts = folderPath.split('/');
        const name = pathParts.pop()!;
        const parentPath = pathParts.join('/');
        const newFolderNode: FileTreeNode = { name, path: folderPath, type: 'folder', children: [] };
        
        const projectFS = this.projectsData[projectId];
        projectFS.files = this.addNodeToTree(projectFS.files, parentPath, newFolderNode);
        this.saveToStorage();
        
        return { success: true, newFolder: newFolderNode };
    }
}

const fileSystemManager = new FileSystemManager();

// --- Project ---
export async function createProject(projectDetails: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const newProject = {
        ...projectDetails,
        id: `proj_${Date.now()}`,
        createdAt: new Date().toISOString(),
    };
    fileSystemManager.initializeProject(newProject);
    return newProject;
}

// --- Files ---
export async function getProjectFiles(projectId: string, projectName: string): Promise<FileTreeNode> {
     await new Promise(resolve => setTimeout(resolve, 200));
     return fileSystemManager.getProjectFiles(projectId);
}

export async function getFileContent(projectId: string, filePath: string, platform: MinecraftPlatform, projectName: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return fileSystemManager.getFileContent(projectId, filePath);
}

export async function writeFileContent(projectId: string, filePath: string, content: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    fileSystemManager.writeFileContent(projectId, filePath, content);
}

export async function createFile(projectId: string, filePath: string): Promise<{ success: boolean; newFile: FileTreeNode }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return fileSystemManager.createFile(projectId, filePath);
}

export async function createFolder(projectId: string, folderPath: string): Promise<{ success: boolean; newFolder: FileTreeNode }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return fileSystemManager.createFolder(projectId, folderPath);
}

// --- Build (These remain mocks) ---
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
    await new Promise(resolve => setTimeout(resolve, 500));
    const dummyJarContent = `This is a simulated JAR file for ${fileName}.`;
    const blob = new Blob([dummyJarContent], { type: 'application/java-archive' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
