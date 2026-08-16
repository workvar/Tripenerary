'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/lib/useAuth';

export default function Providers({ children }: { readonly children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
