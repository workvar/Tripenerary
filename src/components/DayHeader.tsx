import { StyleSheet, Text, View } from 'react-native';
import { Pill } from './ui';
import SmartImage from './SmartImage';
import { colors, elevation, radius, spacing, type } from '@/theme';
import { longDate, relativeLabel } from '@/lib/dates';
import type { Day } from '@/types';

interface DayHeaderProps {
  readonly day: Day;
  readonly totalDays: number;
  readonly todayDate: string;
  readonly showImages: boolean;
}

export default function DayHeader({ day, totalDays, todayDate, showImages }: DayHeaderProps) {
  const isToday = day.date === todayDate;
  const hero = showImages ? day.image : '';
  const counter = `DAY ${day.dayNumber} OF ${totalDays}`;
  const base = day.base.toUpperCase();
  const kicker = hero ? base : [counter, base].filter(Boolean).join('  ·  ');

  return (
    <View style={s.wrap}>
      {hero ? (
        <SmartImage uri={hero} style={s.hero} radiusValue={radius.lg}>
          <View style={s.scrim} />
          <View style={s.heroText}>
            <Text style={s.heroKicker}>{counter}</Text>
            {day.title ? (
              <Text style={s.heroTitle} numberOfLines={2}>
                {day.title}
              </Text>
            ) : null}
          </View>
        </SmartImage>
      ) : null}

      <View style={s.topRow}>
        <Text style={s.kicker} numberOfLines={1}>
          {kicker}
        </Text>
        <Pill label={relativeLabel(day.date, todayDate)} tone={isToday ? 'accent' : 'neutral'} />
      </View>

      {!hero && day.title ? <Text style={s.title}>{day.title}</Text> : null}
      <Text style={s.date}>{longDate(day.date)}</Text>
      {day.summary ? <Text style={s.summary}>{day.summary}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingTop: spacing.lg },
  hero: { height: 200, marginBottom: spacing.lg, justifyContent: 'flex-end', ...elevation.md },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9,55,53,0.34)' },
  heroText: { padding: spacing.lg },
  heroKicker: { ...type.label, color: 'rgba(255,255,255,0.85)' },
  heroTitle: { fontSize: 25, fontWeight: '800', letterSpacing: -0.4, color: '#fff', marginTop: 4 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  kicker: { ...type.label, flex: 1 },
  title: { ...type.h1, marginTop: spacing.sm },
  date: { ...type.small, marginTop: 3 },
  summary: { ...type.body, color: colors.textMuted, marginTop: spacing.md },
});
