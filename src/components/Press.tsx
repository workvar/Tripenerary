import { useRef, type ReactNode } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

interface PressProps {
  readonly children: ReactNode;
  readonly onPress?: () => void;
  readonly onLongPress?: () => void;
  readonly style?: StyleProp<ViewStyle>;
  readonly scaleTo?: number;
  readonly disabled?: boolean;
  readonly accessibilityLabel?: string;
}

/** Subtle press-in scale, the way iOS controls behave. Wraps any content. */
export default function Press({
  children,
  onPress,
  onLongPress,
  style,
  scaleTo = 0.97,
  disabled = false,
  accessibilityLabel,
}: PressProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const spring = (toValue: number) => {
    Animated.spring(scale, { toValue, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => spring(scaleTo)}
      onPressOut={() => spring(1)}
    >
      <Animated.View
        style={[style, { transform: [{ scale }] }, disabled ? { opacity: 0.5 } : null]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
