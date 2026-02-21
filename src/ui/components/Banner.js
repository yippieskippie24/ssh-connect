import React from 'react';
import { Box, Text } from 'ink';
import { APP_NAME, APP_VERSION, APP_DESCRIPTION } from '../../theme.js';

export function Banner() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box borderStyle="round" borderColor="cyan" paddingX={2} paddingY={0}>
        <Text color="cyan" bold>{APP_NAME}</Text>
        <Text color="gray">  v{APP_VERSION}  —  {APP_DESCRIPTION}</Text>
      </Box>
    </Box>
  );
}
