import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { spawn } from 'child_process';

const SSH_DIR = join(homedir(), '.ssh');

/**
 * List all SSH key pairs found in ~/.ssh/
 */
export function listKeys() {
  if (!existsSync(SSH_DIR)) return [];

  let files;
  try {
    files = readdirSync(SSH_DIR);
  } catch {
    return [];
  }

  const keys = [];
  for (const file of files) {
    if (file.endsWith('.pub')) {
      const name = file.replace('.pub', '');
      // Skip authorized_keys, known_hosts, etc.
      if (name.startsWith('authorized') || name.startsWith('known')) continue;
      const privateExists = existsSync(join(SSH_DIR, name));
      keys.push({
        name,
        publicKeyFile: join(SSH_DIR, file),
        privateKeyFile: join(SSH_DIR, name),
        hasPrivate: privateExists,
      });
    }
  }

  return keys;
}

/**
 * Generate a new SSH key pair.
 * Returns a Promise that resolves with { keyPath, publicKeyFile }.
 */
export function generateKey({ name, type = 'ed25519', comment = '' }) {
  return new Promise((resolve, reject) => {
    const keyPath = join(SSH_DIR, name);

    if (existsSync(keyPath)) {
      reject(new Error(`Key '${name}' already exists`));
      return;
    }

    const effectiveComment = comment || `${name}@ssh-connect`;
    const args = ['-t', type, '-f', keyPath, '-N', '', '-C', effectiveComment];
    const child = spawn('ssh-keygen', args, { stdio: 'pipe' });

    let stderr = '';
    child.stderr?.on('data', (d) => { stderr += d.toString(); });

    child.on('exit', (code) => {
      if (code === 0) {
        resolve({ keyPath, publicKeyFile: `${keyPath}.pub` });
      } else {
        reject(new Error(stderr || 'Key generation failed'));
      }
    });

    child.on('error', (err) => {
      reject(new Error(`ssh-keygen not found: ${err.message}`));
    });
  });
}

/**
 * Copy a public key to a server using ssh-copy-id.
 * Returns the child process (stdio: inherit for interactive auth).
 */
export function copyKeyToServer(publicKeyFile, server) {
  const args = [
    '-i', publicKeyFile,
    '-p', String(server.port || 22),
    `${server.username}@${server.host}`,
  ];
  return spawn('ssh-copy-id', args, { stdio: 'inherit' });
}

/**
 * Read the content of a public key file.
 */
export function getPublicKey(name) {
  const pubFile = join(SSH_DIR, `${name}.pub`);
  if (!existsSync(pubFile)) return null;
  try {
    return readFileSync(pubFile, 'utf-8').trim();
  } catch {
    return null;
  }
}
