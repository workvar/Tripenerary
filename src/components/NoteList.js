import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, type } from '../theme';

export default function NoteList({ notes }) {
  if (!notes || notes.length === 0) return null;
  return (
    <View style={s.wrap}>
      <Text style={s.title}>LOCAL NOTES</Text>
      {notes.map((n, i) => (
        <Text key={i} style={s.note}>{'•  ' + n}</Text>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    backgroundColor: '#FAF1E7',
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderRadius: radius.sm,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  title: { ...type.label },
  note: { ...type.body, color: '#5B4636' },
});
