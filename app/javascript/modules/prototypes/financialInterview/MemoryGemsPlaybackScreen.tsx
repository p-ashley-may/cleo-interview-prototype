import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import { PrototypeStatusBar } from 'Modules/prototypes/financialInterview/PrototypeStatusBar';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuIcon from '@mui/icons-material/Menu';
import PublicIcon from '@mui/icons-material/Public';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';

import {
  DAILY_PLAN_FONT_CONTENT,
  DAILY_PLAN_FONT_STATUS,
} from 'Modules/prototypes/financialInterview/dailyPlanTypography';
import type { GoalNotesIcon, PlaybackGemRow } from 'Modules/prototypes/financialInterview/goalNotesMapping';
import { PROTOTYPE_PHONE_SCREEN_SX } from 'Modules/prototypes/financialInterview/PrototypeDeviceFrame';
import { PrototypeAppTabBar } from 'Modules/prototypes/financialInterview/PrototypeAppTabBar';

/** Memory gem playback + “Go to my Plan” — Figma node 5725:42871 (Daily Plan). */
const C = {
  bg: '#f8f6f2',
  contentPrimary: '#47201c',
  contentSecondary: '#5b3935',
  contentTertiary: '#846a67',
  bgTertiary: '#f0edea',
  paper: '#fffefb',
  accentMid: '#47201c',
  borderOpaque: 'rgba(14, 6, 5, 0.1)',
  tagBg: '#e6f2c9',
  tagText: '#101f02',
  positiveDark: '#101f02',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

function TagIcon({ kind }: { kind: GoalNotesIcon }) {
  const sx = { fontSize: 14, color: C.contentPrimary };
  switch (kind) {
    case 'globe':
      return <PublicIcon sx={sx} />;
    case 'shield':
      return <VerifiedUserOutlinedIcon sx={{ fontSize: 14, color: C.contentPrimary }} />;
    case 'dollarDown':
      return <TrendingDownIcon sx={sx} />;
    default:
      return <CheckCircleOutlineIcon sx={sx} />;
  }
}

type Props = {
  items: PlaybackGemRow[];
  onGoToPlan: () => void;
};

export function MemoryGemsPlaybackScreen({ items, onGoToPlan }: Props) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [showClosing, setShowClosing] = useState(false);

  useEffect(() => {
    setVisibleCount(0);
    setShowClosing(false);
    if (items.length === 0) {
      setShowClosing(true);
      return undefined;
    }
    let n = 0;
    let intervalId = 0;
    const tick = () => {
      n += 1;
      setVisibleCount((c) => Math.min(c + 1, items.length));
      if (n >= items.length) {
        window.clearInterval(intervalId);
        window.setTimeout(() => setShowClosing(true), 400);
      }
    };
    intervalId = window.setInterval(tick, 480);
    tick();
    return () => window.clearInterval(intervalId);
  }, [items.length]);

  const visible = items.slice(0, visibleCount);

  return (
    <Box
      sx={{
        ...PROTOTYPE_PHONE_SCREEN_SX,
        bgcolor: C.bg,
        fontFamily: DAILY_PLAN_FONT_CONTENT,
        background: 'linear-gradient(180deg, #f8f6f2 0%, #f3ebe4 55%, #f8f6f2 100%)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 420,
          height: 480,
          left: -100,
          top: 120,
          transform: 'rotate(-11deg)',
          background:
            'radial-gradient(ellipse 65% 55% at 45% 45%, rgba(252, 227, 210, 0.9) 0%, rgba(252, 220, 200, 0.3) 50%, transparent 72%)',
          filter: 'blur(2px)',
          pointerEvents: 'none',
        }}
      />

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

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pt: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Box
            sx={{
              bgcolor: C.paper,
              px: 2,
              py: 1.5,
              borderRadius: '28px',
              borderTopRightRadius: 28,
              borderTopLeftRadius: 28,
              borderBottomLeftRadius: 28,
              maxWidth: 200,
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary }}>
              Done
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary, mb: 2 }}>
          Let’s recap what we have:
        </Typography>

        <Stack spacing={2.5} sx={{ maxWidth: 320 }}>
          {visible.map((row, idx) => (
            <Box
              key={row.gemId}
              sx={{
                animation: `${fadeUp} 0.45s ease-out both`,
              }}
            >
              <Typography
                component="div"
                sx={{
                  fontSize: 20,
                  fontWeight: 700,
                  lineHeight: '24px',
                  color: C.contentPrimary,
                  mb: 1,
                }}
              >
                {idx + 1}. {row.title}
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  bgcolor: C.tagBg,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1000,
                }}
              >
                <TagIcon kind={row.icon} />
                <Typography sx={{ fontSize: 12, fontWeight: 500, lineHeight: '14px', color: C.tagText }}>
                  {row.tag}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>

        {showClosing && items.length > 0 && (
          <Box sx={{ mt: 3, animation: `${fadeUp} 0.5s ease-out both` }}>
            <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary, mb: 2 }}>
              I’ve broken those down to manageable goals, and added them to your Plan.
            </Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: '32px', color: C.contentPrimary }}>
              Shall we review?
            </Typography>
          </Box>
        )}

        {items.length === 0 && (
          <Typography sx={{ fontSize: 16, fontWeight: 500, color: C.contentSecondary, mt: 2 }}>
            No themes to replay—let’s build your plan.
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          backdropFilter: 'blur(11px)',
          WebkitBackdropFilter: 'blur(11px)',
          bgcolor: 'rgba(255, 254, 251, 0.5)',
          borderTop: `1px solid ${C.borderOpaque}`,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1, pb: 0.5 }}>
          <ExpandMoreIcon sx={{ color: C.contentTertiary, fontSize: 28, transform: 'scaleY(-1)' }} />
        </Box>
        <Stack spacing={1.5} sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            disableElevation
            onClick={onGoToPlan}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 20 }} />}
            sx={{
              bgcolor: C.accentMid,
              color: C.bg,
              borderRadius: 1000,
              py: 1.25,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: 14,
              lineHeight: '18px',
              '&:hover': { bgcolor: '#3a1a17' },
            }}
          >
            Go to my Plan
          </Button>
        </Stack>
      </Box>

      <Box sx={{ flexShrink: 0, bgcolor: C.bg, borderTop: `1px solid ${C.borderOpaque}` }}>
        <PrototypeAppTabBar active="ask" />
      </Box>
    </Box>
  );
}
