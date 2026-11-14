import { Ionicons } from '@expo/vector-icons';
import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import {
  describeFilter,
  FAITH_FIELDS,
  FAITH_KEYS,
  faithChips,
  faithLabel,
  faithOptions,
  type FaithAnswers,
  type FaithFilter,
  type FaithKey,
} from '@/services';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

type Mode =
  | { kind: 'answers'; value: FaithAnswers; onChange: (v: FaithAnswers) => void }
  | { kind: 'filter'; value: FaithFilter; onChange: (v: FaithFilter) => void };

/**
 * "Faith & Practice" card: one row per field with its current value and a chevron.
 * `answers` mode edits the user's own answers (single choice);
 * `filter` mode edits partner filters (multi choice, "No preference" by default).
 */
export function FaithSection(props: Mode) {
  const [open, setOpen] = useState<FaithKey | null>(null);

  return (
    <View>
      <View style={styles.card}>
        {FAITH_KEYS.map((key, i) => {
          const summary =
            props.kind === 'filter' ? describeFilter(key, props.value[key]) : (faithLabel(key, props.value[key]) ?? 'Prefer not to say');
          return (
            <ListRow key={key} first={i === 0} label={FAITH_FIELDS[key].label} value={summary} onPress={() => setOpen(key)} />
          );
        })}
      </View>

      {open && (
        <OptionScreen
          field={open}
          multi={props.kind === 'filter'}
          selected={props.kind === 'filter' ? (props.value[open] ?? []) : props.value[open] ? [props.value[open]!] : []}
          onClose={() => setOpen(null)}
          onUpdate={(values) => {
            if (props.kind === 'filter') {
              props.onChange({ ...props.value, [open]: values });
            } else {
              const next = { ...props.value };
              if (values[0]) next[open] = values[0];
              else delete next[open];
              props.onChange(next);
            }
            setOpen(null);
          }}
        />
      )}
    </View>
  );
}

/** One row of a settings-style card: bold label, value underneath, chevron. */
export function ListRow({ label, value, onPress, first }: { label: string; value: string; onPress: () => void; first?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      style={({ pressed }) => [styles.row, !first && styles.divider, pressed && { opacity: 0.6 }]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.optionText} />
    </Pressable>
  );
}

/** Full-screen page with a back button, title, optional header action and a bottom button. */
function PickerScreen({
  title,
  onClose,
  headerAction,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  headerAction?: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <Modal animationType="slide" visible onRequestClose={onClose} presentationStyle="fullScreen">
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={24} color={colors.optionText} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerRight}>{headerAction}</View>
        </View>
        <ScrollView contentContainerStyle={styles.screenBody}>{children}</ScrollView>
        <View style={styles.screenFooter}>{footer}</View>
      </SafeAreaView>
    </Modal>
  );
}

function OptionScreen({
  field,
  multi,
  selected,
  onClose,
  onUpdate,
}: {
  field: FaithKey;
  multi: boolean;
  selected: string[];
  onClose: () => void;
  onUpdate: (values: string[]) => void;
}) {
  const [values, setValues] = useState<string[]>(selected);
  const options = faithOptions(field);
  const withDescriptions = options.some(([, o]) => o.description);
  const changed = [...values].sort().join() !== [...selected].sort().join();

  function choose(v: string | null) {
    if (v === null) return setValues([]);
    if (!multi) return setValues([v]);
    setValues((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));
  }

  const none = { value: null, label: multi ? 'No preference' : 'Prefer not to say' };

  return (
    <PickerScreen
      title={FAITH_FIELDS[field].label}
      onClose={onClose}
      footer={<Button label="Update" disabled={!changed} onPress={() => onUpdate(values)} />}>
      {multi && <Text style={styles.intro}>Show people who are… (pick any)</Text>}
      {withDescriptions ? (
        <View style={{ gap: 14 }}>
          {options.map(([value, o]) => (
            <OptionCard
              key={value}
              title={o.label}
              description={o.description}
              selected={values.includes(value)}
              multi={multi}
              onPress={() => choose(value)}
            />
          ))}
          <OptionCard title={none.label} selected={values.length === 0} multi={false} onPress={() => choose(null)} />
        </View>
      ) : (
        <View>
          {options.map(([value, o]) => (
            <OptionLine key={value} label={o.label} selected={values.includes(value)} multi={multi} onPress={() => choose(value)} />
          ))}
          <OptionLine label={none.label} selected={values.length === 0} multi={false} onPress={() => choose(null)} />
        </View>
      )}
    </PickerScreen>
  );
}

function Tick({ on }: { on: boolean }) {
  return on ? (
    <View style={styles.tickOn}>
      <Ionicons name="checkmark" size={16} color={colors.white} />
    </View>
  ) : (
    <View style={styles.tickOff} />
  );
}

function OptionLine({ label, selected, multi, onPress }: { label: string; selected: boolean; multi: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: selected } : { selected }}
      style={styles.line}>
      <Text style={[styles.lineText, selected && { color: colors.brandButton }]}>{label}</Text>
      {selected && <Tick on />}
    </Pressable>
  );
}

function OptionCard({
  title,
  description,
  selected,
  multi,
  onPress,
}: {
  title: string;
  description?: string;
  selected: boolean;
  multi: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: selected } : { selected }}
      style={[styles.optCard, selected && styles.optCardOn]}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.optTitle}>{title}</Text>
        {!!description && <Text style={styles.optDesc}>{description}</Text>}
      </View>
      <Tick on={selected} />
    </Pressable>
  );
}

/** "My Faith" chips for a profile: answers first, then faith tags. */
export function FaithChips({ answers, tags }: { answers?: FaithAnswers; tags?: string[] }) {
  const chips = [...faithChips(answers).map((o) => `${o.emoji} ${o.chip}`), ...(tags ?? [])];
  if (!chips.length) return null;
  return (
    <View style={styles.chips}>
      {chips.map((c) => (
        <View key={c} style={styles.tag}>
          <Text style={styles.tagText}>{c}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.field, borderRadius: radius.card, paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.cardStackB },
  rowLabel: { fontFamily: fonts.kalamBold, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.optionText },
  rowValue: { fontFamily: fonts.kalam, fontSize: 16, lineHeight: 26, includeFontPadding: false, color: colors.label },

  screen: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardStackB,
  },
  headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.field, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.brandButton },
  headerRight: { minWidth: 44, alignItems: 'flex-end' },
  screenBody: { padding: GUTTER, gap: 16 },
  screenFooter: { paddingHorizontal: GUTTER, paddingVertical: 12 },
  intro: { fontFamily: fonts.kalam, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.body },

  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  lineText: { fontFamily: fonts.kalamBold, fontSize: 19, lineHeight: 30, includeFontPadding: false, color: colors.optionText },
  tickOn: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.brandButton, alignItems: 'center', justifyContent: 'center' },
  tickOff: { width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: colors.placeholder },

  optCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.cardStackB,
  },
  optCardOn: { borderColor: colors.brandButton, borderWidth: 2 },
  optTitle: { fontFamily: fonts.kalamBold, fontSize: 19, lineHeight: 30, includeFontPadding: false, color: colors.optionText },
  optDesc: { fontFamily: fonts.kalam, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.label },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 5,
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardStackB,
  },
  tagText: { fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.optionText },
});
