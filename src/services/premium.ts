/** Premium configuration. Prices are placeholders until real in-app purchases are set up. */

/** Profiles a free user can swipe on per day. */
export const FREE_DAILY_SWIPES = 10;

export interface PremiumPlan {
  id: string;
  months: number;
  /** Display price, e.g. "₹299". Placeholder: set real prices in App Store Connect / Play Console. */
  price: string;
  perMonth?: string;
  tag?: string;
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  { id: 'premium_1m', months: 1, price: '₹299' },
  { id: 'premium_3m', months: 3, price: '₹699', perMonth: '₹233/month', tag: 'Popular' },
  { id: 'premium_6m', months: 6, price: '₹1,199', perMonth: '₹200/month', tag: 'Best value' },
];

export const PREMIUM_BENEFITS = [
  { icon: 'infinite', title: 'Unlimited Discover', body: `Free members can see ${FREE_DAILY_SWIPES} profiles a day.` },
  { icon: 'eye', title: 'See who favourited you', body: 'Find out who already likes you and match instantly.' },
  { icon: 'call', title: 'Contact your matches', body: 'Call or WhatsApp people you’ve matched with.' },
  { icon: 'arrow-undo', title: 'Undo a swipe', body: 'Passed someone by mistake? Bring them back.' },
] as const;

export function isPremium(profile: { premiumUntil?: number } | null | undefined, now = Date.now()) {
  return !!profile?.premiumUntil && profile.premiumUntil > now;
}

/** Local date key, e.g. "2026-11-14", used to reset the daily swipe count. */
export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
