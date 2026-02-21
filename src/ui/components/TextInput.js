import React from 'react';
import { Box, Text } from 'ink';
import InkTextInput from 'ink-text-input';

/**
 * Styled text input with a label.
 * Wraps ink-text-input with consistent padding and color.
 */
export function TextInput({ label, value, onChange, onSubmit, focus, placeholder }) {
  return (
    <Box marginBottom={1}>
      <Box width={18}>
        <Text color={focus ? 'cyan' : 'gray'} bold={focus}>
          {label}:{' '}
        </Text>
      </Box>
      <InkTextInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
        focus={focus}
        placeholder={placeholder}
      />
    </Box>
  );
}
