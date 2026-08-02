import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

// Fades and eases a screen in whenever `id` changes, so pushing into a trip
// or opening settings feels like a transition rather than a hard cut.
export default function ScreenTransition({ id, from = 'right', children }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [id, anim]);

  const offsets = { right: [26, 0], up: [22, 0], none: [0, 0] };
  const range = offsets[from] || offsets.right;

  const style = {
    opacity: anim,
    transform:
      from === 'up'
        ? [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: range }) }]
        : [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: range }) }],
  };

  return <Animated.View style={[s.fill, style]}>{children}</Animated.View>;
}

const s = StyleSheet.create({ fill: { flex: 1 } });
