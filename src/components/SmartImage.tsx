import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  type ImageErrorEventData,
  type ImageResizeMode,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, motion, radius, type } from '@/theme';
import { IMAGE_HEADERS } from '@/config';

/** If `onLoad` never arrives (cached decodes and some CDNs skip it), reveal anyway
 *  rather than leaving a permanently transparent image. */
const REVEAL_FAILSAFE_MS = 2_500;

interface SmartImageProps {
  readonly uri: string | undefined;
  readonly style?: StyleProp<ViewStyle>;
  readonly radiusValue?: number;
  readonly resizeMode?: ImageResizeMode;
  readonly children?: ReactNode;
  /** Show nothing at all when the URL is dead, instead of a placeholder tile. */
  readonly hideOnError?: boolean;
}

export default function SmartImage({
  uri,
  style,
  radiusValue = radius.md,
  resizeMode = 'cover',
  children,
  hideOnError = false,
}: SmartImageProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [failed, setFailed] = useState(false);

  const reveal = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: motion.base,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  useEffect(() => {
    setFailed(false);
    opacity.setValue(0);
    const timer = setTimeout(reveal, REVEAL_FAILSAFE_MS);
    return () => clearTimeout(timer);
  }, [uri, opacity, reveal]);

  const onError = useCallback((e: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (__DEV__) {
      console.warn(`[SmartImage] failed to load ${uri}`, e.nativeEvent.error);
    }
    setFailed(true);
  }, [uri]);

  if (!uri) return null;
  if (failed && hideOnError) return null;

  return (
    <View style={[s.wrap, { borderRadius: radiusValue }, style]}>
      {failed ? (
        <View style={s.fallback}>
          <Text style={s.fallbackGlyph}>{'\u{1F5BC}'}</Text>
          <Text style={s.fallbackText}>Photo unavailable</Text>
        </View>
      ) : (
        <Animated.Image
          source={{ uri, headers: IMAGE_HEADERS }}
          onLoad={reveal}
          onError={onError}
          resizeMode={resizeMode}
          style={[StyleSheet.absoluteFill, { opacity }]}
        />
      )}
      {children}
    </View>
  );
}

/**
 * Warm the cache so the first scroll feels instant.
 *
 * `Image.prefetch` cannot carry headers, so it is skipped whenever custom ones are
 * configured; prefetching without them would just collect 403s and warm nothing.
 */
export function prefetch(urls: readonly string[]): void {
  if (Object.keys(IMAGE_HEADERS).length > 0) return;
  for (const url of urls) {
    if (url) void Image.prefetch(url).catch(() => false);
  }
}

const s = StyleSheet.create({
  wrap: { overflow: 'hidden', backgroundColor: colors.surfaceSunken },
  fallback: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 4 },
  fallbackGlyph: { fontSize: 22, opacity: 0.45 },
  fallbackText: { ...type.caption, color: colors.textFaint },
});
