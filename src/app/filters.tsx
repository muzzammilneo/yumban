import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FaithSection } from '@/components/faith';
import { goBack } from '@/components/navigation';
import { AgeRangePicker } from '@/components/preferences';
import { Button, Segmented } from '@/components/ui';
import { useAuth, useUser } from '@/context/auth';
import { DEFAULT_PREFS, type Gender, type PartnerPrefs } from '@/services';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'man', label: '🤵🏻Man' },
  { value: 'woman', label: '👰🏻Woman' },
];

/** Partner preferences that decide who shows up on Discover. */
export default function Filters() {
  const user = useUser();
  const { updateProfile } = useAuth();
  const [seeking, setSeeking] = useState<Gender>(user.seeking);
  const [prefs, setPrefs] = useState<PartnerPrefs>(user.prefs ?? DEFAULT_PREFS);
  const [saving, setSaving] = useState(false);

  function clearAll() {
    setPrefs({ ...DEFAULT_PREFS, faith: {} });
  }

  async function apply() {
    setSaving(true);
    try {
      await updateProfile({ seeking, prefs });
      goBack('/discover');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack('/discover')} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Close">
          <Ionicons name="close" size={22} color={colors.optionText} />
        </Pressable>
        <Text style={styles.title}>Filters</Text>
        <Pressable onPress={clearAll} style={styles.clearBtn} accessibilityRole="button">
          <Text style={styles.clearText}>Clear all</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Basics</Text>
        <View style={styles.group}>
          <Text style={styles.label}>Seeking a</Text>
          <Segmented options={GENDERS} value={seeking} onChange={setSeeking} />
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>Aged between</Text>
          <AgeRangePicker
            min={prefs.ageMin}
            max={prefs.ageMax}
            onChange={({ min, max }) => setPrefs((p) => ({ ...p, ageMin: min, ageMax: max }))}
          />
        </View>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Verified profiles only</Text>
            <Text style={styles.switchHint}>Only show people checked by the Yumban team</Text>
          </View>
          <Switch
            value={!!prefs.verifiedOnly}
            onValueChange={(verifiedOnly) => setPrefs((p) => ({ ...p, verifiedOnly }))}
            trackColor={{ true: colors.purple, false: colors.cardStackB }}
            thumbColor={colors.white}
            accessibilityLabel="Verified profiles only"
          />
        </View>

        <Text style={styles.heading}>Faith & Practice</Text>
        <FaithSection kind="filter" value={prefs.faith ?? {}} onChange={(faith) => setPrefs((p) => ({ ...p, faith }))} />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Apply filters" onPress={apply} loading={saving} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardStackB,
  },
  headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.field, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.brandButton },
  clearBtn: { paddingHorizontal: 16, height: 44, borderRadius: 22, backgroundColor: colors.field, justifyContent: 'center' },
  clearText: { fontFamily: fonts.kalamBold, fontSize: 16, lineHeight: 26, includeFontPadding: false, color: colors.optionText },
  scroll: { padding: GUTTER, gap: 16 },
  heading: { fontFamily: fonts.kalamBold, fontSize: 22, lineHeight: 35, includeFontPadding: false, color: colors.brandButton, marginTop: 4 },
  group: { gap: 10, alignItems: 'center' },
  label: { fontFamily: fonts.kalam, fontSize: 20, lineHeight: 32, includeFontPadding: false, color: colors.label },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.field, borderRadius: radius.card, padding: 16 },
  switchLabel: { fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.optionText },
  switchHint: { fontFamily: fonts.kalam, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.label },
  footer: { paddingHorizontal: GUTTER, paddingVertical: 12 },
});
