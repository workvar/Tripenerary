import React, { useEffect, useRef } from 'react';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { weekdayShort, dayOfMonth, monthShort } from '../lib/dates';

const ITEM_WIDTH = 62;

function Cell({ day, selected, isToday, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[s.cell, selected && s.cellSelected]}
    >
      <Text style={[s.weekday, selected && s.selectedText]}>{weekdayShort(day.date)}</Text>
      <Text style={[s.dayNum, selected && s.selectedText]}>{dayOfMonth(day.date)}</Text>
      <Text style={[s.month, selected && s.selectedText]}>{monthShort(day.date)}</Text>
      <View style={[s.dot, isToday && s.dotToday, selected && isToday && s.dotOnSelected]} />
    </TouchableOpacity>
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
    <View style={s.wrap}>
      <FlatList
        ref={ref}
        horizontal
        data={days}
        keyExtractor={(d) => d.date}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.list}
        getItemLayout={(_, i) => ({ length: ITEM_WIDTH + spacing.sm, offset: (ITEM_WIDTH + spacing.sm) * i, index: i })}
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
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { backgroundColor: colors.primary, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  cell: {
    width: ITEM_WIDTH,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  cellSelected: { backgroundColor: '#fff' },
  weekday: { fontSize: 10.5, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5 },
  dayNum: { fontSize: 19, fontWeight: '800', color: '#fff', marginTop: 1 },
  month: { fontSize: 10.5, color: 'rgba(255,255,255,0.75)' },
  selectedText: { color: colors.primaryDark },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 4, backgroundColor: 'transparent' },
  dotToday: { backgroundColor: colors.accent },
  dotOnSelected: { backgroundColor: colors.accent },
});
