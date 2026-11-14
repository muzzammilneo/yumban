import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import { type Backend, BackendError } from './backend';
import { SEED_PROFILES } from './seed';
import { FREE_DAILY_SWIPES, isPremium, todayKey } from './premium';
import { matchesFaith, MAX_FAITH_TAGS, migrateFaithAnswers, migrateFaithFilter } from './faith';
import { DEFAULT_PREFS, MAX_HOBBIES, type Account, type AppNotification, type ContactAccess, type ContactRequest, type Profile, type ProfileReport, type ReportReason, type SwipeAllowance, type SwipeDirection } from './types';
import { ageFromDob, normalizeEmail, normalizePhone } from './validation';

const KEYS = {
  profiles: 'yumban:profiles',
  accounts: 'yumban:accounts',
  session: 'yumban:session',
  swipes: (uid: string) => `yumban:swipes:${uid}`,
  notifications: (uid: string) => `yumban:notifications:${uid}`,
  /** { day: 'YYYY-MM-DD', count, last } — daily swipe count + last swiped id for undo */
  swipeLog: (uid: string) => `yumban:swipelog:${uid}`,
  blocks: (uid: string) => `yumban:blocks:${uid}`,
  /** All reports, for the moderation team. A real backend would send these to an admin queue. */
  reports: 'yumban:reports',
  /** All contact requests (a real backend would store these server-side). */
  contactRequests: 'yumban:contact-requests',
} as const;

type SwipeMap = Record<string, SwipeDirection>;
type SwipeLog = { day: string; count: number; last?: string };

/**
 * DEMO ONLY: there are no other real users on a single device, so some demo
 * profiles "favourite" every user they'd be interested in. This gives Likes and
 * Matches something to show. Remove when a real backend is connected.
 */
function demoProfileLikes(seed: Profile, user: Profile) {
  if (!seed.id.startsWith('seed-') || seed.gender !== user.seeking || seed.seeking !== user.gender) return false;
  let h = 0;
  for (const c of seed.id + user.id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h) % 2 === 0;
}

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}

