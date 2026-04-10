import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider, keyframes } from '@mui/material/styles';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  buildFinancialPlan,
  inferSignalsFromLink,
  type LinkedSignals,
  type PlanResult,
} from 'Modules/prototypes/financialInterview/planEngine';
import { CapturedGoalsScreen } from 'Modules/prototypes/financialInterview/CapturedGoalsScreen';
import { BankConnectPlaidScreen } from 'Modules/prototypes/financialInterview/BankConnectPlaidScreen';
import { DailyPlanWelcomeScreen } from 'Modules/prototypes/financialInterview/DailyPlanWelcomeScreen';
import { InterviewTypeModeView } from 'Modules/prototypes/financialInterview/InterviewTypeModeView';
import { MemoryGemsPlaybackScreen } from 'Modules/prototypes/financialInterview/MemoryGemsPlaybackScreen';
import { PlanTabHandoffScreen } from 'Modules/prototypes/financialInterview/PlanTabHandoffScreen';
import { planGoalsToProgressRows } from 'Modules/prototypes/financialInterview/planProgressMapping';
import {
  PROTOTYPE_PHONE_SCREEN_SX,
  PrototypeDeviceFrame,
} from 'Modules/prototypes/financialInterview/PrototypeDeviceFrame';
import { SpeechInterviewView } from 'Modules/prototypes/financialInterview/SpeechInterviewView';
import { DAILY_PLAN_FONT_CONTENT } from 'Modules/prototypes/financialInterview/dailyPlanTypography';
import {
  buildTapHintMessage,
  extractGemsFromMessage,
  INTERVIEW_TURNS,
  LETS_DO_IT_REPLY,
  POST_LINK_ASSISTANT_PARAGRAPHS,
  POST_LINK_WANT_TEXT,
  POST_INTERVIEW_DEBRIEF,
  PROTOTYPE_DEMO_FIRST_NAME,
  type PrototypeInterviewStage,
  SCRIPT_GOAL_GEMS,
  SCRIPT_GOAL_NOTES_ROWS,
  SCRIPT_PLAYBACK_ROWS,
  SKIP_BANK_LINK_INTERVIEW_INTRO,
  VOICE_INTERVIEW_START,
  type MemoryGem,
} from 'Modules/prototypes/financialInterview/interviewScript';

function isLetsDoItReply(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/['']/g, "'");
  return t === "let's do it" || t === 'lets do it';
}

type Step =
  | 'welcome'
  | 'bank_link'
  | 'interview'
  | 'review_goals'
  | 'gems_playback'
  | 'building'
  | 'plan'
  | 'calendar';

