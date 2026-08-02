import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, spacing, type, shadow } from '../theme';

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children }) {
  return <Text style={s.section}>{children}</Text>;
}

export function Pill({ label, tone }) {
  const isAccent = tone === 'accent';
  return (
    <View style={[s.pill, isAccent && s.pillAccent]}>
      <Text style={[s.pillText, isAccent && s.pillTextAccent]}>{label}</Text>
    </View>
  );
}

export function Button({ title, onPress, variant, disabled }) {
  const ghost = variant === 'ghost';
  const light = variant === 'light';
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[s.btn, ghost && s.btnGhost, light && s.btnLight, disabled && s.btnDisabled]}
    >
      <Text style={[s.btnText, ghost && s.btnTextGhost, light && s.btnTextLight]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Divider() {
  return <View style={s.divider} />;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  section: { ...type.label, marginBottom: spacing.sm, marginTop: spacing.xl },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    alignSelf: 'flex-start',
  },
  pillAccent: { backgroundColor: colors.accent },
  pillText: { fontSize: 11.5, fontWeight: '700', color: colors.textMuted },
  pillTextAccent: { color: '#fff' },
  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnLight: { backgroundColor: '#fff' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnTextGhost: { color: colors.primary },
  btnTextLight: { color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
});
