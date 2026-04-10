import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import React from 'react';

import { DAILY_PLAN_FONT_CONTENT } from 'Modules/prototypes/financialInterview/dailyPlanTypography';
import { PROTOTYPE_PHONE_SCREEN_SX } from 'Modules/prototypes/financialInterview/PrototypeDeviceFrame';

/**
 * Plaid bank-link bottom sheet — matches Figma Cursor `12:12081`
 * (https://www.figma.com/design/ndOYaALnTsjzgDAXD3hR3P/Cursor?node-id=12-12081).
 *
 * Use `overlay` when compositing on top of another screen (e.g. welcome) with blur.
 */
const C = {
  bg: '#f8f6f2',
  overlay: 'rgba(14, 6, 5, 0.5)',
  sheet: '#ffffff',
  identityBg: '#f5f5f5',
  primary: '#47201c',
  textInverse: '#fffefb',
  tertiary: '#6f514e',
  secondaryMuted: '#5b3935',
  homeBar: '#0e0605',
};

type SheetProps = {
  connecting: boolean;
  onContinue: () => void;
  onClose: () => void;
};

function PlaidMark() {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minHeight: 24 }}>
      <Box
        aria-hidden
        sx={{
          width: 22,
          height: 22,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '3px',
          p: '2px',
          borderRadius: '6px',
          bgcolor: '#111',
        }}
      >
        <Box sx={{ bgcolor: '#fff', borderRadius: '2px' }} />
        <Box sx={{ bgcolor: '#111', borderRadius: '2px' }} />
        <Box sx={{ bgcolor: '#111', borderRadius: '2px' }} />
        <Box sx={{ bgcolor: '#fff', borderRadius: '2px' }} />
      </Box>
      <Typography
        component="span"
        sx={{
          fontFamily: DAILY_PLAN_FONT_CONTENT,
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '0.12em',
          color: '#111',
          lineHeight: 1,
        }}
      >
        PLAID
      </Typography>
    </Stack>
  );
}

function PlaidBottomSheet({ connecting, onContinue, onClose }: SheetProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: C.sheet,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        pt: 2,
        pb: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        boxShadow: '0 -8px 40px rgba(14, 6, 5, 0.12)',
        zIndex: 1,
        pointerEvents: 'auto',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, pb: 1.5 }}>
        <PlaidMark />
        <IconButton
          aria-label="Close"
          onClick={onClose}
          disabled={connecting}
          size="small"
          sx={{ color: '#111', opacity: connecting ? 0.4 : 1 }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      <Box sx={{ px: 2, width: '100%' }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2.25}
          sx={{
            bgcolor: C.identityBg,
            borderRadius: '12px',
            px: 2.5,
            py: 1.5,
            minHeight: 81,
          }}
        >
          <Box
            sx={{
              width: 55,
              height: 57,
              borderRadius: '12px',
              bgcolor: C.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography
              sx={{
                fontFamily: DAILY_PLAN_FONT_CONTENT,
                fontWeight: 700,
                fontSize: 28,
                lineHeight: 1,
                color: C.textInverse,
              }}
            >
              C
            </Typography>
          </Box>
          <Typography
            component="div"
            sx={{
              fontFamily: DAILY_PLAN_FONT_CONTENT,
              fontSize: 16,
              lineHeight: '24px',
              color: C.secondaryMuted,
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box component="span" sx={{ fontWeight: 700, color: C.primary }}>
              Sign up instantly with{' '}
            </Box>
            <Box component="span" sx={{ fontWeight: 500, color: C.secondaryMuted }}>
              your saved Plaid identity
            </Box>
          </Typography>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ pt: 2, px: 2, pb: 2, width: '100%', maxWidth: 375, alignSelf: 'center' }}>
        <Typography
          sx={{
            fontFamily: DAILY_PLAN_FONT_CONTENT,
            fontSize: 12,
            fontWeight: 500,
            lineHeight: '16px',
            color: C.tertiary,
            textAlign: 'center',
            px: 1,
          }}
        >
          By continuing, you agree to Plaid’s{' '}
          <Box component="span" sx={{ textDecoration: 'underline', cursor: 'default' }}>
            Privacy Policy
          </Box>{' '}
          and{' '}
          <Box component="span" sx={{ textDecoration: 'underline', cursor: 'default' }}>
            Terms
          </Box>
        </Typography>

        {connecting && (
          <Stack spacing={1.25}>
            <Typography
              sx={{
                fontFamily: DAILY_PLAN_FONT_CONTENT,
                fontSize: 13,
                fontWeight: 500,
                color: C.tertiary,
                textAlign: 'center',
              }}
            >
              Connecting securely…
            </Typography>
            <LinearProgress
              variant="indeterminate"
              sx={{
                height: 6,
                borderRadius: 100,
                bgcolor: 'rgba(71, 32, 28, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 100,
                  bgcolor: C.primary,
                },
              }}
            />
          </Stack>
        )}

        <Button
          fullWidth
          disableElevation
          disabled={connecting}
          onClick={onContinue}
          sx={{
            fontFamily: DAILY_PLAN_FONT_CONTENT,
            fontWeight: 600,
            fontSize: 16,
            lineHeight: '20px',
            textTransform: 'none',
            borderRadius: 1000,
            py: 1.5,
            minHeight: 48,
            bgcolor: C.primary,
            color: C.textInverse,
            '&:hover': { bgcolor: '#3a1a17' },
            '&.Mui-disabled': { bgcolor: 'rgba(71, 32, 28, 0.45)', color: C.textInverse },
          }}
        >
          Continue
        </Button>
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1.5, pt: 0.5 }}>
        <Box sx={{ width: 134, height: 5, borderRadius: 100, bgcolor: C.homeBar }} />
      </Box>
    </Box>
  );
}

type Props = SheetProps & {
  /**
   * When true, renders only scrim + sheet as an absolute layer (parent must be `position: relative`).
   * Blurs whatever sits behind this component in the same frame.
   */
  overlay?: boolean;
};

export function BankConnectPlaidScreen({ connecting, onContinue, onClose, overlay = false }: Props) {
  if (overlay) {
    return (
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          overflow: 'hidden',
          fontFamily: DAILY_PLAN_FONT_CONTENT,
          pointerEvents: 'none',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: C.overlay,
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            pointerEvents: 'auto',
          }}
        />
        <PlaidBottomSheet connecting={connecting} onContinue={onContinue} onClose={onClose} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ...PROTOTYPE_PHONE_SCREEN_SX,
        bgcolor: C.bg,
        position: 'relative',
        overflow: 'hidden',
        fontFamily: DAILY_PLAN_FONT_CONTENT,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: C.overlay,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />
      <PlaidBottomSheet connecting={connecting} onContinue={onContinue} onClose={onClose} />
    </Box>
  );
}
