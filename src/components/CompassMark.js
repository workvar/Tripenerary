import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

// The app mark: a compass rose drawn from plain views, so there is no
// image asset to ship and it stays crisp at any size.
export default function CompassMark({ size = 96, spin, tint = '#fff', accent = colors.accent }) {
  const ring = { width: size, height: size, borderRadius: size / 2, borderColor: tint };
  const needle = size * 0.44;

  const rotate = spin
    ? spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
    : '0deg';

  return (
    <View style={[s.wrap, ring]}>
      <View style={[s.inner, { width: size * 0.72, height: size * 0.72, borderRadius: size * 0.36, borderColor: tint }]} />
      <Animated.View
        style={[s.needleWrap, { width: needle * 2, height: needle * 2, transform: [{ rotate }] }]}
      >
        <View style={[s.needle, { height: needle, backgroundColor: accent }]} />
        <View style={[s.needle, s.needleTail, { height: needle, backgroundColor: tint }]} />
      </Animated.View>
      <View style={[s.hub, { backgroundColor: tint }]} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  inner: { position: 'absolute', borderWidth: 1, opacity: 0.35 },
  needleWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  needle: { position: 'absolute', width: 4, borderRadius: 2, bottom: 0 },
  needleTail: { top: 0, bottom: undefined, opacity: 0.55 },
  hub: { width: 7, height: 7, borderRadius: 4, position: 'absolute' },
});
