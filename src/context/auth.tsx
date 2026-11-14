import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { backend, isPremium, type Profile } from '@/services';

type SignUpInput = Parameters<typeof backend.signUp>[0];

interface AuthState {
  ready: boolean;
  user: Profile | null;
  logIn(identifier: string, password: string): Promise<void>;
  signUp(input: SignUpInput): Promise<void>;
  logOut(): Promise<void>;
  updateProfile(patch: Parameters<typeof backend.updateProfile>[1]): Promise<void>;
  deleteAccount(): Promise<void>;
  /** True while Premium is active. */
  premium: boolean;
  activatePremium(months: number): Promise<void>;
  cancelPremium(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const uid = await backend.restoreSession();
        if (uid) setUser(await backend.getProfile(uid));
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const logIn = useCallback(async (identifier: string, password: string) => {
    setUser(await backend.logIn(identifier, password));
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    setUser(await backend.signUp(input));
  }, []);

  const logOut = useCallback(async () => {
    await backend.logOut();
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthState['updateProfile']>(
    async (patch) => {
      if (!user) return;
      setUser(await backend.updateProfile(user.id, patch));
    },
    [user],
  );

  const deleteAccount = useCallback(async () => {
    if (!user) return;
    await backend.deleteAccount(user.id);
    setUser(null);
  }, [user]);

  const activatePremium = useCallback(
    async (months: number) => {
      if (!user) return;
      setUser(await backend.activatePremium(user.id, months));
    },
    [user],
  );

  const cancelPremium = useCallback(async () => {
    if (!user) return;
    setUser(await backend.cancelPremium(user.id));
  }, [user]);

  const premium = isPremium(user);

  const value = useMemo(
    () => ({ ready, user, logIn, signUp, logOut, updateProfile, deleteAccount, premium, activatePremium, cancelPremium }),
    [ready, user, logIn, signUp, logOut, updateProfile, deleteAccount, premium, activatePremium, cancelPremium],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** For screens inside the signed-in area, where a user is guaranteed. */
export function useUser() {
  const { user } = useAuth();
  if (!user) throw new Error('useUser called while signed out');
  return user;
}
