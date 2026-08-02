import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, type } from '../theme';

export default function NoteList({ notes }) {
  if (!notes || notes.length === 0) return null;
  return (
    <View style={s.wrap}>
      <Text style={s.title}>LOCAL NOTES</Text>
      {notes.map((n, i) => (
        <View key={i} style={s.row}>
          <View style={s.bullet} />
          <Text style={s.note}>{n}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { ...type.label },
  row: { flexDirection: 'row', gap: spacing.md },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, marginTop: 8 },
  note: { ...type.body, color: '#5B4636', flex: 1 },
});
