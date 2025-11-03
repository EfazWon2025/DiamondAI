import type * as React from 'react';

export type MinecraftPlatform = 'forge' | 'fabric' | 'spigot' | 'paper' | 'bukkit' | 'neoforge';
export type MinecraftVersion = string; // e.g., '1.20.1', '1.19.2'

export interface Project {
  id: string;
  name: string;
  platform: MinecraftPlatform;
  minecraftVersion: MinecraftVersion;
  description: string;
  createdAt: string;
  template: 'basic' | 'advanced' | 'custom';
}

export interface PlatformConfig {
  name: string;
  displayName: string;
  versions: MinecraftVersion[];
  buildSystem: 'gradle' | 'maven';
  template: string;
  icon: React.ReactElement;
  color: string;
}

export interface BuildResult {
  success: boolean;
  buildId: string;
  message: string;
  downloadUrl?: string;
  fileName?: string;
  fileSize?: number;
  compatibleServers: string[];
}


export interface TestResult {
  passed: number;
  failed: number;
  score: number;
  duration: number;
  details: {
    compilation: { success: boolean; duration: number };
    deployment: { success: boolean; duration: number };
    unitTests: { success: boolean; duration: number };
    integrationTests: { success: boolean; duration: number };
    stressTests: { success: boolean; duration: number };
    securityScan: { success: boolean; duration: number };
  };
}

export interface Block {
    id: string;
    name: string;
    content: string;
    category: 'events' | 'player' | 'logic' | 'world' | 'items';
}

export interface WorkspaceBlock {
    id: string;
    block: Block;
}

export interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'info' | 'error';
}

export interface FileTreeNode {
  name:string;
  type: 'file' | 'folder';
  path: string;
  fileType?: 'java' | 'yml' | 'xml' | 'unknown' | 'json' | 'png' | 'gradle' | 'toml' | 'properties';
  children?: FileTreeNode[];
}

export interface ConsoleLogEntry {
    level: 'INFO' | 'WARN' | 'ERROR' | 'CMD';
    message: string;
    source: string;
    timestamp: string;
}

export interface AIHistoryItem {
    id: string;
    prompt: string;
    code: string;
    timestamp: Date;
    applied: boolean;
}
