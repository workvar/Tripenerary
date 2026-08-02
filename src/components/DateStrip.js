import React, { useEffect, useRef } from 'react';
import { FlatList, Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, elevation } from '../theme';
import { weekdayShort, dayOfMonth, monthShort } from '../lib/dates';

const ITEM_WIDTH = 58;
const GAP = spacing.sm;

function Cell({ day, selected, isToday, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.cell, selected && s.cellSelected, pressed && !selected && s.cellPressed]}>
      <Text style={[s.weekday, selected && s.selectedMuted]}>{weekdayShort(day.date).toUpperCase()}</Text>
      <Text style={[s.dayNum, selected && s.selectedText]}>{dayOfMonth(day.date)}</Text>
      <Text style={[s.month, selected && s.selectedMuted]}>{monthShort(day.date)}</Text>
      <View style={[s.dot, isToday && s.dotToday]} />
    </Pressable>
  );
}

export default function DateStrip({ days, selectedDate, todayDate, onSelect }) {
  const ref = useRef(null);
  const index = days.findIndex((d) => d.date === selectedDate);

  useEffect(() => {
    if (index >= 0 && ref.current) {
      ref.current.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
  }, [index]);

  return (
    <FlatList
      ref={ref}
      horizontal
      data={days}
      keyExtractor={(d) => d.date}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.list}
      style={s.wrap}
      getItemLayout={(_, i) => ({ length: ITEM_WIDTH + GAP, offset: (ITEM_WIDTH + GAP) * i, index: i })}
      onScrollToIndexFailed={() => {}}
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
  wrap: { flexGrow: 0, paddingBottom: spacing.md },
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
