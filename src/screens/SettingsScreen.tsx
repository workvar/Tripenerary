import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import Press from '@/components/Press';
import AuthSheet from '@/components/AuthSheet';
import { Button, Card, Divider, SectionTitle } from '@/components/ui';
import { colors, spacing, type } from '@/theme';
import { formatSyncedAt } from '@/lib/dates';
import { formatBytes } from '@/lib/cache';
import { useAuth } from '@/hooks/useAuth';
import type { TripLibrary } from '@/hooks/useTripLibrary';
import type { Prefs, TripRecord } from '@/types';

interface ToggleRowProps {
  readonly label: string;
  readonly hint: string;
  readonly value: boolean;
  readonly onValueChange: (value: boolean) => void;
}

function ToggleRow({ label, hint, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={s.row}>
      <View style={s.rowText}>
        <Text style={s.rowLabel}>{label}</Text>
        <Text style={s.rowHint}>{hint}</Text>
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

interface TripRowProps {
  readonly trip: TripRecord;
  readonly busy: boolean;
  readonly onRefresh: () => void;
  readonly onRemove: () => void;
}

function TripRow({ trip, busy, onRefresh, onRemove }: TripRowProps) {
  const name = trip.title ?? 'Untitled trip';
  return (
    <View style={s.tripRow}>
      <View style={s.tripText}>
        <Text style={s.tripTitle} numberOfLines={1}>
          {name}
        </Text>
        <Text style={s.tripUrl} numberOfLines={1}>
          {trip.url || 'No link'}
        </Text>
        <Text style={s.tripMeta}>{`Synced ${formatSyncedAt(trip.syncedAt)}`}</Text>
      </View>
      <Press onPress={onRefresh} style={s.tripAction} scaleTo={0.9} accessibilityLabel={`Refresh ${name}`}>
        <Text style={s.tripActionText}>{busy ? '…' : '\u{21BB}'}</Text>
      </Press>
      <Press
        onPress={onRemove}
        style={[s.tripAction, s.tripRemove]}
        scaleTo={0.9}
        accessibilityLabel={`Remove ${name}`}
      >
        <Text style={[s.tripActionText, s.tripRemoveText]}>{'\u{2715}'}</Text>
      </Press>
    </View>
  );
}

interface SettingsScreenProps {
  readonly library: TripLibrary;
  readonly onClose: () => void;
}

export default function SettingsScreen({ library, onClose }: SettingsScreenProps) {
  const auth = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const {
    trips,
    status,
    prefs,
    anyRefreshing,
    syncingAccount,
    updatePrefs,
    refreshAll,
    refreshTrip,
    removeTrip,
    resetAll,
    documentBytes,
    clearDocuments,
  } = library;

  const toggle = (key: keyof Prefs) => (value: boolean) => updatePrefs({ [key]: value });

  const confirmRemove = (trip: TripRecord) => {
    Alert.alert(trip.title ?? 'Remove trip', 'Remove this trip and its offline copy?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void removeTrip(trip.id) },
    ]);
  };

  const confirmClearDocuments = () => {
    Alert.alert(
      'Clear downloaded documents?',
      'Tickets and confirmations will download again the next time you open them. You will need a connection.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => void clearDocuments() },
      ]
    );
  };

  const confirmReset = () => {
    Alert.alert('Clear everything?', 'This removes all trips, their offline copies and your settings.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => void resetAll() },
    ]);
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out?', 'Trips stay on this phone. Cloud sync pauses until you sign in again.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void auth.signOut().then((res) => {
            if (!res.ok) Alert.alert('Could not sign out', res.error);
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScreenHeader title="Settings" onClose={onClose} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <SectionTitle style={s.firstSection}>Account</SectionTitle>
        <Card>
          {!auth.available ? (
            <Text style={s.emptyText}>
              Cloud sync is not configured in this build. Add Firebase keys to enable sign-in.
            </Text>
          ) : auth.user ? (
            <>
              <View style={s.row}>
                <View style={s.rowText}>
                  <Text style={s.rowLabel}>{auth.email ?? 'Signed in'}</Text>
                  <Text style={s.rowHint}>
                    {syncingAccount
                      ? 'Syncing trips and preferences…'
                      : 'Trips and preferences sync to your account.'}
                  </Text>
                </View>
              </View>
              <Divider />
              <Button title="Sign out" variant="ghost" onPress={confirmSignOut} />
            </>
          ) : (
            <>
              <Text style={s.emptyText}>
                Sign in to keep your trips and preferences across phones.
              </Text>
              <Divider />
              <Button title="Sign in or create account" onPress={() => setAuthOpen(true)} />
            </>
          )}
        </Card>

        <SectionTitle>Display</SectionTitle>
        <Card>
          <ToggleRow
            label="Show photos"
            hint="Day headers, place photos and stay pictures."
            value={prefs.showImages}
            onValueChange={toggle('showImages')}
          />
          <Divider />
          <ToggleRow
            label="Show map previews"
            hint="Small embedded map under each location. Turn off to save data."
            value={prefs.showMapPreview}
            onValueChange={toggle('showMapPreview')}
          />
        </Card>

        <SectionTitle>Syncing</SectionTitle>
        <Card>
          <ToggleRow
            label="Refresh daily"
            hint="Each trip is re-downloaded once a day when the app opens."
            value={prefs.autoRefreshOnLaunch}
            onValueChange={toggle('autoRefreshOnLaunch')}
          />
          <Divider />
          <Button
            title={anyRefreshing ? 'Refreshing…' : 'Refresh all trips now'}
            onPress={refreshAll}
            loading={anyRefreshing}
          />
        </Card>

        <SectionTitle>Documents</SectionTitle>
        <Card>
          <View style={s.row}>
            <View style={s.rowText}>
              <Text style={s.rowLabel}>Saved for offline</Text>
              <Text style={s.rowHint}>
                {documentBytes > 0
                  ? 'Tickets and confirmations you have opened are kept on this phone, so they still open with no signal.'
                  : 'Nothing downloaded yet. Opening a ticket or confirmation keeps a copy on this phone.'}
              </Text>
            </View>
            <Text style={s.size}>{formatBytes(documentBytes)}</Text>
          </View>
          {documentBytes > 0 ? (
            <>
              <Divider />
              <Button title="Clear downloads" variant="ghost" onPress={confirmClearDocuments} />
            </>
          ) : null}
        </Card>

        <SectionTitle>{`Trips (${trips.length})`}</SectionTitle>
        {trips.length === 0 ? (
          <Card flat>
            <Text style={s.emptyText}>No trips added yet.</Text>
          </Card>
        ) : (
          <Card style={s.tripCard}>
            {trips.map((trip, i) => (
              <View key={trip.id}>
                {i > 0 ? <Divider /> : null}
                <TripRow
                  trip={trip}
                  busy={status[trip.id]?.refreshing ?? false}
                  onRefresh={() => void refreshTrip(trip.id)}
                  onRemove={() => confirmRemove(trip)}
                />
              </View>
            ))}
          </Card>
        )}

        <View style={s.danger}>
          <Button title="Clear all saved data" variant="danger" onPress={confirmReset} />
        </View>
      </ScrollView>

      <AuthSheet visible={authOpen} onClose={() => setAuthOpen(false)} auth={auth} />
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
  size: { ...type.h3, color: colors.primary },

  tripCard: { paddingVertical: spacing.sm },
  tripRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  tripText: { flex: 1 },
  tripTitle: { ...type.h3 },
  tripUrl: { ...type.caption, marginTop: 2 },
  tripMeta: { ...type.caption, color: colors.textFaint, marginTop: 1 },
  tripAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  tripActionText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  tripRemove: { backgroundColor: colors.dangerSoft },
  tripRemoveText: { color: colors.danger },

  emptyText: { ...type.small },
  danger: { marginTop: spacing.xxl },
});
