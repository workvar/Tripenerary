import React, { useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { colors, motion, radius } from '../theme';

// Remote image that fades in over a tinted placeholder and quietly
// disappears if the URL is dead, so a bad link never breaks a layout.
export default function SmartImage({ uri, style, radiusValue = radius.md, resizeMode = 'cover', children }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [failed, setFailed] = useState(false);

  if (!uri || failed) return null;

  const reveal = () =>
    Animated.timing(opacity, {
      toValue: 1,
      duration: motion.base,
      useNativeDriver: true,
    }).start();

  return (
    <View style={[s.wrap, { borderRadius: radiusValue }, style]}>
      <Animated.Image
        source={{ uri }}
        onLoad={reveal}
        onError={() => setFailed(true)}
        resizeMode={resizeMode}
        style={[StyleSheet.absoluteFill, { opacity }]}
      />
      {children}
    </View>
  );
}

// Convenience: prefetch a list of URLs so the first scroll feels instant.
export function prefetch(urls) {
  (urls || []).filter(Boolean).forEach((u) => Image.prefetch(u).catch(() => {}));
}

const s = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.surfaceSunken },
});
