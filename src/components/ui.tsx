import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { forwardRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputInstance,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { figma } from '@/theme/assets';
import { colors, fonts, radius } from '@/theme/tokens';

type ButtonVariant = 'primary' | 'brand' | 'white' | 'option' | 'optionSelected' | 'ghost';

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  height = 50,
  trailing,
  style,
  textStyle,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  height?: number;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  const v = buttonVariants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, selected: variant === 'optionSelected' }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { height, backgroundColor: v.bg },
        (pressed || disabled) && { opacity: disabled ? 0.5 : 0.85 },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          <Text style={[styles.buttonText, { color: v.fg }, textStyle]}>{label}</Text>
          {trailing}
        </>
      )}
    </Pressable>
  );
}

const buttonVariants: Record<ButtonVariant, { bg: string; fg: string }> = {
  primary: { bg: colors.brandButton, fg: colors.white },
  brand: { bg: colors.brand, fg: colors.white },
  white: { bg: colors.white, fg: colors.brandText },
  option: { bg: colors.field, fg: colors.optionText },
  optionSelected: { bg: colors.purple, fg: colors.white },
  ghost: { bg: 'transparent', fg: colors.brandButton },
};

type FieldTone = 'light' | 'pink';

export const Field = forwardRef<
  TextInputInstance,
  TextInputProps & { tone?: FieldTone; error?: string | null; height?: number; right?: ReactNode }
>(function Field({ tone = 'light', error, height = 50, right, style, ...props }, ref) {
  const pink = tone === 'pink';
  return (
    <View>
      <View
        style={[
          styles.field,
          { height, backgroundColor: pink ? colors.brandDeep : colors.field },
          !!error && { borderWidth: 1.5, borderColor: pink ? colors.white : colors.danger },
        ]}>
        <TextInput
          ref={ref}
          placeholderTextColor={pink ? colors.brandPlaceholder : colors.placeholder}
          style={[styles.fieldInput, { color: pink ? colors.white : colors.optionText }, style]}
          {...props}
        />
        {right}
      </View>
      {!!error && <Text style={[styles.error, pink && { color: colors.white }]}>{error}</Text>}
    </View>
  );
});

/** The 4-dot progress indicator used on the signup steps (Figma SVGs). */
export function Stepper({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <View style={styles.stepper} accessibilityLabel={`Step ${step} of 4`}>
      <Image source={figma.steppers[step - 1]} style={{ width: 225, height: 18 }} contentFit="contain" />
      <View style={styles.stepperLabels}>
        {/* Label centres match the dot centres in the Figma stepper (9, 79, 149, 219). */}
        {[9, 79, 149, 219].map((x, i) => (
          <Text key={x} style={[styles.stepperLabel, { left: x - 6 }]}>
            {i + 1}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function StepHeader({ step, eyebrow, title }: { step: 1 | 2 | 3 | 4; eyebrow: string; title: string }) {
  return (
    <View style={{ gap: 24 }}>
      <Stepper step={step} />
      <View style={{ gap: 14, marginTop: 24 }}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.stepTitle}>{title}</Text>
      </View>
    </View>
  );
}

/** Two-option segmented pill from the Preference screen. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value?: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segment} accessibilityRole="radiogroup">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, selected && { backgroundColor: colors.purple }]}>
            <Text style={styles.segmentText}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Info chip (age, height, place). `glass` (default) is see-through with a blur, for use over
 * photos; `solid` is the original brown pill, for plain backgrounds.
 */
export function Chip({ label, variant = 'glass' }: { label: string; variant?: 'glass' | 'solid' }) {
  if (variant === 'solid') {
    return (
      <View style={styles.chip}>
        <Text style={styles.chipText}>{label}</Text>
      </View>
    );
  }
  return (
    <BlurView intensity={30} tint="light" style={[styles.chip, styles.chipGlass]}>
      <Text style={styles.chipText}>{label}</Text>
    </BlurView>
  );
}

/** Verified badge from Figma ("Varified badge", 2205:66), shown next to a verified profile's name. */
export function VerifiedBadge({ size = 20 }: { size?: number }) {
  return (
    <Image
      source={figma.verifiedBadge}
      style={{ width: size, height: size }}
      contentFit="contain"
      accessible
      accessibilityRole="image"
      accessibilityLabel="Verified profile"
    />
  );
}

/** Name text with the verified badge after it when applicable. */
export function NameWithBadge({
  name,
  verified,
  textStyle,
  badgeSize = 20,
  numberOfLines = 1,
}: {
  name: string;
  verified?: boolean;
  textStyle: StyleProp<TextStyle>;
  badgeSize?: number;
  numberOfLines?: number;
}) {
  // Kalam's line box has a lot of room below the letters, so a centred badge looks low.
  // Lift it towards the top of the name and keep it tight to the last letter.
  const fontSize = StyleSheet.flatten(textStyle)?.fontSize ?? 20;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, maxWidth: '100%' }}>
      <Text style={[textStyle, { flexShrink: 1 }]} numberOfLines={numberOfLines}>
        {name}
      </Text>
      {verified && (
        <View style={{ transform: [{ translateY: -fontSize * 0.22 }] }}>
          <VerifiedBadge size={badgeSize} />
        </View>
      )}
    </View>
  );
}

export function Avatar({ uri, size }: { uri: string | null | undefined; size: number }) {
  if (!uri) {
    return <Image source={figma.avatarPlaceholder} style={{ width: size, height: size }} contentFit="contain" />;
  }
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.field }}
      contentFit="cover"
      transition={150}
    />
  );
}

export const styles = StyleSheet.create({
  button: {
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 11,
    paddingHorizontal: 24,
  },
  buttonText: { fontFamily: fonts.kalamBold, fontSize: 18, lineHeight: 29, includeFontPadding: false },
  field: {
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldInput: { flex: 1, fontFamily: fonts.kalamBold, fontSize: 18, lineHeight: 29, includeFontPadding: false, paddingVertical: 0, height: '100%' },
  error: { fontFamily: fonts.kalam, fontSize: 14, lineHeight: 22, includeFontPadding: false, color: colors.danger, marginTop: 4, marginLeft: 18 },
  stepper: { alignItems: 'center', width: 225, alignSelf: 'center' },
  stepperLabels: { width: 225, height: 18, marginTop: 2 },
  stepperLabel: { position: 'absolute', fontFamily: fonts.kalamBold, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.label, width: 12, textAlign: 'center' },
  eyebrow: { fontFamily: fonts.kalamBold, fontSize: 24, color: colors.brandButton, lineHeight: 38, includeFontPadding: false },
  stepTitle: { fontFamily: fonts.kalamBold, fontSize: 32, lineHeight: 38, color: colors.title },
  segment: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: colors.purpleSoft,
    borderRadius: 32,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  segmentItem: { borderRadius: 25, paddingHorizontal: 16, paddingVertical: 0, justifyContent: 'center' },
  segmentText: { fontFamily: fonts.kalam, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.white },
  chip: { backgroundColor: colors.chip, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 2, justifyContent: 'center' },
  // Frosted glass: light tint over the blurred photo, hairline white edge (overflow clips the blur to the pill).
  chipGlass: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
    overflow: 'hidden',
  },
  chipText: { fontFamily: fonts.kalam, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.white },
});
