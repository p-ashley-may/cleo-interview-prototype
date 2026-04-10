import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ExploreIcon from '@mui/icons-material/Explore';
import SouthWestIcon from '@mui/icons-material/SouthWest';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Box, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import React from 'react';

import { DAILY_PLAN_FONT_CONTENT } from 'Modules/prototypes/financialInterview/dailyPlanTypography';

/** Matches Daily Plan / Cursor tab chrome — five tabs, one active (Figma-aligned). */
export type PrototypeAppTab = 'spend' | 'plan' | 'ask' | 'save' | 'request';

const T = {
  contentPrimary: '#47201c',
  contentTertiary: '#6f514e',
};

type Props = {
  active: PrototypeAppTab;
  /** Extra styles on the outer Stack (e.g. borderTop). */
  sx?: SxProps<Theme>;
};

export function PrototypeAppTabBar({ active, sx }: Props) {
  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ px: 1.5, pt: 1.5, pb: 0.5, ...sx }}>
        <TabSlot
          label="Spend"
          muted={active !== 'spend'}
          icon={<TrendingUpIcon sx={{ fontSize: 22, color: active === 'spend' ? T.contentPrimary : T.contentTertiary }} />}
        />
        <TabSlot
          label="Plan"
          muted={active !== 'plan'}
          icon={<ExploreIcon sx={{ fontSize: 22, color: active === 'plan' ? T.contentPrimary : T.contentTertiary }} />}
        />
        <TabSlot
          label="Ask Cleo"
          muted={active !== 'ask'}
          icon={
            <ChatBubbleOutlineIcon sx={{ fontSize: 22, color: active === 'ask' ? T.contentPrimary : T.contentTertiary }} />
          }
        />
        <TabSlot
          label="Save"
          muted={active !== 'save'}
          icon={<SouthWestIcon sx={{ fontSize: 22, color: active === 'save' ? T.contentPrimary : T.contentTertiary }} />}
        />
        <TabSlot
          label="Request"
          muted={active !== 'request'}
          icon={<AttachMoneyIcon sx={{ fontSize: 22, color: active === 'request' ? T.contentPrimary : T.contentTertiary }} />}
        />
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1.5, pt: 0.5, opacity: 0.4 }}>
        <Box sx={{ width: 134, height: 5, borderRadius: 100, bgcolor: T.contentTertiary }} />
      </Box>
    </>
  );
}

function TabSlot({ icon, label, muted }: { icon: React.ReactNode; label: string; muted: boolean }) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ minWidth: 58, maxWidth: 58, py: 0.5 }}>
      <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: 0.2,
          color: muted ? T.contentTertiary : T.contentPrimary,
          textAlign: 'center',
          lineHeight: '16px',
          width: 52,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontFamily: DAILY_PLAN_FONT_CONTENT,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
