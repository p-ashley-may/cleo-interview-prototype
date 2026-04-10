import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import React from 'react';

import { DAILY_PLAN_FONT_CONTENT } from 'Modules/prototypes/financialInterview/dailyPlanTypography';

type Props = {
  open: boolean;
  appName?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * iOS-style system alert (pre-permission copy) — aligns with common HIG alert layout.
 * Tapping OK should be followed by `navigator.mediaDevices.getUserMedia({ audio: true })`
 * so the native OS permission sheet appears.
 */
export function IosMicrophonePermissionDialog({
  open,
  appName = 'Cleo',
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.4)' } },
      }}
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: '14px',
          maxWidth: 270,
          width: '100%',
          m: 2,
          overflow: 'hidden',
          fontFamily: DAILY_PLAN_FONT_CONTENT,
          bgcolor: 'rgba(248, 248, 248, 0.97)',
          backdropFilter: 'blur(20px)',
        },
      }}
    >
      <DialogContent sx={{ px: 2, pt: 2.5, pb: 1.5, textAlign: 'center' }}>
        <Typography
          sx={{
            fontSize: 17,
            fontWeight: 600,
            lineHeight: '22px',
            letterSpacing: '-0.41px',
            color: '#000',
            mb: 1,
          }}
        >
          {appName} Would Like to Access the Microphone
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 400, lineHeight: '18px', color: '#000', opacity: 0.88 }}>
          This lets you answer by voice during your plan check-in. Audio is converted to text on your device when
          supported; you can optionally send text to a local LLM for a short summary.
        </Typography>
      </DialogContent>
      <Box sx={{ height: 1, bgcolor: 'rgba(60, 60, 67, 0.29)' }} />
      <Button
        fullWidth
        onClick={onCancel}
        sx={{
          borderRadius: 0,
          py: 1.75,
          fontSize: 17,
          fontWeight: 400,
          lineHeight: '22px',
          letterSpacing: '-0.41px',
          color: '#007aff',
          textTransform: 'none',
          fontFamily: DAILY_PLAN_FONT_CONTENT,
          '&:hover': { bgcolor: 'rgba(0, 122, 255, 0.06)' },
        }}
      >
        Don&apos;t Allow
      </Button>
      <Box sx={{ height: 1, bgcolor: 'rgba(60, 60, 67, 0.29)' }} />
      <Button
        fullWidth
        onClick={onConfirm}
        sx={{
          borderRadius: 0,
          py: 1.75,
          fontSize: 17,
          fontWeight: 700,
          lineHeight: '22px',
          letterSpacing: '-0.41px',
          color: '#007aff',
          textTransform: 'none',
          fontFamily: DAILY_PLAN_FONT_CONTENT,
          '&:hover': { bgcolor: 'rgba(0, 122, 255, 0.06)' },
        }}
      >
        OK
      </Button>
    </Dialog>
  );
}
