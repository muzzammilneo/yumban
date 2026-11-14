import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Field } from '@/components/ui';
import { REPORT_REASONS, type ReportReason } from '@/services';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

/** Bottom action sheet from the ⋯ button on a profile. */
export function ProfileActionsSheet({
  name,
  visible,
  onClose,
  onReport,
  onBlock,
}: {
  name: string;
  visible: boolean;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.grabber} />
        <SheetRow icon="flag-outline" label={`Report ${name}`} hint="Tell us what’s wrong. They won’t know it was you." onPress={onReport} />
        <SheetRow icon="ban-outline" label={`Block ${name}`} hint="You won’t see each other anywhere on Yumban." onPress={onBlock} danger />
        <Button label="Cancel" variant="option" onPress={onClose} style={{ marginTop: 8 }} />
      </View>
    </Modal>
  );
}

function SheetRow({
  icon,
  label,
  hint,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  hint: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [styles.sheetRow, pressed && { opacity: 0.6 }]}>
      <Ionicons name={icon} size={22} color={danger ? colors.danger : colors.optionText} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.sheetLabel, danger && { color: colors.danger }]}>{label}</Text>
        <Text style={styles.sheetHint}>{hint}</Text>
      </View>
    </Pressable>
  );
}

/** Full-screen report form: reason, optional details, and "also block". */
export function ReportScreen({
  name,
  visible,
  onClose,
  onSubmit,
}: {
  name: string;
  visible: boolean;
  onClose: () => void;
  onSubmit: (r: { reason: ReportReason; details: string; block: boolean }) => Promise<void>;
}) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [block, setBlock] = useState(true);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!reason) return;
    setBusy(true);
    try {
      await onSubmit({ reason, details, block });
      setReason(null);
      setDetails('');
      setBlock(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Pressable onPress={onClose} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={colors.optionText} />
          </Pressable>
          <Text style={styles.headerTitle}>Report {name}</Text>
          <View style={{ width: 44 }} />
        </View>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <Text style={styles.intro}>Why are you reporting this profile? Your report is confidential.</Text>
            <View accessibilityRole="radiogroup">
              {REPORT_REASONS.map((r) => {
                const on = r.value === reason;
                return (
                  <Pressable
                    key={r.value}
                    onPress={() => setReason(r.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={styles.reason}>
                    <Text style={[styles.reasonText, on && { color: colors.brandButton }]}>{r.label}</Text>
                    {on ? (
                      <View style={styles.tickOn}>
                        <Ionicons name="checkmark" size={16} color={colors.white} />
                      </View>
                    ) : (
                      <View style={styles.tickOff} />
                    )}
                  </Pressable>
                );
              })}
            </View>
            <Field
              placeholder="Add details (optional)"
              value={details}
              onChangeText={setDetails}
              multiline
              maxLength={500}
              height={110}
              style={{ textAlignVertical: 'top', paddingTop: 14, fontFamily: fonts.kalam }}
            />
            <View style={styles.blockRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.blockLabel}>Also block {name}</Text>
                <Text style={styles.blockHint}>You won’t see each other anywhere on Yumban.</Text>
              </View>
              <Switch
                value={block}
                onValueChange={setBlock}
                trackColor={{ true: colors.purple, false: colors.cardStackB }}
                thumbColor={colors.white}
                accessibilityLabel={`Also block ${name}`}
              />
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Button label="Send report" disabled={!reason} loading={busy} onPress={submit} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: GUTTER, paddingTop: 10, gap: 4 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: colors.cardStackB, marginBottom: 10 },
  sheetRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  sheetLabel: { fontFamily: fonts.kalamBold, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.optionText },
  sheetHint: { fontFamily: fonts.kalam, fontSize: 14, lineHeight: 22, includeFontPadding: false, color: colors.label },

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
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: fonts.kalamBold, fontSize: 22, lineHeight: 35, includeFontPadding: false, color: colors.brandButton },
  body: { padding: GUTTER, gap: 14 },
  intro: { fontFamily: fonts.kalam, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.body },
  reason: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardStackB,
  },
  reasonText: { flex: 1, fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.optionText },
  tickOn: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.brandButton, alignItems: 'center', justifyContent: 'center' },
  tickOff: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.placeholder },
  blockRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.field, borderRadius: radius.card, padding: 16 },
  blockLabel: { fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.optionText },
  blockHint: { fontFamily: fonts.kalam, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.label },
  footer: { paddingHorizontal: GUTTER, paddingVertical: 12 },
});
