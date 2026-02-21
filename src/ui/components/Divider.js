import React from 'react';
import { Box, Text } from 'ink';

export function Divider({ title, width = 60 }) {
  if (title) {
    const dashCount = Math.max(0, width - title.length - 4);
    const left = Math.floor(dashCount / 2);
    const right = dashCount - left;
    return (
      <Box marginBottom={0}>
        <Text color="gray">{'─'.repeat(left)} </Text>
        <Text color="cyan">{title}</Text>
        <Text color="gray"> {'─'.repeat(right)}</Text>
      </Box>
    );
  }
  return (
    <Box>
      <Text color="gray">{'─'.repeat(width)}</Text>
    </Box>
  );
}
