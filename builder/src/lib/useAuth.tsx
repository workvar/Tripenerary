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
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { ensureAuthPersistence, getFirebaseAuth, isFirebaseConfigured } from '@/lib/firebase';

export type AuthResult = { ok: true } | { ok: false; error: string };

export interface AuthApi {
  readonly available: boolean;
  readonly ready: boolean;
  readonly user: User | null;
  readonly uid: string | null;
  readonly email: string | null;
  readonly displayName: string | null;
  readonly photoURL: string | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthApi | null>(null);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

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
    case 'auth/popup-closed-by-user':
      return 'Sign-in was cancelled.';
    case 'auth/popup-blocked':
      return 'The sign-in popup was blocked. Allow popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Another sign-in is already in progress.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google sign-in. Add it in Firebase Auth settings.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled for this Firebase project.';
    default:
      return e.message || 'Something went wrong. Try again.';
  }
}

function errorCode(e: unknown): string {
  if (e && typeof e === 'object' && 'code' in e && typeof (e as { code?: unknown }).code === 'string') {
    return (e as { code: string }).code;
  }
  return '';
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

    let unsub: (() => void) | null = null;
    let cancelled = false;

    void (async () => {
      await ensureAuthPersistence();
      if (cancelled) return;

      // Complete Google redirect flow if the popup path fell back to redirect.
      try {
        await getRedirectResult(auth);
      } catch {
        // Surface via the next sign-in attempt; do not block session restore.
      }

      unsub = onAuthStateChanged(auth, (next) => {
        setUser(next);
        setReady(true);
      });
    })();

    return () => {
      cancelled = true;
      unsub?.();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const auth = getFirebaseAuth();
    if (!auth) return { ok: false, error: 'Sign-in is not configured.' };
    try {
      await ensureAuthPersistence();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: authErrorMessage(e) };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const auth = getFirebaseAuth();
    if (!auth) return { ok: false, error: 'Sign-in is not configured.' };
    try {
      await ensureAuthPersistence();
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: authErrorMessage(e) };
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    const auth = getFirebaseAuth();
    if (!auth) return { ok: false, error: 'Sign-in is not configured.' };
    try {
      await ensureAuthPersistence();
      await signInWithPopup(auth, googleProvider);
      return { ok: true };
    } catch (e) {
      if (errorCode(e) === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return { ok: true };
        } catch (redirectErr) {
          return { ok: false, error: authErrorMessage(redirectErr) };
        }
      }
      return { ok: false, error: authErrorMessage(e) };
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
      displayName: user?.displayName ?? null,
      photoURL: user?.photoURL ?? null,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [available, ready, user, signIn, signUp, signInWithGoogle, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
