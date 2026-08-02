import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Press from './Press';
import MapPreview from './MapPreview';
import { colors, radius, spacing, type, hairlineWidth } from '../theme';
import { openInMaps, hasLocation } from '../lib/maps';

export default function LocationRow({ location, showPreview }) {
  if (!hasLocation(location)) return null;
  const label = location.name || location.address || 'Open in Maps';

  return (
    <View style={s.wrap}>
      {showPreview ? (
        <Press onPress={() => openInMaps(location)} scaleTo={0.985}>
          <MapPreview location={location} />
        </Press>
      ) : null}

      <View style={s.row}>
        <Press style={s.btn} onPress={() => openInMaps(location)} scaleTo={0.98}>
          <View style={s.btnInner}>
            <Text style={s.glyph}>{'\u{1F4CD}'}</Text>
            <Text style={s.btnText} numberOfLines={1}>{label}</Text>
          </View>
        </Press>
        <Press style={[s.btn, s.btnSmall]} onPress={() => openInMaps(location, 'directions')} scaleTo={0.94}>
          <Text style={s.btnText}>{'\u{27A4}'}</Text>
        </Press>
      </View>

      {location.address && location.address !== label ? (
        <Text style={s.address} numberOfLines={2}>{location.address}</Text>
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
