import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';

export default function OnboardingScreen({ trip }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);

  const load = async () => {
    setError(null);
    const res = await trip.setSource(draft);
    if (!res.ok) setError(res.error);
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <Text style={s.emoji}>{'\u{1F9F3}'}</Text>
          <Text style={s.title}>Trip Companion</Text>
          <Text style={s.body}>
            Paste the link to your itinerary file. The app saves a copy on the phone, so it keeps
            working without signal.
          </Text>

          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="https://example.com/my-trip.json"
            placeholderTextColor="rgba(255,255,255,0.5)"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={s.input}
            multiline
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <View style={s.action}>
            <Button
              title={trip.refreshing ? 'Loading...' : 'Load itinerary'}
              onPress={load}
              variant="light"
              disabled={trip.refreshing || !draft.trim()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
  emoji: { fontSize: 44, textAlign: 'center', marginBottom: spacing.lg },
  title: { fontSize: 27, fontWeight: '800', color: '#fff', textAlign: 'center' },
  body: {
    ...type.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center',
    marginTop: spacing.md, marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: radius.md,
    padding: spacing.lg, color: '#fff', fontSize: 14.5, minHeight: 64,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  error: { ...type.small, color: '#FFC9C2', marginTop: spacing.md },
  action: { marginTop: spacing.xl },
});
