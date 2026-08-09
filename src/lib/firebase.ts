import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const apiKey = process.env['EXPO_PUBLIC_FIREBASE_API_KEY'] ?? '';
  const authDomain = process.env['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '';
  const projectId = process.env['EXPO_PUBLIC_FIREBASE_PROJECT_ID'] ?? '';
  const storageBucket = process.env['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'] ?? '';
  const messagingSenderId = process.env['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'] ?? '';
  const appId = process.env['EXPO_PUBLIC_FIREBASE_APP_ID'] ?? '';
  const measurementId = process.env['EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'] ?? '';

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
let configured = false;

function ensure(): boolean {
  if (configured) return app !== null;
  configured = true;

  const config = readConfig();
  if (!config) return false;

  app = getApps().length === 0 ? initializeApp(config) : getApps()[0]!;
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Hot reload / second init — Auth was already created for this app.
    auth = getAuth(app);
  }
  db = getFirestore(app);
  return true;
}

/** True when Firebase env vars are present and the SDK initialised. */
export function isFirebaseConfigured(): boolean {
  return ensure();
}

export function getFirebaseAuth(): Auth | null {
  return ensure() ? auth : null;
}

export function getFirebaseDb(): Firestore | null {
  return ensure() ? db : null;
}
