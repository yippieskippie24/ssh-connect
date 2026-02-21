import net from 'net';

/**
 * Check if a host:port is reachable via TCP.
 * Returns 'online' or 'offline'.
 */
export function checkHost(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let resolved = false;

    const done = (result) => {
      if (!resolved) {
        resolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);
    socket.on('connect', () => done('online'));
    socket.on('error', () => done('offline'));
    socket.on('timeout', () => done('offline'));

    try {
      socket.connect(Number(port) || 22, host);
    } catch {
      done('offline');
    }
  });
}

/**
 * Check all servers in parallel, calling onResult as each resolves.
 */
export async function checkAllServers(servers, onResult) {
  const promises = servers.map(async (server) => {
    const status = await checkHost(server.host, server.port || 22);
    onResult(server.alias, status);
    return { alias: server.alias, status };
  });
  return Promise.all(promises);
}
