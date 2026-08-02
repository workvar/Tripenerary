import { useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TripCard from '@/components/TripCard';
import AddTripSheet from '@/components/AddTripSheet';
import CompassMark from '@/components/CompassMark';
import Press from '@/components/Press';
import { IconButton } from '@/components/ui';
import { colors, elevation, radius, spacing, type } from '@/theme';
import { sortTrips } from '@/lib/tripSummary';
import { formatSyncedAt } from '@/lib/dates';
import type { TripLibrary } from '@/hooks/useTripLibrary';
import type { TripRecord } from '@/types';

function EmptyState({ onAdd }: { readonly onAdd: () => void }) {
  return (
    <View style={s.empty}>
      <CompassMark size={76} tint={colors.primary} />
      <Text style={s.emptyTitle}>No trips yet</Text>
      <Text style={s.emptyBody}>
        Add an itinerary link and it lives here, ready offline, refreshed every day.
      </Text>
      <Press style={s.emptyBtn} onPress={onAdd} scaleTo={0.97}>
        <Text style={s.emptyBtnText}>Add your first trip</Text>
      </Press>
    </View>
  );
}

interface LandingScreenProps {
  readonly library: TripLibrary;
  readonly onOpenSettings: () => void;
}

export default function LandingScreen({ library, onOpenSettings }: LandingScreenProps) {
  const { trips, status, anyRefreshing, addTrip, removeTrip, openTrip, refreshAll } = library;
  const [sheetOpen, setSheetOpen] = useState(false);

  const ordered = useMemo(() => sortTrips(trips), [trips]);
  const lastSynced = useMemo(
    () => trips.reduce<string | null>((latest, t) => (t.syncedAt && t.syncedAt > (latest ?? '') ? t.syncedAt : latest), null),
    [trips]
  );

  const confirmRemove = (trip: TripRecord) => {
    Alert.alert(trip.title ?? 'Remove trip', 'Remove this trip and its offline copy?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void removeTrip(trip.id) },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <View style={s.headerText}>
          <Text style={s.eyebrow}>YOUR TRIPS</Text>
          <Text style={s.title}>Tripenerary</Text>
        </View>
        <IconButton
          glyph={'\u{21BB}'}
          label="Refresh all trips"
          onPress={refreshAll}
          spinning={anyRefreshing}
        />
        <View style={s.gap} />
        <IconButton glyph={'\u{2699}'} label="Settings" onPress={onOpenSettings} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={anyRefreshing}
            onRefresh={refreshAll}
            tintColor={colors.primary}
          />
        }
      >
        {ordered.length === 0 ? (
          <EmptyState onAdd={() => setSheetOpen(true)} />
        ) : (
          <View style={s.list}>
            {ordered.map((trip, i) => (
              <TripCard
                key={trip.id}
                trip={trip}
                index={i}
                busy={status[trip.id]?.refreshing ?? false}
                error={status[trip.id]?.error ?? null}
                onPress={() => openTrip(trip.id)}
                onLongPress={() => confirmRemove(trip)}
              />
            ))}
            <Text style={s.footer}>
              {`Last refreshed ${formatSyncedAt(lastSynced)} · hold a card to remove`}
            </Text>
          </View>
        )}
      </ScrollView>

      <Press
        style={s.fab}
        onPress={() => setSheetOpen(true)}
        scaleTo={0.9}
        accessibilityLabel="Add a trip"
      >
        <Text style={s.fabPlus}>+</Text>
      </Press>

      <AddTripSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onSubmit={addTrip} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  headerText: { flex: 1 },
  eyebrow: { ...type.label, color: colors.textFaint },
  title: { ...type.display, marginTop: 2 },
  gap: { width: spacing.sm },

  scroll: { paddingHorizontal: spacing.lg, paddingBottom: 120 },
  list: { gap: spacing.lg },
  footer: { ...type.caption, textAlign: 'center', marginTop: spacing.lg },

  empty: { alignItems: 'center', paddingTop: spacing.xxxl * 1.4, gap: spacing.md },
  emptyTitle: { ...type.h1, marginTop: spacing.lg },
  emptyBody: {
    ...type.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 13,
    borderRadius: radius.pill,
    ...elevation.md,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl + 8,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...elevation.lg,
  },
  fabPlus: { color: '#fff', fontSize: 32, fontWeight: '300', marginTop: -3 },
});
