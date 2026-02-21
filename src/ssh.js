import { spawn } from 'child_process';
import { appendLog } from './logger.js';
import { loadConfig } from './config.js';
import { homedir } from 'os';

/**
 * Spawn an SSH connection to a configured server.
 * Returns the child process.
 */
export function connectToServer(server) {
  const config = loadConfig();
  const port = server.port || config.defaults?.port || 22;
  const username = server.username || config.defaults?.username || process.env.USER;

  const args = buildSSHArgs({ host: server.host, port, username, identityFile: server.identityFile });
  const startTime = Date.now();

  const child = spawn('ssh', args, { stdio: 'inherit' });

  child.on('exit', (code) => {
    const duration = Math.round((Date.now() - startTime) / 1000);
    if (config.settings?.logConnections) {
      appendLog({
        alias: server.alias || null,
        host: server.host,
        port,
        username,
        duration,
        exitCode: code,
        success: code === 0,
      });
    }
  });

  return child;
}

/**
 * Spawn an SSH connection to a custom host (not in config).
 */
export function connectCustom({ host, port = 22, username, identityFile }) {
  const args = buildSSHArgs({ host, port, username, identityFile });
  return spawn('ssh', args, { stdio: 'inherit' });
}

function buildSSHArgs({ host, port, username, identityFile }) {
  const args = [];

  if (Number(port) !== 22) {
    args.push('-p', String(port));
  }

  if (identityFile) {
    const resolved = identityFile.replace(/^~/, homedir());
    args.push('-i', resolved);
  }

  if (username) {
    args.push(`${username}@${host}`);
  } else {
    args.push(host);
  }

  return args;
}
