/** "Faith & Practice": each user answers for themselves and can filter matches by them. */

export interface FaithOption {
  /** Shown in pickers and filters. */
  label: string;
  /** Shown as a chip on profiles, e.g. "Non-smoker". */
  chip: string;
  emoji: string;
  /** Longer explanation shown under the label (religious practice only). */
  description?: string;
}

export const FAITH_FIELDS = {
  religiousPractice: {
    label: 'Religious practice',
    options: {
      strict: {
        label: 'Strictly practising',
        chip: 'Strictly practising',
        emoji: '🌙',
        description: 'I pray all the time, fast, and adhere strictly to Islamic tenets',
      },
      active: {
        label: 'Actively practising',
        chip: 'Actively practising',
        emoji: '🌙',
        description: 'I try to make religious practice part of my daily life where I can',
      },
      occasional: {
        label: 'Occasionally practising',
        chip: 'Occasionally practising',
        emoji: '🌙',
        description: 'I mostly practise during Ramadan, Eid and other special occasions',
      },
      not: {
        label: 'Not practising at all',
        chip: 'Not practising',
        emoji: '🌙',
        description: 'I’m culturally Muslim but don’t actively practise',
      },
    },
  },
  sect: {
    label: 'Sect',
    options: {
      sunni: { label: 'Sunni', chip: 'Sunni', emoji: '🌙' },
      shia: { label: 'Shia', chip: 'Shia', emoji: '🌙' },
      other: { label: 'Other sect', chip: 'Other sect', emoji: '🌙' },
    },
  },
  islamicDress: {
    label: 'Islamic dress',
    options: {
      always: { label: 'Wears religious dress', chip: 'Wears religious dress', emoji: '🧕' },
      sometimes: { label: 'Sometimes', chip: 'Sometimes wears religious dress', emoji: '🧕' },
      never: { label: 'No religious dress', chip: 'No religious dress', emoji: '🧕' },
    },
  },
  diet: {
    label: 'Diet',
    options: {
      halal: { label: 'Only eats halal food', chip: 'Only eats halal food', emoji: '🍴' },
      not_only: { label: 'Doesn’t only eat halal food', chip: 'Doesn’t only eat halal', emoji: '🍴' },
    },
  },
  alcohol: {
    label: 'Alcohol',
    options: {
      never: { label: 'Doesn’t drink', chip: 'Doesn’t drink', emoji: '🚫' },
      drinks: { label: 'Drinks', chip: 'Drinks', emoji: '🍷' },
    },
  },
  smoking: {
    label: 'Smoking',
    options: {
      never: { label: 'Non-smoker', chip: 'Non-smoker', emoji: '🚭' },
      smoker: { label: 'Smoker', chip: 'Smoker', emoji: '🚬' },
    },
  },
  bornMuslim: {
    label: 'Born Muslim',
    options: {
      yes: { label: 'Born Muslim', chip: 'Born Muslim', emoji: '🕌' },
      revert: { label: 'Revert', chip: 'Revert', emoji: '🕌' },
    },
  },
} satisfies Record<string, { label: string; options: Record<string, FaithOption> }>;

export type FaithKey = keyof typeof FAITH_FIELDS;
export const FAITH_KEYS = Object.keys(FAITH_FIELDS) as FaithKey[];

/** A user's own answers. Missing key = prefers not to say. */
export type FaithAnswers = Partial<Record<FaithKey, string>>;
/** Accepted answers per field. Missing or empty = no preference. */
export type FaithFilter = Partial<Record<FaithKey, string[]>>;

export function faithOptions(key: FaithKey) {
  return Object.entries(FAITH_FIELDS[key].options) as [string, FaithOption][];
}

export function faithOption(key: FaithKey, value: string | undefined): FaithOption | undefined {
  if (!value) return undefined;
  return (FAITH_FIELDS[key].options as Record<string, FaithOption>)[value];
}

export function faithLabel(key: FaithKey, value: string | undefined) {
  return faithOption(key, value)?.label;
}

export function describeFilter(key: FaithKey, accepted: string[] | undefined) {
  if (!accepted?.length) return 'No preference';
  return accepted.map((v) => faithLabel(key, v)).filter(Boolean).join(', ');
}

/**
 * True if the answers pass every active filter. Someone who hasn't answered a
 * filtered field is left out, so filters only show people who match for sure.
 */
export function matchesFaith(answers: FaithAnswers | undefined, filter: FaithFilter | undefined) {
  if (!filter) return true;
  return FAITH_KEYS.every((key) => {
    const accepted = filter[key];
    if (!accepted?.length) return true;
    const value = answers?.[key];
    return !!value && accepted.includes(value);
  });
}

export function activeFilterCount(filter: FaithFilter | undefined) {
  return FAITH_KEYS.filter((k) => filter?.[k]?.length).length;
}

/** Chips for a profile: one per answered field, in field order. */
export function faithChips(answers: FaithAnswers | undefined) {
  return FAITH_KEYS.map((k) => faithOption(k, answers?.[k])).filter((o): o is FaithOption => !!o);
}

/** Older option keys, mapped to their replacements (data saved before the options were renamed). */
const LEGACY: Partial<Record<FaithKey, Record<string, string | null>>> = {
  religiousPractice: { very: 'strict', practising: 'active', moderate: 'occasional' },
  diet: { mostly: 'not_only', flexible: 'not_only' },
  alcohol: { sometimes: 'drinks' },
  smoking: { sometimes: 'smoker', regularly: 'smoker' },
};

export function migrateFaithAnswers(answers: FaithAnswers | undefined): FaithAnswers | undefined {
  if (!answers) return answers;
  const out: FaithAnswers = {};
  for (const key of FAITH_KEYS) {
    const v = answers[key];
    if (!v) continue;
    const mapped = LEGACY[key]?.[v] ?? v;
    if (faithOption(key, mapped)) out[key] = mapped;
  }
  return out;
}

export function migrateFaithFilter(filter: FaithFilter | undefined): FaithFilter | undefined {
  if (!filter) return filter;
  const out: FaithFilter = {};
  for (const key of FAITH_KEYS) {
    const values = filter[key];
    if (!values?.length) continue;
    out[key] = [...new Set(values.map((v) => LEGACY[key]?.[v] ?? v).filter((v) => faithOption(key, v)))];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Faith tags: "what matters most in your Islamic practice"

export const MAX_FAITH_TAGS = 8;

export const FAITH_TAGS = [
  '🕌 Charity work',
  '🕋 Completed Hajj',
  '🕋 Completed Umrah',
  '📚 Dawah',
  '📿 Dhikr',
  '🍽️ Fasting',
  '📚 Fiqh',
  '🤲 Frequent dua',
  '🕌 Friday prayer',
  '😇 Good akhlaq',
  '📖 Hadith learning',
  '💭 Hafiz',
  '📚 Islamic lectures',
  '🧠 Learning Arabic',
  '🕌 Masjid regularly',
  '🤲 Nafl prayers',
  '🧎 Prays 5 times a day',
  '🧎 Prays a few times a day',
  '🕐 Prays on time',
  '📖 Reciting Qur’an',
  '🤲 Sadaqah',
  '📖 Seerah studies',
  '📖 Studied Qur’an',
  '🤲 Sunnah prayers',
  '🌙 Tahajjud',
  '🕌 Taraweeh',
  '🤲 Tasawwuf',
] as const;
