import { StyleSheet, Text, View } from 'react-native';
import { Button } from './ui';
import { colors, elevation, hairlineWidth, radius, spacing, type } from '@/theme';

interface MessageProps {
  readonly title: string;
  readonly body?: string;
  readonly actionTitle?: string;
  readonly onAction?: () => void;
  readonly tone?: 'neutral' | 'error';
}

export default function Message({
  title,
  body,
  actionTitle,
  onAction,
  tone = 'neutral',
}: MessageProps) {
  return (
    <View style={[s.wrap, tone === 'error' && s.error]}>
      <Text style={s.title}>{title}</Text>
      {body ? <Text style={s.body}>{body}</Text> : null}
      {actionTitle && onAction ? (
        <View style={s.action}>
          <Button title={actionTitle} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    padding: spacing.xl,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: hairlineWidth,
    borderColor: colors.borderSoft,
    alignItems: 'center',
    ...elevation.sm,
  },
  error: { backgroundColor: colors.dangerSoft, borderColor: '#F3C6C1' },
  title: { ...type.h2, textAlign: 'center' },
  body: { ...type.small, textAlign: 'center', marginTop: spacing.sm, lineHeight: 19 },
  action: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
