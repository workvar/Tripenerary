import React from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import Press from '../components/Press';
import { Button, Card, Divider, SectionTitle } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { formatSyncedAt } from '../lib/dates';

function ToggleRow({ label, hint, value, onValueChange }) {
  return (
    <View style={s.row}>
      <View style={s.rowText}>
        <Text style={s.rowLabel}>{label}</Text>
        {hint ? <Text style={s.rowHint}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary, false: colors.border }}
        thumbColor="#fff"
      />
    </View>
  );
}

function TripRow({ trip, busy, onRefresh, onRemove }) {
  return (
    <View style={s.tripRow}>
      <View style={s.tripText}>
        <Text style={s.tripTitle} numberOfLines={1}>{trip.title || 'Untitled trip'}</Text>
        <Text style={s.tripUrl} numberOfLines={1}>{trip.url || 'No link'}</Text>
        <Text style={s.tripMeta}>{'Synced ' + formatSyncedAt(trip.syncedAt)}</Text>
      </View>
      <Press onPress={onRefresh} style={s.tripAction} scaleTo={0.9}>
        <Text style={s.tripActionText}>{busy ? '…' : '\u{21BB}'}</Text>
      </Press>
      <Press onPress={onRemove} style={[s.tripAction, s.tripRemove]} scaleTo={0.9}>
        <Text style={[s.tripActionText, s.tripRemoveText]}>{'\u{2715}'}</Text>
      </Press>
    </View>
  );
}

export default function SettingsScreen({ library, onClose }) {
  const { trips, status, prefs, updatePrefs, refreshAll, refreshTrip, removeTrip, resetAll } = library;
  const anyRefreshing = Object.values(status).some((v) => v && v.refreshing);

  const confirmRemove = (trip) => {
    Alert.alert(trip.title || 'Remove trip', 'Remove this trip and its offline copy?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeTrip(trip.id) },
    ]);
  };

  const confirmReset = () => {
    Alert.alert('Clear everything?', 'This removes all trips, their offline copies and your settings.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: resetAll },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Settings" onClose={onClose} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SectionTitle style={s.firstSection}>Display</SectionTitle>
        <Card>
          <ToggleRow
            label="Show photos"
            hint="Day headers, place photos and stay pictures."
            value={prefs.showImages}
            onValueChange={(v) => updatePrefs({ showImages: v })}
          />
          <Divider />
          <ToggleRow
            label="Show map previews"
            hint="Small embedded map under each location. Turn off to save data."
            value={prefs.showMapPreview}
            onValueChange={(v) => updatePrefs({ showMapPreview: v })}
          />
        </Card>

        <SectionTitle>Syncing</SectionTitle>
        <Card>
          <ToggleRow
            label="Refresh daily"
            hint="Each trip is re-downloaded once a day when the app opens."
            value={prefs.autoRefreshOnLaunch}
            onValueChange={(v) => updatePrefs({ autoRefreshOnLaunch: v })}
          />
          <Divider />
          <Button
            title={anyRefreshing ? 'Refreshing…' : 'Refresh all trips now'}
            onPress={refreshAll}
            loading={anyRefreshing}
          />
        </Card>

        <SectionTitle>{'Trips (' + trips.length + ')'}</SectionTitle>
        {trips.length === 0 ? (
          <Card flat><Text style={s.emptyText}>No trips added yet.</Text></Card>
        ) : (
          <Card style={s.tripCard}>
            {trips.map((t, i) => (
              <View key={t.id}>
                {i > 0 ? <Divider /> : null}
                <TripRow
                  trip={t}
                  busy={status[t.id] && status[t.id].refreshing}
                  onRefresh={() => refreshTrip(t.id)}
                  onRemove={() => confirmRemove(t)}
                />
              </View>
            ))}
          </Card>
        )}

        <View style={s.danger}>
          <Button title="Clear all saved data" variant="danger" onPress={confirmReset} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  firstSection: { marginTop: 0 },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  rowText: { flex: 1 },
  rowLabel: { ...type.h3 },
  rowHint: { ...type.small, marginTop: 2, lineHeight: 18 },

  tripCard: { paddingVertical: spacing.sm },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  tripText: { flex: 1 },
  tripTitle: { ...type.h3 },
  tripUrl: { ...type.caption, marginTop: 2 },
  tripMeta: { ...type.caption, color: colors.textFaint, marginTop: 1 },
  tripAction: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  tripActionText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  tripRemove: { backgroundColor: colors.dangerSoft },
  tripRemoveText: { color: colors.danger },

  emptyText: { ...type.small },
  danger: { marginTop: spacing.xxl },
});
