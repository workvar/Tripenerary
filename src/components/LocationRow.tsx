import { StyleSheet, Text, View } from 'react-native';
import Press from './Press';
import MapPreview from './MapPreview';
import { colors, hairlineWidth, radius, spacing, type } from '@/theme';
import { hasLocation, openInMaps } from '@/lib/maps';
import type { TripLocation } from '@/types';

interface LocationRowProps {
  readonly location: TripLocation | null;
  readonly showPreview: boolean;
}

export default function LocationRow({ location, showPreview }: LocationRowProps) {
  if (!hasLocation(location)) return null;

  const label = location.name || location.address || 'Open in Maps';
  const open = () => void openInMaps(location);
  const directions = () => void openInMaps(location, 'directions');

  return (
    <View style={s.wrap}>
      {showPreview ? (
        <Press onPress={open} scaleTo={0.985} accessibilityLabel={`Map of ${label}`}>
          <MapPreview location={location} />
        </Press>
      ) : null}

      <View style={s.row}>
        <Press style={s.btn} onPress={open} scaleTo={0.98} accessibilityLabel={`Open ${label} in Maps`}>
          <View style={s.btnInner}>
            <Text style={s.glyph}>{'\u{1F4CD}'}</Text>
            <Text style={s.btnText} numberOfLines={1}>
              {label}
            </Text>
          </View>
        </Press>
        <Press
          style={[s.btn, s.btnSmall]}
          onPress={directions}
          scaleTo={0.94}
          accessibilityLabel={`Directions to ${label}`}
        >
          <Text style={s.btnText}>{'\u{27A4}'}</Text>
        </Press>
      </View>

      {location.address && location.address !== label ? (
        <Text style={s.address} numberOfLines={2}>
          {location.address}
        </Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm, alignItems: 'stretch' },
  btn: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderWidth: hairlineWidth,
    borderColor: 'rgba(14,79,76,0.10)',
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
  },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  btnSmall: { flex: 0, alignItems: 'center', paddingHorizontal: spacing.lg },
  glyph: { fontSize: 12 },
  btnText: { ...type.small, color: colors.primary, fontWeight: '700', flexShrink: 1 },
  address: { ...type.caption, color: colors.textMuted },
});
