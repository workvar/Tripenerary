import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SmartImage from './SmartImage';
import { colors, radius, spacing, type } from '../theme';

// One image fills the width; several become a swipeable row of cards.
export default function ImageStrip({ images, height = 190 }) {
  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    const img = images[0];
    return (
      <View style={s.single}>
        <SmartImage uri={img.url} style={{ height }} radiusValue={radius.md} />
        {img.caption ? <Text style={s.caption}>{img.caption}</Text> : null}
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
        <View key={i} style={s.cell}>
          <SmartImage uri={img.url} style={{ height, width: 244 }} radiusValue={radius.md} />
          {img.caption ? <Text style={[s.caption, s.captionCell]} numberOfLines={2}>{img.caption}</Text> : null}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  single: { marginTop: spacing.md },
  scroll: { marginTop: spacing.md, marginHorizontal: -spacing.lg },
  row: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  cell: { width: 244 },
  caption: { ...type.caption, color: colors.textMuted, marginTop: spacing.xs },
  captionCell: { paddingRight: spacing.xs },
});
