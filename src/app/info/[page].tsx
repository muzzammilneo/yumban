import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { goBack } from '@/components/navigation';
import { ABOUT, PRIVACY, TERMS, type InfoPage } from '@/content/app-info';
import { figma } from '@/theme/assets';
import { colors, fonts, GUTTER } from '@/theme/tokens';

const PAGES: Record<string, InfoPage> = { about: ABOUT, terms: TERMS, privacy: PRIVACY };

/** About / Terms / Privacy pages. */
export default function Info() {
  const { page } = useLocalSearchParams<{ page: string }>();
  const content = PAGES[page] ?? ABOUT;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack('/settings')} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={colors.optionText} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {content.title}
        </Text>
        <View style={{ width: 44 }} />
      </View>
      <ScrollView contentContainerStyle={styles.body}>
        {page === 'about' && <Image source={figma.logoPink} style={styles.logo} contentFit="contain" />}
        {!!content.intro && <Text style={styles.intro}>{content.intro}</Text>}
        {content.sections.map((s, i) => (
          <View key={i} style={{ gap: 4 }}>
            {!!s.heading && <Text style={styles.heading}>{s.heading}</Text>}
            <Text style={styles.text}>{s.body}</Text>
          </View>
        ))}
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
  body: { padding: GUTTER, gap: 18, paddingBottom: 40 },
  logo: { width: 84, height: 75, alignSelf: 'center', marginTop: 8 },
  intro: { fontFamily: fonts.kalam, fontSize: 18, lineHeight: 27, includeFontPadding: false, color: colors.body },
  heading: { fontFamily: fonts.kalamBold, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.optionText },
  text: { fontFamily: fonts.inter, fontSize: 15, lineHeight: 23, color: colors.body },
});
