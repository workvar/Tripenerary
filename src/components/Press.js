import React, { useRef } from 'react';
import { Animated, Pressable } from 'react-native';

// Subtle press-in scale, the way iOS controls behave. Wraps any content.
export default function Press({ children, onPress, onLongPress, style, scaleTo = 0.97, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (to) =>
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      onPressIn={() => spring(scaleTo)}
      onPressOut={() => spring(1)}
    >
      <Animated.View style={[style, { transform: [{ scale }] }, disabled && { opacity: 0.5 }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
