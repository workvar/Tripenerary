import { useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
  type ImageResizeMode,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, motion, radius } from '@/theme';

interface SmartImageProps {
  readonly uri: string | undefined;
  readonly style?: StyleProp<ViewStyle>;
  readonly radiusValue?: number;
  readonly resizeMode?: ImageResizeMode;
  readonly children?: ReactNode;
}

/** Remote image that fades in over a tinted placeholder and quietly disappears
 *  if the URL is dead, so a bad link never leaves a gap in the layout. */
export default function SmartImage({
  uri,
  style,
  radiusValue = radius.md,
  resizeMode = 'cover',
  children,
}: SmartImageProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [failed, setFailed] = useState(false);

  if (!uri || failed) return null;

  const reveal = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: motion.base,
      useNativeDriver: true,
    }).start();
  };

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

/** Warm the cache so the first scroll feels instant. */
export function prefetch(urls: readonly string[]): void {
  for (const url of urls) {
    if (url) void Image.prefetch(url).catch(() => false);
  }
}

const s = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.surfaceSunken },
});
