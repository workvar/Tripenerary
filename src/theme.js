import { Platform } from 'react-native';

export const colors = {
  bg: '#F6F4EF',
  bgElevated: '#FBFAF7',
  surface: '#FFFFFF',
  surfaceSunken: '#F1EEE7',
  primary: '#0E4F4C',
  primaryDark: '#093735',
  primarySoft: '#E6EEED',
  accent: '#D9713C',
  accentSoft: '#FBEDE5',
  text: '#1B1D1C',
  textMuted: '#6B7573',
  textFaint: '#9AA3A1',
  border: '#E3DFD6',
  borderSoft: '#EDEAE3',
  today: '#D9713C',
  danger: '#B3261E',
  dangerSoft: '#FDECEA',
  onDark: '#FFFFFF',
  onDarkMuted: 'rgba(255,255,255,0.68)',
  onDarkFaint: 'rgba(255,255,255,0.34)',
  scrim: 'rgba(9,55,53,0.55)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 44 };

export const radius = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, pill: 999 };

// iOS-flavoured type scale. Tight tracking on large text, loose on small caps.
export const type = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.6, color: colors.text },
  h1: { fontSize: 26, fontWeight: '800', letterSpacing: -0.4, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700', letterSpacing: -0.2, color: colors.text },
  h3: { fontSize: 16, fontWeight: '700', letterSpacing: -0.1, color: colors.text },
  body: { fontSize: 15, lineHeight: 22, letterSpacing: -0.1, color: colors.text },
  small: { fontSize: 13, lineHeight: 18, color: colors.textMuted },
  caption: { fontSize: 11.5, lineHeight: 15, color: colors.textFaint },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    color: colors.accent,
  },
  mono: Platform.select({
    ios: { fontFamily: 'Menlo' },
    android: { fontFamily: 'monospace' },
    default: {},
  }),
};

function elevate(opacity, blur, y, android) {
  return {
    shadowColor: '#1B1D1C',
    shadowOpacity: opacity,
    shadowRadius: blur,
    shadowOffset: { width: 0, height: y },
    elevation: android,
  };
}

export const elevation = {
  none: {},
  xs: elevate(0.04, 4, 1, 1),
  sm: elevate(0.06, 10, 3, 2),
  md: elevate(0.09, 18, 6, 5),
  lg: elevate(0.14, 30, 12, 10),
};

// Kept so older imports of `shadow` keep working.
export const shadow = elevation.sm;

export const motion = { fast: 180, base: 280, slow: 460 };

export const hairlineWidth = Platform.OS === 'android' ? 1 : 0.5;
export const hairline = { height: hairlineWidth, backgroundColor: colors.borderSoft };
