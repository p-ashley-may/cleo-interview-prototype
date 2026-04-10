import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { PrototypeStatusBar } from 'Modules/prototypes/financialInterview/PrototypeStatusBar';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PublicIcon from '@mui/icons-material/Public';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import React, { useState } from 'react';

import {
  DAILY_PLAN_FONT_CONTENT,
  DAILY_PLAN_FONT_STATUS,
} from 'Modules/prototypes/financialInterview/dailyPlanTypography';
import type { PlanProgressRow, PlanProgressRowIcon } from 'Modules/prototypes/financialInterview/planProgressMapping';
import { PROTOTYPE_PHONE_SCREEN_SX } from 'Modules/prototypes/financialInterview/PrototypeDeviceFrame';
import { PrototypeAppTabBar } from 'Modules/prototypes/financialInterview/PrototypeAppTabBar';

/** Plan tab → Progress — chat handoff destination (Figma 5725:27255, Daily Plan). */
const C = {
  bg: '#f8f6f2',
  contentPrimary: '#47201c',
  contentSecondary: '#5b3935',
  contentTertiary: '#6f514e',
  bgTertiary: '#f0edea',
  paper: '#fffefb',
  borderDefault: '#f0edea',
  borderOpaque: 'rgba(14, 6, 5, 0.1)',
  accentMid: '#47201c',
  barTrack: 'rgba(14, 6, 5, 0.1)',
  segmentedBorder: '#fffefb',
  segmentedBg: 'rgba(255, 254, 251, 0.25)',
  focusPillBg: '#fbde8b',
  focusPillText: '#1f1700',
  debtCircle: '#e8f1fc',
  debtIcon: '#1a56c4',
};

type PlanTab = 'left_to_spend' | 'bills' | 'progress';

type Props = {
  rows: PlanProgressRow[];
  scrollFooter?: React.ReactNode;
  onStayOnTrack?: () => void;
};

function RowIcon({ kind }: { kind: PlanProgressRowIcon }) {
  if (kind === 'debt') {
    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `1px solid ${C.borderOpaque}`,
          bgcolor: C.debtCircle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <CreditCardIcon sx={{ fontSize: 22, color: C.debtIcon }} />
      </Box>
    );
  }
  const isShield = kind === 'shield';
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', flexShrink: 0 }}>
      <Box
        sx={{
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: isShield ? '#e8f4f0' : '#fce8ec',
        }}
      >
        {isShield ? (
          <VerifiedUserOutlinedIcon sx={{ fontSize: 24, color: C.contentPrimary }} />
        ) : (
          <PublicIcon sx={{ fontSize: 24, color: C.contentPrimary }} />
        )}
      </Box>
    </Box>
  );
}

