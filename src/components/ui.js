import React from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import Press from './Press';
import { colors, radius, spacing, type, elevation, hairlineWidth } from '../theme';

export function Card({ children, style, flat }) {
  return <View style={[s.card, flat && s.cardFlat, style]}>{children}</View>;
}

export function SectionTitle({ children, style }) {
  return <Text style={[s.section, style]}>{String(children).toUpperCase()}</Text>;
}

export function Pill({ label, tone }) {
  const map = { accent: s.pillAccent, primary: s.pillPrimary, light: s.pillLight };
  const textMap = { accent: s.pillTextOn, primary: s.pillTextOn, light: s.pillTextLight };
  return (
    <View style={[s.pill, map[tone]]}>
      <Text style={[s.pillText, textMap[tone]]}>{label}</Text>
    </View>
  );
}

export function Button({ title, onPress, variant, disabled, loading, style }) {
  const tone = {
    ghost: [s.btnGhost, s.btnTextGhost],
    light: [s.btnLight, s.btnTextLight],
    danger: [s.btnDanger, s.btnTextDanger],
  }[variant] || [];

  return (
    <Press onPress={onPress} disabled={disabled || loading} style={[s.btn, tone[0], style]} scaleTo={0.98}>
      <View style={s.btnInner}>
        {loading ? <ActivityIndicator size="small" color={variant ? colors.primary : '#fff'} /> : null}
        <Text style={[s.btnText, tone[1]]}>{title}</Text>
      </View>
    </Press>
  );
}

export function IconButton({ glyph, onPress, tone, size = 36, spinning }) {
  return (
    <Press onPress={onPress} style={[s.icon, { width: size, height: size, borderRadius: size / 2 }, tone === 'dark' && s.iconDark]} scaleTo={0.9}>
      {spinning ? (
        <ActivityIndicator size="small" color={tone === 'dark' ? '#fff' : colors.primary} />
      ) : (
        <Text style={[s.iconGlyph, tone === 'dark' && s.iconGlyphDark]}>{glyph}</Text>
      )}
    </Press>
  );
}

export function Divider({ inset = 0 }) {
  return <View style={[s.divider, { marginLeft: inset }]} />;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.borderSoft,
    ...elevation.sm,
  },
  cardFlat: { ...elevation.none, backgroundColor: colors.bgElevated, borderColor: colors.border },
  section: { ...type.label, marginBottom: spacing.sm, marginTop: spacing.xl },

  pill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignSelf: 'flex-start',
  },
  pillAccent: { backgroundColor: colors.accent },
  pillPrimary: { backgroundColor: colors.primary },
  pillLight: { backgroundColor: 'rgba(255,255,255,0.18)' },
  pillText: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.2, color: colors.textMuted },
  pillTextOn: { color: '#fff' },
  pillTextLight: { color: '#fff' },

  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btnGhost: { backgroundColor: 'transparent', borderWidth: hairlineWidth, borderColor: colors.border },
  btnLight: { backgroundColor: '#fff' },
  btnDanger: { backgroundColor: colors.dangerSoft },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15.5, letterSpacing: -0.2 },
  btnTextGhost: { color: colors.primary },
  btnTextLight: { color: colors.primary },
  btnTextDanger: { color: colors.danger },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: hairlineWidth,
    borderColor: colors.borderSoft,
    ...elevation.xs,
  },
  iconDark: { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.16)' },
  iconGlyph: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  iconGlyphDark: { color: '#fff' },

  divider: { height: hairlineWidth, backgroundColor: colors.borderSoft, marginVertical: spacing.md },
});