const floatGems = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 1; }
  40% { transform: translateY(-28px) scale(1.06); opacity: 0.95; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
`;

const calmTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3d5a6c' },
    secondary: { main: '#c17f6a' },
    background: { default: '#f4f0eb', paper: '#fffcf8' },
  },
  typography: {
    fontFamily: DAILY_PLAN_FONT_CONTENT,
    h5: { fontWeight: 600, letterSpacing: '-0.02em' },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 14 },
});

function GemChip({
  gem,
  onDelete,
  onEdit,
}: {
  gem: MemoryGem;
  onDelete: (id: string) => void;
  onEdit: (gem: MemoryGem) => void;
}) {
  return (
    <Chip
      label={gem.label}
      onDelete={() => onDelete(gem.id)}
      onClick={() => onEdit(gem)}
      sx={{
        background: 'linear-gradient(135deg, #e8f0f4 0%, #f5e8e4 100%)',
        border: '1px solid rgba(61, 90, 108, 0.15)',
        fontWeight: 500,
        fontFamily: DAILY_PLAN_FONT_CONTENT,
        '& .MuiChip-label': { px: 1.25 },
      }}
    />
  );
}

const FinancialInterviewPrototype: React.FC = () => {
  const [step, setStep] = useState<Step>('welcome');
  const [linked, setLinked] = useState(false);
  const [signals, setSignals] = useState<LinkedSignals>(() => ({
    linked: false,
    incomeCadence: 'monthly',
    billStress: 'low',
    savingsTrend: 'flat',
    debtSignal: 'none',
    cashFlowFragility: 'stable',
  }));
  const [gems, setGems] = useState<MemoryGem[]>([]);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [turnIndex, setTurnIndex] = useState(-1);
  const [interviewStage, setInterviewStage] = useState<PrototypeInterviewStage>('post_link_intro');
  const [input, setInput] = useState('');
  const [voiceOn, setVoiceOn] = useState(false);
  /** Tooltip callout — shown only after "Let's do it" is tapped, before the user starts voice mode. */
  const [voiceHintOpen, setVoiceHintOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [editGem, setEditGem] = useState<MemoryGem | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [plan, setPlan] = useState<PlanResult | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarBooked, setCalendarBooked] = useState(false);
  const [showWhyOrder, setShowWhyOrder] = useState(true);
  const [bankConnecting, setBankConnecting] = useState(false);
  const [goalInclusion, setGoalInclusion] = useState<Record<string, boolean>>({});
  const [goalNotesDraft, setGoalNotesDraft] = useState('');
  const [spentTypingQuickReplies, setSpentTypingQuickReplies] = useState<string[]>([]);
  const submitUserMessageRef = useRef<(text: string) => void>(() => undefined);

  useEffect(() => {
    setSpentTypingQuickReplies([]);
  }, [turnIndex]);

  const appendGems = useCallback((text: string) => {
    const newOnes = extractGemsFromMessage(text, gems);
    if (newOnes.length) setGems((g) => [...g, ...newOnes]);
  }, [gems]);

  /** Post–bank-link copy from Figma Cursor `12-11835` (questions start after “Let’s do it” + tap hint). */
  const startInterview = useCallback((accountLinked: boolean) => {
    setStep('interview');
    setVoiceOn(false);
    setVoiceHintOpen(true);
    if (accountLinked) {
      setInterviewStage('post_link_intro');
      setTurnIndex(-1);
      setMessages(
        POST_LINK_ASSISTANT_PARAGRAPHS.map((text) => ({
          role: 'assistant' as const,
          text,
        })),
      );
    } else {
      setInterviewStage('questions');
      setTurnIndex(0);
      setMessages([
        { role: 'assistant', text: SKIP_BANK_LINK_INTERVIEW_INTRO },
        { role: 'assistant', text: VOICE_INTERVIEW_START },
        { role: 'assistant', text: INTERVIEW_TURNS[0].assistant },
      ]);
    }
  }, []);

  const beginQuestionsAfterTapHint = useCallback((userLine?: string) => {
    setMessages((m) => [
      ...m,
      ...(userLine ? [{ role: 'user' as const, text: userLine }] : []),
      { role: 'assistant', text: VOICE_INTERVIEW_START },
      { role: 'assistant', text: INTERVIEW_TURNS[0].assistant },
    ]);
    setInterviewStage('questions');
    setTurnIndex(0);
  }, []);

  const handleStartVoiceMode = useCallback(() => {
    setVoiceHintOpen(false);
    if (interviewStage === 'post_link_intro') {
      setMessages((m) => [
        ...m,
        { role: 'user', text: LETS_DO_IT_REPLY },
        { role: 'assistant', text: buildTapHintMessage(PROTOTYPE_DEMO_FIRST_NAME) },
      ]);
      setInterviewStage('tap_hint');
      setVoiceOn(true);
      return;
    }
    if (interviewStage === 'tap_hint') {
      beginQuestionsAfterTapHint();
      setVoiceOn(true);
      return;
    }
    setVoiceOn(true);
  }, [interviewStage, beginQuestionsAfterTapHint]);

  const advanceTurn = useCallback(() => {
    setTurnIndex((i) => {
      const next = i + 1;
      if (next < INTERVIEW_TURNS.length) {
        setMessages((m) => [...m, { role: 'assistant', text: INTERVIEW_TURNS[next].assistant }]);
      }
      return next;
    });
  }, []);

  const finishInterviewScript = useCallback(() => {
    const scriptGems = SCRIPT_GOAL_GEMS.map((g) => ({ ...g }));
    setGems(scriptGems);
    setGoalInclusion(Object.fromEntries(scriptGems.map((g) => [g.id, true])));
    setStep('review_goals');
  }, []);

  const submitUserMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (interviewStage === 'post_link_intro') {
        if (!isLetsDoItReply(trimmed)) return;
        setMessages((m) => [
          ...m,
          { role: 'user', text: LETS_DO_IT_REPLY },
          { role: 'assistant', text: buildTapHintMessage(PROTOTYPE_DEMO_FIRST_NAME) },
        ]);
        setInterviewStage('tap_hint');
        setVoiceHintOpen(true);
        return;
      }
      if (interviewStage === 'tap_hint') {
        if (!trimmed) return;
        beginQuestionsAfterTapHint(trimmed);
        return;
      }
      if (!trimmed) return;
      setMessages((m) => [...m, { role: 'user', text: trimmed }]);
      appendGems(trimmed);
      if (turnIndex < INTERVIEW_TURNS.length - 1) {
        window.setTimeout(() => advanceTurn(), 400);
      } else {
        window.setTimeout(() => finishInterviewScript(), 600);
      }
    },
    [
      interviewStage,
      appendGems,
      advanceTurn,
      turnIndex,
      beginQuestionsAfterTapHint,
      finishInterviewScript,
    ],
  );

  useEffect(() => {
    submitUserMessageRef.current = submitUserMessage;
  }, [submitUserMessage]);

  useEffect(() => {
    if (step !== 'building') return undefined;
    const selectedLabels = gems.filter((g) => goalInclusion[g.id] !== false).map((g) => g.label);
    const t = window.setTimeout(() => {
      const nextPlan = buildFinancialPlan(signals, selectedLabels);
      setPlan(nextPlan);
      setStep('plan');
    }, 2800);
    return () => window.clearTimeout(t);
  }, [step, signals, gems, goalInclusion]);

  const simulateVoice = useCallback(() => {
    if (interviewStage === 'post_link_intro') {
      window.setTimeout(() => {
        submitUserMessage(LETS_DO_IT_REPLY);
        setInput('');
      }, 280);
      return;
    }
    if (interviewStage === 'tap_hint') {
      window.setTimeout(() => {
        beginQuestionsAfterTapHint();
        setInput('');
      }, 280);
      window.setTimeout(() => {
        const pick = INTERVIEW_TURNS[0].suggestedReplies[0];
        submitUserMessageRef.current(pick);
        setInput('');
      }, 900);
      return;
    }
    if (turnIndex >= INTERVIEW_TURNS.length) return;
    const suggestions = INTERVIEW_TURNS[turnIndex].suggestedReplies;
    const pick = suggestions[Math.floor(Math.random() * suggestions.length)];
    window.setTimeout(() => {
      submitUserMessage(pick);
      setInput('');
    }, 280);
  }, [interviewStage, turnIndex, submitUserMessage, beginQuestionsAfterTapHint]);

  const handleLinkBank = () => {
    setBankConnecting(true);
    setLinked(true);
    setSignals(inferSignalsFromLink());
    window.setTimeout(() => {
      setBankConnecting(false);
      startInterview(true);
    }, 1400);
  };

  const handleSkipLink = () => {
    setLinked(false);
    setBankConnecting(false);
    setSignals({
      linked: false,
      incomeCadence: 'monthly',
      billStress: 'medium',
      savingsTrend: 'flat',
      debtSignal: 'none',
      cashFlowFragility: 'stable',
    });
    startInterview(false);
  };

  const openEdit = (g: MemoryGem) => {
    setEditGem(g);
    setEditLabel(g.label);
  };

  const saveEdit = () => {
    if (!editGem) return;
    const label = editLabel.trim();
    if (label) setGems((gs) => gs.map((x) => (x.id === editGem.id ? { ...x, label } : x)));
    setEditGem(null);
  };

  /** Insight lines shown in the linked-account callout (prototype inference). */
  const inferredSummary = useMemo(() => {
    if (!linked) return null;
    return [
      'Biweekly income with stable pattern',
      'Recurring bills moderate fixed costs',
      'Savings balance has upward trend',
      'Credit card shows high-interest stress',
    ];
  }, [linked]);

  const includedGems = useMemo(
    () => gems.filter((g) => goalInclusion[g.id] !== false),
    [gems, goalInclusion],
  );

  const playbackRows = useMemo(() => SCRIPT_PLAYBACK_ROWS, []);

  const progressRows = useMemo(
    () => (plan ? planGoalsToProgressRows(plan.goals) : []),
    [plan],
  );

  const typeModeLayout = useMemo(() => {
    const last = messages[messages.length - 1];
    if (interviewStage === 'post_link_intro') {
      const showChip = last?.role === 'assistant' && last.text === POST_LINK_WANT_TEXT;
      return {
        quickReplies: showChip ? [LETS_DO_IT_REPLY] : [],
        interviewActive: false,
        allowQuickRepliesWhenInputLocked: showChip,
      };
    }
    if (interviewStage === 'tap_hint') {
      return { quickReplies: [], interviewActive: true, allowQuickRepliesWhenInputLocked: false };
    }
    const awaiting = turnIndex < INTERVIEW_TURNS.length && last?.role === 'assistant';
    return {
      quickReplies: awaiting ? INTERVIEW_TURNS[turnIndex].suggestedReplies : [],
      interviewActive: awaiting,
      allowQuickRepliesWhenInputLocked: false,
    };
  }, [messages, turnIndex, interviewStage]);

  const resetPrototype = useCallback(() => {
    setStep('welcome');
    setGems([]);
    setMessages([]);
    setTurnIndex(-1);
    setInterviewStage('post_link_intro');
    setPlan(null);
    setInput('');
    setCalendarBooked(false);
    setLinked(false);
    setBankConnecting(false);
    setGoalInclusion({});
    setGoalNotesDraft('');
    setVoiceOn(false);
    setVoiceHintOpen(true);
    setSignals({
      linked: false,
      incomeCadence: 'monthly',
      billStress: 'low',
      savingsTrend: 'flat',
      debtSignal: 'none',
      cashFlowFragility: 'stable',
    });
  }, []);

  return (
    <ThemeProvider theme={calmTheme}>
      <CssBaseline />
      <link href="https://fonts.cdnfonts.com/css/pp-neue-montreal" rel="stylesheet" />
      <PrototypeDeviceFrame>
        {step === 'bank_link' ? (
          <Box sx={{ ...PROTOTYPE_PHONE_SCREEN_SX, position: 'relative', bgcolor: 'transparent' }}>
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
              <DailyPlanWelcomeScreen onContinue={() => undefined} />
            </Box>
            <BankConnectPlaidScreen
              overlay
              connecting={bankConnecting}
              onContinue={handleLinkBank}
              onClose={handleSkipLink}
            />
          </Box>
        ) : step === 'welcome' ? (
          <DailyPlanWelcomeScreen onContinue={() => setStep('bank_link')} />
        ) : step === 'review_goals' ? (
          <CapturedGoalsScreen
            rows={SCRIPT_GOAL_NOTES_ROWS}
            includedById={goalInclusion}
            onToggle={(gemId, included) => setGoalInclusion((p) => ({ ...p, [gemId]: included }))}
            scriptDebrief={POST_INTERVIEW_DEBRIEF}
            notesDateLabel="Thu 6 April"
            onContinue={() => {
              setGoalNotesDraft('');
              if (includedGems.length > 0) {
                setStep('gems_playback');
              } else {
                setStep('building');
              }
            }}
            bottomDraft={goalNotesDraft}
            onBottomDraftChange={setGoalNotesDraft}
          />
        ) : step === 'gems_playback' ? (
          <MemoryGemsPlaybackScreen
            key={includedGems.map((g) => g.id).join('-')}
            items={playbackRows}
            onGoToPlan={() => setStep('building')}
          />
        ) : step === 'plan' && plan ? (
          <PlanTabHandoffScreen
            rows={progressRows}
            onStayOnTrack={() => undefined}
            scrollFooter={
              <Stack spacing={2} sx={{ mt: 3, pb: 2 }}>
                <Card variant="outlined" sx={{ bgcolor: 'rgba(255, 252, 248, 0.85)', borderColor: 'divider' }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">Why this order?</Typography>
                      <Button size="small" onClick={() => setShowWhyOrder((s) => !s)}>
                        {showWhyOrder ? 'Hide' : 'Show'}
                      </Button>
                    </Stack>
                    <Collapse in={showWhyOrder}>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {plan.sequencingNote}
                      </Typography>
                    </Collapse>
                  </CardContent>
                </Card>
                <Typography variant="caption" color="text.secondary">
                  Your themes (demo)
                </Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1}>
                  {includedGems.map((g) => (
                    <GemChip
                      key={g.id}
                      gem={g}
                      onDelete={(id) => setGems((gs) => gs.filter((x) => x.id !== id))}
                      onEdit={openEdit}
                    />
                  ))}
                </Stack>
                <Stack spacing={1}>
                  <Button variant="outlined" startIcon={<EditIcon />} onClick={resetPrototype}>
                    Restart prototype
                  </Button>
                  <Button variant="text" onClick={() => setCalendarOpen(true)}>
                    Schedule a deeper chat (simulated)
                  </Button>
                  {calendarBooked && (
                    <Typography variant="caption" color="text.secondary">
                      You’re on the list—check your email (simulated).
                    </Typography>
                  )}
                </Stack>
              </Stack>
            }
          />
        ) : step === 'interview' && voiceOn ? (
          <SpeechInterviewView
            messages={messages}
            input={input}
            onInputChange={setInput}
            onSend={() => {
              submitUserMessage(input);
              setInput('');
            }}
            onClearInput={() => setInput('')}
            setListening={setListening}
            listening={listening}
            onVoiceTranscriptFinal={(text) => {
              const t = text.trim();
              if (!t) return;
              submitUserMessage(t);
              setInput('');
            }}
            onMicDemoFallback={simulateVoice}
            gems={gems}
            onEditGem={openEdit}
            turnIndex={turnIndex}
            quickReplies={
              interviewStage === 'post_link_intro'
                ? [LETS_DO_IT_REPLY]
                : interviewStage === 'tap_hint'
                  ? []
                  : turnIndex < INTERVIEW_TURNS.length
                    ? INTERVIEW_TURNS[turnIndex].suggestedReplies
                    : []
            }
            onQuickReply={(text) => submitUserMessage(text)}
            interviewComplete={interviewStage === 'questions' && turnIndex >= INTERVIEW_TURNS.length}
            onSwitchToType={() => {
              setVoiceOn(false);
              setVoiceHintOpen(false);
            }}
            orbHeadlineOverride={
              interviewStage === 'post_link_intro'
                ? POST_LINK_WANT_TEXT
                : interviewStage === 'tap_hint'
                  ? buildTapHintMessage(PROTOTYPE_DEMO_FIRST_NAME)
                  : null
            }
          />
        ) : step === 'interview' && !voiceOn ? (
          <InterviewTypeModeView
            transcriptMessages={messages}
            interviewQuestionTexts={INTERVIEW_TURNS.map((t) => t.assistant)}
            quickReplies={typeModeLayout.quickReplies}
            spentQuickReplyIds={spentTypingQuickReplies}
            onQuickReply={(r) => {
              setSpentTypingQuickReplies((s) => [...s, r]);
              submitUserMessage(r);
            }}
            linked={linked}
            inferredSummary={inferredSummary}
            voiceHintOpen={voiceHintOpen}
            onStartVoice={handleStartVoiceMode}
            input={input}
            onInputChange={setInput}
            onSend={() => {
              submitUserMessage(input);
              setInput('');
            }}
            interviewActive={typeModeLayout.interviewActive}
            allowQuickRepliesWhenInputLocked={typeModeLayout.allowQuickRepliesWhenInputLocked}
          />
        ) : step === 'building' ? (
          <Box
            sx={{
              ...PROTOTYPE_PHONE_SCREEN_SX,
              bgcolor: '#f8f6f2',
              fontFamily: DAILY_PLAN_FONT_CONTENT,
              px: 2,
            }}
          >
            <Stack alignItems="center" spacing={3} sx={{ py: 4, textAlign: 'center', flex: 1, justifyContent: 'center' }}>
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: '#47201c' }}>Building your financial profile…</Typography>
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#5b3935', maxWidth: 320, lineHeight: 1.55 }}>
                Turning what you shared into a gentle, ordered plan.
              </Typography>
              <LinearProgress
                sx={{
                  width: '100%',
                  maxWidth: 320,
                  borderRadius: 100,
                  height: 8,
                  bgcolor: 'rgba(71, 32, 28, 0.1)',
                  '& .MuiLinearProgress-bar': { borderRadius: 100, bgcolor: '#47201c' },
                }}
              />
              <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} justifyContent="center">
                {includedGems.map((g) => (
                  <Chip
                    key={g.id}
                    label={g.label}
                    sx={{
                      fontFamily: DAILY_PLAN_FONT_CONTENT,
                      animation: `${floatGems} 2s ease-in-out infinite`,
                      bgcolor: 'rgba(255, 254, 251, 0.65)',
                      border: '1px solid rgba(14, 6, 5, 0.1)',
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Box>
        ) : null}
      </PrototypeDeviceFrame>

      <Dialog open={!!editGem} onClose={() => setEditGem(null)} fullWidth maxWidth="xs">
        <DialogTitle>Edit memory gem</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Label" fullWidth value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditGem(null)}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={calendarOpen} onClose={() => setCalendarOpen(false)}>
        <DialogTitle>Calendar access</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This prototype simulates the system calendar prompt. In a real app, you’d see OS permissions and a
            prefilled event titled “Financial profile discussion” with your memory gems in the description.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalendarOpen(false)}>Not now</Button>
          <Button
            variant="contained"
            onClick={() => {
              setCalendarBooked(true);
              setCalendarOpen(false);
            }}
          >
            Simulate grant + create event
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default FinancialInterviewPrototype;
