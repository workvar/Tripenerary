import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors, radius } from '../theme';
import { hasCoords } from '../lib/maps';

// Small non-interactive preview. Tapping is handled by the parent row.
export default function MapPreview({ location, height = 130 }) {
  if (!hasCoords(location)) return null;

  const region = {
    latitude: location.lat,
    longitude: location.lng,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={[s.wrap, { height }]} pointerEvents="none">
      <MapView
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        liteMode
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        toolbarEnabled={false}
      >
        <Marker coordinate={{ latitude: location.lat, longitude: location.lng }} />
      </MapView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.border,
  },
});
