import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Divider } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { formatSyncedAt } from '../lib/dates';

function Row({ label, hint, value, onValueChange }) {
  return (
    <View style={s.row}>
      <View style={s.rowText}>
        <Text style={s.rowLabel}>{label}</Text>
        {hint ? <Text style={s.rowHint}>{hint}</Text> : null}
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

export default function SettingsScreen({ trip, onClose }) {
  const { sourceUrl, syncedAt, prefs, setSource, updatePrefs, reset, refreshing } = trip;
  const [draft, setDraft] = useState(sourceUrl || '');
  const [status, setStatus] = useState(null);

  const load = async () => {
    setStatus(null);
    const res = await setSource(draft);
    if (res.ok) {
      setStatus({ ok: true, text: 'Itinerary loaded and saved for offline use.' });
    } else {
      setStatus({ ok: false, text: res.error });
    }
  };

  const confirmReset = () => {
    Alert.alert('Clear saved data?', 'This removes the link and the offline copy.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { reset(); setDraft(''); } },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={onClose} hitSlop={10}>
          <Text style={s.close}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Card>
          <Text style={s.label}>ITINERARY LINK</Text>
          <Text style={s.help}>
            Paste a link to a JSON file. GitHub, Gist, Google Drive and Dropbox share links are
            converted to direct links automatically.
          </Text>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="https://example.com/my-trip.json"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={s.input}
            multiline
          />
          <View style={s.actions}>
            <Button title={refreshing ? 'Loading...' : 'Load itinerary'} onPress={load} disabled={refreshing} />
          </View>
          {refreshing ? <ActivityIndicator style={s.spinner} color={colors.primary} /> : null}
          {status ? (
            <Text style={[s.status, status.ok ? s.ok : s.bad]}>{status.text}</Text>
          ) : null}
          <Divider />
          <Text style={s.meta}>{'Last synced: ' + formatSyncedAt(syncedAt)}</Text>
        </Card>

        <Card style={s.card}>
          <Text style={s.label}>DISPLAY</Text>
          <Row
            label="Show map previews"
            hint="Small embedded map under each location. Turn off to save data."
            value={prefs.showMapPreview}
            onValueChange={(v) => updatePrefs({ showMapPreview: v })}
          />
          <Divider />
          <Row
            label="Refresh on launch"
            hint="Check the link for updates each time the app opens."
            value={prefs.autoRefreshOnLaunch}
            onValueChange={(v) => updatePrefs({ autoRefreshOnLaunch: v })}
          />
        </Card>

        <View style={s.card}>
          <Button title="Clear saved data" variant="ghost" onPress={confirmReset} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    backgroundColor: colors.primary,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#fff' },
  close: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  card: { marginTop: spacing.lg },
  label: { ...type.label, marginBottom: spacing.sm },
  help: { ...type.small, lineHeight: 18, marginBottom: spacing.md },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    ...type.body, minHeight: 56, backgroundColor: '#FBFAF7',
  },
  actions: { marginTop: spacing.md },
  spinner: { marginTop: spacing.md },
  status: { ...type.small, marginTop: spacing.md },
  ok: { color: colors.primary },
  bad: { color: colors.danger },
  meta: { ...type.small },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  rowText: { flex: 1 },
  rowLabel: { ...type.h3 },
  rowHint: { ...type.small, marginTop: 2, lineHeight: 17 },
});
