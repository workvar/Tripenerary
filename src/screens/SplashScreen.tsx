import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import CompassMark from '@/components/CompassMark';
import { colors, spacing } from '@/theme';
import { SPLASH_MIN_MS } from '@/config';

interface SplashScreenProps {
  /** The library has finished loading from disk. */
  readonly ready: boolean;
  readonly onDone: () => void;
}

/** Staged entrance: halo blooms, mark settles, needle sweeps, wordmark rises,
 *  then the whole thing lifts away. Native driver only, so it stays at 60fps. */
export default function SplashScreen({ ready, onDone }: SplashScreenProps) {
  const bloom = useRef(new Animated.Value(0)).current;
  const mark = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const exit = useRef(new Animated.Value(0)).current;
  const leaving = useRef(false);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bloom, {
        toValue: 1,
        duration: 620,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(mark, {
          toValue: 1,
          useNativeDriver: true,
          damping: 12,
          stiffness: 120,
          mass: 0.9,
        }),
        Animated.timing(spin, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(word, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [bloom, mark, spin, word]);

  // Leave once the library has booted and the minimum showing time is up.
  useEffect(() => {
    if (!ready || leaving.current) return;
    leaving.current = true;

    const timer = setTimeout(() => {
      Animated.timing(exit, {
        toValue: 1,
        duration: 420,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) onDone();
      });
    }, SPLASH_MIN_MS);

    return () => clearTimeout(timer);
  }, [ready, exit, onDone]);

  return (
    <Animated.View
      style={[
        s.screen,
        {
          opacity: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
          transform: [{ scale: exit.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
        },
      ]}
    >
      <Animated.View
        style={[
          s.halo,
          {
            opacity: bloom.interpolate({ inputRange: [0, 1], outputRange: [0, 0.16] }),
            transform: [{ scale: bloom.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }],
          },
        ]}
      />

      <Animated.View
        style={{
          opacity: mark,
          transform: [{ scale: mark.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] }) }],
        }}
      >
        <CompassMark size={104} spin={spin} />
      </Animated.View>

      <Animated.View
        style={[
          s.words,
          {
            opacity: word,
            transform: [
              { translateY: word.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
            ],
          },
        ]}
      >
        <Text style={s.title}>Tripenerary</Text>
        <Text style={s.tagline}>Every day of the journey, in your pocket</Text>
      </Animated.View>

      <View style={s.footer}>
        <Animated.View style={[s.rule, { opacity: word }]} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: colors.accent,
  },
  words: { alignItems: 'center', marginTop: spacing.xl },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6, color: '#fff' },
  tagline: { fontSize: 13.5, color: colors.onDarkMuted, marginTop: spacing.xs, letterSpacing: 0.1 },
  footer: { position: 'absolute', bottom: 56, alignItems: 'center' },
  rule: { width: 40, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.28)' },
});
