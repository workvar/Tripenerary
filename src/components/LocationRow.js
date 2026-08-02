import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors, radius, spacing, type } from '../theme';
import { openInMaps, hasLocation } from '../lib/maps';
import MapPreview from './MapPreview';

export default function LocationRow({ location, showPreview }) {
  if (!hasLocation(location)) return null;
  const label = location.name || location.address || 'Open in Maps';

  return (
    <View style={s.wrap}>
      {showPreview ? (
        <TouchableOpacity activeOpacity={0.85} onPress={() => openInMaps(location)}>
          <MapPreview location={location} />
        </TouchableOpacity>
      ) : null}

      <View style={s.row}>
        <TouchableOpacity style={s.btn} onPress={() => openInMaps(location)} activeOpacity={0.8}>
          <Text style={s.btnText} numberOfLines={1}>{'\u{1F4CD}  ' + label}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btn, s.btnSmall]}
          onPress={() => openInMaps(location, 'directions')}
          activeOpacity={0.8}
        >
          <Text style={s.btnText}>{'\u{27A4}'}</Text>
        </TouchableOpacity>
      </View>

      {location.address && location.address !== label ? (
        <Text style={s.address}>{location.address}</Text>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: spacing.md, gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF3F2',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
  },
  btnSmall: { flex: 0, justifyContent: 'center', paddingHorizontal: spacing.lg },
  btnText: { ...type.small, color: colors.primary, fontWeight: '700' },
  address: { ...type.small },
});