export function PlanTabHandoffScreen({ rows, scrollFooter, onStayOnTrack }: Props) {
  const [tab, setTab] = useState<PlanTab>('progress');

  return (
    <Box
      sx={{
        ...PROTOTYPE_PHONE_SCREEN_SX,
        bgcolor: C.bg,
        fontFamily: DAILY_PLAN_FONT_CONTENT,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 420,
          height: 480,
          left: -100,
          top: 100,
          transform: 'rotate(-11deg)',
          background:
            'radial-gradient(ellipse 65% 55% at 45% 45%, rgba(252, 227, 210, 0.9) 0%, rgba(252, 220, 200, 0.3) 50%, transparent 72%)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }}
      />

      <Box sx={{ flexShrink: 0, zIndex: 2 }}>
        <PrototypeStatusBar />
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, pt: 0.5, pb: 1 }}
        >
          <Typography
            sx={{
              fontSize: 36,
              fontWeight: 700,
              lineHeight: '40px',
              color: C.contentPrimary,
              flex: 1,
            }}
          >
            Plan
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: 'flex-end' }}>
            <IconButton
              sx={{
                width: 40,
                height: 40,
                bgcolor: C.bgTertiary,
                borderRadius: 1000,
                '&:hover': { bgcolor: C.bgTertiary },
              }}
              aria-label="Notifications"
            >
              <NotificationsNoneOutlinedIcon sx={{ fontSize: 24, color: C.contentPrimary }} />
            </IconButton>
            <IconButton
              sx={{
                width: 40,
                height: 40,
                bgcolor: C.bgTertiary,
                borderRadius: 1000,
                '&:hover': { bgcolor: C.bgTertiary },
              }}
              aria-label="Profile"
            >
              <PersonOutlineIcon sx={{ fontSize: 24, color: C.contentPrimary }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ flexShrink: 0, px: 2, pb: 1.5, zIndex: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: '2px',
            borderRadius: 1000,
            border: `1px solid ${C.segmentedBorder}`,
            bgcolor: C.segmentedBg,
            backdropFilter: 'blur(6px)',
          }}
        >
          {(
            [
              { id: 'left_to_spend' as const, label: 'Left to spend' },
              { id: 'bills' as const, label: 'Bills' },
              { id: 'progress' as const, label: 'Progress' },
            ] as const
          ).map((seg) => {
            const selected = tab === seg.id;
            return (
              <Box
                key={seg.id}
                component="button"
                type="button"
                onClick={() => setTab(seg.id)}
                sx={{
                  flex: 1,
                  py: 1,
                  px: 1.5,
                  border: 'none',
                  borderRadius: 1000,
                  cursor: 'pointer',
                  fontFamily: DAILY_PLAN_FONT_CONTENT,
                  fontSize: 14,
                  fontWeight: selected ? 600 : 500,
                  lineHeight: selected ? '18px' : '16px',
                  color: selected ? C.contentPrimary : C.contentTertiary,
                  bgcolor: selected ? C.paper : 'transparent',
                  transition: 'background-color 0.15s ease',
                }}
              >
                {seg.label}
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 2,
          pb: 3,
          zIndex: 1,
        }}
      >
        {tab === 'progress' && (
          <>
            <Stack spacing={0.5} sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: '24px', color: C.contentPrimary }}>
                Your Goals
              </Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentSecondary }}>
                6 month plan
              </Typography>
            </Stack>

            <Box
              sx={{
                border: `1px solid ${C.borderDefault}`,
                borderRadius: '16px',
                overflow: 'hidden',
                bgcolor: C.paper,
              }}
            >
              {rows.map((row, index) => (
                <Box key={row.id}>
                  {index > 0 && <Box sx={{ height: 1, bgcolor: C.borderDefault, mx: 2 }} />}
                  <Box sx={{ px: 2, py: 2 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1} alignItems="flex-start">
                        <RowIcon kind={row.icon} />
                        <Stack spacing={0} sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontSize: 16,
                              fontWeight: 600,
                              lineHeight: '20px',
                              color: C.contentPrimary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {row.title}
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 14,
                              fontWeight: 500,
                              lineHeight: '18px',
                              color: C.contentSecondary,
                              mt: 0.25,
                            }}
                          >
                            {row.subtitle}
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          spacing={0}
                          sx={{ flexShrink: 0, fontSize: 16, fontWeight: 600, lineHeight: '20px' }}
                        >
                          <Typography sx={{ color: C.contentPrimary }}>{row.percent}%</Typography>
                          <Typography sx={{ color: C.contentTertiary }}>/</Typography>
                          <Typography sx={{ color: C.contentTertiary }}>{row.amountLabel}</Typography>
                        </Stack>
                      </Stack>
                      <Box
                        sx={{
                          height: 4,
                          borderRadius: '12px',
                          bgcolor: C.barTrack,
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${row.percent}%`,
                            bgcolor: C.accentMid,
                            borderRadius: '12px',
                          }}
                        />
                      </Box>
                      {row.focus && (
                        <Box
                          sx={{
                            alignSelf: 'flex-start',
                            bgcolor: C.focusPillBg,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1000,
                          }}
                        >
                          <Typography sx={{ fontSize: 12, fontWeight: 500, lineHeight: '14px', color: C.focusPillText }}>
                            Focus
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>
              ))}
            </Box>
          </>
        )}

        {tab !== 'progress' && (
          <Typography sx={{ fontSize: 16, fontWeight: 500, color: C.contentSecondary, py: 4, textAlign: 'center' }}>
            {tab === 'left_to_spend' ? 'Left to spend (prototype)' : 'Bills (prototype)'}
          </Typography>
        )}

        {scrollFooter}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${C.segmentedBorder}`,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          bgcolor: C.segmentedBg,
          backdropFilter: 'blur(11px)',
          WebkitBackdropFilter: 'blur(11px)',
          zIndex: 3,
        }}
      >
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Button
            fullWidth
            variant="contained"
            disableElevation
            onClick={onStayOnTrack}
            startIcon={<AutoAwesomeIcon sx={{ fontSize: 20 }} />}
            sx={{
              bgcolor: C.accentMid,
              color: C.paper,
              borderRadius: 1000,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 16,
              lineHeight: '20px',
              '&:hover': { bgcolor: '#3a1a17' },
            }}
          >
            Stay on track with Cleo
          </Button>
        </Box>
        <PrototypeAppTabBar active="plan" sx={{ borderTop: `1px solid ${C.borderOpaque}` }} />
      </Box>
    </Box>
  );
}
