import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { figma } from '@/theme/assets';
import { colors, fonts, GUTTER } from '@/theme/tokens';

/** Figma "Start" (14:20). */
export default function Start() {
  return (
    <LinearGradient
      colors={[colors.white, colors.brandTint]}
      locations={[0.35, 1.07]}
      start={{ x: 0, y: 0.42 }}
      end={{ x: 1, y: 0.58 }}
      style={{ flex: 1 }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.body}>
          <Image source={figma.couple} style={styles.art} contentFit="cover" />
          <Text style={styles.headline}>
            We bring you <Text style={{ color: colors.brand }}>Yumban</Text>, Manipur&apos;s first matrimony app.
          </Text>
          <Text style={styles.sub}>
            This app can help you save time and money, and you can contact potential matches without having to travel.
          </Text>
        </View>
        <Button
          label="Let’s get started"
          variant="brand"
          height={44}
          onPress={() => router.push('/login')}
          trailing={<Image source={figma.arrow} style={{ width: 20.41, height: 10.41 }} />}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: GUTTER, paddingBottom: 40 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  art: { width: 220, height: 220 },
  headline: {
    fontFamily: fonts.kalamBold,
    fontSize: 32,
    lineHeight: 36,
    color: colors.body,
    textAlign: 'center',
    marginTop: 20,
    maxWidth: 303,
  },
  sub: {
    fontFamily: fonts.kalam,
    fontSize: 20,
    lineHeight: 24,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 24,
    maxWidth: 293,
  },
});
