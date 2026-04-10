import CloseIcon from '@mui/icons-material/Close';
import { PrototypeStatusBar } from 'Modules/prototypes/financialInterview/PrototypeStatusBar';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import MicIcon from '@mui/icons-material/Mic';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { Alert, Box, Button, IconButton, InputBase, Stack, Typography } from '@mui/material';
import { keyframes } from '@mui/material/styles';
import React, { useEffect, useRef, useState } from 'react';

/** Left-to-right reveal for the question shown over the voice orb (Figma Cursor `12-11702`). */
const VOICE_QUESTION_STREAM_MS_PER_CHAR = 18;

function useStreamingText(text: string, msPerChar: number): string {
  const [len, setLen] = useState(0);
  useEffect(() => {
    setLen(0);
    if (!text) return undefined;
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      const next = Math.min(n, text.length);
      setLen(next);
      if (next >= text.length) window.clearInterval(id);
    }, msPerChar);
    return () => window.clearInterval(id);
  }, [text, msPerChar]);
  return text.slice(0, len);
}

import { DAILY_PLAN_FONT_CONTENT } from 'Modules/prototypes/financialInterview/dailyPlanTypography';
import { IosMicrophonePermissionDialog } from 'Modules/prototypes/financialInterview/IosMicrophonePermissionDialog';
import { PROTOTYPE_PHONE_SCREEN_SX } from 'Modules/prototypes/financialInterview/PrototypeDeviceFrame';
import { PrototypeAppTabBar } from 'Modules/prototypes/financialInterview/PrototypeAppTabBar';
import { INTERVIEW_TURNS, type MemoryGem } from 'Modules/prototypes/financialInterview/interviewScript';
import { usePrototypeVoiceSession } from 'Modules/prototypes/financialInterview/usePrototypeVoiceSession';

/** Voice / speech UI — tokens from Figma node 5725:27568 (Voice Mode). */
const C = {
  bg: '#f8f6f2',
  contentPrimary: '#47201c',
  contentSecondary: '#5b3935',
  contentTertiary: '#846a67',
  bgTertiary: '#f0edea',
  paper: '#fffefb',
  accentMid: '#47201c',
  borderOpaque: 'rgba(14, 6, 5, 0.1)',
  overlayLight: 'rgba(255, 254, 251, 0.5)',
  userBubble: '#f0edea',
  mintMic: 'linear-gradient(180deg, #e8f4f0 0%, #dceee8 100%)',
};

const orbFloat = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
`;

const haloDrift = keyframes`
  0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 0.5; }
  33% { transform: translate(-48%, -52%) scale(1.04) rotate(120deg); opacity: 0.65; }
  66% { transform: translate(-52%, -48%) scale(0.98) rotate(240deg); opacity: 0.55; }
`;

const coronaSpin = keyframes`
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
`;

/** Fade + slight rise for newly mounted message blocks. */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
`;


export type ChatLine = { role: 'user' | 'assistant'; text: string };

type Props = {
  messages: ChatLine[];
  input: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onClearInput: () => void;
  /** Shown while capturing (orb + mic pulse). */
  listening: boolean;
  setListening: (v: boolean) => void;
  /** After speech-to-text + optional Ollama summary. */
  onVoiceTranscriptFinal: (text: string) => void;
  /** When Web Speech API is unavailable: scripted demo line (still after mic permission if needed). */
  onMicDemoFallback: () => void;
  gems: MemoryGem[];
  onEditGem: (g: MemoryGem) => void;
  turnIndex: number;
  quickReplies: string[];
  onQuickReply: (text: string) => void;
  interviewComplete: boolean;
  onSwitchToType: () => void;
  /** When set, orb headline uses this instead of inferring from `turnIndex` (pre-question Figma script). */
  orbHeadlineOverride?: string | null;

};

