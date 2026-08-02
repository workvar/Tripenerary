import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';

type Direction = 'right' | 'up' | 'none';

const OFFSETS: Record<Direction, [number, number]> = {
  right: [26, 0],
  up: [22, 0],
  none: [0, 0],
};

interface ScreenTransitionProps {
  /** Changing this replays the entrance. */
  readonly id: string;
  readonly from?: Direction;
  readonly children: ReactNode;
}

/** Fades and eases a screen in whenever `id` changes, so pushing into a trip
 *  or opening settings feels like a transition rather than a hard cut. */
export default function ScreenTransition({ id, from = 'right', children }: ScreenTransitionProps) {
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

  const outputRange = OFFSETS[from];
  const shift = anim.interpolate({ inputRange: [0, 1], outputRange });

  return (
    <Animated.View
      style={[
        s.fill,
        { opacity: anim, transform: [from === 'up' ? { translateY: shift } : { translateX: shift }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const s = StyleSheet.create({ fill: { flex: 1 } });
