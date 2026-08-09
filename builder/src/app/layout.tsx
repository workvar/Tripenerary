import type { Metadata } from 'next';
import Providers from '@/app/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trip Companion Builder',
  description: 'Build, preview and export Trip Companion itinerary JSON.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
