import { Command } from 'commander';
import React from 'react';
import { render } from 'ink';
import chalk from 'chalk';
import {
  loadConfig,
  getServer,
  removeServer,
  CONFIG_FILE,
  LOGS_FILE,
} from './config.js';
import { connectToServer } from './ssh.js';
import { checkAllServers } from './health.js';
import { loadLogs } from './logger.js';
import { App } from './ui/App.js';

const program = new Command();

program
  .name('ssh-connect')
  .description('Modern SSH connection manager — the spiritual successor to ssh_connect.sh')
  .version('1.0.0');

// ─── Default action: launch TUI or quick-connect ─────────────────────────────

program
  .argument('[alias]', 'Server alias for quick connect (skips TUI)')
  .action(async (alias) => {
    if (alias) {
      await quickConnect(alias);
    } else {
      await runTUI();
    }
  });

// ─── Subcommands ──────────────────────────────────────────────────────────────

program
  .command('add')
  .description('Add a new server (opens TUI form)')
  .action(async () => {
    await runTUI('add');
  });

program
  .command('list')
  .description('List all configured servers')
  .action(() => {
    const config = loadConfig();
    const servers = config.servers;

    if (servers.length === 0) {
      console.log(chalk.gray('\n  No servers configured. Run: ssh-connect add\n'));
      return;
    }

    const W = { alias: 20, host: 22, port: 8, user: 16 };
    const rule = '─'.repeat(W.alias + W.host + W.port + W.user + 20);

    console.log(chalk.bold.cyan('\n  SSH Connect — Servers\n'));
    console.log(chalk.gray('  ' + rule));
    console.log(
      '  ' +
      chalk.bold.gray('ALIAS'.padEnd(W.alias)) +
      chalk.bold.gray('HOST'.padEnd(W.host)) +
      chalk.bold.gray('PORT'.padEnd(W.port)) +
      chalk.bold.gray('USER'.padEnd(W.user)) +
      chalk.bold.gray('DESCRIPTION')
    );
    console.log(chalk.gray('  ' + rule));

    for (const s of servers) {
      const user = s.username || config.defaults?.username || '';
      console.log(
        '  ' +
        chalk.cyan((s.alias).padEnd(W.alias)) +
        chalk.white((s.host).padEnd(W.host)) +
        chalk.gray(String(s.port || 22).padEnd(W.port)) +
        chalk.gray(user.padEnd(W.user)) +
        chalk.gray(s.description || '')
      );
    }

    console.log(chalk.gray('  ' + rule));
    console.log(chalk.gray(`\n  ${servers.length} server(s) configured\n`));
  });

program
  .command('remove <alias>')
  .alias('rm')
  .description('Remove a server by alias')
  .action((alias) => {
    const server = getServer(alias);
    if (!server) {
      console.error(chalk.red(`  Error: Server "${alias}" not found`));
      process.exit(1);
    }
    removeServer(alias);
    console.log(chalk.green(`  ✔ Removed server "${alias}"`));
  });

program
  .command('edit <alias>')
  .description('Edit a server (opens TUI form)')
  .action(async (alias) => {
    const server = getServer(alias);
    if (!server) {
      console.error(chalk.red(`  Error: Server "${alias}" not found`));
      process.exit(1);
    }
    await runTUI('edit', { server });
  });

program
  .command('keys')
  .description('Manage SSH keys (TUI)')
  .action(async () => {
    await runTUI('keys');
  });

