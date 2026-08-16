'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import TextInput from '@/components/ui/TextInput';
import { useAuth } from '@/lib/useAuth';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => {
    if (auth.ready && auth.user) {
      router.replace('/');
    }
  }, [auth.ready, auth.user, router]);

  if (!auth.ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-sm text-muted">
        Restoring your session…
      </div>
    );
  }

  if (auth.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-sm text-muted">
        Signed in. Opening the builder…
      </div>
    );
  }

  const onGoogle = async () => {
    setBusy(true);
    setError(null);
    const res = await auth.signInWithGoogle();
    setBusy(false);
    if (res.ok) router.replace('/');
    else setError(res.error);
  };

  const onEmailSubmit = async () => {
    setBusy(true);
    setError(null);
    const res = mode === 'signIn' ? await auth.signIn(email, password) : await auth.signUp(email, password);
    setBusy(false);
    if (res.ok) router.replace('/');
    else setError(res.error);
  };

  return (
    <div className="flex h-screen items-center justify-center overflow-auto bg-[radial-gradient(circle_at_20%_0%,#e6eeed_0%,transparent_45%),radial-gradient(circle_at_90%_10%,#f7ebe3_0%,transparent_40%),linear-gradient(180deg,#f6f4ef_0%,#efece4_100%)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/favicon.png"
            alt=""
            width={64}
            height={64}
            className="mb-4 h-16 w-16 rounded-md shadow-sm"
            decoding="async"
          />
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Tripenerary</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">Trip Companion Builder</h1>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Sign in to keep drafts in the cloud, publish shareable trip links, and pick up where you left
            off.
          </p>
        </div>

        <div className="rounded-lg border border-lineSoft bg-white/95 p-6 shadow-sm backdrop-blur">
          {!auth.available ? (
            <div className="space-y-4">
              <p className="text-sm text-muted">
                Cloud sign-in is not configured for this build. Add the{' '}
                <code className="rounded-sm bg-elevated px-1 py-0.5 text-[12px] text-ink">
                  NEXT_PUBLIC_FIREBASE_*
                </code>{' '}
                keys to{' '}
                <code className="rounded-sm bg-elevated px-1 py-0.5 text-[12px] text-ink">
                  builder/.env.local
                </code>
                , enable Google and Email/Password providers in Firebase Auth, and authorize this domain.
              </p>
              <Button variant="primary" size="md" block onClick={() => router.push('/')}>
                Continue locally without signing in
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="md"
                block
                disabled={busy}
                onClick={() => void onGoogle()}
                className="h-11 gap-3 border-line bg-white text-ink hover:bg-sunken"
              >
                <GoogleMark />
                {busy ? 'Please wait…' : 'Continue with Google'}
              </Button>

              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider text-faint">
                <span className="h-px flex-1 bg-lineSoft" />
                or
                <span className="h-px flex-1 bg-lineSoft" />
              </div>

              {!showEmail ? (
                <Button size="sm" block onClick={() => setShowEmail(true)}>
                  Use email and password
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted">
                    {mode === 'signIn'
                      ? 'Sign in with the email account tied to your builder drafts.'
                      : 'Create an account to sync drafts and publish itinerary links.'}
                  </p>
                  <label className="block">
                    <span className="label">Email</span>
                    <TextInput
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      autoFocus
                    />
                  </label>
                  <label className="block">
                    <span className="label">Password</span>
                    <TextInput
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                      placeholder="At least 6 characters"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={busy || !email.trim() || password.length < 6}
                      onClick={() => void onEmailSubmit()}
                    >
                      {busy ? 'Please wait…' : mode === 'signIn' ? 'Sign in' : 'Create account'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
                        setError(null);
                      }}
                    >
                      {mode === 'signIn' ? 'Need an account?' : 'Already have an account?'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error ? <p className="mt-4 text-sm font-semibold text-danger">{error}</p> : null}
        </div>

        <p className="mt-5 text-center text-[11px] text-muted">
          Your session stays signed in on this browser until you sign out.
        </p>
      </div>
    </div>
  );
}
