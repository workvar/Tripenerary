export const colors = {
  bg: '#F6F4EF',
  surface: '#FFFFFF',
  primary: '#0E4F4C',
  primaryDark: '#093735',
  accent: '#D9713C',
  text: '#1B1D1C',
  textMuted: '#6B7573',
  border: '#E3DFD6',
  today: '#D9713C',
  danger: '#B3261E',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 18, pill: 999 };

export const type = {
  h1: { fontSize: 24, fontWeight: '700', color: colors.text },
  h2: { fontSize: 19, fontWeight: '700', color: colors.text },
  h3: { fontSize: 15, fontWeight: '700', color: colors.text },
  body: { fontSize: 14.5, lineHeight: 21, color: colors.text },
  small: { fontSize: 12.5, color: colors.textMuted },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: colors.accent },
};

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
