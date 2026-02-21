import React, { useState } from 'react';
import { Box, useStdout } from 'ink';
import { MainMenu } from './MainMenu.js';
import { ServerForm } from './ServerForm.js';
import { ServerDetail } from './ServerDetail.js';
import { KeyManager } from './KeyManager.js';
import { LogViewer } from './LogViewer.js';

/**
 * Root Ink component — screen router.
 *
 * Props:
 *   initialScreen - starting screen name
 *   initialData   - data for the initial screen
 *   onConnect     - callback(server) when user initiates an SSH connection.
 *                   The caller should unmount Ink and spawn SSH.
 */
export function App({ initialScreen = 'main', initialData = null, onConnect }) {
  const { stdout } = useStdout();
  const rows = stdout?.rows ?? process.stdout.rows ?? 24;
  const cols = stdout?.columns ?? process.stdout.columns ?? 80;

  const [screen, setScreen] = useState(initialScreen);
  const [screenData, setScreenData] = useState(initialData);

  const navigate = (newScreen, data = null) => {
    if (newScreen === 'connect') {
      // Hand off to the CLI layer — it will unmount Ink then spawn SSH
      if (onConnect) onConnect(data?.server);
      return;
    }
    setScreen(newScreen);
    setScreenData(data);
  };

  let content;
  switch (screen) {
    case 'add':
      content = <ServerForm onNavigate={navigate} mode="add" />;
      break;
    case 'edit':
      content = <ServerForm onNavigate={navigate} mode="edit" server={screenData?.server} />;
      break;
    case 'detail':
      content = <ServerDetail onNavigate={navigate} server={screenData?.server} />;
      break;
    case 'keys':
      content = <KeyManager onNavigate={navigate} />;
      break;
    case 'logs':
      content = <LogViewer onNavigate={navigate} />;
      break;
    case 'main':
    default:
      content = <MainMenu onNavigate={navigate} />;
  }

  // Root box fills the entire terminal window — screens use flexGrow={1}
  // so their status bars are pinned to the bottom edge.
  return (
    <Box flexDirection="column" height={rows} width={cols}>
      {content}
    </Box>
  );
}
