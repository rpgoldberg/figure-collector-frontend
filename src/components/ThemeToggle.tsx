import React from 'react';
import { IconButton, Tooltip, useColorMode } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

const ThemeToggle: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Tooltip
      label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
      placement="bottom"
      hasArrow
    >
      <IconButton
        aria-label="Toggle color mode"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        variant="ghost"
        size="md"
        type="button"
      />
    </Tooltip>
  );
};

export default ThemeToggle;
