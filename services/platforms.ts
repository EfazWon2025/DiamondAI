import React from 'react';
import { PlatformConfig, MinecraftPlatform, MinecraftVersion } from '../types';
import { Icon } from '../components/Icon.tsx';

export const PLATFORMS: Record<MinecraftPlatform, PlatformConfig> = {
  forge: {
    name: 'forge',
    displayName: 'Minecraft Forge',
    versions: ['1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.18.2', '1.16.5', '1.12.2', '1.8.9'],
    buildSystem: 'gradle',
    template: 'forge',
    icon: React.createElement(Icon, { name: 'forge', className: 'w-6 h-6' }),
    color: 'text-orange-500'
  },
  neoforge: {
    name: 'neoforge',
    displayName: 'NeoForge',
    versions: ['1.21', '1.20.6', '1.20.4'],
    buildSystem: 'gradle',
    template: 'neoforge',
    icon: React.createElement(Icon, { name: 'neoforge', className: 'w-6 h-6' }),
    color: 'text-purple-500'
  },
  fabric: {
    name: 'fabric',
    displayName: 'Fabric',
    versions: ['1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4'],
    buildSystem: 'gradle',
    template: 'fabric',
    icon: React.createElement(Icon, { name: 'fabric', className: 'w-6 h-6' }),
    color: 'text-blue-400'
  },
  spigot: {
    name: 'spigot',
    displayName: 'Spigot',
    versions: ['1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.16.5', '1.12.2', '1.8.8'],
    buildSystem: 'maven',
    template: 'spigot',
    icon: React.createElement(Icon, { name: 'spigot', className: 'w-6 h-6' }),
    color: 'text-green-500'
  },
  paper: {
    name: 'paper',
    displayName: 'Paper',
    versions: ['1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.16.5', '1.12.2', '1.8.8'],
    buildSystem: 'maven',
    template: 'paper',
    icon: React.createElement(Icon, { name: 'paper', className: 'w-6 h-6' }),
    color: 'text-yellow-500'
  },
  bukkit: {
    name: 'bukkit',
    displayName: 'Bukkit',
    versions: ['1.21', '1.20.6', '1.20.4', '1.20.1', '1.19.4', '1.16.5', '1.12.2', '1.8.8'],
    buildSystem: 'maven',
    template: 'bukkit',
    icon: React.createElement(Icon, { name: 'bukkit', className: 'w-6 h-6' }),
    color: 'text-red-500'
  }
};

export const getPlatformVersions = (platform: MinecraftPlatform): MinecraftVersion[] => PLATFORMS[platform]?.versions || [];