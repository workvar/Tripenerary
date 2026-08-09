import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
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
}

function readConfig(): FirebaseConfig | null {
  const apiKey = process.env['NEXT_PUBLIC_FIREBASE_API_KEY'] ?? '';
  const authDomain = process.env['NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '';
  const projectId = process.env['NEXT_PUBLIC_FIREBASE_PROJECT_ID'] ?? '';
  const storageBucket = process.env['NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? '';
  const messagingSenderId = process.env['NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '';
  const appId = process.env['NEXT_PUBLIC_FIREBASE_APP_ID'] ?? '';

  if (!apiKey || !authDomain || !projectId || !appId) return null;

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
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

/** Soft cap for a user's saved draft + published JSON in cloud storage. */
export const MAX_CLOUD_BYTES = 20 * 1024 * 1024;
