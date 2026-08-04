import { useCallback, useMemo, useState, type ReactNode } from 'react';
import {
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import ZoomableImage from './ZoomableImage';
import Press from '../Press';
import { LightboxContext, toTripImage, type LightboxSource } from './context';
import { spacing, type } from '@/theme';
import type { TripImage } from '@/types';

interface State {
  readonly images: readonly TripImage[];
  readonly index: number;
}

const EMPTY: State = { images: [], index: 0 };

/** Wraps the app so any block can hand a set of photos to the full-screen viewer. */
export default function LightboxProvider({ children }: { readonly children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const [state, setState] = useState<State>(EMPTY);
  const [page, setPage] = useState(0);

  const open = useCallback((images: readonly LightboxSource[], index = 0) => {
    const mapped = images.map(toTripImage).filter((img) => img.url);
    if (mapped.length === 0) return;
    const start = Math.min(Math.max(index, 0), mapped.length - 1);
    setPage(start);
    setState({ images: mapped, index: start });
  }, []);

  const close = useCallback(() => setState(EMPTY), []);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const visible = state.images.length > 0;
  const current = state.images[page];
  const counter = state.images.length > 1 ? `${page + 1} / ${state.images.length}` : '';
  const caption = [current?.caption, current?.credit].filter(Boolean).join('  ·  ');

  const offset = useMemo(() => ({ x: state.index * width, y: 0 }), [state.index, width]);

  return (
    <LightboxContext.Provider value={open}>
      {children}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={close}
        statusBarTranslucent
      >
        <StatusBar barStyle="light-content" />
        <View style={s.backdrop}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            onMomentumScrollEnd={onScroll}
            contentOffset={offset}
          >
            {state.images.map((img) => (
              <ZoomableImage
                key={img.url}
                uri={img.url}
                width={width}
                height={height}
                onDismiss={close}
              />
            ))}
          </ScrollView>

          <View style={s.topBar} pointerEvents="box-none">
            {counter ? <Text style={s.counter}>{counter}</Text> : <View />}
            <Press style={s.closeBtn} onPress={close} scaleTo={0.9} accessibilityLabel="Close photo">
              <Text style={s.closeGlyph}>{'\u{2715}'}</Text>
            </Press>
          </View>

          {caption ? (
            <View style={s.captionBar} pointerEvents="none">
              <Text style={s.caption} numberOfLines={3}>
                {caption}
              </Text>
            </View>
          ) : null}
        </View>
      </Modal>
    </LightboxContext.Provider>
  );
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: '#000' },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  counter: { ...type.small, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  closeGlyph: { color: '#fff', fontSize: 15, fontWeight: '700' },
  captionBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  caption: { ...type.small, color: '#fff' },
});
