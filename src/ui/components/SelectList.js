import React from 'react';
import { Box, Text } from 'ink';

/**
 * A styled selectable list component.
 * The parent is responsible for keyboard handling via useInput.
 *
 * Props:
 *   items        - array of items to display
 *   selectedIndex - currently highlighted index
 *   renderItem   - (item, isSelected) => ReactNode
 */
export function SelectList({ items = [], selectedIndex = 0, renderItem }) {
  return (
    <Box flexDirection="column">
      {items.map((item, i) => {
        const isSelected = i === selectedIndex;
        return (
          <Box key={i}>
            <Text color={isSelected ? 'cyan' : 'gray'}>
              {isSelected ? '▶ ' : '  '}
            </Text>
            {renderItem ? renderItem(item, isSelected) : (
              <Text color={isSelected ? 'white' : 'gray'}>{String(item)}</Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
