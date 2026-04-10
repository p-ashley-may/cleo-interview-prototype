import type { PlanGoal } from 'Modules/prototypes/financialInterview/planEngine';

/** Visual row on Plan → Progress (Figma 5725:27255). */
export type PlanProgressRowIcon = 'debt' | 'shield' | 'globe';

export type PlanProgressRow = {
  id: string;
  title: string;
  subtitle: string;
  percent: number;
  amountLabel: string;
  icon: PlanProgressRowIcon;
  focus: boolean;
};

/** Match Figma sample percentages for the first three goals when present. */
const FIGMA_PCTS = [26, 37, 14];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pickSubtitle(g: PlanGoal): string {
  const first = g.subSteps[0] ?? g.why;
  if (first.length <= 46) return first;
  return `${first.slice(0, 43)}…`;
}

function pickAmount(goal: PlanGoal, i: number): string {
  const base = 280 + (hash(goal.id) % 900) + i * 120;
  return `$${base.toLocaleString('en-US')}`;
}

function pickIcon(g: PlanGoal, i: number): PlanProgressRowIcon {
  const t = g.title.toLowerCase();
  if (/debt|card|apr|interest|pay down|visa|chase|loan/.test(t)) return 'debt';
  if (/emergency|safety|buffer|cushion|net|stab|cash flow/.test(t)) return 'shield';
  if (/matter|milestone|goal|save|trip|japan|fund|gradual/.test(t)) return 'globe';
  return (['debt', 'shield', 'globe'] as const)[i % 3];
}

export function planGoalsToProgressRows(goals: PlanGoal[]): PlanProgressRow[] {
  return goals.slice(0, 3).map((g, i) => ({
    id: g.id,
    title: g.title,
    subtitle: pickSubtitle(g),
    percent: FIGMA_PCTS[i] ?? 12 + (hash(g.id) % 35),
    amountLabel: pickAmount(g, i),
    icon: pickIcon(g, i),
    focus: g.badge === 'first',
  }));
}