program
  .command('logs')
  .description('Show connection history')
  .action(() => {
    const allLogs = loadLogs().reverse().slice(0, 50);

    if (allLogs.length === 0) {
      console.log(chalk.gray('\n  No connection history yet.\n'));
      return;
    }

    const W = { ts: 22, alias: 20, host: 20, status: 10 };
    const rule = '─'.repeat(W.ts + W.alias + W.host + W.status + 8);

    console.log(chalk.bold.cyan('\n  SSH Connect — Connection History\n'));
    console.log(chalk.gray('  ' + rule));
    console.log(
      '  ' +
      chalk.bold.gray('TIMESTAMP'.padEnd(W.ts)) +
      chalk.bold.gray('ALIAS'.padEnd(W.alias)) +
      chalk.bold.gray('HOST'.padEnd(W.host)) +
      chalk.bold.gray('STATUS'.padEnd(W.status)) +
      chalk.bold.gray('DURATION')
    );
    console.log(chalk.gray('  ' + rule));

    for (const log of allLogs) {
      const ts = new Date(log.timestamp).toLocaleString();
      const status = log.success
        ? chalk.green('✔ ok'.padEnd(W.status))
        : chalk.red('✖ fail'.padEnd(W.status));
      console.log(
        '  ' +
        chalk.gray(ts.padEnd(W.ts)) +
        chalk.cyan((log.alias || '—').padEnd(W.alias)) +
        chalk.gray((log.host || '—').padEnd(W.host)) +
        status +
        chalk.gray(`${log.duration || 0}s`)
      );
    }

    console.log(chalk.gray('  ' + rule));
    console.log(chalk.gray(`\n  Showing ${allLogs.length} most recent connections\n`));
  });

program
  .command('config')
  .description('Show config and log file paths')
  .action(() => {
    console.log(chalk.cyan('\n  SSH Connect — File Locations\n'));
    console.log('  ' + chalk.gray('Config: ') + chalk.white(CONFIG_FILE));
    console.log('  ' + chalk.gray('Logs:   ') + chalk.white(LOGS_FILE));
    console.log();
  });

program
  .command('check [alias]')
  .description('Run health check on one or all servers')
  .action(async (alias) => {
    const config = loadConfig();
    const servers = alias
      ? config.servers.filter(s => s.alias === alias)
      : config.servers;

    if (servers.length === 0) {
      console.log(chalk.gray(alias
        ? `  Server "${alias}" not found`
        : '  No servers configured'));
      return;
    }

    console.log(chalk.cyan('\n  Checking server health...\n'));

    await checkAllServers(servers, (sAlias, status) => {
      const dot   = status === 'online' ? chalk.green('●') : chalk.red('●');
      const label = status === 'online' ? chalk.green('online') : chalk.red('offline');
      const srv   = servers.find(s => s.alias === sAlias);
      console.log(`  ${dot}  ${chalk.cyan(sAlias.padEnd(22))} ${chalk.gray((srv?.host || '').padEnd(22))} ${label}`);
    });

    console.log();
  });

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Direct connect to a server by alias — no TUI overhead. */
async function quickConnect(alias) {
  const server = getServer(alias);
  if (!server) {
    console.error(chalk.red(`\n  Error: Server "${alias}" not found`));
    console.log(chalk.gray(`  Run 'ssh-connect list' to see available servers\n`));
    process.exit(1);
  }

  console.log(chalk.cyan(`\n  Connecting to ${alias} (${server.host})...\n`));
  const child = connectToServer(server);

  await new Promise((resolve) => {
    child.on('exit', resolve);
    child.on('error', (err) => {
      console.error(chalk.red(`  SSH error: ${err.message}`));
      resolve();
    });
  });
}

/**
 * Launch the Ink TUI. After the user initiates a connection, Ink is
 * unmounted and SSH is spawned. When SSH exits, the TUI relaunches.
 */
async function runTUI(initialScreen = 'main', initialData = null) {
  while (true) {
    const server = await launchTUI(initialScreen, initialData);
    if (!server) break;

    // After Ink unmounts, spawn SSH in the raw terminal
    process.stdout.write('\n');
    console.log(chalk.cyan(`  Connecting to ${server.alias} (${server.host})...\n`));

    await new Promise((resolve) => {
      const child = connectToServer(server);
      child.on('exit', resolve);
      child.on('error', (err) => {
        console.error(chalk.red(`  SSH error: ${err.message}`));
        resolve();
      });
    });

    // Return to main menu after SSH session ends
    initialScreen = 'main';
    initialData = null;
  }
}

/**
 * Render the Ink TUI and wait for it to exit.
 * Returns the server the user wants to connect to, or null if they quit.
 */
function launchTUI(screen = 'main', data = null) {
  return new Promise((resolve) => {
    let pendingServer = null;

    const { unmount, waitUntilExit } = render(
      React.createElement(App, {
        initialScreen: screen,
        initialData: data,
        onConnect: (server) => {
          pendingServer = server;
          unmount();
        },
      })
    );

    waitUntilExit().then(() => {
      resolve(pendingServer);
    });
  });
}

program.parseAsync(process.argv);
