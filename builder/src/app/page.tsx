'use client';

import Builder from '@/components/Builder';
import { AuthProvider } from '@/lib/useAuth';

export default function Page() {
  return (
    <AuthProvider>
      <Builder />
    </AuthProvider>
  );
}
