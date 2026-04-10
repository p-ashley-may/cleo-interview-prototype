import { Box } from '@mui/material';
import React from 'react';

/**
 * Fixed “device” chrome for the financial interview prototype: outer page does not scroll;
 * children fill the inner frame and should use flex + minHeight:0 + overflow:auto on scroll regions.
 */
export function PrototypeDeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: { xs: 'stretch', sm: 'center' },
        background: 'linear-gradient(180deg, #ebe8e4 0%, #ddd8d2 100%)',
        py: { xs: 0, sm: 2 },
        px: { xs: 0, sm: 2 },
        boxSizing: 'border-box',
      }}
    >
      <Box
        sx={{
          width: 375,
          maxWidth: '100%',
          flex: { xs: 1, sm: 'none' },
          minHeight: 0,
          height: { sm: 'min(812px, calc(100dvh - 32px))' },
          maxHeight: { sm: 'min(812px, calc(100dvh - 32px))' },
          borderRadius: { xs: 0, sm: '30px' },
          overflow: 'hidden',
          boxShadow: { sm: '0 24px 80px rgba(71, 32, 28, 0.12)' },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'transparent',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

/** Root styles for screens that fill the device frame (375×fixed height). */
export const PROTOTYPE_PHONE_SCREEN_SX = {
  position: 'relative' as const,
  width: '100%',
  height: '100%',
  flex: 1,
  minHeight: 0,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column' as const,
};
