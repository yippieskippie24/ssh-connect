import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Banner } from './components/Banner.js';
import { Divider } from './components/Divider.js';
import { StatusBar } from './StatusBar.js';
import { loadLogs } from '../logger.js';

const PAGE_SIZE = 12;

export function LogViewer({ onNavigate }) {
  const [logs, setLogs] = useState([]);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Most recent first
    setLogs(loadLogs().reverse());
  }, []);

  const maxOffset = Math.max(0, logs.length - PAGE_SIZE);

  useInput((input, key) => {
    if (key.escape || input === 'b' || input === 'B' || input === 'q' || input === 'Q') {
      onNavigate('main');
    } else if (key.upArrow) {
      setOffset(i => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setOffset(i => Math.min(maxOffset, i + 1));
    } else if (key.pageUp) {
      setOffset(i => Math.max(0, i - PAGE_SIZE));
    } else if (key.pageDown) {
      setOffset(i => Math.min(maxOffset, i + PAGE_SIZE));
    }
  });

  const visibleLogs = logs.slice(offset, offset + PAGE_SIZE);

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
      });
    } catch {
      return iso;
    }
  };

  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1}>
      <Banner />
      <Text color="cyan" bold>Connection History</Text>
      <Box>
        <Text color="gray">{logs.length} total connections recorded</Text>
      </Box>
      <Box marginBottom={1} />

      <Box flexDirection="column" flexGrow={1}>
        {logs.length === 0 ? (
          <Box paddingX={1}>
            <Text color="gray">No connection history yet. Connect to a server to start logging.</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Box paddingX={1}>
              <Text color="gray" bold>{'TIMESTAMP'.padEnd(20)}</Text>
              <Text color="gray" bold>{'ALIAS'.padEnd(20)}</Text>
              <Text color="gray" bold>{'HOST'.padEnd(20)}</Text>
              <Text color="gray" bold>{'STATUS'.padEnd(10)}</Text>
              <Text color="gray" bold>{'DUR'}</Text>
            </Box>
            <Divider width={76} />

            {visibleLogs.map((log, i) => (
              <Box key={i} paddingX={1}>
                <Text color="gray">{formatDate(log.timestamp).padEnd(20)}</Text>
                <Text color="white">{(log.alias || '—').padEnd(20)}</Text>
                <Text color="gray">{(log.host || '—').padEnd(20)}</Text>
                <Text color={log.success ? 'green' : 'red'}>
                  {(log.success ? '✔ ok' : '✖ fail').padEnd(10)}
                </Text>
                <Text color="gray">{log.duration || 0}s</Text>
              </Box>
            ))}
          </Box>
        )}

        {logs.length > PAGE_SIZE ? (
          <Box marginTop={1} paddingX={1}>
            <Text color="gray">
              Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, logs.length)} of {logs.length}
            </Text>
          </Box>
        ) : null}
      </Box>

      <StatusBar bindings={[
        { key: '↑↓', label: 'Scroll' },
        { key: 'PgUp/Dn', label: 'Page' },
        { key: 'Esc/Q', label: 'Back' },
      ]} />
    </Box>
  );
}
