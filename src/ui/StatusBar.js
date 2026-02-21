import React from 'react';
import { Box, Text } from 'ink';

/**
 * Bottom status bar showing available keybindings.
 * bindings: Array<{ key: string, label: string }>
 */
export function StatusBar({ bindings = [] }) {
  return (
    <Box marginTop={1} paddingX={1} flexWrap="wrap">
      {bindings.map(({ key, label }, i) => (
        <Box key={i} marginRight={3}>
          <Text backgroundColor="gray" color="black"> {key} </Text>
          <Text color="gray"> {label}</Text>
        </Box>
      ))}
    </Box>
  );
}
