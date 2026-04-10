import type { GoalNotesIcon, GoalNotesRow, PlaybackGemRow } from 'Modules/prototypes/financialInterview/goalNotesMapping';

export type InterviewTurn = {
  assistant: string;
  userPlaceholder?: string;
  suggestedReplies: string[];
};

/** Figma Cursor flow · voice questions `12-11957` / `12-12018`. */
export const INTERVIEW_TURNS: InterviewTurn[] = [
  {
    assistant: 'How do you feel about your money right now?',
    suggestedReplies: [
      'Honestly a bit anxious—bills feel tight some months.',
      'Mostly okay; I just want a clearer picture.',
      'Pretty calm, but I know I should plan more.',
    ],
  },
  {
    assistant: 'What outgoings do you have upcoming that I should know about?',
    suggestedReplies: [
      'Rent and subscriptions; car insurance renews in July.',
      'A few big one-offs—wedding gift, dentist, travel deposit.',
      'Nothing huge—just the usual monthly bills.',
    ],
  },
  {
    assistant: 'Do you have a money goal in mind this year?',
    suggestedReplies: [
      'Build a small emergency cushion—three months if I can.',
      'Pay down the credit card and still save a little.',
      'Save for a trip without leaning on the card.',
    ],
  },
];

export type MemoryGem = { id: string; label: string };

let gemId = 0;
const nextId = () => `gem-${++gemId}`;

/** Prototype stages after bank link — Figma `12-11835` → `12-11957`. */
export type PrototypeInterviewStage = 'post_link_intro' | 'tap_hint' | 'questions';

export const PROTOTYPE_DEMO_FIRST_NAME = 'Kyle';

/** Figma `12-11781` — welcome headline (shared with Daily Plan welcome stream). */
export const WELCOME_PLAN_HEADLINE = 'Today’s plan moment';

/** Figma `12-11835` — post-link assistant script before “Let’s do it”. */
export const POST_LINK_WANT_TEXT = 'Want me to show you how?';

export const LETS_DO_IT_REPLY = "Let's do it";

export const POST_LINK_ASSISTANT_PARAGRAPHS: readonly string[] = [
  "That's all done. I have a clearer sense of your money. Next up, the plan is to spend a few minutes guiding you through some questions about your money.",
  'No wrong answers, no complex sums, just answer honestly and tell me how you feel about your money. You can type your response, but the best way is to enable voice mode.',
  POST_LINK_WANT_TEXT,
];

/** Skip bank link — jump straight into voice questions. */
export const SKIP_BANK_LINK_INTERVIEW_INTRO =
  "Let's spend a few minutes on questions about your money—no wrong answers, just your honest take. Voice works best, or you can type.";

export function buildTapHintMessage(firstName: string): string {
  return `Just tap there and we can start, ${firstName} ⬇️`;
}

/** Figma `12-11957` — immediately before first interview question. */
export const VOICE_INTERVIEW_START = "Okay, let's get started!";

/** Figma `12-12146` — shown above Goal Notes (`12-12203`). */
export const POST_INTERVIEW_DEBRIEF = {
  headline: 'Great responses.',
  bodies: [
    "I appreciate you being so open.\n\nWhat you're describing is common these days. Saying that doesn't help, but hopefully it grounds things in the real world.",
    "I can't control gas and food prices, but I can help you set and meet your money goals.",
  ] as const,
  recapLead: "Let's recap what you shared:",
} as const;

/** Figma `12-12203` — Goal Notes rows (gem ids stable for toggles). */
export const SCRIPT_GOAL_NOTES_ROWS: GoalNotesRow[] = [
  {
    gemId: 'script-gn-1',
    title: 'Feeling stressed about money right now',
    subtitle: 'Financial feelings',
    icon: 'check' as GoalNotesIcon,
  },
  {
    gemId: 'script-gn-2',
    title: 'Dream trip to Japan',
    subtitle: 'Financial feelings',
    icon: 'globe',
  },
  {
    gemId: 'script-gn-3',
    title: 'Saving up for family birthday holiday',
    subtitle: 'Financial feelings',
    icon: 'globe',
  },
  {
    gemId: 'script-gn-4',
    title: 'Savings up for grabs',
    subtitle: 'How you win your plan',
    icon: 'shield',
  },
  {
    gemId: 'script-gn-5',
    title: 'Look into the future',
    subtitle: 'How you win your plan',
    icon: 'shield',
  },
  {
    gemId: 'script-gn-6',
    title: 'Avoiding unwanted surprises',
    subtitle: 'How you win your plan',
    icon: 'check',
  },
];

export const SCRIPT_GOAL_GEMS: MemoryGem[] = SCRIPT_GOAL_NOTES_ROWS.map((r) => ({
  id: r.gemId,
  label: r.title,
}));

/** Figma `12-12321` — recap playback before Plan. */
export const SCRIPT_PLAYBACK_ROWS: PlaybackGemRow[] = [
  { gemId: 'script-pb-1', title: 'Dream trip to Japan', tag: 'Travel fund', icon: 'globe' },
  { gemId: 'script-pb-2', title: 'Building a safety buffer', tag: 'Financial safety', icon: 'shield' },
  { gemId: 'script-pb-3', title: 'Clearing your credit debt', tag: 'Reduce debt', icon: 'dollarDown' },
];

/** Lightweight keyword → gem labels (prototype stand-in for NLU). */
export function extractGemsFromMessage(text: string, existing: MemoryGem[]): MemoryGem[] {
  const lower = text.toLowerCase();
  const additions: MemoryGem[] = [];
  const labels = new Set(existing.map((g) => g.label));

  const tryAdd = (cond: boolean, label: string) => {
    if (cond && !labels.has(label)) {
      labels.add(label);
      additions.push({ id: nextId(), label });
    }
  };

  tryAdd(/japan|travel|trip|vacation|abroad|flight|hotel/.test(lower), 'Travel dream');
  tryAdd(/baby|nursery|pregnant|maternity|paternity/.test(lower), 'Family / nursery');
  tryAdd(/car|auto|vehicle|used car/.test(lower), 'Car savings');
  tryAdd(/house|home|mortgage|down payment|closing/.test(lower), 'Home buying');
  tryAdd(/renovat|repair|improvement|kitchen|bathroom/.test(lower), 'Home improvements');
  tryAdd(/birthday|wedding|party|celebration/.test(lower), 'Upcoming celebration');
  tryAdd(/credit card|debt|apr|interest|balance|pay down/.test(lower), 'Debt stress');
  tryAdd(/irregular|freelance|variable|gig/.test(lower), 'Variable income');
  tryAdd(/save|savings|cushion|emergency|buffer|security/.test(lower), 'More security');
  tryAdd(/lease|move|moving|rent/.test(lower), 'Housing / move');
  tryAdd(/parent|caregiv|medical|copay/.test(lower), 'Family care costs');
  tryAdd(/partner|joint|split bills/.test(lower), 'Shared money dynamics');
  tryAdd(/anxious|stressed|overwhelmed|worried|nervous|scared/.test(lower), 'Money stress (feelings)');
  tryAdd(/calm|fine|okay|relaxed|comfortable|good about/.test(lower), 'Feeling stable');
  tryAdd(/outgoing|subscription|renew|due soon|payment due|upcoming bill/.test(lower), 'Upcoming outgoings');
  tryAdd(/insurance|dentist|vet|tuition|tax bill/.test(lower), 'Planned expenses');
  tryAdd(/goal|this year|next year|hoping to|want to save|aiming/.test(lower), 'Money goal');

  return additions;
}
