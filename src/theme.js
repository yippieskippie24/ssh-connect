// Centralized color palette and styling tokens for SSH Connect TUI

export const colors = {
  primary: 'cyan',
  secondary: 'blue',
  success: 'green',
  error: 'red',
  warning: 'yellow',
  muted: 'gray',
  accent: 'magenta',
  text: 'white',
};

export const statusColors = {
  online: 'green',
  offline: 'red',
  checking: 'yellow',
  unknown: 'gray',
};

export const statusSymbols = {
  online: '●',
  offline: '●',
  checking: '◌',
  unknown: '○',
};

export const APP_NAME = 'SSH Connect';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Modern SSH connection manager';
