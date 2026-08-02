import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Press from './Press';
import { colors, elevation, hairlineWidth, radius, spacing, type } from '@/theme';
import { regionFor, routeUrl, type RouteStop } from '@/lib/route';

interface RouteMapProps {
  readonly stops: readonly RouteStop[];
  readonly height?: number;
}

/** The whole day drawn as one shape: every pinned stop in order, closed back to
 *  the start so an out-and-back day reads as a perimeter. */
export default function RouteMap({ stops, height = 220 }: RouteMapProps) {
  const region = regionFor(stops);
  if (!region || stops.length < 2) return null;

  const coords = stops.map((s) => ({ latitude: s.lat, longitude: s.lng }));
  const url = routeUrl(stops);
  const returnIndex = stops.findIndex((s) => s.isReturn);
  const outbound = returnIndex > 0 ? coords.slice(0, returnIndex + 1) : coords;
  const closing = returnIndex > 0 ? coords.slice(returnIndex - 1) : [];

  return (
    <View style={s.wrap}>
      <View style={[s.map, { height }]} pointerEvents="none">
        <MapView
          style={StyleSheet.absoluteFill}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={region}
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
          toolbarEnabled={false}
        >
          <Polyline coordinates={outbound} strokeColor={colors.primary} strokeWidth={3} />
          {closing.length > 1 ? (
            <Polyline
              coordinates={closing}
              strokeColor={colors.accent}
              strokeWidth={3}
              lineDashPattern={[6, 6]}
            />
          ) : null}

          {stops.map((stop) =>
            stop.isReturn ? null : (
              <Marker
                key={stop.key}
                coordinate={{ latitude: stop.lat, longitude: stop.lng }}
                title={stop.name}
                tracksViewChanges={false}
              >
                <View style={[s.pin, stop.key === 'stay-start' && s.pinStay]}>
                  <Text style={s.pinText}>{stop.key === 'stay-start' ? '\u{2302}' : stop.label}</Text>
                </View>
              </Marker>
            )
          )}
        </MapView>
      </View>

      {url ? (
        <Press style={s.action} onPress={() => Linking.openURL(url)} scaleTo={0.99}>
          <Text style={s.actionText}>{`Open route in Maps  \u{203A}`}</Text>
        </Press>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: hairlineWidth,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    ...elevation.sm,
  },
  map: { backgroundColor: colors.surfaceSunken },

  pin: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#fff',
    ...elevation.sm,
  },
  pinStay: { backgroundColor: colors.accent },
  pinText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  action: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderTopWidth: hairlineWidth,
    borderTopColor: colors.borderSoft,
  },
  actionText: { ...type.small, color: colors.primary, fontWeight: '700' },
});