async function hashPassword(password: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

/** On-device backend: all data lives in AsyncStorage. */
export class LocalBackend implements Backend {
  private async profiles(): Promise<Record<string, Profile>> {
    const stored = await readJSON<Record<string, Profile> | null>(KEYS.profiles, null);
    if (stored) {
      // Demo profiles aren't editable in the app, so refresh them from seed.ts
      // whenever it changes (new fields like `verified` or `hobbies`).
      let changed = false;
      for (const seed of SEED_PROFILES) {
        const current = stored[seed.id];
        if (!current) continue;
        const fresh = { ...seed, createdAt: current.createdAt }; // seed createdAt is Date.now(), keep the original
        if (JSON.stringify(current) !== JSON.stringify(fresh)) {
          stored[seed.id] = fresh;
          changed = true;
        }
      }
      // Users' own faith answers saved before the options were renamed.
      for (const p of Object.values(stored)) {
        if (p.id.startsWith('seed-')) continue;
        const faith = migrateFaithAnswers(p.faith);
        const prefFaith = migrateFaithFilter(p.prefs?.faith);
        if (JSON.stringify(faith) !== JSON.stringify(p.faith) || JSON.stringify(prefFaith) !== JSON.stringify(p.prefs?.faith)) {
          stored[p.id] = { ...p, faith, prefs: p.prefs ? { ...p.prefs, faith: prefFaith } : p.prefs };
          changed = true;
        }
      }
      if (changed) await writeJSON(KEYS.profiles, stored);
      return stored;
    }
    const seeded = Object.fromEntries(SEED_PROFILES.map((p) => [p.id, p]));
    await writeJSON(KEYS.profiles, seeded);
    return seeded;
  }

  private accounts() {
    return readJSON<Record<string, Account>>(KEYS.accounts, {});
  }

  private async findAccount(identifier: string): Promise<Account | undefined> {
    const accounts = Object.values(await this.accounts());
    const id = identifier.trim();
    if (id.includes('@')) {
      const email = normalizeEmail(id);
      return accounts.find((a) => a.email === email);
    }
    const phone = normalizePhone(id);
    return accounts.find((a) => a.phone === phone);
  }

  async restoreSession() {
    const uid = await AsyncStorage.getItem(KEYS.session);
    if (!uid) return null;
    const profiles = await this.profiles();
    return profiles[uid] ? uid : null;
  }

  async isRegistered(identifier: string) {
    return !!(await this.findAccount(identifier));
  }

  async signUp(draft: Parameters<Backend['signUp']>[0]) {
    const phone = normalizePhone(draft.phone);
    const email = draft.email ? normalizeEmail(draft.email) : undefined;
    if (await this.findAccount(phone)) {
      throw new BackendError('An account with this phone number already exists.', 'phone');
    }
    if (email && (await this.findAccount(email))) {
      throw new BackendError('An account with this email already exists.', 'email');
    }

    const id = Crypto.randomUUID();
    const salt = Crypto.randomUUID();
    const account: Account = {
      id,
      phone,
      email,
      salt,
      passwordHash: await hashPassword(draft.password, salt),
    };
    const profile: Profile = {
      id,
      name: draft.name.trim(),
      gender: draft.gender,
      seeking: draft.seeking,
      relationshipStatus: draft.relationshipStatus,
      address: draft.address.trim(),
      dateOfBirth: draft.dateOfBirth,
      profession: draft.profession.trim(),
      photo: draft.photo ?? null,
      hobbies: (draft.hobbies ?? []).slice(0, MAX_HOBBIES),
      faith: draft.faith,
      faithTags: (draft.faithTags ?? []).slice(0, MAX_FAITH_TAGS),
      prefs: draft.prefs ?? DEFAULT_PREFS,
      phone,
      email,
      createdAt: Date.now(),
    };

    const [accounts, profiles] = await Promise.all([this.accounts(), this.profiles()]);
    accounts[id] = account;
    profiles[id] = profile;
    await Promise.all([
      writeJSON(KEYS.accounts, accounts),
      writeJSON(KEYS.profiles, profiles),
      AsyncStorage.setItem(KEYS.session, id),
    ]);
    return profile;
  }

  async logIn(identifier: string, password: string) {
    const account = await this.findAccount(identifier);
    if (!account || (await hashPassword(password, account.salt)) !== account.passwordHash) {
      throw new BackendError('Incorrect phone/email or password.');
    }
    const profile = (await this.profiles())[account.id];
    if (!profile) throw new BackendError('This account no longer exists.');
    await AsyncStorage.setItem(KEYS.session, account.id);
    return profile;
  }

  async logOut() {
    await AsyncStorage.removeItem(KEYS.session);
  }

  async getProfile(id: string) {
    return (await this.profiles())[id] ?? null;
  }

  async updateProfile(id: string, patch: Partial<Omit<Profile, 'id' | 'createdAt'>>) {
    const profiles = await this.profiles();
    const current = profiles[id];
    if (!current) throw new BackendError('Profile not found.');
    // Verification is granted by the Yumban team, not editable from the app.
    delete (patch as Partial<Profile>).verified;
    delete (patch as Partial<Profile>).premiumUntil;
    if (patch.hobbies) patch.hobbies = patch.hobbies.slice(0, MAX_HOBBIES);
    if (patch.faithTags) patch.faithTags = patch.faithTags.slice(0, MAX_FAITH_TAGS);

    if (patch.phone !== undefined || patch.email !== undefined) {
      const accounts = await this.accounts();
      const account = accounts[id];
      if (patch.phone !== undefined) {
        const phone = normalizePhone(patch.phone);
        const other = await this.findAccount(phone);
        if (other && other.id !== id) throw new BackendError('That phone number is already in use.', 'phone');
        patch.phone = phone;
        if (account) account.phone = phone;
      }
      if (patch.email !== undefined) {
        const email = patch.email ? normalizeEmail(patch.email) : undefined;
        if (email) {
          const other = await this.findAccount(email);
          if (other && other.id !== id) throw new BackendError('That email is already in use.', 'email');
        }
        patch.email = email;
        if (account) account.email = email;
      }
      await writeJSON(KEYS.accounts, accounts);
    }

    const next = { ...current, ...patch };
    profiles[id] = next;
    await writeJSON(KEYS.profiles, profiles);
    return next;
  }

  async deleteAccount(id: string) {
    const [accounts, profiles] = await Promise.all([this.accounts(), this.profiles()]);
    delete accounts[id];
    delete profiles[id];
    await Promise.all([
      writeJSON(KEYS.accounts, accounts),
      writeJSON(KEYS.profiles, profiles),
      AsyncStorage.removeItem(KEYS.swipes(id)),
      AsyncStorage.removeItem(KEYS.notifications(id)),
      AsyncStorage.removeItem(KEYS.swipeLog(id)),
      AsyncStorage.removeItem(KEYS.blocks(id)),
      AsyncStorage.removeItem(KEYS.session),
    ]);
  }

  private swipes(uid: string) {
    return readJSON<SwipeMap>(KEYS.swipes(uid), {});
  }

  async getDiscoverQueue(userId: string) {
    const [profiles, swipes, hidden] = await Promise.all([this.profiles(), this.swipes(userId), this.hiddenFor(userId)]);
    const me = profiles[userId];
    if (!me) return [];
    const prefs = me.prefs ?? DEFAULT_PREFS;
    const mine = new Set(me.hobbies ?? []);
    const shared = (p: Profile) => (p.hobbies ?? []).filter((h) => mine.has(h)).length;
    return Object.values(profiles)
      .filter((p) => {
        if (p.id === userId || swipes[p.id] || hidden.has(p.id)) return false;
        if (p.gender !== me.seeking || p.seeking !== me.gender) return false;
        const age = ageFromDob(p.dateOfBirth);
        if (age < prefs.ageMin || age > prefs.ageMax) return false;
        if (prefs.verifiedOnly && !p.verified) return false;
        if (!matchesFaith(p.faith, prefs.faith)) return false;
        return true;
      })
      // People with more hobbies in common first, then newest.
      .sort((a, b) => shared(b) - shared(a) || b.createdAt - a.createdAt);
  }

  private async swipeLog(userId: string): Promise<SwipeLog> {
    const log = await readJSON<SwipeLog>(KEYS.swipeLog(userId), { day: todayKey(), count: 0 });
    return log.day === todayKey() ? log : { day: todayKey(), count: 0, last: log.last };
  }

  async getSwipeAllowance(userId: string): Promise<SwipeAllowance> {
    const [me, log] = await Promise.all([this.getProfile(userId), this.swipeLog(userId)]);
    if (isPremium(me)) return { limit: null, used: log.count, remaining: null };
    return { limit: FREE_DAILY_SWIPES, used: log.count, remaining: Math.max(0, FREE_DAILY_SWIPES - log.count) };
  }

  async recordSwipe(userId: string, targetId: string, direction: SwipeDirection) {
    const allowance = await this.getSwipeAllowance(userId);
    if (allowance.remaining === 0) {
      throw new BackendError(`You’ve seen ${FREE_DAILY_SWIPES} profiles today. Go Premium for unlimited Discover.`, 'limit');
    }
    const [swipes, log] = await Promise.all([this.swipes(userId), this.swipeLog(userId)]);
    swipes[targetId] = direction;
    await Promise.all([
      writeJSON(KEYS.swipes(userId), swipes),
      writeJSON(KEYS.swipeLog(userId), { day: log.day, count: log.count + 1, last: targetId }),
    ]);
    const matched = direction === 'like' && (await this.likes(targetId, userId));
    if (matched) await this.notifyMatch(userId, targetId);
    return { matched };
  }

  async undoLastSwipe(userId: string) {
    const me = await this.getProfile(userId);
    if (!isPremium(me)) throw new BackendError('Undo is a Premium feature.', 'premium');
    const [swipes, log] = await Promise.all([this.swipes(userId), this.swipeLog(userId)]);
    if (!log.last || !swipes[log.last]) return null;
    const id = log.last;
    delete swipes[id];
    await Promise.all([
      writeJSON(KEYS.swipes(userId), swipes),
      writeJSON(KEYS.swipeLog(userId), { ...log, last: undefined }),
    ]);
    return id;
  }

  /** Does `fromId` favourite `toId`? Real accounts use their swipes; demo profiles use demoProfileLikes. */
  private async likes(fromId: string, toId: string) {
    const profiles = await this.profiles();
    const from = profiles[fromId];
    const to = profiles[toId];
    if (!from || !to) return false;
    if ((await this.hiddenFor(toId)).has(fromId)) return false;
    if (fromId.startsWith('seed-')) return demoProfileLikes(from, to);
    return (await this.swipes(fromId))[toId] === 'like';
  }

  private async notifyMatch(userId: string, otherId: string) {
    const other = await this.getProfile(otherId);
    if (!other) return;
    const list = await readJSON<AppNotification[]>(KEYS.notifications(userId), []);
    const id = `match-${otherId}`;
    if (list.some((n) => n.id === id)) return;
    list.push({
      id,
      icon: 'heart-circle',
      title: 'It’s a match! 💕',
      body: `You and ${other.name.split(' ')[0]} favourited each other.`,
      createdAt: Date.now(),
      read: false,
      link: `/profile/${otherId}`,
    });
    await writeJSON(KEYS.notifications(userId), list);
  }

  async getLikesReceived(userId: string) {
    const [profiles, mine] = await Promise.all([this.profiles(), this.swipes(userId)]);
    const out: Profile[] = [];
    for (const p of Object.values(profiles)) {
      if (p.id === userId || mine[p.id]) continue;
      if (await this.likes(p.id, userId)) out.push(p);
    }
    return out;
  }

  async getMatches(userId: string) {
    const [profiles, mine] = await Promise.all([this.profiles(), this.swipes(userId)]);
    const out: Profile[] = [];
    for (const [id, d] of Object.entries(mine)) {
      if (d === 'like' && profiles[id] && (await this.likes(id, userId))) out.push(profiles[id]);
    }
    return out;
  }

  async isMatch(userId: string, otherId: string) {
    return (await this.swipes(userId))[otherId] === 'like' && (await this.likes(otherId, userId));
  }

  async activatePremium(userId: string, months: number) {
    const profiles = await this.profiles();
    const me = profiles[userId];
    if (!me) throw new BackendError('Profile not found.');
    const start = isPremium(me) ? me.premiumUntil! : Date.now();
    const until = new Date(start);
    until.setMonth(until.getMonth() + months);
    profiles[userId] = { ...me, premiumUntil: until.getTime() };
    await writeJSON(KEYS.profiles, profiles);
    return profiles[userId];
  }

  async cancelPremium(userId: string) {
    const profiles = await this.profiles();
    const me = profiles[userId];
    if (!me) throw new BackendError('Profile not found.');
    const { premiumUntil: _drop, ...rest } = me;
    profiles[userId] = rest;
    await writeJSON(KEYS.profiles, profiles);
    return profiles[userId];
  }

  async resetPasses(userId: string) {
    const swipes = await this.swipes(userId);
    const kept = Object.fromEntries(Object.entries(swipes).filter(([, d]) => d === 'like'));
    await writeJSON(KEYS.swipes(userId), kept);
  }

  async getFavourites(userId: string) {
    const [profiles, swipes, hidden] = await Promise.all([this.profiles(), this.swipes(userId), this.hiddenFor(userId)]);
    return Object.entries(swipes)
      .filter(([id, d]) => d === 'like' && profiles[id] && !hidden.has(id))
      .map(([id]) => profiles[id]);
  }

  async isFavourite(userId: string, targetId: string) {
    return (await this.swipes(userId))[targetId] === 'like';
  }

  async setFavourite(userId: string, targetId: string, favourite: boolean) {
    const swipes = await this.swipes(userId);
    if (favourite) swipes[targetId] = 'like';
    else delete swipes[targetId];
    await writeJSON(KEYS.swipes(userId), swipes);
    const matched = favourite && (await this.likes(targetId, userId));
    if (matched) await this.notifyMatch(userId, targetId);
    return { matched };
  }

  async getNotifications(userId: string) {
    const stored = await readJSON<AppNotification[] | null>(KEYS.notifications(userId), null);
    const list = stored ?? [];
    const profile = (await this.profiles())[userId];
    if (!profile) return [];

    const add = (n: Omit<AppNotification, 'createdAt' | 'read'>) => {
      if (!list.some((x) => x.id === n.id)) list.push({ ...n, createdAt: Date.now(), read: false });
    };
    // First visit: welcome message.
    if (!stored) {
      add({
        id: 'welcome',
        icon: 'heart',
        title: 'Welcome to Yumban 💕',
        body: 'Swipe right on people you like to save them to your favourites. May Allah make it easy for you.',
        link: '/discover',
      });
    }
    // Profile tips, added once each while the profile is missing something.
    if (!profile.photo) {
      add({ id: 'tip-photo', icon: 'camera', title: 'Add your photo', body: 'Profiles with a clear photo get far more interest.', link: '/me' });
    }
    if (!profile.faith || !Object.keys(profile.faith).length) {
      add({ id: 'tip-faith', icon: 'moon', title: 'Share your faith', body: 'Tell matches about your religious practice, sect and what matters most to you.', link: '/edit-profile' });
    }
    if (!profile.hobbies?.length) {
      add({ id: 'tip-hobbies', icon: 'sparkles', title: 'Pick your hobbies', body: 'Hobbies help us show you people with things in common.', link: '/edit-profile' });
    }

    if (JSON.stringify(list) !== JSON.stringify(stored)) await writeJSON(KEYS.notifications(userId), list);
    return [...list].sort((a, b) => b.createdAt - a.createdAt);
  }

  async markNotificationsRead(userId: string) {
    const list = await readJSON<AppNotification[]>(KEYS.notifications(userId), []);
    await writeJSON(
      KEYS.notifications(userId),
      list.map((n) => ({ ...n, read: true })),
    );
  }

  // ---- Blocking & reporting -------------------------------------------------

  private blocks(userId: string) {
    return readJSON<string[]>(KEYS.blocks(userId), []);
  }

  /** People this user shouldn't see or be seen by: those they blocked, and accounts that blocked them. */
  private async hiddenFor(userId: string) {
    const hidden = new Set(await this.blocks(userId));
    const accounts = Object.keys(await this.accounts());
    for (const other of accounts) {
      if (other !== userId && (await this.blocks(other)).includes(userId)) hidden.add(other);
    }
    return hidden;
  }

  async isBlocked(userId: string, otherId: string) {
    return (await this.hiddenFor(userId)).has(otherId);
  }

  async blockProfile(userId: string, targetId: string) {
    const [list, swipes] = await Promise.all([this.blocks(userId), this.swipes(userId)]);
    if (!list.includes(targetId)) list.push(targetId);
    // Blocking also removes them from your favourites.
    delete swipes[targetId];
    await Promise.all([writeJSON(KEYS.blocks(userId), list), writeJSON(KEYS.swipes(userId), swipes)]);
  }

  async unblockProfile(userId: string, targetId: string) {
    const list = await this.blocks(userId);
    await writeJSON(
      KEYS.blocks(userId),
      list.filter((id) => id !== targetId),
    );
  }

  async getBlocked(userId: string) {
    const [list, profiles] = await Promise.all([this.blocks(userId), this.profiles()]);
    return list.map((id) => profiles[id]).filter((p): p is Profile => !!p);
  }

  async reportProfile(userId: string, targetId: string, reason: ReportReason, details?: string) {
    const reports = await readJSON<ProfileReport[]>(KEYS.reports, []);
    reports.push({
      id: Crypto.randomUUID(),
      reporterId: userId,
      targetId,
      reason,
      details: details?.trim() || undefined,
      createdAt: Date.now(),
    });
    await writeJSON(KEYS.reports, reports);
  }

  // ---- Contact privacy & requests -------------------------------------------

  private contactRequests() {
    return readJSON<ContactRequest[]>(KEYS.contactRequests, []);
  }

  private async pushNotification(userId: string, n: Omit<AppNotification, 'createdAt' | 'read'>) {
    const list = await readJSON<AppNotification[]>(KEYS.notifications(userId), []);
    if (list.some((x) => x.id === n.id)) return;
    list.push({ ...n, createdAt: Date.now(), read: false });
    await writeJSON(KEYS.notifications(userId), list);
  }

  async getContactAccess(userId: string, targetId: string): Promise<ContactAccess> {
    const target = await this.getProfile(targetId);
    if (!target?.contactPrivacy) return 'open';
    const req = (await this.contactRequests())
      .filter((r) => r.fromId === userId && r.toId === targetId)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    return req?.status ?? 'none';
  }

  async requestContact(userId: string, targetId: string) {
    const me = await this.getProfile(userId);
    if (!isPremium(me)) throw new BackendError('Contacting matches is a Premium feature.', 'premium');
    if (!(await this.isMatch(userId, targetId))) throw new BackendError('You can only ask matches to contact them.', 'match');
    const access = await this.getContactAccess(userId, targetId);
    if (access === 'open' || access === 'accepted' || access === 'pending') return;

    const list = await this.contactRequests();
    const request: ContactRequest = { id: Crypto.randomUUID(), fromId: userId, toId: targetId, status: 'pending', createdAt: Date.now() };
    list.push(request);
    await writeJSON(KEYS.contactRequests, list);
    await this.pushNotification(targetId, {
      id: `contact-req-${request.id}`,
      icon: 'chatbubbles',
      title: 'New contact request',
      body: `${me!.name.split(' ')[0]} would like to call or WhatsApp you.`,
      link: '/requests',
    });
  }

  async getIncomingContactRequests(userId: string) {
    const [list, profiles, hidden] = await Promise.all([this.contactRequests(), this.profiles(), this.hiddenFor(userId)]);
    return list
      .filter((r) => r.toId === userId && r.status === 'pending' && profiles[r.fromId] && !hidden.has(r.fromId))
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((request) => ({ request, from: profiles[request.fromId] }));
  }

  async respondToContactRequest(userId: string, requestId: string, accept: boolean) {
    const list = await this.contactRequests();
    const req = list.find((r) => r.id === requestId && r.toId === userId);
    if (!req || req.status !== 'pending') return;
    req.status = accept ? 'accepted' : 'declined';
    req.respondedAt = Date.now();
    await writeJSON(KEYS.contactRequests, list);
    const me = await this.getProfile(userId);
    await this.pushNotification(req.fromId, {
      id: `contact-res-${req.id}`,
      icon: accept ? 'checkmark-circle' : 'close-circle',
      title: accept ? 'Contact request accepted' : 'Contact request declined',
      body: accept
        ? `${me?.name.split(' ')[0]} accepted. You can now call or WhatsApp them.`
        : `${me?.name.split(' ')[0]} isn’t ready to be contacted yet.`,
      link: `/profile/${userId}`,
    });
  }
}
