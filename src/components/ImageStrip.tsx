import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SmartImage from './SmartImage';
import { colors, radius, spacing, type } from '@/theme';
import type { TripImage } from '@/types';

const CELL_WIDTH = 244;

interface ImageStripProps {
  readonly images: readonly TripImage[] | undefined;
  readonly height?: number;
}

/** One image fills the width; several become a swipeable row of cards. */
export default function ImageStrip({ images, height = 190 }: ImageStripProps) {
  if (!images || images.length === 0) return null;

  const [only] = images;
  if (images.length === 1 && only) {
    return (
      <View style={s.single}>
        <SmartImage uri={only.url} style={{ height }} radiusValue={radius.md} />
        {only.caption ? <Text style={s.caption}>{only.caption}</Text> : null}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.row}
      style={s.scroll}
    >
      {images.map((img) => (
        <View key={img.url} style={s.cell}>
          <SmartImage uri={img.url} style={{ height, width: CELL_WIDTH }} radiusValue={radius.md} />
          {img.caption ? (
            <Text style={[s.caption, s.captionCell]} numberOfLines={2}>
              {img.caption}
            </Text>
          ) : null}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  single: { marginTop: spacing.md },
  scroll: { marginTop: spacing.md, marginHorizontal: -spacing.lg },
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  cell: { width: CELL_WIDTH },
  caption: { ...type.caption, color: colors.textMuted, marginTop: spacing.xs },
  captionCell: { paddingRight: spacing.xs },
});
