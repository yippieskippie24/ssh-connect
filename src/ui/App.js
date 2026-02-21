import React, { useState } from 'react';
import { Box } from 'ink';
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

  switch (screen) {
    case 'add':
      return <ServerForm onNavigate={navigate} mode="add" />;

    case 'edit':
      return <ServerForm onNavigate={navigate} mode="edit" server={screenData?.server} />;

    case 'detail':
      return <ServerDetail onNavigate={navigate} server={screenData?.server} />;

    case 'keys':
      return <KeyManager onNavigate={navigate} />;

    case 'logs':
      return <LogViewer onNavigate={navigate} />;

    case 'main':
    default:
      return <MainMenu onNavigate={navigate} />;
  }
}
