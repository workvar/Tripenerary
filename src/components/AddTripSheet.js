import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, KeyboardAvoidingView, Modal, Platform, Pressable,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { Button } from './ui';
import { colors, radius, spacing, type, elevation } from '../theme';

// Bottom sheet for pasting a new itinerary link. Slides up over a dimmed backdrop.
export default function AddTripSheet({ visible, onClose, onSubmit }) {
  const slide = useRef(new Animated.Value(0)).current;
  const [url, setUrl] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 1 : 0,
      duration: visible ? 320 : 200,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
    if (visible) { setUrl(''); setError(null); setBusy(false); }
  }, [visible, slide]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res = await onSubmit(url);
    setBusy(false);
    if (res && res.ok) onClose();
    else setError((res && res.error) || 'Could not add that trip.');
  };

  const sheetStyle = {
    transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [420, 0] }) }],
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        style={s.anchor}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <Animated.View style={[s.sheet, sheetStyle]}>
          <View style={s.grabber} />
          <Text style={s.title}>Add a trip</Text>
          <Text style={s.help}>
            Paste the link to an itinerary JSON file. GitHub, Gist, Google Drive and Dropbox
            share links are converted automatically.
          </Text>

          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com/my-trip.json"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            style={s.input}
            multiline
            autoFocus
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Button
            title={busy ? 'Adding…' : 'Add trip'}
            onPress={submit}
            loading={busy}
            disabled={!url.trim()}
            style={s.cta}
          />
          <Button title="Cancel" variant="ghost" onPress={onClose} style={s.cancel} />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(9,55,53,0.42)' },
  anchor: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
    ...elevation.lg,
  },
  grabber: {
    width: 38, height: 5, borderRadius: 3,
    backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.md,
  },
  title: { ...type.h1 },
  help: { ...type.small, lineHeight: 19, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    ...type.body,
    minHeight: 76,
  },
  error: { ...type.small, color: colors.danger },
  cta: { marginTop: spacing.md },
  cancel: { marginTop: spacing.xs },
});
