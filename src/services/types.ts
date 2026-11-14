import type { FaithAnswers, FaithFilter } from './faith';

export type Gender = 'man' | 'woman';

export type RelationshipStatus =
  | 'never_married'
  | 'separated'
  | 'divorced'
  | 'widowed'
  | 'undisclosed';

export const RELATIONSHIP_LABELS: Record<RelationshipStatus, string> = {
  never_married: 'Never Married',
  separated: 'Currently separated',
  divorced: 'Divorced',
  widowed: 'Widow/Widower',
  undisclosed: 'Prefers not to say',
};

/** Public profile data, visible to other users. */
export interface Profile {
  id: string;
  name: string;
  gender: Gender;
  seeking: Gender;
  relationshipStatus: RelationshipStatus;
  address: string;
  /** ISO date, yyyy-mm-dd */
  dateOfBirth: string;
  profession: string;
  /** Total height in inches, e.g. 67 = 5ft 7in */
  heightIn?: number;
  about?: string;
  /** Remote URL or data: URI */
  photo: string | null;
  phone: string;
  email?: string;
  /** Identity checked by the Yumban team. Set by the backend, never by the user. */
  verified?: boolean;
  /** Premium is active until this timestamp (ms). Set by the backend after purchase. */
  premiumUntil?: number;
  /** When on, matches must send a contact request and be accepted before they can call or WhatsApp. */
  contactPrivacy?: boolean;
  /** Up to MAX_HOBBIES entries from HOBBIES. */
  hobbies?: string[];
  /** Faith & Practice answers. */
  faith?: FaithAnswers;
  /** Up to MAX_FAITH_TAGS entries from FAITH_TAGS. */
  faithTags?: string[];
  /** What this user is looking for. Used to filter Discover. */
  prefs?: PartnerPrefs;
  createdAt: number;
}

export interface PartnerPrefs {
  ageMin: number;
  ageMax: number;
  /** Only show profiles verified by the Yumban team. */
  verifiedOnly?: boolean;
  /** Faith & Practice filters. */
  faith?: FaithFilter;
}

export const AGE_LIMITS = { min: 18, max: 70 } as const;
export const DEFAULT_PREFS: PartnerPrefs = { ageMin: AGE_LIMITS.min, ageMax: 45, verifiedOnly: false };
export const MAX_HOBBIES = 5;

export const HOBBIES = [
  '📚 Reading',
  '🍳 Cooking',
  '🧁 Baking',
  '✈️ Travelling',
  '⚽ Football',
  '🏏 Cricket',
  '🏸 Badminton',
  '🏊 Swimming',
  '🏋️ Fitness',
  '🥾 Hiking',
  '🎣 Fishing',
  '🌱 Gardening',
  '📷 Photography',
  '🎨 Painting',
  '🖋️ Calligraphy',
  '✍️ Writing',
  '📜 Poetry',
  '🎵 Music',
  '🎬 Movies',
  '🎮 Gaming',
  '💻 Technology',
  '🧵 Sewing',
  '🤝 Volunteering',
  '📖 Quran study',
  '🛍️ Shopping',
  '🐈 Pets',
] as const;

/** Private account record stored alongside the profile. */
export interface Account {
  id: string;
  phone: string;
  email?: string;
  passwordHash: string;
  salt: string;
}

export interface SignupDraft {
  gender?: Gender;
  seeking?: Gender;
  relationshipStatus?: RelationshipStatus;
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  profession?: string;
  password?: string;
  photo?: string | null;
  hobbies?: string[];
  faith?: FaithAnswers;
  faithTags?: string[];
  prefs?: PartnerPrefs;
}

export type SwipeDirection = 'like' | 'pass';

export interface AppNotification {
  id: string;
  /** Ionicons glyph name */
  icon: string;
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
  /** In-app route to open when tapped, e.g. '/edit-profile' */
  link?: string;
}

export interface SwipeAllowance {
  /** null = unlimited (Premium) */
  limit: number | null;
  used: number;
  /** null = unlimited */
  remaining: number | null;
}

export type ReportReason = 'fake' | 'photos' | 'harassment' | 'scam' | 'underage' | 'married' | 'other';

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'fake', label: 'Fake profile or impersonation' },
  { value: 'photos', label: 'Inappropriate photos' },
  { value: 'harassment', label: 'Harassment or offensive messages' },
  { value: 'scam', label: 'Scam or asking for money' },
  { value: 'underage', label: 'Appears to be under 18' },
  { value: 'married', label: 'Already married / not serious' },
  { value: 'other', label: 'Something else' },
];

export interface ProfileReport {
  id: string;
  reporterId: string;
  targetId: string;
  reason: ReportReason;
  details?: string;
  createdAt: number;
}

export type ContactRequestStatus = 'pending' | 'accepted' | 'declined';

export interface ContactRequest {
  id: string;
  fromId: string;
  toId: string;
  status: ContactRequestStatus;
  createdAt: number;
  respondedAt?: number;
}

/**
 * Can `viewer` call/WhatsApp `target`?
 * - 'open': target doesn't require requests
 * - 'none' / 'pending' / 'accepted' / 'declined': state of viewer's request to target
 */
export type ContactAccess = 'open' | 'none' | ContactRequestStatus;
