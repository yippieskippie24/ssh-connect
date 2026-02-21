import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { Banner } from './components/Banner.js';
import { Badge } from './components/Badge.js';
import { Divider } from './components/Divider.js';
import { StatusBar } from './StatusBar.js';
import { loadConfig } from '../config.js';
import { checkAllServers } from '../health.js';

export function MainMenu({ onNavigate }) {
  const { exit } = useApp();
  const [config, setConfig] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [health, setHealth] = useState({});

  useEffect(() => {
    const cfg = loadConfig();
    setConfig(cfg);

    if (cfg.settings?.healthCheckOnStart && cfg.servers.length > 0) {
      const initial = {};
      cfg.servers.forEach(s => { initial[s.alias] = 'checking'; });
      setHealth(initial);

      checkAllServers(cfg.servers, (alias, status) => {
        setHealth(prev => ({ ...prev, [alias]: status }));
      });
    }
  }, []);

  const servers = config?.servers || [];
  // List items: all servers + one "Add Server" row
  const totalItems = servers.length + 1;

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(i => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelectedIndex(i => Math.min(totalItems - 1, i + 1));
    } else if (key.return) {
      if (selectedIndex < servers.length) {
        onNavigate('detail', { server: servers[selectedIndex] });
      } else {
        onNavigate('add');
      }
    } else if (input === 'c' || input === 'C') {
      if (selectedIndex < servers.length) {
        onNavigate('connect', { server: servers[selectedIndex] });
      }
    } else if (input === 'a' || input === 'A') {
      onNavigate('add');
    } else if (input === 'k' || input === 'K') {
      onNavigate('keys');
    } else if (input === 'l' || input === 'L') {
      onNavigate('logs');
    } else if (input === 'q' || input === 'Q') {
      exit();
    }
  });

  if (!config) {
    return (
      <Box flexGrow={1} paddingX={1}>
        <Text color="gray">Loading...</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1}>
      <Banner />

      {/* Content area grows to fill available space, pushing StatusBar to bottom */}
      <Box flexDirection="column" flexGrow={1}>
        {servers.length === 0 ? (
          <Box flexDirection="column" marginBottom={1}>
            <Text color="gray">No servers configured yet.</Text>
            <Box>
              <Text color="gray">Press </Text>
              <Text color="cyan" bold>A</Text>
              <Text color="gray"> to add your first server, or </Text>
              <Text color="cyan" bold>Q</Text>
              <Text color="gray"> to quit.</Text>
            </Box>
          </Box>
        ) : (
          <Box flexDirection="column" marginBottom={1}>
            <Divider title="SERVERS" width={58} />
            <Box marginTop={1} />
            {servers.map((server, i) => {
              const isSelected = i === selectedIndex;
              return (
                <Box key={server.alias} paddingX={1} marginBottom={0}>
                  <Text color={isSelected ? 'cyan' : 'gray'}>
                    {isSelected ? '▶ ' : '  '}
                  </Text>
                  <Badge status={health[server.alias] || 'unknown'} />
                  <Text> </Text>
                  <Text color={isSelected ? 'white' : 'gray'} bold={isSelected}>
                    {server.alias.padEnd(22)}
                  </Text>
                  <Text color={isSelected ? 'gray' : 'gray'}>
                    {server.host.padEnd(20)}
                  </Text>
                  {server.description ? (
                    <Text color="gray" dimColor>{server.description}</Text>
                  ) : null}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Add Server row */}
        <Box paddingX={1} marginBottom={1}>
          <Text color={selectedIndex === servers.length ? 'cyan' : 'gray'}>
            {selectedIndex === servers.length ? '▶ ' : '  '}
          </Text>
          <Text color={selectedIndex === servers.length ? 'cyan' : 'gray'}>
            + Add Server
          </Text>
        </Box>
      </Box>

      <StatusBar bindings={[
        { key: '↑↓', label: 'Navigate' },
        { key: 'Enter', label: 'Detail' },
        { key: 'C', label: 'Connect' },
        { key: 'A', label: 'Add' },
        { key: 'K', label: 'Keys' },
        { key: 'L', label: 'Logs' },
        { key: 'Q', label: 'Quit' },
      ]} />
    </Box>
  );
}
