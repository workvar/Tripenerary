import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '@/components/ui';
import { colors, elevation, radius, spacing, type } from '@/theme';
import type { AuthState } from '@/hooks/useAuth';

type Mode = 'signIn' | 'signUp';

interface AuthSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly auth: AuthState;
}

/** Bottom sheet for email/password sign-in and account creation. */
export default function AuthSheet({ visible, onClose, auth }: AuthSheetProps) {
  const slide = useRef(new Animated.Value(0)).current;
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 1 : 0,
      duration: visible ? 320 : 200,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();

    if (visible) {
      setMode('signIn');
      setEmail('');
      setPassword('');
      setError(null);
      setBusy(false);
    }
  }, [visible, slide]);

  const submit = async () => {
    setBusy(true);
    setError(null);
    const res =
      mode === 'signIn'
        ? await auth.signIn(email, password)
        : await auth.signUp(email, password);
    setBusy(false);
    if (res.ok) onClose();
    else setError(res.error);
  };

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [480, 0] });
  const title = mode === 'signIn' ? 'Sign in' : 'Create account';
  const help =
    mode === 'signIn'
      ? 'Sign in to sync your trips and preferences across devices.'
      : 'Create an account to keep your trips and preferences in the cloud.';
  const cta = mode === 'signIn' ? 'Sign in' : 'Create account';
  const switchLabel =
    mode === 'signIn' ? 'Need an account? Create one' : 'Already have an account? Sign in';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={s.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
      <KeyboardAvoidingView
        style={s.anchor}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
          <View style={s.grabber} />
          <Text style={s.title}>{title}</Text>
          <Text style={s.help}>{help}</Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            style={s.input}
            autoFocus
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            textContentType={mode === 'signIn' ? 'password' : 'newPassword'}
            autoComplete={mode === 'signIn' ? 'password' : 'new-password'}
            style={s.input}
          />

          {error ? <Text style={s.error}>{error}</Text> : null}

          <Button
            title={busy ? 'Please wait…' : cta}
            onPress={() => void submit()}
            loading={busy}
            disabled={!email.trim() || password.length < 6}
            style={s.cta}
          />
          <Button
            title={switchLabel}
            variant="ghost"
            onPress={() => {
              setMode((m) => (m === 'signIn' ? 'signUp' : 'signIn'));
              setError(null);
            }}
            style={s.switch}
          />
          <Button title="Cancel" variant="ghost" onPress={onClose} />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.scrim },
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
    width: 38,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: { ...type.h1 },
  help: { ...type.small, lineHeight: 19, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    ...type.body,
    minHeight: 48,
  },
  error: { ...type.small, color: colors.danger },
  cta: { marginTop: spacing.md },
  switch: { marginTop: spacing.xs },
});
