import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Banner } from './components/Banner.js';
import { TextInput } from './components/TextInput.js';
import { Divider } from './components/Divider.js';
import { StatusBar } from './StatusBar.js';
import { listKeys, generateKey, copyKeyToServer } from '../keys.js';
import { loadConfig } from '../config.js';

const SCREEN = { LIST: 'list', GENERATE: 'generate', COPY: 'copy' };

export function KeyManager({ onNavigate }) {
  const [screen, setScreen] = useState(SCREEN.LIST);
  const [keys, setKeys] = useState([]);
  const [selectedKeyIndex, setSelectedKeyIndex] = useState(0);
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Generate form state
  const [genName, setGenName] = useState('');
  const [genType, setGenType] = useState('ed25519');
  const [genField, setGenField] = useState(0);
  const [generating, setGenerating] = useState(false);

  const servers = loadConfig().servers;

  useEffect(() => {
    setKeys(listKeys());
  }, []);

  const refreshKeys = () => setKeys(listKeys());

  const handleGenerate = async () => {
    if (!genName.trim()) {
      setError('Key name is required');
      return;
    }
    setGenerating(true);
    setError('');
    try {
      await generateKey({ name: genName.trim(), type: genType.trim() || 'ed25519' });
      setMessage(`Key "${genName.trim()}" generated successfully`);
      refreshKeys();
      setScreen(SCREEN.LIST);
      setGenName('');
      setGenType('ed25519');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  useInput((input, key) => {
    setError('');

    if (screen === SCREEN.LIST) {
      if (key.escape || input === 'b' || input === 'B') {
        onNavigate('main');
      } else if (key.upArrow) {
        setSelectedKeyIndex(i => Math.max(0, i - 1));
      } else if (key.downArrow) {
        setSelectedKeyIndex(i => Math.min(Math.max(0, keys.length - 1), i + 1));
      } else if (input === 'g' || input === 'G') {
        setScreen(SCREEN.GENERATE);
        setGenName('');
        setGenField(0);
        setError('');
      } else if (input === 'c' || input === 'C') {
        if (keys.length > 0 && servers.length > 0) {
          setScreen(SCREEN.COPY);
          setSelectedServerIndex(0);
        } else if (keys.length === 0) {
          setError('No SSH keys found. Press G to generate one.');
        } else {
          setError('No servers configured. Add a server first.');
        }
      }

    } else if (screen === SCREEN.GENERATE) {
      if (key.escape) {
        setScreen(SCREEN.LIST);
        setError('');
      } else if (key.tab) {
        setGenField(f => (f + 1) % 2);
      } else if (key.upArrow) {
        setGenField(f => Math.max(0, f - 1));
      } else if (key.downArrow) {
        setGenField(f => Math.min(1, f + 1));
      }

    } else if (screen === SCREEN.COPY) {
      if (key.escape) {
        setScreen(SCREEN.LIST);
      } else if (key.upArrow) {
        setSelectedServerIndex(i => Math.max(0, i - 1));
      } else if (key.downArrow) {
        setSelectedServerIndex(i => Math.min(servers.length - 1, i + 1));
      } else if (key.return) {
        const selectedKey = keys[selectedKeyIndex];
        const targetServer = servers[selectedServerIndex];
        if (selectedKey && targetServer) {
          setMessage(`Running ssh-copy-id to ${targetServer.alias}...`);
          setScreen(SCREEN.LIST);
          const child = copyKeyToServer(selectedKey.publicKeyFile, targetServer);
          child.on('exit', code => {
            if (code === 0) {
              setMessage(`Key copied to ${targetServer.alias}`);
            } else {
              setError(`Failed to copy key to ${targetServer.alias}`);
            }
          });
          child.on('error', err => {
            setError(`ssh-copy-id error: ${err.message}`);
          });
        }
      }
    }
  });

  // --- GENERATE screen ---
  if (screen === SCREEN.GENERATE) {
    return (
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        <Banner />
        <Text color="cyan" bold>Generate New SSH Key</Text>
        <Box marginBottom={1} />

        <Box flexDirection="column" flexGrow={1}>
          <TextInput
            label="Key Name"
            value={genName}
            onChange={setGenName}
            onSubmit={() => setGenField(1)}
            focus={genField === 0}
            placeholder="id_ed25519_work"
          />
          <TextInput
            label="Key Type"
            value={genType}
            onChange={setGenType}
            onSubmit={handleGenerate}
            focus={genField === 1}
            placeholder="ed25519"
          />

          {generating ? <Text color="yellow">Generating key...</Text> : null}
          {error ? <Text color="red">✖ {error}</Text> : null}
        </Box>

        <StatusBar bindings={[
          { key: 'Enter/Tab', label: 'Next Field' },
          { key: 'Enter (type)', label: 'Generate' },
          { key: 'Esc', label: 'Cancel' },
        ]} />
      </Box>
    );
  }

  // --- COPY screen ---
  if (screen === SCREEN.COPY) {
    return (
      <Box flexDirection="column" flexGrow={1} paddingX={1}>
        <Banner />
        <Text color="cyan" bold>Copy Key to Server</Text>
        <Box>
          <Text color="gray">Key: </Text>
          <Text color="white">{keys[selectedKeyIndex]?.name}</Text>
        </Box>
        <Box marginBottom={1} />

        <Box flexDirection="column" flexGrow={1}>
          <Divider title="SELECT SERVER" width={50} />
          <Box marginTop={1} />

          {servers.map((server, i) => (
            <Box key={server.alias} paddingX={1}>
              <Text color={i === selectedServerIndex ? 'cyan' : 'gray'}>
                {i === selectedServerIndex ? '▶ ' : '  '}
              </Text>
              <Text color={i === selectedServerIndex ? 'white' : 'gray'}>
                {server.alias.padEnd(20)}
              </Text>
              <Text color="gray">{server.host}</Text>
            </Box>
          ))}

          {error ? <Text color="red">✖ {error}</Text> : null}
        </Box>

        <StatusBar bindings={[
          { key: '↑↓', label: 'Select Server' },
          { key: 'Enter', label: 'Copy Key' },
          { key: 'Esc', label: 'Cancel' },
        ]} />
      </Box>
    );
  }

  // --- LIST screen ---
  return (
    <Box flexDirection="column" flexGrow={1} paddingX={1}>
      <Banner />
      <Text color="cyan" bold>SSH Key Manager</Text>
      <Box marginBottom={1} />

      <Box flexDirection="column" flexGrow={1}>
      {keys.length === 0 ? (
        <Box paddingX={1}>
          <Text color="gray">No SSH keys found in ~/.ssh/</Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          <Divider title="KEYS" width={58} />
          <Box marginTop={1} />
          {keys.map((k, i) => (
            <Box key={k.name} paddingX={1}>
              <Text color={i === selectedKeyIndex ? 'cyan' : 'gray'}>
                {i === selectedKeyIndex ? '▶ ' : '  '}
              </Text>
              <Text color={i === selectedKeyIndex ? 'white' : 'gray'}>
                {k.name.padEnd(30)}
              </Text>
              <Text color="gray">
                {k.hasPrivate ? 'keypair' : 'pub only'}
              </Text>
            </Box>
          ))}
        </Box>
      )}

      {message ? (
        <Box marginTop={1} paddingX={1}>
          <Text color="green">✔ {message}</Text>
        </Box>
      ) : null}
      {error ? (
        <Box marginTop={1} paddingX={1}>
          <Text color="red">✖ {error}</Text>
        </Box>
      ) : null}
      </Box>

      <StatusBar bindings={[
        { key: '↑↓', label: 'Navigate' },
        { key: 'G', label: 'Generate Key' },
        { key: 'C', label: 'Copy to Server' },
        { key: 'Esc/B', label: 'Back' },
      ]} />
    </Box>
  );
}
