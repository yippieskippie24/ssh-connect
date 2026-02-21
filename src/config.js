import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

export const CONFIG_DIR = join(homedir(), '.ssh-connect');
export const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
export const LOGS_FILE = join(CONFIG_DIR, 'logs.json');

const DEFAULT_CONFIG = {
  servers: [],
  defaults: {
    port: 22,
    username: process.env.USER || process.env.USERNAME || 'user',
  },
  settings: {
    healthCheckOnStart: true,
    logConnections: true,
  },
};

export function ensureConfigDir() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig() {
  ensureConfigDir();
  if (!existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }
  try {
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    // Merge with defaults so missing keys are handled
    return {
      servers: parsed.servers || [],
      defaults: { ...DEFAULT_CONFIG.defaults, ...(parsed.defaults || {}) },
      settings: { ...DEFAULT_CONFIG.settings, ...(parsed.settings || {}) },
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config) {
  ensureConfigDir();
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function getServer(alias) {
  const config = loadConfig();
  return config.servers.find(s => s.alias === alias) || null;
}

export function addServer(server) {
  const config = loadConfig();
  config.servers.push(server);
  saveConfig(config);
}

export function updateServer(alias, updates) {
  const config = loadConfig();
  const idx = config.servers.findIndex(s => s.alias === alias);
  if (idx === -1) throw new Error(`Server '${alias}' not found`);
  config.servers[idx] = { ...config.servers[idx], ...updates };
  saveConfig(config);
}

export function removeServer(alias) {
  const config = loadConfig();
  config.servers = config.servers.filter(s => s.alias !== alias);
  saveConfig(config);
}
