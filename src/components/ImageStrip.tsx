import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SmartImage from './SmartImage';
import Press from './Press';
import { useLightbox } from './lightbox/context';
import { colors, radius, spacing, type } from '@/theme';
import type { TripImage } from '@/types';

const CELL_WIDTH = 244;

interface ImageStripProps {
  readonly images: readonly TripImage[] | undefined;
  readonly height?: number;
}

/** One or two images fill the width; three or more become a swipeable row of cards.
 *  Tapping any of them opens the full-screen viewer. */
export default function ImageStrip({ images, height = 190 }: ImageStripProps) {
  const openLightbox = useLightbox();

  if (!images || images.length === 0) return null;

  const enlarge = (index: number) => () => openLightbox(images, index);

  const [only] = images;
  if (images.length === 1 && only) {
    return (
      <View style={s.single}>
        <Press onPress={enlarge(0)} scaleTo={0.99} accessibilityLabel="Enlarge photo">
          <SmartImage uri={only.url} style={{ height }} radiusValue={radius.md} />
        </Press>
        {only.caption ? <Text style={s.caption}>{only.caption}</Text> : null}
      </View>
    );
  }

  if (images.length === 2) {
    return (
      <View style={s.pair}>
        {images.map((img, i) => (
          <View key={img.url} style={s.pairCell}>
            <Press onPress={enlarge(i)} scaleTo={0.98} accessibilityLabel="Enlarge photo">
              <SmartImage uri={img.url} style={{ height }} radiusValue={radius.md} />
            </Press>
            {img.caption ? (
              <Text style={s.caption} numberOfLines={2}>
                {img.caption}
              </Text>
            ) : null}
          </View>
        ))}
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
      {images.map((img, i) => (
        <View key={img.url} style={s.cell}>
          <Press onPress={enlarge(i)} scaleTo={0.98} accessibilityLabel="Enlarge photo">
            <SmartImage
              uri={img.url}
              style={{ height, width: CELL_WIDTH }}
              radiusValue={radius.md}
            />
          </Press>
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
  pair: { marginTop: spacing.md, flexDirection: 'row', gap: spacing.sm },
  pairCell: { flex: 1, minWidth: 0 },
  scroll: { marginTop: spacing.md, marginHorizontal: -spacing.lg },
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  cell: { width: CELL_WIDTH },
  caption: { ...type.caption, color: colors.textMuted, marginTop: spacing.xs },
  captionCell: { paddingRight: spacing.xs },
});
