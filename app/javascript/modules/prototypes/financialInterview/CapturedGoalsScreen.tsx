import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import { PrototypeStatusBar } from 'Modules/prototypes/financialInterview/PrototypeStatusBar';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import MicIcon from '@mui/icons-material/Mic';
import PublicIcon from '@mui/icons-material/Public';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Box, IconButton, InputBase, Stack, Switch, Typography } from '@mui/material';
import React from 'react';

import {
  DAILY_PLAN_FONT_CONTENT,
  DAILY_PLAN_FONT_STATUS,
} from 'Modules/prototypes/financialInterview/dailyPlanTypography';
import type { GoalNotesRow } from 'Modules/prototypes/financialInterview/goalNotesMapping';
import { PROTOTYPE_PHONE_SCREEN_SX } from 'Modules/prototypes/financialInterview/PrototypeDeviceFrame';
import { PrototypeAppTabBar } from 'Modules/prototypes/financialInterview/PrototypeAppTabBar';

/** Goal Notes + toggles — Figma node 5725:41244 (Daily Plan). */
const C = {
  bg: '#f8f6f2',
  contentPrimary: '#47201c',
  contentSecondary: '#5b3935',
  contentTertiary: '#846a67',
  bgTertiary: '#f0edea',
  paper: '#fffefb',
  accentMid: '#47201c',
  borderOpaque: 'rgba(14, 6, 5, 0.1)',
  listBorder: 'rgba(255, 254, 251, 0.25)',
  rowBg: 'rgba(255, 254, 251, 0.5)',
  iconPositive: '#e6f2c9',
};

type ScriptDebrief = {
  headline: string;
  bodies: readonly string[];
  recapLead: string;
};

type Props = {
  rows: GoalNotesRow[];
  includedById: Record<string, boolean>;
  onToggle: (gemId: string, included: boolean) => void;
  sessionLabel?: string;
  /** When set, replaces the dynamic “today” line under Goal Notes (Figma e.g. Thu 6 April). */
  notesDateLabel?: string;
  /** Figma `12-12146` — replaces default “I hear you.” debrief when provided. */
  scriptDebrief?: ScriptDebrief | null;
  onContinue: () => void;
  bottomDraft: string;
  onBottomDraftChange: (v: string) => void;
};

function GoalIcon({ kind }: { kind: GoalNotesRow['icon'] }) {
  const sx = { fontSize: 22, color: C.contentPrimary };
  switch (kind) {
    case 'globe':
      return <PublicIcon sx={sx} />;
    case 'shield':
      return <VerifiedUserOutlinedIcon sx={sx} />;
    case 'dollarDown':
      return <TrendingDownIcon sx={sx} />;
    default:
      return <CheckCircleOutlineIcon sx={sx} />;
  }
}

