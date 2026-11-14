import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { goBack } from '@/components/navigation';
import { Button } from '@/components/ui';
import { useAuth, useUser } from '@/context/auth';
import { PREMIUM_BENEFITS, PREMIUM_PLANS } from '@/services';
import { figma } from '@/theme/assets';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

/**
 * Premium upgrade screen. Purchases are simulated (demo mode) until real
 * in-app purchases are connected; `activatePremium` is the hook to replace.
 */
export default function Premium() {
  const user = useUser();
  const { premium, activatePremium, cancelPremium } = useAuth();
  const [plan, setPlan] = useState(PREMIUM_PLANS[1].id);
  const [busy, setBusy] = useState(false);
  const selected = PREMIUM_PLANS.find((p) => p.id === plan)!;

  async function buy() {
    setBusy(true);
    try {
      await activatePremium(selected.months);
      goBack('/discover');
    } finally {
      setBusy(false);
    }
  }

  function cancel() {
    const go = async () => {
      setBusy(true);
      try {
        await cancelPremium();
      } finally {
        setBusy(false);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm('End Premium now? (demo)')) go();
      return;
    }
    Alert.alert('End Premium?', 'This turns Premium off now (demo mode).', [
      { text: 'Keep it', style: 'cancel' },
      { text: 'End Premium', style: 'destructive', onPress: go },
    ]);
  }

  const until = user.premiumUntil ? new Date(user.premiumUntil).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.brand, '#B5179E']} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => goBack('/discover')} style={styles.close} accessibilityRole="button" accessibilityLabel="Close">
            <Ionicons name="close" size={22} color={colors.white} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <Image source={figma.logoWhite} style={styles.logo} />
          <Text style={styles.title}>Yumban Premium</Text>
          <Text style={styles.subtitle}>{premium ? `You’re Premium until ${until}.` : 'Find your partner faster.'}</Text>

          <View style={styles.benefits}>
            {PREMIUM_BENEFITS.map((b) => (
              <View key={b.title} style={styles.benefit}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={b.icon} size={20} color={colors.brandButton} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitTitle}>{b.title}</Text>
                  <Text style={styles.benefitBody}>{b.body}</Text>
                </View>
                {premium && <Ionicons name="checkmark-circle" size={22} color={colors.white} />}
              </View>
            ))}
          </View>

          {!premium && (
            <View style={styles.plans} accessibilityRole="radiogroup">
              {PREMIUM_PLANS.map((p) => {
                const on = p.id === plan;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPlan(p.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: on }}
                    style={[styles.plan, on && styles.planOn]}>
                    {p.tag && (
                      <View style={styles.planTag}>
                        <Text style={styles.planTagText}>{p.tag}</Text>
                      </View>
                    )}
                    <Text style={[styles.planMonths, on && { color: colors.brandButton }]}>{p.months}</Text>
                    <Text style={[styles.planUnit, on && { color: colors.label }]}>{p.months === 1 ? 'month' : 'months'}</Text>
                    <Text style={[styles.planPrice, on && { color: colors.optionText }]}>{p.price}</Text>
                    {p.perMonth && <Text style={[styles.planPer, on && { color: colors.label }]}>{p.perMonth}</Text>}
                  </Pressable>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {premium ? (
            <>
              <Button label={`Extend by ${selected.months} months`} variant="white" loading={busy} onPress={buy} />
              <Pressable onPress={cancel} style={styles.cancel}>
                <Text style={styles.cancelText}>End Premium</Text>
              </Pressable>
            </>
          ) : (
            <Button label={`Get Premium · ${selected.price}`} variant="white" loading={busy} onPress={buy} />
          )}
          <Text style={styles.demo}>Demo mode: no payment is taken. In-app purchases will be added before launch.</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 14, paddingTop: 4 },
  close: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 16, alignItems: 'center' },
  logo: { width: 72, height: 64 },
  title: { fontFamily: fonts.kalamBold, fontSize: 34, lineHeight: 54, includeFontPadding: false, color: colors.white, marginTop: 4 },
  subtitle: { fontFamily: fonts.interSemi, fontSize: 16, lineHeight: 22, color: colors.white, opacity: 0.95, textAlign: 'center' },
  benefits: { alignSelf: 'stretch', gap: 10, marginTop: 22 },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.card,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  benefitIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  benefitTitle: { fontFamily: fonts.kalamBold, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.white },
  benefitBody: { fontFamily: fonts.kalam, fontSize: 14, lineHeight: 20, includeFontPadding: false, color: colors.white, opacity: 0.9 },
  plans: { flexDirection: 'row', gap: 10, marginTop: 22, alignSelf: 'stretch' },
  plan: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 12,
    borderRadius: radius.card,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planOn: { backgroundColor: colors.white, borderColor: colors.white },
  planTag: { position: 'absolute', top: -11, backgroundColor: colors.purple, borderRadius: 10, paddingHorizontal: 8 },
  planTagText: { fontFamily: fonts.kalamBold, fontSize: 12, lineHeight: 19, includeFontPadding: false, color: colors.white },
  planMonths: { fontFamily: fonts.kalamBold, fontSize: 30, lineHeight: 40, includeFontPadding: false, color: colors.white },
  planUnit: { fontFamily: fonts.kalam, fontSize: 14, lineHeight: 20, includeFontPadding: false, color: colors.white },
  planPrice: { fontFamily: fonts.interSemi, fontSize: 15, color: colors.white, marginTop: 6 },
  planPer: { fontFamily: fonts.inter, fontSize: 11, color: colors.white, opacity: 0.85, marginTop: 2 },
  footer: { paddingHorizontal: GUTTER, paddingBottom: 12, gap: 8 },
  cancel: { alignItems: 'center', paddingVertical: 6 },
  cancelText: { fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.white },
  demo: { fontFamily: fonts.inter, fontSize: 11, color: colors.white, opacity: 0.8, textAlign: 'center' },
});
