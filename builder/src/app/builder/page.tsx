'use client';

import Builder from '@/components/Builder';
import { AuthProvider } from '@/lib/useAuth';

export default function BuilderPage() {
  return (
    <AuthProvider>
      <Builder />
    </AuthProvider>
  );
}
