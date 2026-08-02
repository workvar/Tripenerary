import React from 'react';
import { Linking, Text, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, type } from '../theme';
import LocationRow from './LocationRow';

const ICONS = {
  sight: '\u{1F5FA}',
  food: '\u{1F374}',
  travel: '\u{1F697}',
  flight: '\u{2708}',
  hotel: '\u{1F3E8}',
  activity: '\u{1F3DE}',
  rest: '\u{1F334}',
  note: '\u{1F4CC}',
};

export default function ScheduleItem({ item, isLast, showPreview }) {
  return (
    <View style={s.row}>
      <View style={s.rail}>
        <Text style={s.time}>{item.time || ' '}</Text>
        <View style={s.markerWrap}>
          <View style={s.marker} />
          {!isLast ? <View style={s.line} /> : null}
        </View>
      </View>

      <View style={s.body}>
        <View style={s.titleRow}>
          <Text style={s.icon}>{ICONS[item.type] || ICONS.activity}</Text>
          <Text style={s.title}>{item.title}</Text>
        </View>

        {item.endTime ? <Text style={s.until}>{'until ' + item.endTime}</Text> : null}
        {item.description ? <Text style={s.desc}>{item.description}</Text> : null}
        {item.cost ? <Text style={s.cost}>{item.cost}</Text> : null}

        {item.booking && (item.booking.ref || item.booking.url) ? (
          <Text
            style={[s.cost, item.booking.url && s.link]}
            onPress={() => item.booking.url && Linking.openURL(item.booking.url)}
          >
            {'Booking' + (item.booking.ref ? ': ' + item.booking.ref : '')}
          </Text>
        ) : null}

        <LocationRow location={item.location} showPreview={showPreview} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md },
  rail: { width: 52, alignItems: 'flex-end' },
  time: { fontSize: 12.5, fontWeight: '800', color: colors.primary },
  markerWrap: { position: 'absolute', right: -spacing.md + 3, top: 3, alignItems: 'center', bottom: 0 },
  marker: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.accent },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 2 },
  body: { flex: 1, paddingBottom: spacing.xl, marginLeft: spacing.sm },
  titleRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start' },
  icon: { fontSize: 14, marginTop: 1 },
  title: { ...type.h3, flex: 1 },
  until: { ...type.small, marginTop: 2 },
  desc: { ...type.body, marginTop: spacing.xs },
  cost: { ...type.small, marginTop: spacing.xs, fontWeight: '700', color: colors.accent },
  link: { textDecorationLine: 'underline' },
});
