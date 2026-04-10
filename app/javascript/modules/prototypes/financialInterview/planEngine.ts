/**
 * Rule-based plan sequencing for the financial interview prototype.
 * Mirrors: stabilize cash flow → starter safety net → high-interest debt → life goals.
 */

export type LinkedSignals = {
  linked: boolean;
  incomeCadence: 'weekly' | 'biweekly' | 'monthly' | 'irregular';
  billStress: 'low' | 'medium' | 'high';
  savingsTrend: 'building' | 'flat' | 'drawing';
  debtSignal: 'none' | 'manageable' | 'high_interest_stress';
  cashFlowFragility: 'stable' | 'tight' | 'fragile';
};

export type PlanGoal = {
  id: string;
  title: string;
  why: string;
  badge: 'first' | 'next' | 'later';
  subSteps: string[];
};

export type PlanResult = {
  goals: PlanGoal[];
  sequencingNote: string;
};

const defaultSignals = (): LinkedSignals => ({
  linked: false,
  incomeCadence: 'monthly',
  billStress: 'medium',
  savingsTrend: 'flat',
  debtSignal: 'none',
  cashFlowFragility: 'stable',
});

/** Mock “inference” after a successful Plaid-style link (prototype only). */
export function inferSignalsFromLink(): LinkedSignals {
  return {
    linked: true,
    incomeCadence: 'biweekly',
    billStress: 'medium',
    savingsTrend: 'building',
    debtSignal: 'high_interest_stress',
    cashFlowFragility: 'tight',
  };
}

export function buildFinancialPlan(
  signals: LinkedSignals,
  gemLabels: string[],
): PlanResult {
  const s = signals.linked ? signals : defaultSignals();

  const lifeGoalHints = gemLabels.filter(Boolean);
  const hasLifeGoals = lifeGoalHints.length > 0;

  const goals: PlanGoal[] = [];

  const needsStability =
    s.cashFlowFragility === 'fragile' ||
    s.cashFlowFragility === 'tight' ||
    s.incomeCadence === 'irregular' ||
    s.billStress === 'high';

  if (needsStability) {
    goals.push({
      id: 'cash-flow',
      title: 'Stabilize cash flow',
      why:
        s.linked && s.cashFlowFragility !== 'stable'
          ? 'Your linked accounts suggest month-to-month tightness—goals stick better when the basics feel steady.'
          : 'Getting bill dates and income timing aligned first makes everything else easier to follow.',
      badge: 'first',
      subSteps: [
        'List must-pay bills and their dates next to your pay schedule.',
        'Move one bill date or set a small “buffer” transfer after each paycheck.',
        'Pause new optional subscriptions until you have one calm pay cycle.',
      ],
    });
  }

  const debtUrgent = s.debtSignal === 'high_interest_stress';
  const lowBuffer = s.savingsTrend !== 'building' && s.linked;

  if (!debtUrgent || !needsStability) {
    goals.push({
      id: 'starter-emergency',
      title: 'Build a starter safety net',
      why: debtUrgent
        ? 'Even while tackling debt, a small cushion helps you avoid new high-interest charges when life happens.'
        : 'A modest buffer turns surprises into annoyances—not crises.',
      badge: goals.length ? 'next' : 'first',
      subSteps: [
        'Aim for one month of must-pay expenses, or a smaller milestone if cash is tight.',
        'Keep this money separate from everyday spending.',
        'Name the account something encouraging (e.g. “Calm fund”).',
      ],
    });
  }

  if (debtUrgent) {
    goals.push({
      id: 'debt',
      title: 'Pay down high-interest debt',
      why:
        'High-interest balances often cost more per month than you’d earn on savings—so paydown usually comes before bigger dreams.',
      badge: goals.length ? 'next' : 'first',
      subSteps: [
        'Pick one card or loan to focus on first (smallest balance or highest APR).',
        'Pay more than the minimum on that focus account when cash flow allows.',
        'Avoid adding new charges on that account while you’re in paydown mode.',
      ],
    });
  }

  if (hasLifeGoals) {
    const preview = lifeGoalHints.slice(0, 3).join(' · ');
    goals.push({
      id: 'life-goals',
      title: 'Fund what matters to you—gradually',
      why: `You mentioned ${preview}. We’ll stagger these so progress doesn’t come at the expense of stability.`,
      badge: goals.length ? 'later' : 'first',
      subSteps: [
        `Define one “next step” for your top theme (not the whole price tag yet).`,
        'Automate a small, sustainable transfer after bills and buffer contributions.',
        'Revisit amounts after 4–6 weeks—small consistency beats a perfect spreadsheet.',
      ],
    });
  } else {
    goals.push({
      id: 'life-goals-generic',
      title: 'Choose a meaningful milestone',
      why: 'Once cash flow and debt are calmer, naming one concrete goal makes saving feel real.',
      badge: goals.length ? 'later' : 'first',
      subSteps: [
        'Pick one horizon: 3 months, 1 year, or 3 years.',
        'Give it a name you’d actually say out loud.',
        'Set a starter monthly amount—even if it’s small.',
      ],
    });
  }

  const badgeOrder = { first: 0, next: 1, later: 2 };
  goals.sort((a, b) => badgeOrder[a.badge] - badgeOrder[b.badge]);

  const sequencingNote =
    'We put stability and costly debt ahead of bigger dreams so your progress is less likely to get wiped out by surprises—that’s care, not a lecture.';

  return { goals, sequencingNote };
}
