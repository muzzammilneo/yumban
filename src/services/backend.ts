import type { AppNotification, ContactAccess, ContactRequest, Profile, ReportReason, SignupDraft, SwipeAllowance, SwipeDirection } from './types';

/**
 * Everything the app needs from a backend. The UI only talks to this
 * interface, so swapping the local implementation for Supabase/Firebase
 * means writing one new class and changing `src/services/index.ts`.
 */
export interface Backend {
  /** Returns the signed-in user's id, or null. */
  restoreSession(): Promise<string | null>;
  signUp(draft: Required<Pick<SignupDraft, 'gender' | 'seeking' | 'relationshipStatus' | 'name' | 'address' | 'phone' | 'dateOfBirth' | 'profession' | 'password'>> & Pick<SignupDraft, 'email' | 'photo' | 'hobbies' | 'prefs' | 'faith' | 'faithTags'>): Promise<Profile>;
  logIn(identifier: string, password: string): Promise<Profile>;
  logOut(): Promise<void>;
  /** True if an account with this phone or email already exists. */
  isRegistered(identifier: string): Promise<boolean>;

  getProfile(id: string): Promise<Profile | null>;
  updateProfile(id: string, patch: Partial<Omit<Profile, 'id' | 'createdAt'>>): Promise<Profile>;
  deleteAccount(id: string): Promise<void>;

  /** Profiles the user has not swiped yet, filtered to who they seek. */
  getDiscoverQueue(userId: string): Promise<Profile[]>;
  /**
   * Throws BackendError with field 'limit' when a free user has used today's swipes.
   * Returns true when a like creates a mutual match.
   */
  recordSwipe(userId: string, targetId: string, direction: SwipeDirection): Promise<{ matched: boolean }>;
  getSwipeAllowance(userId: string): Promise<SwipeAllowance>;
  /** Premium only: bring back the last swiped profile. Returns its id, or null if nothing to undo. */
  undoLastSwipe(userId: string): Promise<string | null>;
  /** Forget all passes so the queue refills. Favourites are kept. */
  resetPasses(userId: string): Promise<void>;

  getFavourites(userId: string): Promise<Profile[]>;
  isFavourite(userId: string, targetId: string): Promise<boolean>;
  setFavourite(userId: string, targetId: string, favourite: boolean): Promise<{ matched: boolean }>;

  /** People who favourited this user and haven't been swiped on yet. */
  getLikesReceived(userId: string): Promise<Profile[]>;
  /** Mutual favourites. */
  getMatches(userId: string): Promise<Profile[]>;
  isMatch(userId: string, otherId: string): Promise<boolean>;

  /** Demo stand-in for an in-app purchase: activates Premium for `months`. */
  activatePremium(userId: string, months: number): Promise<Profile>;
  cancelPremium(userId: string): Promise<Profile>;

  /** Newest first. */
  getNotifications(userId: string): Promise<AppNotification[]>;
  markNotificationsRead(userId: string): Promise<void>;

  /** Blocked people disappear from each other's Discover, Likes, Matches and Favourites. */
  blockProfile(userId: string, targetId: string): Promise<void>;
  unblockProfile(userId: string, targetId: string): Promise<void>;
  /** True if either user has blocked the other. */
  isBlocked(userId: string, otherId: string): Promise<boolean>;
  /** Profiles this user has blocked. */
  getBlocked(userId: string): Promise<Profile[]>;
  /** Sends a report to the moderation team. */
  reportProfile(userId: string, targetId: string, reason: ReportReason, details?: string): Promise<void>;

  /** Whether `userId` may contact `targetId` directly, or the state of their contact request. */
  getContactAccess(userId: string, targetId: string): Promise<ContactAccess>;
  /** Ask a match (who has contact privacy on) for permission to call/WhatsApp. Needs a match and Premium. */
  requestContact(userId: string, targetId: string): Promise<void>;
  /** Pending requests sent to this user, newest first. */
  getIncomingContactRequests(userId: string): Promise<{ request: ContactRequest; from: Profile }[]>;
  respondToContactRequest(userId: string, requestId: string, accept: boolean): Promise<void>;
}

export class BackendError extends Error {
  constructor(
    message: string,
    public field?: string,
  ) {
    super(message);
    this.name = 'BackendError';
  }
}