export function SpeechInterviewView({
  messages,
  input,
  onInputChange,
  onSend,
  onClearInput,
  listening,
  setListening,
  onVoiceTranscriptFinal,
  onMicDemoFallback,
  gems,
  onEditGem,
  turnIndex,
  quickReplies,
  onQuickReply,
  interviewComplete,
  onSwitchToType,
  orbHeadlineOverride = null,
}: Props) {
  const voice = usePrototypeVoiceSession({
    onTranscriptFinal: onVoiceTranscriptFinal,
    onInputInterim: onInputChange,
    onListeningChange: setListening,
    onDemoFallback: onMicDemoFallback,
  });

  const [spentQuickReplies, setSpentQuickReplies] = useState<string[]>([]);
  useEffect(() => {
    setSpentQuickReplies([]);
  }, [turnIndex]);

  /** Auto-scroll: reveal only the height of the new content, not the full sentinel distance. */
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
  }, [messages]);

  const visibleQuickReplies = quickReplies.filter((r) => !spentQuickReplies.includes(r));

  const handleQuickReplyPick = (text: string) => {
    setSpentQuickReplies((s) => [...s, text]);
    onQuickReply(text);
  };

  const last = messages[messages.length - 1];
  let headlineQuestion: string;
  let historyMessages: ChatLine[];

  if (last?.role === 'user') {
    historyMessages = messages;
    const nextIdx = turnIndex + 1;
    headlineQuestion =
      nextIdx < INTERVIEW_TURNS.length
        ? INTERVIEW_TURNS[nextIdx].assistant
        : 'Thanks—that’s everything we need for now.';
  } else {
    let li = -1;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant') {
        li = i;
        break;
      }
    }
    headlineQuestion = li >= 0 ? messages[li].text : INTERVIEW_TURNS[0]?.assistant ?? '';
    historyMessages = li >= 0 ? [...messages.slice(0, li), ...messages.slice(li + 1)] : [];
  }

  if (orbHeadlineOverride) {
    headlineQuestion = orbHeadlineOverride;
  }

  const streamedHeadline = useStreamingText(headlineQuestion, VOICE_QUESTION_STREAM_MS_PER_CHAR);

  return (
    <Box
      sx={{
        ...PROTOTYPE_PHONE_SCREEN_SX,
        bgcolor: C.bg,
        fontFamily: DAILY_PLAN_FONT_CONTENT,
      }}
    >
      <IosMicrophonePermissionDialog
        open={voice.permissionDialogOpen}
        onCancel={voice.cancelPermissionDialog}
        onConfirm={voice.confirmPermissionDialog}
      />

      {/* Top app bar */}
      <Box
        sx={{
          flexShrink: 0,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          bgcolor: 'rgba(255, 254, 251, 0.25)',
          borderBottom: `1px solid ${C.borderOpaque}`,
          zIndex: 10,
        }}
      >
        <PrototypeStatusBar />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, pb: 1 }}>
          <IconButton
            aria-label="Type instead of voice"
            onClick={onSwitchToType}
            sx={{
              bgcolor: C.bgTertiary,
              width: 40,
              height: 40,
              borderRadius: 1000,
              '&:hover': { bgcolor: C.bgTertiary },
            }}
          >
            <KeyboardIcon sx={{ color: C.contentPrimary, fontSize: 22 }} />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              component="button"
              type="button"
              sx={{
                bgcolor: C.bgTertiary,
                border: 'none',
                borderRadius: 1000,
                px: 1.5,
                py: 1,
                cursor: 'default',
              }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: '18px',
                  color: C.contentSecondary,
                  fontFamily: DAILY_PLAN_FONT_CONTENT,
                }}
              >
                Get $100
              </Typography>
            </Box>
            <IconButton
              sx={{
                bgcolor: C.bgTertiary,
                width: 'auto',
                height: 40,
                borderRadius: 1000,
                px: 1,
                gap: 0.5,
                '&:hover': { bgcolor: C.bgTertiary },
              }}
            >
              <NotificationsNoneOutlinedIcon sx={{ color: C.contentPrimary, fontSize: 22 }} />
              <Typography
                sx={{ fontSize: 12, fontWeight: 500, color: C.contentSecondary, pr: 0.5, fontFamily: DAILY_PLAN_FONT_CONTENT }}
              >
                3
              </Typography>
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
              <PersonOutlineIcon sx={{ color: C.contentPrimary, fontSize: 22 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {/* Scrollable transcript + headline */}
      <Box
        ref={scrollContainerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          px: 2,
          pt: 2,
          pb: 2,
          position: 'relative',
        }}
      >
        <Stack spacing={2}>
          {historyMessages.map((msg, i) => {
            const isLast = i === historyMessages.length - 1;
            return msg.role === 'assistant' ? (
              <Typography
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ref={isLast ? (lastItemRef as any) : undefined}
                key={`h-${i}`}
                sx={{
                  fontSize: 16,
                  fontWeight: 500,
                  lineHeight: '20px',
                  color: C.contentTertiary,
                  maxWidth: 320,
                  fontFamily: DAILY_PLAN_FONT_CONTENT,
                  animation: `${fadeIn} 0.35s ease-in-out both`,
                }}
              >
                {msg.text}
              </Typography>
            ) : (
              <Box
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                ref={isLast ? (lastItemRef as any) : undefined}
                key={`h-${i}`}
                sx={{ display: 'flex', justifyContent: 'flex-end', animation: `${fadeIn} 0.35s ease-in-out both` }}
              >
                <Box
                  sx={{
                    bgcolor: C.userBubble,
                    px: 2,
                    py: 1.5,
                    borderTopLeftRadius: '28px',
                    borderTopRightRadius: '28px',
                    borderBottomLeftRadius: '28px',
                    borderBottomRightRadius: '4px',
                    maxWidth: 320,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: '20px',
                      color: C.contentPrimary,
                      fontFamily: DAILY_PLAN_FONT_CONTENT,
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>

        {voice.voiceError && (
          <Alert severity="warning" sx={{ mt: 2, fontFamily: DAILY_PLAN_FONT_CONTENT }} onClose={() => voice.setVoiceError(null)}>
            {voice.voiceError}
          </Alert>
        )}

        {voice.llmSummary && (
          <Box
            sx={{
              position: 'relative',
              mt: 2,
              minHeight: gems.length > 0 ? 100 : 'auto',
            }}
          >
            {gems.length > 0 && (
              <Stack
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 103,
                  width: 78,
                  gap: 1,
                }}
              >
                {gems.map((g) => (
                  <Box
                    key={g.id}
                    component="button"
                    type="button"
                    onClick={() => onEditGem(g)}
                    sx={{
                      cursor: 'pointer',
                      width: 78,
                      minHeight: 44,
                      maxHeight: 100,
                      px: 0.75,
                      py: 1,
                      bgcolor: 'rgba(255,254,251,0.9)',
                      borderRadius: '12px',
                      border: `1px solid ${C.borderOpaque}`,
                      fontSize: 11,
                      fontWeight: 600,
                      lineHeight: 1.25,
                      color: C.contentPrimary,
                      fontFamily: DAILY_PLAN_FONT_CONTENT,
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {g.label}
                  </Box>
                ))}
              </Stack>
            )}
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '20px',
                color: C.contentSecondary,
                fontFamily: DAILY_PLAN_FONT_CONTENT,
                pl: gems.length > 0 ? '86px' : 0,
              }}
            >
              {voice.llmSummary}
            </Typography>
          </Box>
        )}

        {gems.length > 0 && !voice.llmSummary && (
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
            {gems.map((g) => (
              <Box
                key={g.id}
                component="button"
                type="button"
                onClick={() => onEditGem(g)}
                sx={{
                  border: 'none',
                  cursor: 'pointer',
                  bgcolor: 'rgba(255,254,251,0.65)',
                  borderRadius: 1000,
                  px: 1.25,
                  py: 0.5,
                  fontSize: 12,
                  fontWeight: 600,
                  color: C.contentPrimary,
                  fontFamily: DAILY_PLAN_FONT_CONTENT,
                }}
              >
                {g.label}
              </Box>
            ))}
          </Stack>
        )}

        {/* Fallback anchor when historyMessages is empty */}
        <Box ref={historyMessages.length === 0 ? (lastItemRef as React.RefObject<HTMLDivElement>) : undefined} sx={{ height: 1 }} />
      </Box>

      {/* Current question streams over the orb (Figma Cursor `12-11702`) */}
      <Box sx={{ position: 'relative', flexShrink: 0, minHeight: 236, overflow: 'visible' }}>
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 8,
            zIndex: 8,
            px: 2,
            display: 'flex',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{
              fontSize: 26,
              fontWeight: 700,
              lineHeight: '30px',
              color: C.contentPrimary,
              maxWidth: 300,
              textAlign: 'center',
              fontFamily: DAILY_PLAN_FONT_CONTENT,
              textShadow:
                '0 0 20px rgba(255,254,251,0.98), 0 0 36px rgba(255,254,251,0.9), 0 1px 0 rgba(255,254,251,1)',
              opacity: streamedHeadline.length > 0 ? 1 : 0,
              transition: 'opacity 0.35s ease-out',
              minHeight: 56,
            }}
          >
            {streamedHeadline}
          </Typography>
        </Box>
        <VoiceInterviewOrb listening={listening} micLevel={voice.micLevel} />
      </Box>

      {/* Mic — press and hold to speak; release to transcribe into the thread */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2, flexShrink: 0 }}>
        <IconButton
          disabled={interviewComplete}
          onPointerDown={(e) => {
            if (interviewComplete) return;
            (e.currentTarget as HTMLButtonElement).setPointerCapture(e.pointerId);
            voice.handleMicPointerDown();
          }}
          onPointerUp={(e) => {
            if (interviewComplete) return;
            try {
              (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
            } catch {
              /* released already */
            }
            voice.handleMicPointerUp();
          }}
          onPointerCancel={(e) => {
            try {
              (e.currentTarget as HTMLButtonElement).releasePointerCapture(e.pointerId);
            } catch {
              /* noop */
            }
            voice.handleMicPointerUp();
          }}
          aria-label={listening ? 'Release to finish and transcribe' : 'Hold to speak'}
          sx={{
            width: 60,
            height: 60,
            background: listening ? 'linear-gradient(180deg, #d8efe6 0%, #c5e5d8 100%)' : C.mintMic,
            boxShadow: listening
              ? `0 4px 24px rgba(4, 31, 26, 0.14), 0 0 0 ${3 + voice.micLevel * 10}px rgba(120, 200, 170, ${0.15 + voice.micLevel * 0.35})`
              : '0 2px 12px rgba(4, 31, 26, 0.08)',
            transform: listening ? `scale(${1 + voice.micLevel * 0.06})` : 'scale(1)',
            transition: 'transform 0.12s ease-out, box-shadow 0.12s ease-out',
            '&:hover': { background: C.mintMic },
            '&.Mui-disabled': { opacity: 0.45 },
          }}
        >
          <MicIcon sx={{ color: C.contentPrimary, fontSize: 26 }} />
        </IconButton>
      </Box>

      {/* Bottom input sheet */}
      <Box
        sx={{
          flexShrink: 0,
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          bgcolor: C.overlayLight,
          border: `1px solid ${C.borderOpaque}`,
          borderBottom: 'none',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          pt: 2,
          pb: 2.5,
          px: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%', maxWidth: 343, mx: 'auto' }}>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              bgcolor: C.paper,
              border: `1px solid ${C.borderOpaque}`,
              borderRadius: '32px',
              pl: 3,
              pr: 0.75,
              py: 0.75,
              minHeight: 48,
            }}
          >
            <InputBase
              fullWidth
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && input.trim()) {
                  e.preventDefault();
                  onSend();
                }
              }}
              disabled={interviewComplete}
              sx={{
                fontFamily: DAILY_PLAN_FONT_CONTENT,
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '20px',
                color: input ? C.contentPrimary : C.contentTertiary,
              }}
            />
          </Box>
          <IconButton
            aria-label="Clear"
            onClick={onClearInput}
            disabled={!input}
            sx={{ width: 48, height: 48 }}
          >
            <CloseIcon sx={{ color: C.contentPrimary, fontSize: 24 }} />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ flexShrink: 0, bgcolor: C.bg, borderTop: `1px solid ${C.borderOpaque}` }}>
        <PrototypeAppTabBar active="ask" />
      </Box>
    </Box>
  );
}

