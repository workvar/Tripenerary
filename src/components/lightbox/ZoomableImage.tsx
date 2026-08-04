import { Animated, StyleSheet, View } from 'react-native';
import useZoomPan from './useZoomPan';
import { IMAGE_HEADERS } from '@/config';

interface ZoomableImageProps {
  readonly uri: string;
  readonly width: number;
  readonly height: number;
  readonly onDismiss: () => void;
}

/** A single full-screen photo the user can pinch, pan, and double-tap. */
export default function ZoomableImage({ uri, width, height, onDismiss }: ZoomableImageProps) {
  const { panHandlers, scale, translate } = useZoomPan({ width, height }, onDismiss);

  return (
    <View style={[s.stage, { width, height }]} {...panHandlers}>
      <Animated.Image
        source={{ uri, headers: IMAGE_HEADERS }}
        resizeMode="contain"
        style={[
          s.image,
          { transform: [{ translateX: translate.x }, { translateY: translate.y }, { scale }] },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
});
