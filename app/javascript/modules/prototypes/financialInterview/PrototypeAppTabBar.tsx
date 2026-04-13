import { Box, Stack, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import React from 'react';

import { DAILY_PLAN_FONT_CONTENT } from 'Modules/prototypes/financialInterview/dailyPlanTypography';

// Exact Figma assets — node 15:14419 (Cursor file, tab bar Content)
const IMG_CIRCLE       = 'data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDI4IDI4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBpZD0iVmVjdG9yIiBkPSJNMTQgMC43NUMyMS4zMTc4IDAuNzUgMjcuMjUgNi42ODIyMyAyNy4yNSAxNEMyNy4yNSAyMS4zMTc4IDIxLjMxNzggMjcuMjUgMTQgMjcuMjVDNi42ODIyMyAyNy4yNSAwLjc1IDIxLjMxNzggMC43NSAxNEMwLjc1MDAwMiA2LjY4MjIzIDYuNjgyMjMgMC43NTAwMDIgMTQgMC43NVoiIHN0cm9rZT0idmFyKC0tc3Ryb2tlLTAsICM0NzIwMUMpIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4K';   // circle outline (Spend, Save, Request bg)
const IMG_SPEND_ARROW  = 'data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDExLjcxIDExLjcxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBpZD0iVmVjdG9yIiBkPSJNMCAxMC4zTDEuNDEgMTEuNzFMOS43MSAzLjQyVjlIMTEuNzFWMEgyLjcxVjJIOC4yOUwwIDEwLjNaIiBmaWxsPSJ2YXIoLS1maWxsLTAsICM0NzIwMUMpIi8+Cjwvc3ZnPgo=';            // ↗ arrow (Spend)
const IMG_PLAN_BG      = 'data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDI4IDI4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBpZD0iVmVjdG9yIiBkPSJNMTQgMC43NUMyMS4zMTc4IDAuNzUgMjcuMjUgNi42ODIyMyAyNy4yNSAxNEMyNy4yNSAyMS4zMTc4IDIxLjMxNzggMjcuMjUgMTQgMjcuMjVDNi42ODIyMyAyNy4yNSAwLjc1IDIxLjMxNzggMC43NSAxNEMwLjc1MDAwMiA2LjY4MjIzIDYuNjgyMjMgMC43NTAwMDIgMTQgMC43NVoiIHN0cm9rZT0idmFyKC0tc3Ryb2tlLTAsICM0NzIwMUMpIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4K';  // Autopilot compass bg (Plan)
const IMG_PLAN_STROKE  = 'data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDE0IDE2IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBpZD0iVmVjdG9yIChTdHJva2UpIiBkPSJNMTQgMTZMNyAxMi4wODM4TDAgMTZMNyAwTDE0IDE2Wk00LjE5MjkxIDExLjMzODZMNyA5Ljc2OTU0TDkuODA2MTMgMTEuMzM4Nkw3IDQuOTI0MDdMNC4xOTI5MSAxMS4zMzg2WiIgZmlsbD0idmFyKC0tZmlsbC0wLCAjNDcyMDFDKSIvPgo8L3N2Zz4K';      // inner A stroke (Plan)
const IMG_ASK_CLEO     = 'data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDI4IDI4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBpZD0iU3VidHJhY3QiIGQ9Ik0xNCAwQzIxLjczIDAgMjggNi4yNyAyOCAxNEMyOCAyMS43MyAyMS43MyAyOCAxNCAyOEgwVjE0QzEuODA1MDdlLTA2IDYuMjcgNi4yNyAxLjgwNDk2ZS0wNiAxNCAwWk0xMy45NDA0IDdDMTAuMTIwNCA3IDcuNTUwNzggOS45MyA3LjU1MDc4IDE0QzcuNTUwNzggMTguMDcgMTAuMTMwNyAyMSAxMy45NzA3IDIxQzE2LjU3MDUgMjAuOTk5OSAxOC41NDA0IDE5LjYyOTggMTkuNjEwNCAxNy4xNjk5TDE3LjExMDQgMTYuMDA5OEgxNy4xMDA2QzE2LjQ5MDYgMTcuNDM5NiAxNS40NjA1IDE4LjMyOTkgMTMuOTcwNyAxOC4zMzAxQzExLjc1MDcgMTguMzMwMSAxMC4zNzk5IDE2LjQzIDEwLjM3OTkgMTRDMTAuMzc5OSAxMS41NyAxMS43NTA0IDkuNjY5OTIgMTMuOTQwNCA5LjY2OTkyQzE1LjQzMDMgOS42Njk5NyAxNi40OTA2IDEwLjUzOTggMTcuMTAwNiAxMS45Njk3TDE5LjU4MDEgMTAuNzgwM0MxOC41MjAxIDguMzIwMzEgMTYuNTUwNCA3LjAwMDA1IDEzLjk0MDQgN1oiIGZpbGw9InZhcigtLWZpbGwtMCwgIzQ3MjAxQykiLz4KPC9zdmc+Cg==';   // Cleo branded circle (Ask Cleo)
const IMG_SAVE_ARROW   = 'data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDExLjcxIDExLjcxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBpZD0iVmVjdG9yIiBkPSJNMTEuNzEgMS40MkwxMC4yOSAwTDIgOC4zVjIuNzFIMFYxMS43MUg5VjkuNzFIMy40MUwxMS43MSAxLjQyWiIgZmlsbD0idmFyKC0tZmlsbC0wLCAjNDcyMDFDKSIvPgo8L3N2Zz4K';           // ↙ arrow (Save)
const IMG_REQUEST_SIGN = 'data:image/svg+xml;base64,PHN2ZyBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBvdmVyZmxvdz0idmlzaWJsZSIgc3R5bGU9ImRpc3BsYXk6IGJsb2NrOyIgdmlld0JveD0iMCAwIDEwLjQxIDE1Ljk5IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBpZD0iVmVjdG9yIiBkPSJNOS4yNCAxMy4zQzguNDUgMTMuOTggNy4zNCAxNC4zNSA1Ljg5IDE0LjQxVjE1Ljk5SDQuNzFWMTQuMzdDMy4zIDE0LjI1IDIuMTcgMTMuOCAxLjMyIDEzLjA0QzAuNDcgMTIuMjcgMC4wMyAxMS4yNSAwIDkuOThIMi41NEMyLjU4IDEwLjY1IDIuNzkgMTEuMTcgMy4xNyAxMS41NEMzLjU1IDExLjkxIDQuMDYgMTIuMTQgNC43MSAxMi4yNFY4Ljc1QzQuNzEgOC43NSA0LjU5IDguNyA0LjQ3IDguNjhDMy4xOCA4LjMzIDIuMTkgNy44OCAxLjQ4IDcuMzRDMC43ODAwMDEgNi44IDAuNDIgNi4wMiAwLjQyIDUuMDFDMC40MiAzLjkyIDAuOCAzLjA0IDEuNTcgMi4zOUMyLjM0IDEuNzMgMy4zOCAxLjM4IDQuNzEgMS4zMVYwSDUuODlWMS4zMkM3LjE4IDEuNDQgOC4yIDEuODYgOC45NiAyLjU4QzkuNzIgMy4zIDEwLjEzIDQuMjMgMTAuMTcgNS4zOEg3LjYxQzcuNDkgNC4zMSA2LjkxIDMuNjcgNS44OCAzLjQ1VjYuNjFDNi45IDYuOTIgNy43MiA3LjIxIDguMzQgNy40OUM4Ljk2IDcuNzcgOS40NiA4LjE2IDkuODQgOC42N0MxMC4yMiA5LjE4IDEwLjQxIDkuODMgMTAuNDEgMTAuNjRDMTAuNDEgMTEuNzMgMTAuMDIgMTIuNjIgOS4yMyAxMy4zSDkuMjRaTTMuNCA1LjY1QzMuNjYgNS44NiA0LjEgNi4wNyA0LjcyIDYuMjdWMy40QzQuMTkgMy40NCAzLjc4IDMuNTcgMy40NyAzLjhDMy4xNiA0LjAzIDMuMDEgNC4zNiAzLjAxIDQuNzdDMy4wMSA1LjE0IDMuMTQgNS40MyAzLjQxIDUuNjRMMy40IDUuNjVaTTUuODkgMTIuMzFDNy4xOSAxMi4yNCA3Ljg0IDExLjc1IDcuODQgMTAuODRDNy44NCAxMC40IDcuNjggMTAuMDUgNy4zNiA5Ljc5QzcuMDQgOS41MyA2LjU1IDkuMjkgNS44OSA5LjA3VjEyLjMxWiIgZmlsbD0idmFyKC0tZmlsbC0wLCAjNDcyMDFDKSIvPgo8L3N2Zz4K';           // $ sign (Request)

/** Matches Daily Plan / Cursor tab chrome — five tabs, one active (Figma-aligned). */
export type PrototypeAppTab = 'spend' | 'plan' | 'ask' | 'save' | 'request';

const T = {
  contentPrimary: '#47201c',
  contentTertiary: '#6f514e',
};

type Props = {
  active: PrototypeAppTab;
  sx?: SxProps<Theme>;
};

export function PrototypeAppTabBar({ active, sx }: Props) {
  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ px: 1.5, pt: 1.5, pb: 0.5, ...sx }}>
        {/* Spend — circle outline + ↗ overlay */}
        <TabSlot label="Spend" active={active === 'spend'}>
          <LayeredIcon bg={IMG_CIRCLE}>
            <Box component="img" src={IMG_SPEND_ARROW} sx={{ position: 'absolute', top: '29.61%', right: '29.61%', bottom: '28.57%', left: '28.57%' }} />
          </LayeredIcon>
        </TabSlot>

        {/* Plan — Autopilot circle + inner A stroke */}
        <TabSlot label="Plan" active={active === 'plan'}>
          <LayeredIcon bg={IMG_PLAN_BG}>
            <Box component="img" src={IMG_PLAN_STROKE} sx={{ position: 'absolute', width: 14, height: 16, left: '50%', top: 'calc(50% - 1.5px)', transform: 'translate(-50%, -50%)' }} />
          </LayeredIcon>
        </TabSlot>

        {/* Ask Cleo — single branded icon */}
        <TabSlot label="Ask Cleo" active={active === 'ask'}>
          <Box component="img" src={IMG_ASK_CLEO} sx={{ width: 28, height: 28, display: 'block' }} />
        </TabSlot>

        {/* Save — circle outline + ↙ overlay */}
        <TabSlot label="Save" active={active === 'save'}>
          <LayeredIcon bg={IMG_CIRCLE}>
            <Box component="img" src={IMG_SAVE_ARROW} sx={{ position: 'absolute', top: '29.61%', right: '29.60%', bottom: '28.57%', left: '28.57%' }} />
          </LayeredIcon>
        </TabSlot>

        {/* Request — circle outline + $ overlay */}
        <TabSlot label="Request" active={active === 'request'}>
          <LayeredIcon bg={IMG_CIRCLE}>
            <Box component="img" src={IMG_REQUEST_SIGN} sx={{ position: 'absolute', top: '21.47%', right: '31.43%', bottom: '21.43%', left: '31.39%' }} />
          </LayeredIcon>
        </TabSlot>
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 1.5, pt: 0.5, opacity: 0.4 }}>
        <Box sx={{ width: 134, height: 5, borderRadius: 100, bgcolor: T.contentTertiary }} />
      </Box>
    </>
  );
}

/** 28×28 icon with a full-bleed background image and optional overlay children. */
function LayeredIcon({ bg, children }: { bg: string; children?: React.ReactNode }) {
  return (
    <Box sx={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
      <Box component="img" src={bg} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      {children}
    </Box>
  );
}

function TabSlot({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
  return (
    <Stack alignItems="center" spacing=1 sx={{ minWidth: 58, maxWidth: 58, py: 0.5 }}>
      <Box sx={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </Box>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: 0.2,
          color: active ? T.contentPrimary : T.contentTertiary,
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
