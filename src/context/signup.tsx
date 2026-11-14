import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { SignupDraft } from '@/services';

interface SignupState {
  draft: SignupDraft;
  update(patch: Partial<SignupDraft>): void;
  reset(): void;
}

const SignupContext = createContext<SignupState | null>(null);

/** Holds the multi-step signup answers until the final step submits them. */
export function SignupProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<SignupDraft>({});
  const value = useMemo<SignupState>(
    () => ({
      draft,
      update: (patch) => setDraft((d) => ({ ...d, ...patch })),
      reset: () => setDraft({}),
    }),
    [draft],
  );
  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>;
}

export function useSignup() {
  const ctx = useContext(SignupContext);
  if (!ctx) throw new Error('useSignup must be used inside <SignupProvider>');
  return ctx;
}
