import type { 
    Project, 
    FileTreeNode, 
    BuildResult,
    MinecraftPlatform
} from '../types';

interface ProjectFileSystem {
    files: FileTreeNode;
    fileContents: Record<string, string>;
}

class FileSystemManager {
    private projectsData: Record<string, ProjectFileSystem> = {};
    private readonly storageKey = 'diamond_ai_file_system';

    constructor() { this.loadFromStorage(); }

    private loadFromStorage() {
        try {
            const storedData = localStorage.getItem(this.storageKey);
            if (storedData) this.projectsData = JSON.parse(storedData);
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

    private generateInitialStructureAndContent({ name, platform }: Project): ProjectFileSystem {
        const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
        const lowerName = safeName.toLowerCase();
        const mainClass = safeName.charAt(0).toUpperCase() + safeName.slice(1);
        const mainFile = `${mainClass}.java`;
        const pkg = `com.example.${lowerName}`;
        const basePath = name;
        const pkgPath = `src/main/java/${pkg.replace(/\./g, '/')}`;
        const resPath = 'src/main/resources';

        const createDirs = (path: string, parts: string[]): FileTreeNode => {
            const currentPart = parts.shift();
            if (!currentPart) return { name: '', type: 'folder', path: '', children: [] }; // Should not happen
            const currentPath = path ? `${path}/${currentPart}` : currentPart;
            return {
                name: currentPart, type: 'folder', path: currentPath,
                children: parts.length > 0 ? [createDirs(currentPath, parts)] : []
            };
        };
        
        const mainJavaFileFullPath = `${basePath}/${pkgPath}/${mainFile}`;
        const javaDirs = createDirs(basePath, ['src', 'main', 'java', 'com', 'example', lowerName]);
        const mainJavaFile: FileTreeNode = { name: mainFile, type: 'file', path: mainJavaFileFullPath, fileType: 'java' };
        
        let currentFolder = javaDirs;
        while(currentFolder.children && currentFolder.children.length > 0) currentFolder = currentFolder.children[0];
        currentFolder.children?.push(mainJavaFile);

        const files: FileTreeNode = { name: basePath, type: 'folder', path: basePath, children: [
            javaDirs,
            { name: 'resources', type: 'folder', path: `${basePath}/src/main/resources`, children: [
                { name: 'mods.toml', type: 'file', path: `${basePath}/${resPath}/mods.toml`, fileType: 'toml' }
            ]},
            { name: 'build.gradle', type: 'file', path: `${basePath}/build.gradle`, fileType: 'gradle' }
        ]};

        const fileContents: Record<string, string> = {};
        let mainClassContent = '';
        switch (platform) {
            case 'forge':
            case 'neoforge':
                mainClassContent = `package ${pkg};\n\nimport net.minecraftforge.fml.common.Mod;\n\n@Mod("${lowerName}")\npublic class ${mainClass} {\n    public ${mainClass}() {}\n}`;
                break;
            case 'fabric':
                mainClassContent = `package ${pkg};\n\nimport net.fabricmc.api.ModInitializer;\n\npublic class ${mainClass} implements ModInitializer {\n\t@Override\n\tpublic void onInitialize() {}\n}`;
                break;
            default:
                mainClassContent = `package ${pkg};\n\nimport org.bukkit.plugin.java.JavaPlugin;\n\npublic final class ${mainClass} extends JavaPlugin {\n    @Override\n    public void onEnable() {}\n}`;
        }
        fileContents[mainJavaFileFullPath] = mainClassContent;
        fileContents[`${basePath}/build.gradle`] = `// build.gradle for ${name}`;
        fileContents[`${basePath}/${resPath}/mods.toml`] = `# mods.toml for ${name}`;
        
        return { files, fileContents };
    }
    
    public initializeProject(project: Project) {
        if (!this.projectsData[project.id]) {
            this.projectsData[project.id] = this.generateInitialStructureAndContent(project);
            this.saveToStorage();
        }
    }

    public getProjectFiles(projectId: string): FileTreeNode { return this.projectsData[projectId]?.files; }
    public getFileContent(projectId: string, filePath: string): string { return this.projectsData[projectId]?.fileContents[filePath] ?? ''; }
    public writeFileContent(projectId: string, filePath: string, content: string) {
        if (this.projectsData[projectId]) {
            this.projectsData[projectId].fileContents[filePath] = content;
            this.saveToStorage();
        }
    }
    
    private addNodeToTree(root: FileTreeNode, parentPath: string, newNode: FileTreeNode): FileTreeNode {
        if (root.path === parentPath && root.type === 'folder') {
            const newChildren = [...(root.children || []), newNode].sort((a, b) => (a.type !== b.type) ? (a.type === 'folder' ? -1 : 1) : a.name.localeCompare(b.name));
            return { ...root, children: newChildren };
        }
        if (root.children) return { ...root, children: root.children.map(child => this.addNodeToTree(child, parentPath, newNode)) };
        return root;
    }

    public createFile(projectId: string, filePath: string): { success: boolean; newNode: FileTreeNode } {
        const pathParts = filePath.split('/');
        const name = pathParts.pop()!;
        const parentPath = pathParts.join('/');
        const ext = name.split('.').pop() as FileTreeNode['fileType'];
        const fileTypeMap: Record<string, FileTreeNode['fileType']> = { java: 'java', yml: 'yml', json: 'json', png: 'png', gradle: 'gradle', toml: 'toml', properties: 'properties' };
        const newFileNode: FileTreeNode = { name, path: filePath, type: 'file', fileType: fileTypeMap[ext!] || 'unknown' };

        const projectFS = this.projectsData[projectId];
        projectFS.files = this.addNodeToTree(projectFS.files, parentPath, newFileNode);
        projectFS.fileContents[filePath] = '';
        this.saveToStorage();

        return { success: true, newNode: newFileNode };
    }

    public createFolder(projectId: string, folderPath: string): { success: boolean; newNode: FileTreeNode } {
        const pathParts = folderPath.split('/');
        const name = pathParts.pop()!;
        const parentPath = pathParts.join('/');
        const newFolderNode: FileTreeNode = { name, path: folderPath, type: 'folder', children: [] };
        
        const projectFS = this.projectsData[projectId];
        projectFS.files = this.addNodeToTree(projectFS.files, parentPath, newFolderNode);
        this.saveToStorage();
        
        return { success: true, newNode: newFolderNode };
    }
}

const fileSystemManager = new FileSystemManager();
const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function createProject(projectDetails: Omit<Project, 'id' | 'createdAt'>): Promise<Project> {
    await simulateDelay(500);
    const newProject = { ...projectDetails, id: `proj_${Date.now()}`, createdAt: new Date().toISOString() };
    fileSystemManager.initializeProject(newProject);
    return newProject;
}

export async function getProjectFiles(projectId: string): Promise<FileTreeNode> {
    await simulateDelay(200);
    return fileSystemManager.getProjectFiles(projectId);
}

export async function getFileContent(projectId: string, filePath: string): Promise<string> {
    await simulateDelay(100);
    return fileSystemManager.getFileContent(projectId, filePath);
}

export async function writeFileContent(projectId: string, filePath: string, content: string): Promise<void> {
    await simulateDelay(100);
    fileSystemManager.writeFileContent(projectId, filePath, content);
}

export async function createFile(projectId: string, filePath: string): Promise<{ success: boolean; newNode: FileTreeNode }> {
    await simulateDelay(200);
    return fileSystemManager.createFile(projectId, filePath);
}

export async function createFolder(projectId: string, folderPath: string): Promise<{ success: boolean; newNode: FileTreeNode }> {
    await simulateDelay(200);
    return fileSystemManager.createFolder(projectId, folderPath);
}

export async function executeBuildCommand(projectId: string, command: string): Promise<{message: string}> {
    await simulateDelay(1000);
    return { message: `Command ${command} executed for ${projectId}.` };
}

export async function compileProject(projectId: string): Promise<BuildResult> {
    await simulateDelay(3000);
    const success = Math.random() > 0.2; // 80% success rate
    return {
        success,
        buildId: `build_${Date.now()}`,
        message: success ? 'Compilation successful!' : 'Compilation failed. See console for details.',
        downloadUrl: success ? `/api/projects/${projectId}/download/build_${Date.now()}` : undefined,
        fileName: success ? `${projectId}.jar` : undefined,
        // FIX: Added missing property 'compatibleServers' to satisfy the BuildResult type.
        compatibleServers: success ? ['Paper 1.20.x', 'Spigot 1.20.x'] : [],
        fileSize: success ? 12345 : undefined,
    };
}

export async function downloadBuild(projectId: string, buildId: string, fileName: string): Promise<void> {
    await simulateDelay(500);
    const blob = new Blob([`This is a simulated JAR file for ${fileName}.`], { type: 'application/java-archive' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}