export function CapturedGoalsScreen({
  rows,
  includedById,
  onToggle,
  sessionLabel = 'Session 1',
  notesDateLabel,
  scriptDebrief = null,
  onContinue,
  bottomDraft,
  onBottomDraftChange,
}: Props) {
  const formattedDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  const dateLine = notesDateLabel ?? formattedDate;

  const handleBottomSubmit = () => {
    onContinue();
  };

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
          top: 140,
          transform: 'rotate(-11deg)',
          background:
            'radial-gradient(ellipse 65% 55% at 45% 45%, rgba(252, 227, 210, 0.95) 0%, rgba(252, 220, 200, 0.35) 45%, transparent 72%)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top app bar */}
      <Box
        sx={{
          flexShrink: 0,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          bgcolor: 'rgba(255, 254, 251, 0.25)',
          zIndex: 10,
        }}
      >
        <PrototypeStatusBar />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pb: 1 }}>
          <IconButton
            sx={{
              bgcolor: C.bgTertiary,
              width: 40,
              height: 40,
              borderRadius: 1000,
              '&:hover': { bgcolor: C.bgTertiary },
            }}
          >
            <MenuIcon sx={{ color: C.contentPrimary, fontSize: 24 }} />
          </IconButton>
          <IconButton
            sx={{
              bgcolor: C.bgTertiary,
              width: 40,
              height: 40,
              borderRadius: 1000,
              '&:hover': { bgcolor: C.bgTertiary },
            }}
          >
            <AddCommentOutlinedIcon sx={{ color: C.contentPrimary, fontSize: 24 }} />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 2, pb: 2, position: 'relative', zIndex: 1 }}>
        {scriptDebrief ? (
          <>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 700,
                lineHeight: '32px',
                color: C.contentPrimary,
                mb: 1.5,
              }}
            >
              {scriptDebrief.headline}
            </Typography>
            {scriptDebrief.bodies.map((body, bi) => (
              <Typography
                key={`debrief-body-${bi}`}
                sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary, mb: 2, whiteSpace: 'pre-line' }}
              >
                {body}
              </Typography>
            ))}
            <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary, mb: 3 }}>
              {scriptDebrief.recapLead}
            </Typography>
          </>
        ) : (
          <>
            <Typography
              sx={{
                fontSize: 28,
                fontWeight: 700,
                lineHeight: '32px',
                color: C.contentPrimary,
                mb: 1.5,
              }}
            >
              I hear you.
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary, mb: 2 }}>
              What you’re describing is common these days. Saying that doesn’t fix it—but hopefully it makes this feel a
              little less lonely.
            </Typography>
            <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary, mb: 3 }}>
              I can’t control prices out there, but I can help you set and meet your money goals. Let’s recap what you
              shared:
            </Typography>
          </>
        )}

        <Stack spacing={2} sx={{ maxWidth: 320, mx: 'auto' }}>
          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: '24px',
                  color: C.contentPrimary,
                  flex: 1,
                }}
              >
                Goal Notes
              </Typography>
              <Box sx={{ bgcolor: C.bgTertiary, px: 1, py: 0.5, borderRadius: 1000 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 500, lineHeight: '14px', color: '#1b0c0b' }}>
                  {sessionLabel}
                </Typography>
              </Box>
            </Stack>
            <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentSecondary, mt: 0.5 }}>
              {dateLine}
            </Typography>
          </Box>

          <Box
            sx={{
              border: `1px solid ${C.listBorder}`,
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {rows.map((row, idx) => {
              const on = includedById[row.gemId] !== false;
              return (
                <Box
                  key={row.gemId}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2,
                    py: 2,
                    bgcolor: C.rowBg,
                    position: 'relative',
                    borderBottom: idx < rows.length - 1 ? `1px solid rgba(14, 6, 5, 0.06)` : 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '100px',
                      bgcolor: C.iconPositive,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <GoalIcon kind={row.icon} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: '20px', color: C.contentPrimary }}>
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
                  </Box>
                  <Switch
                    checked={on}
                    onChange={(_, v) => onToggle(row.gemId, v)}
                    inputProps={{ 'aria-label': `Include ${row.title}` }}
                    sx={{
                      width: 52,
                      height: 32,
                      p: 0,
                      flexShrink: 0,
                      alignSelf: 'center',
                      '& .MuiSwitch-switchBase': {
                        p: 0.25,
                        top: 0,
                        left: 0,
                        '&.Mui-checked': {
                          transform: 'translateX(20px)',
                          color: '#fff',
                          '& + .MuiSwitch-track': { bgcolor: C.accentMid, opacity: 1 },
                        },
                      },
                      '& .MuiSwitch-thumb': {
                        width: 28,
                        height: 28,
                        bgcolor: C.paper,
                        boxShadow: '0 1px 4px rgba(14,6,5,0.15)',
                      },
                      '& .MuiSwitch-track': {
                        borderRadius: 100,
                        bgcolor: '#d5cec9',
                        opacity: 1,
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>

          <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary, pt: 0.5 }}>
            Go ahead and toggle off any you don’t want added to your financial plan
          </Typography>
        </Stack>
      </Box>

      {/* Bottom chat strip (Figma: bolt + field + mic) */}
      <Box
        sx={{
          flexShrink: 0,
          backdropFilter: 'blur(11px)',
          WebkitBackdropFilter: 'blur(11px)',
          bgcolor: 'rgba(255, 254, 251, 0.5)',
          borderTop: `1px solid ${C.borderOpaque}`,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          pt: 1.5,
          pb: 2,
          px: 2,
        }}
      >
        {/* "All done" quick reply — clear next step before the plan CTA */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
          <Box
            component="button"
            type="button"
            onClick={onContinue}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 44,
              cursor: 'pointer',
              border: `1px solid ${C.borderOpaque}`,
              bgcolor: C.bg,
              color: C.contentSecondary,
              borderRadius: 1000,
              fontWeight: 500,
              fontSize: 16,
              fontFamily: DAILY_PLAN_FONT_CONTENT,
              px: 2,
              py: 0,
              whiteSpace: 'nowrap',
              lineHeight: 1,
              transition: 'background-color 0.15s ease',
              '&:hover': { bgcolor: C.bgTertiary },
            }}
          >
            All done
          </Box>
        </Box>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton sx={{ width: 40, height: 40 }}>
            <BoltOutlinedIcon sx={{ color: C.contentPrimary }} />
          </IconButton>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              bgcolor: C.paper,
              border: `1px solid rgba(14, 6, 5, 0.25)`,
              borderRadius: '32px',
              pl: 3,
              pr: 0.5,
              py: 0.75,
            }}
          >
            <InputBase
              fullWidth
              placeholder="Ask me anything..."
              value={bottomDraft}
              onChange={(e) => onBottomDraftChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleBottomSubmit();
                }
              }}
              sx={{
                fontFamily: DAILY_PLAN_FONT_CONTENT,
                fontSize: 14,
                fontWeight: 500,
                color: bottomDraft ? C.contentPrimary : C.contentTertiary,
              }}
            />
            <IconButton
              onClick={onContinue}
              aria-label="Continue with voice"
              sx={{
                width: 40,
                height: 40,
                bgcolor: C.accentMid,
                color: '#fff',
                '&:hover': { bgcolor: '#3a1a17' },
              }}
            >
              <MicIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flexShrink: 0, bgcolor: C.bg, borderTop: `1px solid ${C.borderOpaque}` }}>
        <PrototypeAppTabBar active="ask" />
      </Box>
    </Box>
  );
}
