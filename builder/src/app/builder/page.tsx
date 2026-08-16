'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Builder from '@/components/Builder';
import { useAuth, AuthProvider } from '@/lib/useAuth';

function BuilderContent() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.ready) return;
    if (auth.available && !auth.user) {
      router.replace('/login');
    }
  }, [auth.ready, auth.available, auth.user, router]);

  if (!auth.ready) {
    return <div className="p-10 text-sm text-muted">Checking session…</div>;
  }

  if (auth.available && !auth.user) {
    return <div className="p-10 text-sm text-muted">Redirecting to sign in…</div>;
  }

  return <Builder />;
}

export default function BuilderPage() {
  return (
    <AuthProvider>
      <BuilderContent />
    </AuthProvider>
  );
}
