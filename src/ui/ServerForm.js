import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Banner } from './components/Banner.js';
import { TextInput } from './components/TextInput.js';
import { StatusBar } from './StatusBar.js';
import { addServer, updateServer, loadConfig } from '../config.js';

const FIELDS = [
  { name: 'alias',        label: 'Alias',         placeholder: 'prod-web1' },
  { name: 'host',         label: 'Host',           placeholder: '192.168.1.10' },
  { name: 'port',         label: 'Port',           placeholder: '22' },
  { name: 'username',     label: 'Username',       placeholder: 'deploy' },
  { name: 'description',  label: 'Description',    placeholder: 'Production web server' },
  { name: 'identityFile', label: 'Identity File',  placeholder: '~/.ssh/id_rsa (optional)' },
];

export function ServerForm({ mode = 'add', server = null, onNavigate }) {
  const config = loadConfig();
  const defaultUser = config.defaults?.username || process.env.USER || 'user';

  const [values, setValues] = useState({
    alias:        server?.alias        || '',
    host:         server?.host         || '',
    port:         String(server?.port  || config.defaults?.port || 22),
    username:     server?.username     || defaultUser,
    description:  server?.description  || '',
    identityFile: server?.identityFile || '',
  });

  const [focusedField, setFocusedField] = useState(0);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = () => {
    if (!values.alias.trim()) {
      setError('Alias is required');
      setFocusedField(0);
      return;
    }
    if (!values.host.trim()) {
      setError('Host is required');
      setFocusedField(1);
      return;
    }

    if (mode === 'add') {
      const existing = config.servers.find(s => s.alias === values.alias.trim());
      if (existing) {
        setError(`Alias "${values.alias.trim()}" already exists`);
        setFocusedField(0);
        return;
      }
    }

    const serverData = {
      alias:        values.alias.trim(),
      host:         values.host.trim(),
      port:         parseInt(values.port, 10) || 22,
      username:     values.username.trim() || defaultUser,
      description:  values.description.trim(),
      identityFile: values.identityFile.trim(),
    };

    // Remove empty optional fields
    if (!serverData.description) delete serverData.description;
    if (!serverData.identityFile) delete serverData.identityFile;

    try {
      if (mode === 'add') {
        addServer(serverData);
      } else {
        updateServer(server.alias, serverData);
      }
      onNavigate('main');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFieldSubmit = (fieldIndex) => {
    if (fieldIndex === FIELDS.length - 1) {
      handleSubmit();
    } else {
      setFocusedField(fieldIndex + 1);
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      onNavigate('main');
    } else if (key.tab) {
      setFocusedField(i => (i + 1) % FIELDS.length);
    } else if (key.upArrow && !key.shift) {
      setFocusedField(i => Math.max(0, i - 1));
    } else if (key.downArrow && !key.shift) {
      setFocusedField(i => Math.min(FIELDS.length - 1, i + 1));
    }
  });

  const title = mode === 'add' ? 'Add Server' : `Edit: ${server?.alias}`;

  return (
    <Box flexDirection="column" padding={1}>
      <Banner />
      <Text color="cyan" bold>{title}</Text>
      <Box marginBottom={1} />

      {FIELDS.map((field, i) => (
        <TextInput
          key={field.name}
          label={field.label}
          value={values[field.name]}
          onChange={v => handleChange(field.name, v)}
          onSubmit={() => handleFieldSubmit(i)}
          focus={focusedField === i}
          placeholder={field.placeholder}
        />
      ))}

      {error ? (
        <Box marginTop={1}>
          <Text color="red">✖ {error}</Text>
        </Box>
      ) : null}

      <StatusBar bindings={[
        { key: 'Enter/Tab', label: 'Next Field' },
        { key: '↑↓', label: 'Move Field' },
        { key: 'Enter (last)', label: 'Save' },
        { key: 'Esc', label: 'Cancel' },
      ]} />
    </Box>
  );
}