function VoiceInterviewOrb({ listening, micLevel }: { listening: boolean; micLevel: number }) {
  const energy = listening ? micLevel : 0;
  const scale = 1 + energy * 0.11;
  const flareOpacity = 0.22 + energy * 0.68;
  const coronaDuration = `${Math.max(18, 34 - energy * 16)}s`;

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 2,
        flexShrink: 0,
        minHeight: 236,
        overflow: 'visible',
        animation: `${orbFloat} 6.2s ease-in-out infinite`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 360,
          height: 360,
          left: '50%',
          top: '50%',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(255, 214, 180, ${0.32 + energy * 0.28}) 0%, rgba(252, 227, 210, 0.14) 44%, transparent 72%)`,
          filter: 'blur(26px)',
          pointerEvents: 'none',
          opacity: listening ? 0.92 : 0.5,
          transition: 'opacity 0.35s ease, transform 0.2s ease-out',
          transform: `translate(-50%, -50%) scale(${listening ? scale : 0.94})`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 248,
          height: 248,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          opacity: listening ? 0.28 + energy * 0.45 : 0.1,
          background:
            'conic-gradient(from 200deg, transparent 0%, rgba(255, 255, 255, 0.55) 18%, transparent 35%, rgba(255, 190, 140, 0.4) 52%, transparent 70%, rgba(200, 230, 255, 0.35) 88%, transparent 100%)',
          filter: 'blur(12px)',
          pointerEvents: 'none',
          animation: `${coronaSpin} ${coronaDuration} linear infinite`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 240, 228, 0.55) 0%, rgba(255, 200, 160, 0.18) 52%, transparent 72%)',
          filter: 'blur(16px)',
          pointerEvents: 'none',
          animation: `${haloDrift} ${listening ? 3.8 + (1 - energy) * 2.2 : 7.5}s ease-in-out infinite`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          width: 158,
          height: 158,
          borderRadius: '50%',
          position: 'relative',
          zIndex: 2,
          background:
            'radial-gradient(circle at 30% 26%, rgba(255,255,255,0.99) 0%, rgba(252, 253, 252, 1) 36%, rgba(228, 244, 236, 0.92) 100%)',
          boxShadow: `
            0 ${18 + energy * 32}px ${52 + energy * 36}px rgba(71, 32, 28, ${0.08 + energy * 0.14}),
            inset 0 -14px 32px rgba(170, 205, 188, 0.38),
            inset 0 5px 14px rgba(255,255,255,0.88)
          `,
          transition: 'transform 0.16s ease-out, box-shadow 0.2s ease-out',
          transform: `translateY(${listening ? -6 - energy * 12 : -3}px) scale(${listening ? 1 + energy * 0.055 : 1})`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 96,
          height: 96,
          left: '50%',
          top: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.98) 0%, rgba(255, 248, 230, 0.45) 40%, transparent 68%)',
          filter: 'blur(16px)',
          zIndex: 3,
          opacity: listening ? flareOpacity : 0.2,
          pointerEvents: 'none',
          transform: `translate(calc(-50% - 18px), calc(-50% - 36px)) scale(${listening ? 1 + energy * 0.42 : 1})`,
          transition: 'opacity 0.12s ease-out, transform 0.12s ease-out',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 40,
          height: 40,
          left: '50%',
          top: '50%',
          borderRadius: '50%',
          bgcolor: 'rgba(255,255,255,0.55)',
          filter: 'blur(10px)',
          zIndex: 3,
          opacity: listening ? 0.22 + energy * 0.58 : 0.07,
          pointerEvents: 'none',
          transition: 'opacity 0.1s ease-out, transform 0.15s ease-out',
          transform: `translate(calc(-50% + 52px), calc(-50% + 18px)) scale(${listening ? 1 + energy * 0.25 : 1})`,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          width: 26,
          height: 26,
          left: '50%',
          top: '50%',
          transform: 'translate(calc(-50% - 56px), calc(-50% + 32px))',
          borderRadius: '50%',
          bgcolor: 'rgba(255, 215, 185, 0.65)',
          filter: 'blur(8px)',
          zIndex: 3,
          opacity: listening ? 0.18 + energy * 0.52 : 0.05,
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}
