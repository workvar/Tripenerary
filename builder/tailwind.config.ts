import type { Config } from 'tailwindcss';

/** Mirrors src/theme.ts in the Expo app so the preview matches the phone. */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F6F4EF',
        elevated: '#FBFAF7',
        surface: '#FFFFFF',
        sunken: '#F1EEE7',
        primary: '#0E4F4C',
        primaryDark: '#093735',
        primarySoft: '#E6EEED',
        accent: '#D9713C',
        accentSoft: '#FBEDE5',
        ink: '#1B1D1C',
        muted: '#6B7573',
        faint: '#9AA3A1',
        line: '#E3DFD6',
        lineSoft: '#EDEAE3',
        danger: '#B3261E',
        dangerSoft: '#FDECEA',
      },
      borderRadius: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
      },
    },
  },
  plugins: [],
} satisfies Config;
