import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { PrototypeStatusBar } from 'Modules/prototypes/financialInterview/PrototypeStatusBar';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import CheckIcon from '@mui/icons-material/Check';
import MicIcon from '@mui/icons-material/Mic';
import MicNoneIcon from '@mui/icons-material/MicNone';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Box, IconButton, InputBase, Stack, Tooltip, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import React, { useEffect, useRef } from 'react';

import { DAILY_PLAN_FONT_CONTENT } from 'Modules/prototypes/financialInterview/dailyPlanTypography';
import { PROTOTYPE_PHONE_SCREEN_SX } from 'Modules/prototypes/financialInterview/PrototypeDeviceFrame';
import { PrototypeAppTabBar } from 'Modules/prototypes/financialInterview/PrototypeAppTabBar';

/**
 * Typed interview after bank link — content & chrome aligned with Figma Cursor `12-11835`:
 * https://www.figma.com/design/ndOYaALnTsjzgDAXD3hR3P/Cursor?node-id=12-11835
 */
const C = {
  bg: '#f8f6f2',
  contentPrimary: '#47201c',
  contentSecondary: '#5b3935',
  contentTertiary: '#846a67',
  bgTertiary: '#f0edea',
  paper: '#fffefb',
  borderOpaque: 'rgba(14, 6, 5, 0.1)',
  userBubble: '#f0edea',
  overlayBar: 'rgba(255, 254, 251, 0.25)',
  gemBg: 'rgba(255, 254, 251, 0.65)',
  insightFill: 'rgba(255, 248, 232, 0.72)',
  checkAccent: '#2d6a4f',
};

/** Animated gradient on the insights card outline (AI-style shimmer). */
const aiShimmer = keyframes`
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
`;

/** Fade + slight rise for newly mounted message blocks. */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

export type TypeModeChatLine = { role: 'user' | 'assistant'; text: string };

type Props = {
  transcriptMessages: TypeModeChatLine[];
  /** Assistant strings that are interview questions — rendered as headline in the thread. */
  interviewQuestionTexts: readonly string[];
  quickReplies: string[];
  spentQuickReplyIds: Set<string> | string[];
  onQuickReply: (text: string) => void;
  linked: boolean;
  inferredSummary: string[] | null;
  voiceHintOpen: boolean;
  onStartVoice: () => void;
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  interviewActive: boolean;
  /** Show suggested-reply chips even when the text field is locked (Figma “Let’s do it” gate). */
  allowQuickRepliesWhenInputLocked?: boolean;
};

