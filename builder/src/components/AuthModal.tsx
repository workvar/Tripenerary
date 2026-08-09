'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import TextInput from '@/components/ui/TextInput';
import type { AuthApi } from '@/lib/useAuth';

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly auth: AuthApi;
}

export default function AuthModal({ open, onClose, auth }: Props) {
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setMode('signIn');
      setEmail('');
      setPassword('');
      setError(null);
      setBusy(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = mode === 'signIn' ? await auth.signIn(email, password) : await auth.signUp(email, password);
    setBusy(false);
    if (res.ok) onClose();
    else setError(res.error);
  };

  return (
    <Modal title={mode === 'signIn' ? 'Sign in' : 'Create account'} onClose={onClose} width="md">
      <p className="mb-4 text-sm text-muted">
        {mode === 'signIn'
          ? 'Sign in to save this trip in the cloud and publish a shareable link for the app.'
          : 'Create an account to keep drafts synced and publish itinerary links.'}
      </p>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Email</span>
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
          <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Password</span>
          <TextInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
            placeholder="At least 6 characters"
          />
        </label>
      </div>

      {error ? <p className="mt-3 text-sm font-semibold text-danger">{error}</p> : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          disabled={busy || !email.trim() || password.length < 6}
          onClick={() => void submit()}
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
    </Modal>
  );
}
