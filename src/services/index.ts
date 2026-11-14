import type { Backend } from './backend';
import { LocalBackend } from './local-backend';

/** Swap this for a Supabase/Firebase implementation of `Backend` later. */
export const backend: Backend = new LocalBackend();

export { BackendError } from './backend';
export * from './faith';
export * from './premium';
export * from './types';
export * from './validation';
