import { useEffect, useRef } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, elevation, radius, spacing, type } from '@/theme';
import { formatDate } from '@/lib/dates';
import type { Day } from '@/types';

const ROW_HEIGHT = 56;

interface DayPickerSheetProps {
  readonly visible: boolean;
  readonly days: readonly Day[];
  readonly selectedDate: string | null;
  readonly todayDate: string;
  readonly onSelect: (date: string) => void;
  readonly onClose: () => void;
}

/** Full list of days, opened from the day slider header. */
export default function DayPickerSheet({
  visible,
  days,
  selectedDate,
  todayDate,
  onSelect,
  onClose,
}: DayPickerSheetProps) {
  const ref = useRef<FlatList<Day>>(null);
  const index = days.findIndex((d) => d.date === selectedDate);

  useEffect(() => {
    if (!visible || index < 0) return;
    const id = setTimeout(
      () => ref.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 }),
      0,
    );
    return () => clearTimeout(id);
  }, [visible, index]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
      <View style={s.anchor} pointerEvents="box-none">
        <View style={s.sheet}>
          <View style={s.grabber} />
          <Text style={s.title}>Jump to a day</Text>

          <FlatList
            ref={ref}
            data={days as Day[]}
            keyExtractor={(d) => d.date}
            style={s.list}
            getItemLayout={(_, i) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * i, index: i })}
            onScrollToIndexFailed={() => undefined}
            renderItem={({ item }) => (
              <Row
                day={item}
                selected={item.date === selectedDate}
                isToday={item.date === todayDate}
                onPress={() => {
                  onSelect(item.date);
                  onClose();
                }}
              />
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

interface RowProps {
  readonly day: Day;
  readonly selected: boolean;
  readonly isToday: boolean;
  readonly onPress: () => void;
}

function Row({ day, selected, isToday, onPress }: RowProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[s.row, selected && s.rowSelected]}
    >
      <Text style={[s.dayNum, selected && s.selectedText]}>{`Day ${day.dayNumber}`}</Text>
      <Text style={[s.date, selected && s.selectedText]} numberOfLines={1}>
        {formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}
      </Text>
      <View style={s.spacer} />
      {isToday ? <Text style={s.today}>TODAY</Text> : null}
      {selected ? <Text style={s.check}>✓</Text> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrim },
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    ...elevation.lg,
  },
  grabber: {
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: { ...type.h3, marginBottom: spacing.sm },
  list: { flexGrow: 0 },

  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  rowSelected: { backgroundColor: colors.primarySoft },
  dayNum: { ...type.h3, width: 62 },
  date: { ...type.body, color: colors.textMuted },
  selectedText: { color: colors.primary },
  spacer: { flex: 1 },
  today: { fontSize: 9.5, fontWeight: '800', letterSpacing: 0.8, color: colors.accent },
  check: { ...type.h3, color: colors.primary, marginLeft: spacing.sm },
});
