import { Linking, StyleSheet, Text, View } from 'react-native';
import { Card } from './ui';
import LocationRow from './LocationRow';
import SmartImage from './SmartImage';
import Press from './Press';
import AttachmentList from './AttachmentList';
import { useLightbox } from './lightbox/context';
import { colors, hairlineWidth, radius, spacing, type } from '@/theme';
import { formatDate } from '@/lib/dates';
import type { Stay } from '@/types';

interface FieldProps {
  readonly label: string;
  readonly value: string;
  readonly onPress?: () => void;
}

function Field({ label, value, onPress }: FieldProps) {
  if (!value) return null;
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      <Text style={[s.value, onPress ? s.link : null]} onPress={onPress}>
        {value}
      </Text>
    </View>
  );
}

interface StayCardProps {
  readonly stay: Stay;
  readonly showPreview: boolean;
  readonly showImages: boolean;
}

const shortDate = (key: string): string =>
  key ? formatDate(key, { day: 'numeric', month: 'short' }) : '';

export default function StayCard({ stay, showPreview, showImages }: StayCardProps) {
  const openLightbox = useLightbox();

  return (
    <Card style={s.card}>
      {showImages && stay.image ? (
        <Press
          onPress={() => openLightbox([{ url: stay.image, caption: stay.name, credit: '' }])}
          scaleTo={0.99}
          accessibilityLabel="Enlarge hotel photo"
        >
          <SmartImage uri={stay.image} style={s.photo} radiusValue={radius.md} />
        </Press>
      ) : null}

      <Text style={s.kicker}>WHERE YOU ARE STAYING</Text>
      <Text style={s.name}>{stay.name}</Text>
      {stay.city ? <Text style={s.city}>{stay.city}</Text> : null}

      <View style={s.grid}>
        <Field label="CHECK IN" value={shortDate(stay.checkIn)} />
        <Field label="CHECK OUT" value={shortDate(stay.checkOut)} />
      </View>

      <Field label="CONFIRMATION" value={stay.confirmation} />
      <Field
        label="PHONE"
        value={stay.phone}
        {...(stay.phone ? { onPress: () => void Linking.openURL(`tel:${stay.phone}`) } : {})}
      />

      {stay.notes ? (
        <View style={s.noteWrap}>
          <Text style={s.notes}>{stay.notes}</Text>
        </View>
      ) : null}

      <AttachmentList attachments={stay.attachments} label="BOOKING DOCUMENTS" />

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