export function InterviewTypeModeView({
  transcriptMessages,
  interviewQuestionTexts,
  quickReplies,
  spentQuickReplyIds,
  onQuickReply,
  linked,
  inferredSummary,
  voiceHintOpen,
  onStartVoice,
  input,
  onInputChange,
  onSend,
  interviewActive,
  allowQuickRepliesWhenInputLocked = false,
}: Props) {
  const spent = spentQuickReplyIds instanceof Set ? spentQuickReplyIds : new Set(spentQuickReplyIds);
  const visibleQuickReplies = quickReplies.filter((r) => !spent.has(r));
  const questionSet = new Set(interviewQuestionTexts);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const container = scrollContainerRef.current;
    const last = lastItemRef.current;
    if (!container || !last) return;
    const overshoot = last.getBoundingClientRect().bottom - container.getBoundingClientRect().bottom;
    if (overshoot > 0) {
      container.scrollBy({ top: overshoot + 12, behavior: 'smooth' });
    }
  }, [transcriptMessages, quickReplies]);

  return (
    <Box
      sx={{
        ...PROTOTYPE_PHONE_SCREEN_SX,
        bgcolor: C.bg,
        fontFamily: DAILY_PLAN_FONT_CONTENT,
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          bgcolor: C.overlayBar,
          borderBottom: `1px solid ${C.borderOpaque}`,
          zIndex: 10,
        }}
      >
        <PrototypeStatusBar />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pb: 1.25 }}>
          <Typography
            sx={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: C.contentTertiary,
              fontFamily: DAILY_PLAN_FONT_CONTENT,
            }}
          >
            Interview
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                color: C.contentSecondary,
                fontFamily: DAILY_PLAN_FONT_CONTENT,
              }}
            >
              Voice
            </Typography>
            <IconButton
              size="small"
              onClick={onStartVoice}
              aria-label="Start voice mode"
              sx={{
                bgcolor: C.bgTertiary,
                width: 40,
                height: 40,
                borderRadius: 1000,
                '&:hover': { bgcolor: C.bgTertiary },
              }}
            >
              <MicNoneIcon sx={{ color: C.contentPrimary, fontSize: 22 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 2,
          pt: 2,
          pb: 2,
          '& .MuiTypography-root': { fontFamily: DAILY_PLAN_FONT_CONTENT },
        }}
      >
        <Stack spacing={2}>
          {linked && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                sx={{
                  bgcolor: C.bgTertiary,
                  px: 2,
                  py: 0.75,
                  borderRadius: 1000,
                  border: `1px solid ${C.borderOpaque}`,
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: C.contentSecondary }}>
                  Account connected
                </Typography>
              </Box>
            </Box>
          )}

          {linked && inferredSummary && (
            <Box
              sx={{
                borderRadius: '17px',
                p: '1px',
                background:
                  'linear-gradient(105deg, rgba(120, 200, 160, 0.55), rgba(160, 210, 255, 0.75), rgba(255, 200, 150, 0.85), rgba(180, 230, 210, 0.6), rgba(140, 190, 255, 0.7), rgba(120, 200, 160, 0.55))',
                backgroundSize: '200% 200%',
                animation: `${aiShimmer} 5s ease-in-out infinite`,
              }}
            >
              <Box
                sx={{
                  borderRadius: '16px',
                  bgcolor: C.insightFill,
                  p: 2,
                  border: '1px solid rgba(255, 254, 251, 0.6)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25 }}>
                  <VisibilityOutlinedIcon sx={{ fontSize: 22, color: C.contentPrimary }} />
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 700,
                      lineHeight: '18px',
                      color: C.contentPrimary,
                    }}
                  >
                    From your linked account
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {inferredSummary.map((line) => (
                    <Stack key={line} direction="row" alignItems="flex-start" spacing={1}>
                      <CheckIcon sx={{ fontSize: 18, color: C.checkAccent, mt: 0.15, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 15, fontWeight: 500, lineHeight: '20px', color: C.contentSecondary }}>
                        {line}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Box>
          )}

          <Stack spacing={1.75}>
            {transcriptMessages.map((msg, i) => {
              const isLast = i === transcriptMessages.length - 1;
              return msg.role === 'assistant' ? (
                <Typography
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ref={isLast ? (lastItemRef as any) : undefined}
                  key={`a-${i}-${msg.text.slice(0, 24)}`}
                  sx={
                    questionSet.has(msg.text)
                      ? {
                          fontSize: 22,
                          fontWeight: 700,
                          lineHeight: '28px',
                          color: C.contentPrimary,
                          maxWidth: 320,
                          animation: `${fadeIn} 0.35s ease-in-out both`,
                        }
                      : {
                          fontSize: 16,
                          fontWeight: 500,
                          lineHeight: '20px',
                          color: C.contentSecondary,
                          maxWidth: 320,
                          animation: `${fadeIn} 0.35s ease-in-out both`,
                        }
                  }
                >
                  {msg.text}
                </Typography>
              ) : (
                <Box
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ref={isLast ? (lastItemRef as any) : undefined}
                  key={`u-${i}-${msg.text.slice(0, 24)}`}
                  sx={{ display: 'flex', justifyContent: 'flex-end', animation: `${fadeIn} 0.35s ease-in-out both` }}
                >
                  <Box
                    sx={{
                      bgcolor: C.userBubble,
                      px: 2,
                      py: 1.5,
                      borderRadius: '28px',
                      maxWidth: 280,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 16,
                        fontWeight: 500,
                        lineHeight: '20px',
                        color: C.contentPrimary,
                      }}
                    >
                      {msg.text}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>

        </Stack>
      </Box>

      {/* Figma 12-11835 / 12-11702: quick replies above input only; questions live in thread */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'rgba(255, 254, 251, 0.72)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderTop: `1px solid ${C.borderOpaque}`,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          pt: 1,
          pb: 1.5,
          px: 0,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 100, bgcolor: 'rgba(14, 6, 5, 0.15)' }} />
        </Box>

        {(interviewActive || allowQuickRepliesWhenInputLocked) && visibleQuickReplies.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'flex-end',
              gap: 1,
              px: 2,
              pb: 1.5,
              maxWidth: 343,
              mx: 'auto',
              width: '100%',
            }}
          >
            {visibleQuickReplies.map((r) => (
              <Box
                key={r}
                component="button"
                type="button"
                onClick={() => onQuickReply(r)}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  height: 44,
                  cursor: 'pointer',
                  border: `1px solid ${C.borderOpaque}`,
                  bgcolor: C.bg,
                  color: C.contentSecondary,
                  borderTopLeftRadius: 28,
                  borderTopRightRadius: 28,
                  borderBottomLeftRadius: 28,
                  borderBottomRightRadius: 0,
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
                {r}
              </Box>
            ))}
          </Box>
        )}

        <Box sx={{ px: 2, maxWidth: 343, mx: 'auto' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BoltOutlinedIcon sx={{ color: C.contentTertiary, fontSize: 22, flexShrink: 0 }} />
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: C.paper,
                border: `1px solid ${C.borderOpaque}`,
                borderRadius: '32px',
                pl: 1.5,
                pr: 0.5,
                minHeight: 52,
              }}
            >
              <InputBase
                fullWidth
                placeholder="Type to reply…"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && input.trim() && interviewActive) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                disabled={!interviewActive}
                sx={{
                  fontFamily: DAILY_PLAN_FONT_CONTENT,
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: input ? C.contentPrimary : C.contentTertiary,
                  py: 1,
                }}
              />
            </Box>
            <Tooltip
              title="✨ NEW Speak to Cleo"
              open={voiceHintOpen ? true : undefined}
              placement="top"
              arrow
              disableFocusListener
              disableHoverListener
              disableTouchListener
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: '#ebe8e4',
                    color: C.contentPrimary,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: DAILY_PLAN_FONT_CONTENT,
                    px: 1.5,
                    py: 1,
                    boxShadow: '0 4px 20px rgba(14, 6, 5, 0.12)',
                  },
                },
                arrow: { sx: { color: '#ebe8e4' } },
              }}
            >
              <span>
                <IconButton
                  aria-label="Start voice mode"
                  onClick={onStartVoice}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: C.contentPrimary,
                    borderRadius: 1000,
                    flexShrink: 0,
                    '&:hover': { bgcolor: '#3a1a17' },
                  }}
                >
                  <MicIcon sx={{ color: C.paper, fontSize: 22 }} />
                </IconButton>
              </span>
            </Tooltip>
            <IconButton
              aria-label="Send"
              onClick={onSend}
              disabled={!input.trim() || !interviewActive}
              sx={{
                width: 48,
                height: 48,
                bgcolor: C.bgTertiary,
                borderRadius: 1000,
                flexShrink: 0,
                '&:hover': { bgcolor: C.bgTertiary },
                '&.Mui-disabled': { opacity: 0.4 },
              }}
            >
              <ArrowUpwardIcon sx={{ color: C.contentPrimary, fontSize: 22 }} />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, bgcolor: C.bg, borderTop: `1px solid ${C.borderOpaque}` }}>
        <PrototypeAppTabBar active="ask" />
      </Box>
    </Box>
  );
}
