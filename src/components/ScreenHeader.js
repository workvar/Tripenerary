import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Press from './Press';
import { colors, spacing } from '../theme';

// Shared modal-style header: title on the left, a single dismiss action right.
export default function ScreenHeader({ title, onClose, actionLabel = 'Done' }) {
  return (
    <View style={s.header}>
      <Text style={s.title}>{title}</Text>
      <Press onPress={onClose} style={s.action} scaleTo={0.94}>
        <Text style={s.actionText}>{actionLabel}</Text>
      </Press>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.primary,
  },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, color: '#fff' },
  action: { paddingVertical: 6, paddingHorizontal: spacing.sm },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 15.5 },
});
