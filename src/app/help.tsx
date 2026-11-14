import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { goBack } from '@/components/navigation';
import { Button } from '@/components/ui';
import { APP_INFO, FAQ } from '@/content/app-info';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

/** Help & FAQ: tap a question to expand it. */
export default function Help() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack('/settings')} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={colors.optionText} />
        </Pressable>
        <Text style={styles.title}>Help & FAQ</Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {FAQ.map((item, i) => {
          const expanded = open === i;
          return (
            <Pressable
              key={item.q}
              onPress={() => setOpen(expanded ? null : i)}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              style={styles.item}>
              <View style={styles.qRow}>
                <Text style={styles.q}>{item.q}</Text>
                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.label} />
              </View>
              {expanded && <Text style={styles.a}>{item.a}</Text>}
            </Pressable>
          );
        })}

        <View style={styles.contact}>
          <Text style={styles.contactTitle}>Still need help?</Text>
          <Text style={styles.contactText}>Our team usually replies within a day.</Text>
          <Button label="Email support" onPress={() => Linking.openURL(`mailto:${APP_INFO.supportEmail}?subject=Yumban%20help`)} style={{ alignSelf: 'stretch' }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardStackB,
  },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.field, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.kalamBold, fontSize: 22, lineHeight: 35, includeFontPadding: false, color: colors.brandButton },
  body: { padding: GUTTER, gap: 10, paddingBottom: 40 },
  item: { backgroundColor: colors.field, borderRadius: radius.card, paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  qRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  q: { flex: 1, fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.optionText },
  a: { fontFamily: fonts.inter, fontSize: 15, lineHeight: 22, color: colors.body },
  contact: { marginTop: 16, alignItems: 'center', gap: 6 },
  contactTitle: { fontFamily: fonts.kalamBold, fontSize: 20, lineHeight: 32, includeFontPadding: false, color: colors.title },
  contactText: { fontFamily: fonts.kalam, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.muted, marginBottom: 6 },
});
