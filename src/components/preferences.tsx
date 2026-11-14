import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AGE_LIMITS, FAITH_TAGS, HOBBIES, MAX_FAITH_TAGS, MAX_HOBBIES } from '@/services';
import { colors, fonts, radius } from '@/theme/tokens';

/** Min/max age picker with − / + steppers, styled like the Figma option pills. */
export function AgeRangePicker({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (range: { min: number; max: number }) => void;
}) {
  return (
    <View style={styles.ageRow}>
      <AgeStepper
        label="From"
        value={min}
        canDec={min > AGE_LIMITS.min}
        canInc={min < max}
        onDec={() => onChange({ min: min - 1, max })}
        onInc={() => onChange({ min: min + 1, max })}
      />
      <Text style={styles.to}>to</Text>
      <AgeStepper
        label="To"
        value={max}
        canDec={max > min}
        canInc={max < AGE_LIMITS.max}
        onDec={() => onChange({ min, max: max - 1 })}
        onInc={() => onChange({ min, max: max + 1 })}
      />
    </View>
  );
}

function AgeStepper({
  label,
  value,
  canDec,
  canInc,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  canDec: boolean;
  canInc: boolean;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <View
      style={styles.stepper}
      accessibilityRole="adjustable"
      accessibilityLabel={`${label} age`}
      accessibilityValue={{ now: value, min: AGE_LIMITS.min, max: AGE_LIMITS.max, text: `${value} years` }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'increment' && canInc) onInc();
        if (e.nativeEvent.actionName === 'decrement' && canDec) onDec();
      }}>
      <StepButton icon="remove" label={`Decrease ${label.toLowerCase()} age`} disabled={!canDec} onPress={onDec} />
      <Text style={styles.ageValue}>{value}</Text>
      <StepButton icon="add" label={`Increase ${label.toLowerCase()} age`} disabled={!canInc} onPress={onInc} />
    </View>
  );
}

function StepButton({ icon, label, disabled, onPress }: { icon: 'add' | 'remove'; label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [styles.stepBtn, disabled && { opacity: 0.35 }, pressed && { backgroundColor: colors.purple }]}>
      <Ionicons name={icon} size={20} color={colors.white} />
    </Pressable>
  );
}

/** Toggleable hobby chips, capped at MAX_HOBBIES. */
/** Toggleable chips from a fixed list, capped at `max` (used for hobbies and faith tags). */
export function ChipPicker({
  options,
  max,
  value,
  onChange,
}: {
  options: readonly string[];
  max: number;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const full = value.length >= max;
  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.counter}>
        {value.length}/{max} selected{full ? ' · remove one to pick another' : ''}
      </Text>
      <View style={styles.chips}>
        {options.map((h) => {
          const selected = value.includes(h);
          const disabled = !selected && full;
          return (
            <Pressable
              key={h}
              onPress={() => onChange(selected ? value.filter((x) => x !== h) : [...value, h])}
              disabled={disabled}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected, disabled }}
              style={[styles.hobby, selected && styles.hobbySelected, disabled && { opacity: 0.4 }]}>
              <Text style={[styles.hobbyText, selected && { color: colors.white }]}>{h}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function HobbyPicker({ value, onChange }: { value: string[]; onChange: (hobbies: string[]) => void }) {
  return <ChipPicker options={HOBBIES} max={MAX_HOBBIES} value={value} onChange={onChange} />;
}

/** "What matters most in your Islamic practice" tags. */
export function FaithTagPicker({ value, onChange }: { value: string[]; onChange: (tags: string[]) => void }) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.intro}>
        Choose up to <Text style={{ fontFamily: fonts.kalamBold }}>{MAX_FAITH_TAGS}</Text> to describe what matters most in your Islamic practice.
      </Text>
      <ChipPicker options={FAITH_TAGS} max={MAX_FAITH_TAGS} value={value} onChange={onChange} />
    </View>
  );
}

/** Read-only hobby chips; hobbies shared with the viewer are highlighted. */
export function HobbyList({ hobbies, highlight }: { hobbies: string[]; highlight?: string[] }) {
  const shared = new Set(highlight ?? []);
  return (
    <View style={styles.chips}>
      {hobbies.map((h) => (
        <View key={h} style={[styles.hobby, shared.has(h) && styles.hobbyShared]}>
          <Text style={[styles.hobbyText, shared.has(h) && { color: colors.white }]}>{h}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  to: { fontFamily: fonts.kalam, fontSize: 20, lineHeight: 32, includeFontPadding: false, color: colors.label },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purpleSoft,
    borderRadius: 32,
    paddingHorizontal: 8,
    paddingVertical: 2,
    gap: 6,
  },
  stepBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  ageValue: { fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.white, minWidth: 34, textAlign: 'center' },
  intro: { fontFamily: fonts.kalam, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.body },
  counter: { fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.label },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  hobby: { backgroundColor: colors.field, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 5, justifyContent: 'center' },
  hobbySelected: { backgroundColor: colors.purple },
  hobbyShared: { backgroundColor: colors.brandButton },
  hobbyText: { fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.optionText },
});
