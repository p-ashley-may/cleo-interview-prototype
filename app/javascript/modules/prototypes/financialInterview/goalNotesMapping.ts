import type { MemoryGem } from 'Modules/prototypes/financialInterview/interviewScript';

export type GoalNotesIcon = 'check' | 'globe' | 'shield' | 'dollarDown';

export type GoalNotesRow = {
  gemId: string;
  title: string;
  subtitle: string;
  icon: GoalNotesIcon;
};

/** Map captured memory gems to Goal Notes list rows (Figma copy patterns). */
export function gemsToGoalNotesRows(gems: MemoryGem[]): GoalNotesRow[] {
  return gems.map((gem, i) => mapOneGem(gem, i));
}

function mapOneGem(gem: MemoryGem, index: number): GoalNotesRow {
  const label = gem.label;
  const low = label.toLowerCase();

  if (/travel|trip|japan|abroad|vacation|flight/.test(low)) {
    return {
      gemId: gem.id,
      title: label,
      subtitle: 'Saving toward something meaningful away from home',
      icon: 'globe',
    };
  }
  if (/debt|card|interest|pay down|apr/.test(low)) {
    return {
      gemId: gem.id,
      title: label,
      subtitle: 'Easing repayment and interest pressure',
      icon: 'dollarDown',
    };
  }
  if (/security|cushion|buffer|emergency|save|savings/.test(low)) {
    return {
      gemId: gem.id,
      title: label,
      subtitle: 'Building room for surprises',
      icon: 'shield',
    };
  }
  if (/stress|anxious|tense|worried|feel/.test(low) || /variable|freelance|irregular|income/.test(low)) {
    return {
      gemId: gem.id,
      title: label,
      subtitle: 'How money feels day to day right now',
      icon: 'check',
    };
  }

  const fallbacks: Array<Omit<GoalNotesRow, 'gemId'>> = [
    { title: label, subtitle: 'Captured from your chat', icon: 'check' },
    { title: label, subtitle: 'Something you want the plan to remember', icon: 'globe' },
    { title: label, subtitle: 'A theme we can sequence with the rest', icon: 'shield' },
    { title: label, subtitle: 'Worth keeping in view as we prioritise', icon: 'dollarDown' },
  ];
  return { gemId: gem.id, ...fallbacks[index % fallbacks.length] };
}

/** Mint tag labels in memory-gem playback (Figma 5725:42871). */
const PLAYBACK_TAG_BY_ICON: Record<GoalNotesIcon, string> = {
  check: 'Financial feelings',
  globe: 'Travel fund',
  shield: 'Financial safety',
  dollarDown: 'Reduce debt',
};

export type PlaybackGemRow = {
  gemId: string;
  title: string;
  tag: string;
  icon: GoalNotesIcon;
};

export function gemsToPlaybackRows(gems: MemoryGem[]): PlaybackGemRow[] {
  return gemsToGoalNotesRows(gems).map((row) => ({
    gemId: row.gemId,
    title: row.title,
    tag: PLAYBACK_TAG_BY_ICON[row.icon],
    icon: row.icon,
  }));
}
