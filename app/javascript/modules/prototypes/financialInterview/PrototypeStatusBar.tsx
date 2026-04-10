import { Box, Typography } from '@mui/material';
import React from 'react';

/**
 * Inline SVG of the iOS status-bar right-side icons (signal · WiFi · battery).
 *
 * WiFi arcs are drawn with SVG arc commands (A) so they are geometrically
 * circular — bezier approximations look visibly wobbly at small sizes.
 * WiFi focal point: (29, 13). Arc radii: 3 / 5.5 / 8. Half-angle: 60°.
 * Each arc endpoint: (cx ± r·sin60°, cy − r·cos60°) = (cx ± r·0.866, cy − r·0.5).
 */
function StatusBarRightIcons({ color = '#47201c' }: { color?: string }) {
  return (
    <svg width="77" height="13" viewBox="0 0 77 13" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Cell signal — 4 ascending bars */}
      <rect x="0"    y="9"   width="3" height="4"    rx="0.5" fill={color} />
      <rect x="4.5"  y="5.5" width="3" height="7.5"  rx="0.5" fill={color} />
      <rect x="9"    y="2.5" width="3" height="10.5" rx="0.5" fill={color} />
      <rect x="13.5" y="0"   width="3" height="13"   rx="0.5" fill={color} />

      {/* WiFi — three concentric circular arcs + centre dot */}
      {/* Small  r=3:   endpoints (26.4, 11.5) → (31.6, 11.5) */}
      {/* Medium r=5.5: endpoints (24.2, 10.25) → (33.8, 10.25) */}
      {/* Large  r=8:   endpoints (22.1, 9)    → (35.9, 9)    */}
      <circle cx="29" cy="11.8" r="1.3" fill={color} />
      <path d="M26.4 11.5 A3 3 0 0 1 31.6 11.5"    stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M24.2 10.25 A5.5 5.5 0 0 1 33.8 10.25" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M22.1 9 A8 8 0 0 1 35.9 9"           stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Battery */}
      <rect x="44"  y="1"   width="27" height="11" rx="2.5" stroke={color} strokeWidth="1" />
      <rect x="71"  y="4"   width="2.5" height="5" rx="1"   fill={color} fillOpacity="0.4" />
      <rect x="45.5" y="2.5" width="23" height="8"  rx="1.5" fill={color} />
    </svg>
  );
}

interface PrototypeStatusBarProps {
  /** Override icon/text colour — defaults to Cleo content-primary (#47201c). */
  color?: string;
}

/**
 * iOS-style status bar (47 px tall) shared across all prototype screens.
 * Figma reference: node 12:12180 ("StatusBar / iPhone 15").
 */
export function PrototypeStatusBar({ color = '#47201c' }: PrototypeStatusBarProps = {}) {
  return (
    <Box sx={{ height: 47, position: 'relative', flexShrink: 0 }}>
      {/* Time — left: 27px, top: 14px, SF Pro Text Semibold 17px */}
      <Typography
        sx={{
          position: 'absolute',
          left: 27,
          top: 14,
          fontSize: 17,
          fontWeight: 600,
          lineHeight: '22px',
          letterSpacing: -0.408,
          color,
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          userSelect: 'none',
        }}
      >
        9:41
      </Typography>

      {/* Signal · WiFi · Battery — right: 26.6px, top: 19px */}
      <Box
        sx={{
          position: 'absolute',
          right: 26.6,
          top: 19,
          lineHeight: 0,
        }}
      >
        <StatusBarRightIcons color={color} />
      </Box>
    </Box>
  );
}
