import React from 'react';
import { Text } from 'ink';
import { statusColors, statusSymbols } from '../../theme.js';

export function Badge({ status = 'unknown' }) {
  const color = statusColors[status] || 'gray';
  const symbol = statusSymbols[status] || '○';
  return <Text color={color}>{symbol}</Text>;
}
