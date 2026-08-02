import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View } from 'react-native';
import Press from './Press';
import SmartImage from './SmartImage';
import { colors, radius, spacing, type, elevation, hairlineWidth } from '../theme';
import { formatDate } from '../lib/dates';
import { tripStatus } from '../lib/tripSummary';

const BADGE_TONE = {
  live: { backgroundColor: colors.accent, color: '#fff' },
  upcoming: { backgroundColor: 'rgba(255,255,255,0.22)', color: '#fff' },
  past: { backgroundColor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.8)' },
};

function dateRange(trip) {
  if (!trip.startDate || !trip.endDate) return 'Not loaded yet';
  const a = formatDate(trip.startDate, { day: 'numeric', month: 'short' });
  const b = formatDate(trip.endDate, { day: 'numeric', month: 'short', year: 'numeric' });
  return a + ' – ' + b;
}

export default function TripCard({ trip, index = 0, busy, error, onPress, onLongPress }) {
  const enter = useRef(new Animated.Value(0)).current;
  const status = tripStatus(trip);
  const tone = BADGE_TONE[status.state];

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 420,
      delay: 90 + index * 80,
      useNativeDriver: true,
    }).start();
  }, [enter, index]);

  const animated = {
    opacity: enter,
    transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [22, 0] }) }],
  };

  return (
    <Animated.View style={animated}>
      <Press onPress={onPress} onLongPress={onLongPress} style={s.card} scaleTo={0.975}>
        <SmartImage uri={trip.coverImage} style={StyleSheet.absoluteFill} radiusValue={radius.xl} />
        <View style={s.scrim} />
        <View style={s.scrimTop} />

        <View style={s.top}>
          <View style={[s.badge, { backgroundColor: tone.backgroundColor }]}>
            <Text style={[s.badgeText, { color: tone.color }]}>{status.label}</Text>
          </View>
          {busy ? <ActivityIndicator size="small" color="#fff" /> : null}
        </View>

        <View style={s.bottom}>
          <Text style={s.title} numberOfLines={2}>{trip.title || 'Untitled trip'}</Text>
          <Text style={s.dates}>{dateRange(trip)}</Text>
          <View style={s.metaRow}>
            {trip.dayCount ? <Text style={s.meta}>{trip.dayCount + ' days'}</Text> : null}
            {trip.places && trip.places.length ? (
              <Text style={s.meta} numberOfLines={1}>{trip.places.join(' · ')}</Text>
            ) : null}
          </View>
          {error ? <Text style={s.error} numberOfLines={1}>{error}</Text> : null}
        </View>
      </Press>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  card: {
    height: 214,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primary,
    borderWidth: hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'space-between',
    ...elevation.md,
  },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9,55,53,0.42)' },
  scrimTop: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0, height: 130,
    backgroundColor: 'rgba(9,55,53,0.34)',
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  badge: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: radius.pill },
  badgeText: { fontSize: 11.5, fontWeight: '800', letterSpacing: 0.2 },
  bottom: { padding: spacing.lg },
  title: { fontSize: 23, fontWeight: '800', letterSpacing: -0.4, color: '#fff' },
  dates: { fontSize: 13, color: 'rgba(255,255,255,0.86)', marginTop: 3 },
  metaRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  meta: { ...type.caption, color: 'rgba(255,255,255,0.68)', flexShrink: 1 },
  error: { ...type.caption, color: '#FFC9C2', marginTop: spacing.xs },
});
