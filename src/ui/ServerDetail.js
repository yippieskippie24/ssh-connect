import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Banner } from './components/Banner.js';
import { Badge } from './components/Badge.js';
import { Divider } from './components/Divider.js';
import { StatusBar } from './StatusBar.js';
import { removeServer } from '../config.js';
import { checkHost } from '../health.js';

export function ServerDetail({ server, onNavigate }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [healthStatus, setHealthStatus] = useState('unknown');
  const [checking, setChecking] = useState(false);

  useInput((input, key) => {
    if (confirmDelete) {
      if (input === 'y' || input === 'Y') {
        removeServer(server.alias);
        onNavigate('main');
      } else if (input === 'n' || input === 'N' || key.escape) {
        setConfirmDelete(false);
      }
      return;
    }

    if (key.escape || input === 'b' || input === 'B') {
      onNavigate('main');
    } else if (input === 'c' || input === 'C') {
      onNavigate('connect', { server });
    } else if (input === 'e' || input === 'E') {
      onNavigate('edit', { server });
    } else if (input === 'd' || input === 'D') {
      setConfirmDelete(true);
    } else if (input === 'h' || input === 'H') {
      if (!checking) {
        setChecking(true);
        setHealthStatus('checking');
        checkHost(server.host, server.port || 22).then(status => {
          setHealthStatus(status);
          setChecking(false);
        });
      }
    }
  });

  const infoRows = [
    { label: 'Host',          value: server.host },
    { label: 'Port',          value: String(server.port || 22) },
    { label: 'Username',      value: server.username || '(config default)' },
    { label: 'Description',   value: server.description || '—' },
    { label: 'Identity File', value: server.identityFile || '(default key)' },
  ];

  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1}>
      <Banner />

      <Box flexDirection="column" flexGrow={1}>
      <Box borderStyle="round" borderColor="cyan" padding={1} marginBottom={1} flexDirection="column">
        <Box marginBottom={1}>
          <Text color="cyan" bold>{server.alias}</Text>
          <Text>  </Text>
          <Badge status={healthStatus} />
          {checking ? <Text color="yellow"> checking...</Text> : null}
        </Box>

        <Divider width={48} />
        <Box marginTop={1} />

        {infoRows.map(({ label, value }) => (
          <Box key={label}>
            <Box width={16}>
              <Text color="gray">{label}:</Text>
            </Box>
            <Text color="white">{value}</Text>
          </Box>
        ))}
      </Box>

      {confirmDelete ? (
        <Box borderStyle="round" borderColor="red" padding={1} marginBottom={1}>
          <Text color="red">Delete </Text>
          <Text color="white" bold>{server.alias}</Text>
          <Text color="red">? </Text>
          <Text color="gray">(</Text>
          <Text color="green" bold>Y</Text>
          <Text color="gray">es / </Text>
          <Text color="red" bold>N</Text>
          <Text color="gray">o)</Text>
        </Box>
      ) : null}
      </Box>

      <StatusBar bindings={[
        { key: 'C', label: 'Connect' },
        { key: 'E', label: 'Edit' },
        { key: 'H', label: 'Health Check' },
        { key: 'D', label: 'Delete' },
        { key: 'Esc/B', label: 'Back' },
      ]} />
    </Box>
  );
}
