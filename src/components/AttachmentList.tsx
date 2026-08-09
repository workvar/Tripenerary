import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AttachmentRow from './AttachmentRow';
import { colors, spacing, type } from '@/theme';
import type { Attachment } from '@/types';

interface AttachmentListProps {
  readonly attachments: readonly Attachment[] | undefined;
  readonly label?: string;
  /** Drop the leading margin when the list is already the first thing in a card. */
  readonly flush?: boolean;
}

/** Documents attached to a block, a stay, or the trip. Renders nothing when
 *  there are none, so callers can drop it in unconditionally. */
export default function AttachmentList({
  attachments,
  label = 'DOCUMENTS',
  flush = false,
}: AttachmentListProps) {
  const [failed, setFailed] = useState('');

  if (!attachments || attachments.length === 0) return null;

  return (
    <View style={flush ? undefined : s.wrap}>
      <Text style={s.label}>{label}</Text>
      <View style={s.rows}>
        {attachments.map((a, i) => (
          <AttachmentRow key={`${a.url}-${i}`} attachment={a} onFail={setFailed} />
        ))}
      </View>
      {failed ? <Text style={s.error}>{failed}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { marginTop: spacing.lg },
  label: { fontSize: 10, fontWeight: '700', letterSpacing: 0.9, color: colors.textFaint },
  rows: { marginTop: spacing.sm, gap: spacing.sm },
  error: { ...type.caption, color: colors.danger, marginTop: spacing.sm, lineHeight: 16 },
});
