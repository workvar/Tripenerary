import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export interface FirebaseConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  /** Google Analytics measurement ID (G-…). Optional. */
  readonly measurementId?: string;
}

function readConfig(): FirebaseConfig | null {
  const apiKey = process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] ?? '';
  const authDomain = process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '';
  const projectId = process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] ?? '';
  const storageBucket = process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? '';
  const messagingSenderId = process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '';
  const appId = process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] ?? '';
  const measurementId = process.env['NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID'] ?? '';

  if (!apiKey || !authDomain || !projectId || !appId) return null;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
    ...(measurementId ? { measurementId } : {}),
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;
let configured = false;

function ensure(): boolean {
  if (configured) return app !== null;
  configured = true;

  const config = readConfig();
  if (!config) return false;

  app = getApps().length === 0 ? initializeApp(config) : getApps()[0]!;
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  if (config.measurementId && typeof window !== 'undefined') {
    void isSupported()
      .then((ok: boolean) => {
        if (ok && app) analytics = getAnalytics(app);
      })
      .catch(() => undefined);
  }

  return true;
}

export function isFirebaseConfigured(): boolean {
  return ensure();
}

export function getFirebaseAuth(): Auth | null {
  return ensure() ? auth : null;
}

export function getFirebaseDb(): Firestore | null {
  return ensure() ? db : null;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  return ensure() ? storage : null;
}

export function getFirebaseAnalytics(): Analytics | null {
  ensure();
  return analytics;
}

/** Soft cap for a user's saved draft + published JSON in cloud storage. */
export const MAX_CLOUD_BYTES = 20 * 1024 * 1024;
