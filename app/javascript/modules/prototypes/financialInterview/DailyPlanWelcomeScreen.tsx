import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import { PrototypeStatusBar } from 'Modules/prototypes/financialInterview/PrototypeStatusBar';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import MenuIcon from '@mui/icons-material/Menu';
import CheckIcon from '@mui/icons-material/Check';
import { Box, ButtonBase, Fade, IconButton, InputBase, Stack, Typography } from '@mui/material';
import { ThemeProvider, createTheme, keyframes, useTheme } from '@mui/material/styles';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DAILY_PLAN_FONT_CONTENT } from 'Modules/prototypes/financialInterview/dailyPlanTypography';
import { PROTOTYPE_PHONE_SCREEN_SX } from 'Modules/prototypes/financialInterview/PrototypeDeviceFrame';
import { PrototypeAppTabBar } from 'Modules/prototypes/financialInterview/PrototypeAppTabBar';

/** Daily Plan welcome frame — tokens from Figma node 5725:27458 (Daily Plan file). */
const C = {
  bg: '#f8f6f2',
  contentPrimary: '#47201c',
  contentSecondary: '#5b3935',
  contentTertiary: '#846a67',
  bgTertiary: '#f0edea',
  budgetSecondary: '#354f4b',
  budgetPrimary: '#041f1a',
  accentMid: '#47201c',
  borderOpaque: 'rgba(14, 6, 5, 0.1)',
  paper: '#fffefb',
  overlayBar: 'rgba(255, 254, 251, 0.25)',
  streakCardBg: 'rgba(255, 254, 251, 0.5)',
  streakCardBorder: 'rgba(255, 254, 251, 0.25)',
  mintCircle: 'linear-gradient(180deg, #e8f4f0 0%, #d4ebe4 100%)',
  chipBorder: 'rgba(14, 6, 5, 0.25)',
  userBubbleBg: 'rgba(71, 32, 28, 0.08)',
};

const bubbleSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/** Pause after a block finishes streaming, before the next block starts (contemplative beat). */
const WELCOME_STAGGER_MS = 2000;
/** Word-by-word reveal; higher = more subtle than per-character typewriter. */
const WELCOME_STREAM_MS_PER_WORD = 92;
/** Coalesce stream ticks into one smooth scroll (avoids scroll fighting the typewriter). */
const WELCOME_SCROLL_DEBOUNCE_MS = 480;

const CONTINUE_AFTER_MS = 420;

const WELCOME_ACCOUNT_PARA =
  'We’ll start by connecting your accounts, so that I can see what’s coming and going. This helps me make smarter recommendations—don’t worry, I’ll never touch your money without your consent.';

const WELCOME_QUICK_REPLIES: ReadonlyArray<{
  id: string;
  label: string;
  /** Advances prototype after message animates in. */
  continuesFlow?: boolean;
  /** Stronger visual weight (primary CTA chip). */
  emphasis?: boolean;
}> = [{ id: 'go', label: "Let's go", continuesFlow: true, emphasis: true }];

type ThreadMsg = { id: string; text: string };

type StreamSx = React.ComponentProps<typeof Typography>['sx'];

function StreamingTypography({
  text,
  run,
  sx,
  onDone,
  onTick = () => {},
}: {
  text: string;
  run: boolean;
  sx?: StreamSx;
  onDone: () => void;
  onTick?: () => void;
}) {
  const words = useMemo(() => text.trim().match(/\S+/g) ?? [], [text]);
  const totalWords = words.length;
  const [wordIndex, setWordIndex] = useState(0);
  const firedDone = useRef(false);
  const onDoneRef = useRef(onDone);
  const onTickRef = useRef(onTick);
  onDoneRef.current = onDone;
  onTickRef.current = onTick;

  useEffect(() => {
    firedDone.current = false;
    if (!run) {
      setWordIndex(totalWords);
      return;
    }
    setWordIndex(0);
    if (totalWords === 0) {
      firedDone.current = true;
      onDoneRef.current();
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      const next = Math.min(i, totalWords);
      setWordIndex(next);
      onTickRef.current();
      if (next >= totalWords) {
        window.clearInterval(id);
        if (!firedDone.current) {
          firedDone.current = true;
          onDoneRef.current();
        }
      }
    }, WELCOME_STREAM_MS_PER_WORD);
    return () => window.clearInterval(id);
  }, [run, text, totalWords]);

  const visible = run ? words.slice(0, wordIndex).join(' ') : text;
  return (
    <Typography
      sx={{
        ...sx,
        opacity: run && wordIndex === 0 ? 0 : 1,
        transition: run ? 'opacity 0.55s ease-out' : undefined,
      }}
    >
      {visible}
    </Typography>
  );
}

