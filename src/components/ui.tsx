import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Press from './Press';
import { colors, elevation, hairlineWidth, radius, spacing, type } from '@/theme';

type Styleable = { readonly style?: StyleProp<ViewStyle> };

export function Card({
  children,
  style,
  flat = false,
}: Styleable & { readonly children: ReactNode; readonly flat?: boolean }) {
  return <View style={[s.card, flat && s.cardFlat, style]}>{children}</View>;
}

export function SectionTitle({
  children,
  style,
}: {
  readonly children: string;
  readonly style?: StyleProp<TextStyle>;
}) {
  return <Text style={[s.section, style]}>{children.toUpperCase()}</Text>;
}

export type PillTone = 'accent' | 'primary' | 'light' | 'neutral';

const PILL_BG: Record<PillTone, ViewStyle | undefined> = {
  accent: { backgroundColor: colors.accent },
  primary: { backgroundColor: colors.primary },
  light: { backgroundColor: 'rgba(255,255,255,0.18)' },
  neutral: undefined,
};

export function Pill({ label, tone = 'neutral' }: { readonly label: string; readonly tone?: PillTone }) {
  return (
    <View style={[s.pill, PILL_BG[tone]]}>
      <Text style={[s.pillText, tone !== 'neutral' && s.pillTextOn]}>{label}</Text>
    </View>
  );
}

export type ButtonVariant = 'primary' | 'ghost' | 'light' | 'danger';

const BUTTON_STYLES: Record<ButtonVariant, readonly [ViewStyle | undefined, TextStyleLike]> = {
  primary: [undefined, undefined],
  ghost: [{ backgroundColor: 'transparent', borderWidth: hairlineWidth, borderColor: colors.border }, { color: colors.primary }],
  light: [{ backgroundColor: '#fff' }, { color: colors.primary }],
  danger: [{ backgroundColor: colors.dangerSoft }, { color: colors.danger }],
};

type TextStyleLike = { color: string } | undefined;

interface ButtonProps extends Styleable {
  readonly title: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly disabled?: boolean;
  readonly loading?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const [box, label] = BUTTON_STYLES[variant];

  return (
    <Press
      onPress={onPress}
      disabled={disabled || loading}
      style={[s.btn, box, style]}
      scaleTo={0.98}
      accessibilityLabel={title}
    >
      <View style={s.btnInner}>
        {loading ? (
          <ActivityIndicator size="small" color={variant === 'primary' ? '#fff' : colors.primary} />
        ) : null}
        <Text style={[s.btnText, label]}>{title}</Text>
      </View>
    </Press>
  );
}

interface IconButtonProps {
  readonly glyph: string;
  readonly onPress: () => void;
  readonly label: string;
  readonly tone?: 'light' | 'dark';
  readonly size?: number;
  readonly spinning?: boolean;
}

export function IconButton({
  glyph,
  onPress,
  label,
  tone = 'light',
  size = 36,
  spinning = false,
}: IconButtonProps) {
  const dark = tone === 'dark';
  return (
    <Press
      onPress={onPress}
      accessibilityLabel={label}
      scaleTo={0.9}
      style={[s.icon, { width: size, height: size, borderRadius: size / 2 }, dark && s.iconDark]}
    >
      {spinning ? (
        <ActivityIndicator size="small" color={dark ? '#fff' : colors.primary} />
      ) : (
        <Text style={[s.iconGlyph, dark && s.iconGlyphDark]}>{glyph}</Text>
      )}
    </Press>
  );
}

export function Divider({ inset = 0 }: { readonly inset?: number }) {
  return <View style={[s.divider, { marginLeft: inset }]} />;
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: hairlineWidth,
    borderColor: colors.borderSoft,
    ...elevation.sm,
  },
  cardFlat: { ...elevation.none, backgroundColor: colors.bgElevated, borderColor: colors.border },
  section: { ...type.label, marginBottom: spacing.sm, marginTop: spacing.xl },

  pill: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSunken,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 11.5, fontWeight: '700', letterSpacing: 0.2, color: colors.textMuted },
  pillTextOn: { color: '#fff' },

  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15.5, letterSpacing: -0.2 },

  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: hairlineWidth,
    borderColor: colors.borderSoft,
    ...elevation.xs,
  },
  iconDark: { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.16)' },
  iconGlyph: { fontSize: 16, color: colors.primary, fontWeight: '600' },
  iconGlyphDark: { color: '#fff' },

  divider: { height: hairlineWidth, backgroundColor: colors.borderSoft, marginVertical: spacing.md },
});
