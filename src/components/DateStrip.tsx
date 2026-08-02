import { useEffect, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, elevation, radius, spacing } from '@/theme';
import { dayOfMonth, monthShort, weekdayShort } from '@/lib/dates';
import type { Day } from '@/types';

const ITEM_WIDTH = 58;
const GAP = spacing.sm;
const STRIDE = ITEM_WIDTH + GAP;

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
      style={({ pressed }) => [
        s.cell,
        selected && s.cellSelected,
        pressed && !selected && s.cellPressed,
      ]}
    >
      <Text style={[s.weekday, selected && s.selectedMuted]}>
        {weekdayShort(day.date).toUpperCase()}
      </Text>
      <Text style={[s.dayNum, selected && s.selectedText]}>{dayOfMonth(day.date)}</Text>
      <Text style={[s.month, selected && s.selectedMuted]}>{monthShort(day.date)}</Text>
      <View style={[s.dot, isToday && s.dotToday]} />
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
  cell: {
    width: ITEM_WIDTH,
    paddingVertical: 9,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  cellPressed: { backgroundColor: 'rgba(255,255,255,0.20)' },
  cellSelected: { backgroundColor: '#fff', ...elevation.sm },
  weekday: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.62)', letterSpacing: 0.8 },
  dayNum: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, color: '#fff', marginTop: 1 },
  month: { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.62)', letterSpacing: 0.4 },
  selectedText: { color: colors.primaryDark },
  selectedMuted: { color: colors.textMuted },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 5, backgroundColor: 'transparent' },
  dotToday: { backgroundColor: colors.accent },
});
