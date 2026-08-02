import { Linking, StyleSheet, Text, View } from 'react-native';
import LocationRow from './LocationRow';
import ImageStrip from './ImageStrip';
import { colors, elevation, hairlineWidth, radius, spacing, type } from '@/theme';
import type { ItemType, ScheduleItem as Item } from '@/types';

const ICONS: Record<ItemType, string> = {
  sight: '\u{1F5FA}',
  food: '\u{1F374}',
  travel: '\u{1F697}',
  flight: '\u{2708}',
  hotel: '\u{1F3E8}',
  activity: '\u{1F3DE}',
  rest: '\u{1F334}',
  note: '\u{1F4CC}',
};

const LABELS: Record<ItemType, string> = {
  sight: 'Sight',
  food: 'Food',
  travel: 'Travel',
  flight: 'Flight',
  hotel: 'Hotel',
  activity: 'Activity',
  rest: 'Rest',
  note: 'Note',
};

interface ScheduleItemProps {
  readonly item: Item;
  readonly showPreview: boolean;
  readonly showImages: boolean;
}

/** Full-bleed block: time header on top, everything else stacked beneath it.
 *  No left rail, so nothing is wasted on an empty gutter. */
export default function ScheduleItem({ item, showPreview, showImages }: ScheduleItemProps) {
  const booking = item.booking?.ref || item.booking?.url ? item.booking : null;

  return (
    <View style={s.block}>
      <View style={s.timeRow}>
        <View style={s.dot} />
        <Text style={s.time}>{item.time || 'Any time'}</Text>
        {item.endTime ? <Text style={s.endTime}>{`– ${item.endTime}`}</Text> : null}
        <View style={s.spacer} />
        <View style={s.typeChip}>
          <Text style={s.typeGlyph}>{ICONS[item.type]}</Text>
          <Text style={s.typeText}>{LABELS[item.type]}</Text>
        </View>
      </View>

      <View style={s.card}>
        <Text style={s.title}>{item.title}</Text>
        {item.description ? <Text style={s.desc}>{item.description}</Text> : null}

        {showImages ? <ImageStrip images={item.images} height={170} /> : null}

        {item.cost || booking ? (
          <View style={s.metaRow}>
            {item.cost ? (
              <View style={s.costChip}>
                <Text style={s.costText}>{item.cost}</Text>
              </View>
            ) : null}
            {booking ? (
              <Text
                style={[s.booking, booking.url ? s.link : null]}
                onPress={booking.url ? () => void Linking.openURL(booking.url) : undefined}
              >
                {`Booking${booking.ref ? ` · ${booking.ref}` : ''}`}
              </Text>
            ) : null}
          </View>
        ) : null}

        <LocationRow location={item.location} showPreview={showPreview} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  block: { marginBottom: spacing.lg },

  timeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, paddingLeft: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent, marginRight: spacing.sm },
  time: { fontSize: 13.5, fontWeight: '800', letterSpacing: 0.2, color: colors.primary },
  endTime: { fontSize: 13, fontWeight: '600', color: colors.textFaint, marginLeft: 5 },
  spacer: { flex: 1 },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
  },
  typeGlyph: { fontSize: 11 },
  typeText: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.1 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.borderSoft,
    padding: spacing.lg,
    ...elevation.sm,
  },
  title: { ...type.h2 },
  desc: { ...type.body, color: colors.textMuted, marginTop: spacing.sm },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    flexWrap: 'wrap',
  },
  costChip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.xs,
  },
  costText: { fontSize: 12.5, fontWeight: '800', color: colors.accent },
  booking: { ...type.small, fontWeight: '700', color: colors.primary },
  link: { textDecorationLine: 'underline' },
});
