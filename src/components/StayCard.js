import React from 'react';
import { Linking, Text, View, StyleSheet } from 'react-native';
import { Card } from './ui';
import LocationRow from './LocationRow';
import { colors, spacing, type } from '../theme';
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

export default function StayCard({ stay, showPreview }) {
  if (!stay) return null;
  const fmt = (k) => (k ? formatDate(k, { day: 'numeric', month: 'short' }) : '');

  return (
    <Card>
      <Text style={s.kicker}>WHERE YOU ARE STAYING</Text>
      <Text style={s.name}>{stay.name}</Text>
      {stay.city ? <Text style={s.city}>{stay.city}</Text> : null}

      <View style={s.grid}>
        <Field label="Check in" value={fmt(stay.checkIn)} />
        <Field label="Check out" value={fmt(stay.checkOut)} />
      </View>

      <Field label="Confirmation" value={stay.confirmation} />
      <Field
        label="Phone"
        value={stay.phone}
        onPress={stay.phone ? () => Linking.openURL('tel:' + stay.phone) : undefined}
      />

      {stay.notes ? <Text style={s.notes}>{stay.notes}</Text> : null}
      <LocationRow location={stay.location} showPreview={showPreview} />
    </Card>
  );
}

const s = StyleSheet.create({
  kicker: { ...type.label, marginBottom: spacing.xs },
  name: { ...type.h2 },
  city: { ...type.small, marginTop: 2 },
  grid: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.md },
  field: { marginTop: spacing.sm },
  label: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.6, color: colors.textMuted },
  value: { ...type.body, fontWeight: '600' },
  link: { color: colors.primary, textDecorationLine: 'underline' },
  notes: { ...type.small, marginTop: spacing.md, fontStyle: 'italic' },
});
