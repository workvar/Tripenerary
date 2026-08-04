import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Press from './Press';
import { useTripId } from './TripScope';
import useAttachment from '@/hooks/useAttachment';
import { colors, hairlineWidth, radius, spacing, type } from '@/theme';
import { ATTACHMENT_GLYPH, ATTACHMENT_LABEL } from '@/lib/attachments';
import { formatBytes } from '@/lib/cache';
import type { Attachment } from '@/types';

interface AttachmentRowProps {
  readonly attachment: Attachment;
  readonly onFail: (message: string) => void;
}

/** One tappable document. The first tap downloads it and keeps the copy, so the
 *  same document opens later without signal. */
export default function AttachmentRow({ attachment, onFail }: AttachmentRowProps) {
  const tripId = useTripId();
  const { state, bytes, error, open } = useAttachment(tripId, attachment);

  useEffect(() => {
    if (error) onFail(error);
  }, [error, onFail]);

  const busy = state === 'downloading';
  const meta = busy
    ? 'Downloading…'
    : [
        attachment.note || ATTACHMENT_LABEL[attachment.kind],
        state === 'cached' && bytes > 0 ? `saved · ${formatBytes(bytes)}` : '',
      ]
        .filter(Boolean)
        .join('  ·  ');

  return (
    <Press
      style={s.row}
      scaleTo={0.98}
      onPress={open}
      disabled={busy}
      accessibilityLabel={`Open ${attachment.title}`}
    >
      <View style={s.badge}>
        {busy ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Text style={s.glyph}>{ATTACHMENT_GLYPH[attachment.kind]}</Text>
        )}
      </View>

      <View style={s.text}>
        <Text style={s.title} numberOfLines={1}>
          {attachment.title}
        </Text>
        <Text style={s.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>

      {state === 'cached' ? <Text style={s.offline}>{'\u{2913}'}</Text> : null}
      <Text style={s.chevron}>{'\u{203A}'}</Text>
    </Press>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  glyph: { fontSize: 16 },
  text: { flex: 1, minWidth: 0 },
  title: { ...type.body, fontWeight: '700' },
  meta: { ...type.caption, marginTop: 1 },
  offline: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  chevron: { fontSize: 20, color: colors.textFaint, fontWeight: '600' },
});
