import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

interface CompassMarkProps {
  readonly size?: number;
  /** Drives a full rotation when interpolated from 0 to 1. */
  readonly spin?: Animated.Value;
  readonly tint?: string;
  readonly accent?: string;
}

/** The app mark: a compass rose drawn from plain views, so there is no image
 *  asset to ship and it stays crisp at any size.
 *
 *  The proportions here are the same ones scripts/generate-icons.py uses to
 *  render the launcher and splash icons. Change one, change both. */
export default function CompassMark({
  size = 96,
  spin,
  tint = '#fff',
  accent = colors.accent,
}: CompassMarkProps) {
  const needle = size * 0.44;
  const halfWidth = (size * 0.115) / 2;
  const hub = size * 0.09;

  const rotate = spin
    ? spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
    : '0deg';

  return (
    <View style={[s.wrap, { width: size, height: size, borderRadius: size / 2, borderColor: tint }]}>
      <View
        style={[
          s.inner,
          { width: size * 0.72, height: size * 0.72, borderRadius: size * 0.36, borderColor: tint },
        ]}
      />

      <Animated.View
        style={[s.needleWrap, { width: needle * 2, height: needle * 2, transform: [{ rotate }] }]}
      >
        {/* Two triangles meeting at the hub. Rendered with the border trick
            because RN has no polygon primitive and an SVG dependency is not
            worth it for one shape. */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            borderLeftWidth: halfWidth,
            borderRightWidth: halfWidth,
            borderBottomWidth: needle,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderBottomColor: accent,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            opacity: 0.55,
            borderLeftWidth: halfWidth,
            borderRightWidth: halfWidth,
            borderTopWidth: needle,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: tint,
          }}
        />
      </Animated.View>

      <View
        style={[s.hub, { width: hub, height: hub, borderRadius: hub / 2, backgroundColor: tint }]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  inner: { position: 'absolute', borderWidth: 1, opacity: 0.35 },
  needleWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  hub: { position: 'absolute' },
});
