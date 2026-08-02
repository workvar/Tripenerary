import { useEffect, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, elevation, spacing } from '@/theme';
import { dayOfMonth, monthShort, weekdayShort } from '@/lib/dates';
import type { Day } from '@/types';

/** The selector is a true circle, so width and height are the same number. */
const DIAMETER = 48;
const GAP = spacing.md;
const STRIDE = DIAMETER + GAP;

interface CellProps {
  readonly day: Day;
  readonly selected: boolean;
  readonly isToday: boolean;
  readonly onPress: () => void;
}

function Cell({ day, selected, isToday, onPress }: CellProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      style={s.cell}
      hitSlop={4}
    >
      <Text style={s.weekday}>{weekdayShort(day.date).toUpperCase()}</Text>

      <View
        style={[
          s.circle,
          selected && s.circleSelected,
          !selected && isToday && s.circleToday,
        ]}
      >
        <Text style={[s.dayNum, selected && s.selectedText]}>{dayOfMonth(day.date)}</Text>
        <Text style={[s.month, selected && s.selectedMuted]}>{monthShort(day.date)}</Text>
      </View>

      <Text
        style={[s.dayLabel, selected && s.dayLabelSelected, !selected && isToday && s.dayLabelToday]}
        numberOfLines={1}
      >
        {`Day ${day.dayNumber}`}
      </Text>
    </Pressable>
  );
}

interface DateStripProps {
  readonly days: readonly Day[];
  readonly selectedDate: string | null;
  readonly todayDate: string;
  readonly onSelect: (date: string) => void;
}

export default function DateStrip({ days, selectedDate, todayDate, onSelect }: DateStripProps) {
  const ref = useRef<FlatList<Day>>(null);
  const index = days.findIndex((d) => d.date === selectedDate);

  useEffect(() => {
    if (index >= 0) ref.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
  }, [index]);

  return (
    <FlatList
      ref={ref}
      horizontal
      data={days as Day[]}
      keyExtractor={(d) => d.date}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.list}
      style={s.wrap}
      getItemLayout={(_, i) => ({ length: STRIDE, offset: STRIDE * i, index: i })}
      onScrollToIndexFailed={() => undefined}
      renderItem={({ item }) => (
        <Cell
          day={item}
          selected={item.date === selectedDate}
          isToday={item.date === todayDate}
          onPress={() => onSelect(item.date)}
        />
      )}
    />
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 0, paddingVertical: spacing.md },
  list: { paddingHorizontal: spacing.lg, gap: GAP },

  cell: { width: DIAMETER, alignItems: 'center' },
  weekday: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.onDarkMuted,
    marginBottom: 5,
  },
  circle: {
    width: DIAMETER,
    height: DIAMETER,
    borderRadius: DIAMETER / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  circleToday: { borderWidth: 1.5, borderColor: colors.accent },
  circleSelected: { backgroundColor: '#fff', ...elevation.sm },

  dayNum: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4, color: '#fff' },
  month: { fontSize: 9, fontWeight: '600', letterSpacing: 0.3, color: colors.onDarkMuted, marginTop: -1 },
  selectedText: { color: colors.primaryDark },
  selectedMuted: { color: colors.textMuted },

  dayLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 5,
    color: colors.onDarkFaint,
  },
  dayLabelSelected: { color: colors.onDark },
  dayLabelToday: { color: colors.accent },
});
