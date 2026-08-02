import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Pill } from './ui';
import { colors, spacing, type } from '../theme';
import { longDate, relativeLabel } from '../lib/dates';

export default function DayHeader({ day, totalDays, todayDate }) {
  const rel = relativeLabel(day.date, todayDate);
  const isToday = day.date === todayDate;

  return (
    <View style={s.wrap}>
      <View style={s.topRow}>
        <Text style={s.kicker}>
          {'DAY ' + day.dayNumber + ' OF ' + totalDays + (day.base ? '  ·  ' + day.base.toUpperCase() : '')}
        </Text>
        <Pill label={rel} tone={isToday ? 'accent' : undefined} />
      </View>

      {day.title ? <Text style={s.title}>{day.title}</Text> : null}
      <Text style={s.date}>{longDate(day.date)}</Text>
      {day.summary ? <Text style={s.summary}>{day.summary}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: spacing.lg },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  kicker: { ...type.label, flex: 1 },
  title: { ...type.h1, marginTop: spacing.sm },
  date: { ...type.small, marginTop: 2 },
  summary: { ...type.body, marginTop: spacing.md, color: colors.textMuted },
});
