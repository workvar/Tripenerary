import { useMemo, useRef, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import DayPickerSheet from './DayPickerSheet';
import { colors, radius, spacing } from '@/theme';
import { formatDate } from '@/lib/dates';
import type { Day } from '@/types';

const THUMB = 18;
const RAIL = 4;
const MAX_TICKS = 21;

interface DateStripProps {
  readonly days: readonly Day[];
  readonly selectedDate: string | null;
  readonly todayDate: string;
  readonly onSelect: (date: string) => void;
}

/** Compact day slider: drag the thumb, tap the rail, or step with the arrows. */
export default function DateStrip({ days, selectedDate, todayDate, onSelect }: DateStripProps) {
  const [width, setWidth] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);

  const found = days.findIndex((d) => d.date === selectedDate);
  const index = found < 0 ? 0 : found;
  const last = days.length - 1;
  const ratio = last > 0 ? index / last : 0;
  const day = days[index];
  const travel = Math.max(0, width - THUMB);

  const live = useRef({ days, index, width, onSelect });
  live.current = { days, index, width, onSelect };

  const go = (next: number) => {
    const { days: ds, index: cur, onSelect: pick } = live.current;
    const clamped = Math.max(0, Math.min(ds.length - 1, next));
    const target = ds[clamped];
    if (target && clamped !== cur) pick(target.date);
  };

  const seek = (x: number) => {
    const { days: ds, width: w } = live.current;
    const span = Math.max(1, w - THUMB);
    go(Math.round(((x - THUMB / 2) / span) * (ds.length - 1)));
  };

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => seek(e.nativeEvent.locationX),
        onPanResponderMove: (e) => seek(e.nativeEvent.locationX),
      }),
    [],
  );

  if (!day) return null;

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);
  const showTicks = days.length > 1 && days.length <= MAX_TICKS;

  return (
    <View style={s.wrap}>
      <Pressable
        style={s.head}
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Day ${day.dayNumber}. Choose a different day`}
        hitSlop={6}
      >
        <Text style={s.dayNum}>{`Day ${day.dayNumber}`}</Text>
        <Text style={s.date}>
          {formatDate(day.date, { weekday: 'short', day: 'numeric', month: 'short' })}
        </Text>
        <Text style={s.caret}>▾</Text>
        {day.date === todayDate ? <Text style={s.today}>TODAY</Text> : null}
        <View style={s.spacer} />
        <Text style={s.count}>{`${index + 1} / ${days.length}`}</Text>
      </Pressable>

      <DayPickerSheet
        visible={pickerOpen}
        days={days}
        selectedDate={day.date}
        todayDate={todayDate}
        onSelect={onSelect}
        onClose={() => setPickerOpen(false)}
      />

      <View style={s.row}>
        <Step label="‹" onPress={() => go(live.current.index - 1)} disabled={index === 0} />

        <View
          style={s.track}
          onLayout={onLayout}
          accessibilityRole="adjustable"
          accessibilityLabel="Select day"
          accessibilityValue={{ min: 1, max: days.length, now: index + 1 }}
          onAccessibilityAction={(e) =>
            go(index + (e.nativeEvent.actionName === 'decrement' ? -1 : 1))
          }
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          {...pan.panHandlers}
        >
          <View pointerEvents="none" style={s.rail} />
          <View pointerEvents="none" style={[s.fill, { width: ratio * travel + THUMB / 2 }]} />

          {showTicks
            ? days.map((d, i) => (
                <View
                  key={d.date}
                  pointerEvents="none"
                  style={[
                    s.tick,
                    { left: THUMB / 2 + (last > 0 ? i / last : 0) * travel - 1.5 },
                    d.date === todayDate && s.tickToday,
                  ]}
                />
              ))
            : null}

          <View pointerEvents="none" style={[s.thumb, { left: ratio * travel }]} />
        </View>

        <Step label="›" onPress={() => go(live.current.index + 1)} disabled={index === last} />
      </View>
    </View>
  );
}

function Step({
  label,
  onPress,
  disabled,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      style={s.step}
    >
      <Text style={[s.stepText, disabled && s.stepDisabled]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },

  head: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  dayNum: { fontSize: 13.5, fontWeight: '800', letterSpacing: -0.2, color: colors.onDark },
  date: { fontSize: 12.5, fontWeight: '600', color: colors.onDarkMuted, marginLeft: spacing.sm },
  caret: { fontSize: 20, color: colors.onDarkMuted, marginLeft: spacing.xs, marginTop: 1 },
  today: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: colors.accent,
    marginLeft: spacing.sm,
  },
  spacer: { flex: 1 },
  count: { fontSize: 11, fontWeight: '700', color: colors.onDarkFaint },

  row: { flexDirection: 'row', alignItems: 'center' },
  step: { width: 26, alignItems: 'center' },
  stepText: { fontSize: 20, lineHeight: 24, fontWeight: '700', color: colors.onDarkMuted },
  stepDisabled: { color: 'rgba(255,255,255,0.18)' },

  track: { flex: 1, height: 28, justifyContent: 'center' },
  rail: {
    position: 'absolute',
    top: (28 - RAIL) / 2,
    left: THUMB / 2,
    right: THUMB / 2,
    height: RAIL,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  fill: {
    position: 'absolute',
    top: (28 - RAIL) / 2,
    left: THUMB / 2,
    height: RAIL,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  tick: {
    position: 'absolute',
    top: (28 - 3) / 2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  tickToday: { top: 12, width: 4, height: 4, borderRadius: 2, backgroundColor: colors.accent },
  thumb: {
    position: 'absolute',
    top: (28 - THUMB) / 2,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    backgroundColor: colors.onDark,
  },
});
