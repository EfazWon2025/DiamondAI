import React from 'react';
import { PlatformConfig, MinecraftPlatform, MinecraftVersion } from '../types';
import { 
  ForgeIcon, 
  FabricIcon, 
  SpigotIcon, 
  PaperIcon, 
  BukkitIcon,
  NeoForgeIcon 
} from '../components/icons/PlatformIcons';

export const PLATFORMS: Record<MinecraftPlatform, PlatformConfig> = {
  forge: {
    name: 'forge',
    displayName: 'Minecraft Forge',
    versions: ['1.20.1', '1.19.4', '1.18.2', '1.17.1', '1.16.5', '1.15.2', '1.14.4', '1.13.2', '1.12.2'],
    buildSystem: 'gradle',
    template: 'forge',
    // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
    icon: React.createElement(ForgeIcon, { className: 'w-6 h-6' }),
    color: 'text-orange-500'
  },
  neoforge: {
    name: 'neoforge',
    displayName: 'NeoForge',
    versions: ['1.20.4', '1.20.1'],
    buildSystem: 'gradle',
    template: 'neoforge',
    // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
    icon: React.createElement(NeoForgeIcon, { className: 'w-6 h-6' }),
    color: 'text-purple-500'
  },
  fabric: {
    name: 'fabric',
    displayName: 'Fabric',
    versions: ['1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.17.1', '1.16.5'],
    buildSystem: 'gradle',
    template: 'fabric',
    // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
    icon: React.createElement(FabricIcon, { className: 'w-6 h-6' }),
    color: 'text-blue-400'
  },
  spigot: {
    name: 'spigot',
    displayName: 'Spigot',
    versions: ['1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.17.1', '1.16.5', '1.15.2', '1.14.4', '1.13.2', '1.12.2'],
    buildSystem: 'maven',
    template: 'spigot',
    // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
    icon: React.createElement(SpigotIcon, { className: 'w-6 h-6' }),
    color: 'text-green-500'
  },
  paper: {
    name: 'paper',
    displayName: 'Paper',
    versions: ['1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.17.1', '1.16.5'],
    buildSystem: 'maven',
    template: 'paper',
    // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
    icon: React.createElement(PaperIcon, { className: 'w-6 h-6' }),
    color: 'text-yellow-500'
  },
  bukkit: {
    name: 'bukkit',
    displayName: 'Bukkit',
    versions: ['1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.17.1', '1.16.5', '1.15.2', '1.14.4', '1.13.2', '1.12.2'],
    buildSystem: 'maven',
    template: 'bukkit',
    // FIX: Replaced JSX with React.createElement to avoid parsing errors in a .ts file.
    icon: React.createElement(BukkitIcon, { className: 'w-6 h-6' }),
    color: 'text-red-500'
  }
};

export const getPlatformVersions = (platform: MinecraftPlatform): MinecraftVersion[] => {
  return PLATFORMS[platform]?.versions || [];
};

export const getPlatformDisplayName = (platform: MinecraftPlatform): string => {
  return PLATFORMS[platform]?.displayName || platform;
};