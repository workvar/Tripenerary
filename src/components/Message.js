import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Button } from './ui';
import { colors, radius, spacing, type } from '../theme';

export default function Message({ title, body, actionTitle, onAction, tone }) {
  return (
    <View style={[s.wrap, tone === 'error' && s.error]}>
      <Text style={s.title}>{title}</Text>
      {body ? <Text style={s.body}>{body}</Text> : null}
      {actionTitle ? (
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
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  error: { backgroundColor: '#FDECEA', borderColor: '#F3C6C1' },
  title: { ...type.h3, textAlign: 'center' },
  body: { ...type.small, textAlign: 'center', marginTop: spacing.sm, lineHeight: 19 },
  action: { marginTop: spacing.lg, alignSelf: 'stretch' },
});
