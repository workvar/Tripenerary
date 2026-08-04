import { useMemo, useRef } from 'react';
import { Animated, PanResponder, type GestureResponderEvent, type PanResponderInstance } from 'react-native';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_MS = 280;
const DOUBLE_TAP_SCALE = 2.5;
/** How far a one-finger drag has to travel, unzoomed, before the sheet closes. */
const DISMISS_DISTANCE = 110;

interface Size {
  readonly width: number;
  readonly height: number;
}

interface Gesture {
  scale: number;
  x: number;
  y: number;
  startScale: number;
  startX: number;
  startY: number;
  startDistance: number;
  lastTapAt: number;
  pinching: boolean;
}

const distance = (e: GestureResponderEvent): number => {
  const [a, b] = e.nativeEvent.touches;
  if (!a || !b) return 0;
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
};

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max);

export interface ZoomPan {
  readonly panHandlers: PanResponderInstance['panHandlers'];
  readonly scale: Animated.Value;
  readonly translate: Animated.ValueXY;
}

/**
 * Pinch to zoom, drag to pan, double-tap to toggle, and a downward flick to
 * dismiss when the image sits at rest. Built on PanResponder so the app keeps
 * working without a native gesture library.
 */
export default function useZoomPan(size: Size, onDismiss: () => void): ZoomPan {
  const scale = useRef(new Animated.Value(1)).current;
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const g = useRef<Gesture>({
    scale: 1,
    x: 0,
    y: 0,
    startScale: 1,
    startX: 0,
    startY: 0,
    startDistance: 0,
    lastTapAt: 0,
    pinching: false,
  }).current;

  const settle = useMemo(
    () => (next: number, x: number, y: number) => {
      g.scale = next;
      g.x = x;
      g.y = y;
      Animated.parallel([
        Animated.spring(scale, { toValue: next, useNativeDriver: true, speed: 20, bounciness: 2 }),
        Animated.spring(translate, {
          toValue: { x, y },
          useNativeDriver: true,
          speed: 20,
          bounciness: 2,
        }),
      ]).start();
    },
    [g, scale, translate]
  );

  const bound = useMemo(
    () => (value: number, extent: number, next: number) => {
      const limit = Math.max((extent * next - extent) / 2, 0);
      return clamp(value, -limit, limit);
    },
    []
  );

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        // Horizontal drags at rest are deliberately left alone so the pager
        // underneath can swipe between photos.
        onMoveShouldSetPanResponder: (e, s) =>
          e.nativeEvent.touches.length > 1 ||
          g.scale > 1 ||
          Math.abs(s.dy) > Math.abs(s.dx) + 8,

        onPanResponderGrant: (e) => {
          g.startScale = g.scale;
          g.startX = g.x;
          g.startY = g.y;
          g.startDistance = distance(e);
          g.pinching = e.nativeEvent.touches.length > 1;

          const now = Date.now();
          if (!g.pinching && now - g.lastTapAt < DOUBLE_TAP_MS) {
            g.lastTapAt = 0;
            settle(g.scale > 1 ? MIN_SCALE : DOUBLE_TAP_SCALE, 0, 0);
            return;
          }
          g.lastTapAt = now;
        },

        onPanResponderMove: (e, s) => {
          const touches = e.nativeEvent.touches.length;

          if (touches > 1) {
            const start = g.startDistance || distance(e);
            if (!g.startDistance) g.startDistance = start;
            const next = clamp((distance(e) / start) * g.startScale, MIN_SCALE * 0.8, MAX_SCALE);
            g.pinching = true;
            g.scale = next;
            scale.setValue(next);
            return;
          }

          const nextX = g.startX + s.dx;
          const nextY = g.startY + s.dy;
          g.x = g.scale > 1 ? bound(nextX, size.width, g.scale) : 0;
          g.y = g.scale > 1 ? bound(nextY, size.height, g.scale) : nextY;
          translate.setValue({ x: g.x, y: g.y });
        },

        onPanResponderRelease: (_e, s) => {
          if (!g.pinching && g.scale <= 1 && Math.abs(s.dy) > DISMISS_DISTANCE) {
            onDismiss();
            return;
          }
          g.pinching = false;
          g.startDistance = 0;

          const next = clamp(g.scale, MIN_SCALE, MAX_SCALE);
          settle(
            next,
            next > 1 ? bound(g.x, size.width, next) : 0,
            next > 1 ? bound(g.y, size.height, next) : 0
          );
        },

        onPanResponderTerminationRequest: () => false,
      }),
    [g, bound, onDismiss, scale, translate, settle, size.height, size.width]
  );

  return { panHandlers: responder.panHandlers, scale, translate };
}
