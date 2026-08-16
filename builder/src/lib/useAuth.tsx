'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

export interface AuthApi {
  readonly available: boolean;
  readonly ready: boolean;
  readonly user: User | null;
  readonly uid: string | null;
  readonly email: string | null;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

function authErrorMessage(e: unknown): string {
  if (!(e instanceof Error)) return 'Something went wrong. Try again.';
  const code =
    'code' in e && typeof (e as { code?: unknown }).code === 'string'
      ? (e as { code: string }).code
      : '';
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address does not look right.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Wrong email or password.';
    case 'auth/email-already-in-use':
      return 'An account with that email already exists. Sign in instead.';
    case 'auth/weak-password':
      return 'Use a password with at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return e.message || 'Something went wrong. Try again.';
  }
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const available = isFirebaseConfigured();
  const [ready, setReady] = useState(!available);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setReady(true);
      return;
    }
    return onAuthStateChanged(auth, (next: User | null) => {
      setUser(next);
      setReady(true);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return { ok: false as const, error: 'Sign-in is not configured.' };
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: authErrorMessage(e) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) return { ok: false as const, error: 'Sign-in is not configured.' };
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true as const };
    } catch (e) {
      return { ok: false as const, error: authErrorMessage(e) };
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) await firebaseSignOut(auth);
  }, []);

  const value = useMemo<AuthApi>(
    () => ({
      available,
      ready,
      user,
      uid: user?.uid ?? null,
      email: user?.email ?? null,
      signIn,
      signUp,
      signOut,
    }),
    [available, ready, user, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
