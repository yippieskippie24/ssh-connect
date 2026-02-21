import { readFileSync, writeFileSync, existsSync } from 'fs';
import { ensureConfigDir, LOGS_FILE } from './config.js';

const MAX_LOG_ENTRIES = 1000;

export function loadLogs() {
  if (!existsSync(LOGS_FILE)) return [];
  try {
    const raw = readFileSync(LOGS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function appendLog(entry) {
  ensureConfigDir();
  const logs = loadLogs();
  logs.push({ ...entry, timestamp: new Date().toISOString() });
  // Keep only the most recent entries
  if (logs.length > MAX_LOG_ENTRIES) {
    logs.splice(0, logs.length - MAX_LOG_ENTRIES);
  }
  writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8');
}
