import React from 'react';
import { Linking, Text, View, StyleSheet } from 'react-native';
import { Card } from './ui';
import LocationRow from './LocationRow';
import SmartImage from './SmartImage';
import { colors, radius, spacing, type, hairlineWidth } from '../theme';
import { formatDate } from '../lib/dates';

function Field({ label, value, onPress }) {
  if (!value) return null;
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <Text style={[s.value, onPress && s.link]} onPress={onPress}>{value}</Text>
    </View>
  );
}

export default function StayCard({ stay, showPreview, showImages }) {
  if (!stay) return null;
  const fmt = (k) => (k ? formatDate(k, { day: 'numeric', month: 'short' }) : '');

  return (
    <Card style={s.card}>
      {showImages && stay.image ? (
        <SmartImage uri={stay.image} style={s.photo} radiusValue={radius.md} />
      ) : null}

      <Text style={s.kicker}>WHERE YOU ARE STAYING</Text>
      <Text style={s.name}>{stay.name}</Text>
      {stay.city ? <Text style={s.city}>{stay.city}</Text> : null}

      <View style={s.grid}>
        <Field label="CHECK IN" value={fmt(stay.checkIn)} />
        <Field label="CHECK OUT" value={fmt(stay.checkOut)} />
      </View>

      <Field label="CONFIRMATION" value={stay.confirmation} />
      <Field
        label="PHONE"
        value={stay.phone}
        onPress={stay.phone ? () => Linking.openURL('tel:' + stay.phone) : undefined}
      />

      {stay.notes ? (
        <View style={s.noteWrap}><Text style={s.notes}>{stay.notes}</Text></View>
      ) : null}
      <LocationRow location={stay.location} showPreview={showPreview} />
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: spacing.lg },
  photo: { height: 150, marginBottom: spacing.lg },
  kicker: { ...type.label, marginBottom: spacing.xs },
  name: { ...type.h2 },
  city: { ...type.small, marginTop: 2 },
  grid: { flexDirection: 'row', gap: spacing.xxl, marginTop: spacing.sm },
  field: { marginTop: spacing.md },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.9, color: colors.textFaint },
  value: { ...type.body, fontWeight: '600', marginTop: 2 },
  link: { color: colors.primary },
  noteWrap: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: hairlineWidth,
    borderTopColor: colors.borderSoft,
  },
  notes: { ...type.small, lineHeight: 20 },
});
