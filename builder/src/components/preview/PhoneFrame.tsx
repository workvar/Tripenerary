'use client';

import type { ReactNode } from 'react';

/** Bezel-free surface. The preview fills whatever space the column gives it, so
 *  the app UI is seen at size rather than inside a phone illustration. */
export default function PhoneFrame({ children }: { readonly children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-line bg-bg shadow-sm">
      {children}
    </div>
  );
}