type Props = {
  /** Shown as “Hey {firstName}” — default matches Figma sample. */
  firstName?: string;
  onContinue: () => void;
};

export function DailyPlanWelcomeScreen({ firstName = 'Kyle', onContinue }: Props) {
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ThreadMsg[]>([]);
  const [spentWelcomeIds, setSpentWelcomeIds] = useState<Set<string>>(() => new Set());
  const threadRef = useRef<HTMLDivElement | null>(null);
  const mainScrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const scrollDebounceRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  /** Sequential block index: 0 = streaming “Hey”, … 6 = “Ready?”, 7 = all done. */
  const [streamCursor, setStreamCursor] = useState(0);
  /** Spend row: 0 stream title, 1 stream subtitle, 2 finished while cursor === 1. */
  const [spendPhase, setSpendPhase] = useState(0);
  /** Streak card: 0 stream “Launch week”, 1 show grid. */
  const [cardPhase, setCardPhase] = useState(0);
  const parentTheme = useTheme();

  /** One smooth scroll after layout settles (block transitions). */
  const smoothScrollMainToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = mainScrollRef.current;
        const sentinel = sentinelRef.current;
        if (!container || !sentinel) return;
        const overshoot =
          sentinel.getBoundingClientRect().bottom - container.getBoundingClientRect().bottom;
        if (overshoot > 0) {
          container.scrollBy({ top: overshoot + 16, behavior: 'smooth' });
        }
      });
    });
  }, []);

  /** Coalesce many stream ticks into a single smooth scroll so it doesn’t stutter. */
  const scheduleSmoothScrollMainToEnd = useCallback(() => {
    if (scrollDebounceRef.current) window.clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = window.setTimeout(() => {
      scrollDebounceRef.current = null;
      smoothScrollMainToEnd();
    }, WELCOME_SCROLL_DEBOUNCE_MS);
  }, [smoothScrollMainToEnd]);

  useEffect(
    () => () => {
      if (scrollDebounceRef.current) window.clearTimeout(scrollDebounceRef.current);
    },
    [],
  );

  const finishBlock = useCallback((blockIndex: number) => {
    window.setTimeout(() => {
      setStreamCursor((c) => Math.max(c, blockIndex + 1));
    }, WELCOME_STAGGER_MS);
  }, []);

  useEffect(() => {
    smoothScrollMainToEnd();
  }, [streamCursor, spendPhase, cardPhase, smoothScrollMainToEnd]);

  useEffect(() => {
    if (streamCursor === 2) setCardPhase(0);
  }, [streamCursor]);

  // Block 1 ("Spend Smarter") dissolves in as a whole unit — advance cursor after stagger.
  useEffect(() => {
    if (streamCursor !== 1) return undefined;
    const t = window.setTimeout(() => setStreamCursor((c) => Math.max(c, 2)), WELCOME_STAGGER_MS);
    return () => window.clearTimeout(t);
  }, [streamCursor]);

  const ppTheme = useMemo(
    () =>
      createTheme(parentTheme, {
        typography: {
          fontFamily: DAILY_PLAN_FONT_CONTENT,
          allVariants: { fontFamily: DAILY_PLAN_FONT_CONTENT },
        },
      }),
    [parentTheme],
  );

  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const appendUserLine = (text: string, continuesFlow: boolean) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setMessages((m) => [...m, { id, text }]);
    if (continuesFlow) {
      window.setTimeout(() => onContinue(), CONTINUE_AFTER_MS);
    }
  };

  const submitComposer = () => {
    const t = draft.trim();
    if (!t) return;
    setDraft('');
    appendUserLine(t, true);
  };

  return (
    <ThemeProvider theme={ppTheme}>
      <Box
        sx={{
          ...PROTOTYPE_PHONE_SCREEN_SX,
          bgcolor: C.bg,
          fontFamily: DAILY_PLAN_FONT_CONTENT,
        }}
      >
        {/* Decorative gradient (replaces Figma “Living Gradient” asset) */}
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
            zIndex: 10,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            bgcolor: C.overlayBar,
          }}
        >
          <PrototypeStatusBar />
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ px: 2, pb: 1 }}>
            <IconButton
              aria-label="Menu"
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
              aria-label="Chat"
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

        {/* Scrollable main — sequential dissolve + LTR streaming; auto-scrolls to newest content */}
        <Box
          ref={mainScrollRef}
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            px: 2,
            pt: 2,
            pb: 2,
            position: 'relative',
            zIndex: 1,
            scrollBehavior: 'auto',
            '& .MuiTypography-root': {
              fontFamily: DAILY_PLAN_FONT_CONTENT,
            },
          }}
        >
          <Stack spacing={2} sx={{ maxWidth: 343 }}>
            <Fade in={streamCursor >= 0} timeout={520} mountOnEnter unmountOnExit>
              <Box sx={{ mb: 0 }}>
                {streamCursor > 0 ? (
                  <Typography
                    sx={{
                      fontSize: 44,
                      fontWeight: 700,
                      lineHeight: '50px',
                      color: C.contentPrimary,
                      letterSpacing: '-0.02em',
                      mb: 2,
                    }}
                  >
                    Hey {firstName}
                  </Typography>
                ) : (
                  <StreamingTypography
                    text={`Hey ${firstName}`}
                    run
                    sx={{
                      fontSize: 44,
                      fontWeight: 700,
                      lineHeight: '50px',
                      color: C.contentPrimary,
                      letterSpacing: '-0.02em',
                      mb: 2,
                    }}
                    onDone={() => finishBlock(0)}
                  />
                )}
              </Box>
            </Fade>

            <Fade in={streamCursor >= 1} timeout={520} mountOnEnter unmountOnExit>
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 700,
                      lineHeight: '24px',
                      color: C.contentPrimary,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Spend Smarter
                  </Typography>
                  <Box
                    sx={{
                      bgcolor: C.bgTertiary,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1000,
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, fontWeight: 500, lineHeight: '14px', color: '#1b0c0b' }}>
                      Day 5 of 5
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentSecondary, mt: 0.5 }}
                >
                  Check in daily for 5 days
                </Typography>
              </Box>
            </Fade>

            <Fade in={streamCursor >= 2} timeout={520} mountOnEnter unmountOnExit>
              <Box
                sx={{
                  bgcolor: C.streakCardBg,
                  border: `1px solid ${C.streakCardBorder}`,
                  borderRadius: '16px',
                  p: 2,
                }}
              >
                {streamCursor > 2 ? (
                  <Box>
                    <Typography
                      sx={{ fontSize: 14, fontWeight: 600, lineHeight: '18px', color: C.budgetSecondary, mb: 1.5 }}
                    >
                      Launch week
                    </Typography>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" sx={{ textAlign: 'center', px: 0.5 }}>
                        {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'].map((d) => (
                          <Typography
                            key={d}
                            sx={{
                              fontSize: 14,
                              fontWeight: 500,
                              lineHeight: '16px',
                              color: C.budgetPrimary,
                              width: 36,
                            }}
                          >
                            {d}
                          </Typography>
                        ))}
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.5 }}>
                        {[0, 1, 2, 3].map((i) => (
                          <Box
                            key={i}
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '100px',
                              background: C.mintCircle,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CheckIcon sx={{ fontSize: 14, color: C.budgetPrimary }} />
                          </Box>
                        ))}
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '1000px',
                            bgcolor: C.paper,
                            border: `1px solid ${C.budgetPrimary}`,
                            flexShrink: 0,
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ) : (
                  <Box>
                    {cardPhase === 0 && (
                      <StreamingTypography
                        text="Launch week"
                        run
                        sx={{ fontSize: 14, fontWeight: 600, lineHeight: '18px', color: C.budgetSecondary, mb: 1.5 }}
                        onDone={() => {
                          setCardPhase(1);
                          finishBlock(2);
                        }}
                      />
                    )}
                    {cardPhase >= 1 && (
                      <Fade in timeout={480}>
                        <Stack spacing={1.5}>
                          <Typography
                            sx={{ fontSize: 14, fontWeight: 600, lineHeight: '18px', color: C.budgetSecondary }}
                          >
                            Launch week
                          </Typography>
                          <Stack direction="row" justifyContent="space-between" sx={{ textAlign: 'center', px: 0.5 }}>
                            {['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'].map((d) => (
                              <Typography
                                key={d}
                                sx={{
                                  fontSize: 14,
                                  fontWeight: 500,
                                  lineHeight: '16px',
                                  color: C.budgetPrimary,
                                  width: 36,
                                }}
                              >
                                {d}
                              </Typography>
                            ))}
                          </Stack>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 0.5 }}>
                            {[0, 1, 2, 3].map((i) => (
                              <Box
                                key={i}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '100px',
                                  background: C.mintCircle,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <CheckIcon sx={{ fontSize: 14, color: C.budgetPrimary }} />
                              </Box>
                            ))}
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '1000px',
                                bgcolor: C.paper,
                                border: `1px solid ${C.budgetPrimary}`,
                                flexShrink: 0,
                              }}
                            />
                          </Stack>
                        </Stack>
                      </Fade>
                    )}
                  </Box>
                )}
              </Box>
            </Fade>

            <Fade in={streamCursor >= 3} timeout={520} mountOnEnter unmountOnExit>
              <Box sx={{ mt: 1 }}>
                {streamCursor > 3 ? (
                  <Typography
                    sx={{
                      fontSize: 28,
                      fontWeight: 700,
                      lineHeight: '32px',
                      color: C.contentPrimary,
                      maxWidth: 312,
                    }}
                  >
                    Today’s plan moment
                  </Typography>
                ) : (
                  <StreamingTypography
                    text="Today’s plan moment"
                    run={streamCursor === 3}
                    sx={{
                      fontSize: 28,
                      fontWeight: 700,
                      lineHeight: '32px',
                      color: C.contentPrimary,
                      maxWidth: 312,
                    }}
                    onDone={() => finishBlock(3)}
                  />
                )}
              </Box>
            </Fade>

            <Fade in={streamCursor >= 4} timeout={520} mountOnEnter unmountOnExit>
              <Box>
                {streamCursor > 4 ? (
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 600, lineHeight: '20px', color: C.contentPrimary, maxWidth: 320 }}
                  >
                    Today’s about getting a view on your money.
                  </Typography>
                ) : (
                  <StreamingTypography
                    text="Today’s about getting a view on your money."
                    run={streamCursor === 4}
                    sx={{ fontSize: 16, fontWeight: 600, lineHeight: '20px', color: C.contentPrimary, maxWidth: 320 }}
                    onDone={() => finishBlock(4)}
                  />
                )}
              </Box>
            </Fade>

            <Fade in={streamCursor >= 5} timeout={520} mountOnEnter unmountOnExit>
              <Box>
                {streamCursor > 5 ? (
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary, maxWidth: 320 }}
                  >
                    {WELCOME_ACCOUNT_PARA}
                  </Typography>
                ) : (
                  <StreamingTypography
                    text={WELCOME_ACCOUNT_PARA}
                    run={streamCursor === 5}
                    sx={{ fontSize: 16, fontWeight: 500, lineHeight: '20px', color: C.contentPrimary, maxWidth: 320 }}
                    onDone={() => finishBlock(5)}
                  />
                )}
              </Box>
            </Fade>

            <Fade in={streamCursor >= 6} timeout={520} mountOnEnter unmountOnExit>
              <Box>
                {streamCursor > 6 ? (
                  <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: '20px', color: C.contentPrimary }}>
                    Ready?
                  </Typography>
                ) : (
                  <StreamingTypography
                    text="Ready?"
                    run={streamCursor === 6}
                    sx={{ fontSize: 16, fontWeight: 600, lineHeight: '20px', color: C.contentPrimary }}
                    onDone={() => finishBlock(6)}
                  />
                )}
              </Box>
            </Fade>
            <Box ref={sentinelRef} sx={{ height: 1 }} />
          </Stack>
        </Box>

        {/* Bottom: mini thread + quick replies + chat input + nav */}
        <Box
          sx={{
            flexShrink: 0,
            width: '100%',
            zIndex: 12,
          }}
        >
          <Box
            sx={{
              backdropFilter: 'blur(11px)',
              WebkitBackdropFilter: 'blur(11px)',
              bgcolor: 'rgba(255, 254, 251, 0.5)',
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              border: '1px solid rgba(14, 6, 5, 0.1)',
              borderBottom: 'none',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ height: 32 }} />

            <Box
              ref={threadRef}
              sx={{
                maxHeight: 132,
                overflowY: 'auto',
                px: 2,
                pb: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: 1,
                minHeight: 0,
              }}
            >
              {messages.map((m) => (
                <Box
                  key={m.id}
                  sx={{
                    alignSelf: 'flex-end',
                    maxWidth: '92%',
                    animation: `${bubbleSlideUp} 0.42s cubic-bezier(0.22, 1, 0.36, 1) both`,
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: C.userBubbleBg,
                      border: `1px solid ${C.chipBorder}`,
                      borderRadius: '18px',
                      px: 1.75,
                      py: 1.25,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 500,
                        lineHeight: '20px',
                        color: C.contentPrimary,
                        textAlign: 'left',
                      }}
                    >
                      {m.text}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Stack
              direction="row"
              flexWrap="wrap"
              gap={1}
              sx={{ px: 2, pb: 1.5, justifyContent: 'flex-end' }}
            >
              {WELCOME_QUICK_REPLIES.filter((r) => !spentWelcomeIds.has(r.id)).map((r) => (
                <ButtonBase
                  key={r.id}
                  focusRipple
                  onClick={() => {
                    setSpentWelcomeIds((prev) => new Set(prev).add(r.id));
                    appendUserLine(r.label, Boolean(r.continuesFlow));
                  }}
                  sx={{
                    borderTopLeftRadius: 28,
                    borderTopRightRadius: 28,
                    borderBottomLeftRadius: 28,
                    borderBottomRightRadius: 0,
                    border: `1px solid ${C.borderOpaque}`,
                    bgcolor: C.bg,
                    height: 44,
                    px: 2,
                    py: 0,
                    justifyContent: 'center',
                    textAlign: 'left',
                    '&:hover': { bgcolor: C.bgTertiary },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 500,
                      lineHeight: '20px',
                      color: C.contentSecondary,
                      fontFamily: DAILY_PLAN_FONT_CONTENT,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.label}
                  </Typography>
                </ButtonBase>
              ))}
            </Stack>

            <Stack spacing={2} sx={{ pl: 1, pr: 2, pb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  aria-label="Boost"
                  sx={{ width: 40, height: 40, borderRadius: 1000, flexShrink: 0 }}
                >
                  <BoltOutlinedIcon sx={{ color: C.contentPrimary, fontSize: 24 }} />
                </IconButton>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: C.paper,
                  border: `1px solid ${C.borderOpaque}`,
                  borderRadius: '28px',
                  pl: 3,
                  pr: 0.75,
                  py: 0.75,
                  minHeight: 48,
                  }}
                >
                  <InputBase
                    fullWidth
                    placeholder="Ask me anything..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        submitComposer();
                      }
                    }}
                    multiline
                    maxRows={3}
                    sx={{
                      fontFamily: DAILY_PLAN_FONT_CONTENT,
                      fontSize: 14,
                      fontWeight: 500,
                      lineHeight: '20px',
                      color: C.contentPrimary,
                      '& .MuiInputBase-input::placeholder': {
                        color: C.contentTertiary,
                        opacity: 1,
                      },
                    }}
                  />
                  <IconButton
                    aria-label="Send"
                    onClick={submitComposer}
                    disabled={!draft.trim()}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: C.accentMid,
                      color: '#fff',
                      borderRadius: 1000,
                      '&:hover': { bgcolor: '#3a1a17' },
                      '&.Mui-disabled': { bgcolor: 'rgba(71, 32, 28, 0.35)', color: '#fff' },
                    }}
                  >
                    <GraphicEqIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              </Stack>
            </Stack>

            <PrototypeAppTabBar active="ask" sx={{ borderTop: '1px solid rgba(14, 6, 5, 0.08)' }} />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
