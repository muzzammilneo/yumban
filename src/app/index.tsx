import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/context/auth';
import { figma } from '@/theme/assets';
import { colors, fonts } from '@/theme/tokens';

/**
 * Splash (from the updated Figma screenshot): logo + wordmark centred, decorative
 * circle top-left and a large heart cropped bottom-right. Auto-advances; tap to skip.
 * Signed-in users go to Discover, everyone else to the Welcome screen.
 */
export default function Splash() {
  const { user } = useAuth();
  const done = useRef(false);

  const next = useCallback(() => {
    if (done.current) return;
    done.current = true;
    router.replace(user ? '/discover' : '/welcome');
  }, [user]);

  useEffect(() => {
    const t = setTimeout(next, 1800);
    return () => clearTimeout(t);
  }, [next]);

  return (
    <Pressable style={styles.root} onPress={next} accessibilityLabel="Yumban. Tap to continue">
      <StatusBar style="light" />
      <Image source={figma.splashEllipse} style={styles.ellipse} />
      <Image source={figma.splashHeartBg} style={styles.bigHeart} />
      <View style={styles.center}>
        <Image source={figma.logoWhite} style={styles.logo} />
        <Text style={styles.wordmark}>Yumban</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand, overflow: 'hidden' },
  ellipse: { position: 'absolute', left: -153, top: -207, width: 468, height: 468 },
  // Logo shape at ~3.82x (478x424), left 67 / top 558 on an 800pt frame → anchored to the bottom.
  bigHeart: { position: 'absolute', left: 67, bottom: 800 - 558 - 424, width: 478, height: 424 },
  // Logo (125x111) and wordmark sit around the vertical centre of the screen.
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 4 },
  logo: { width: 125, height: 111 },
  // Wordmark ink starts ~28pt below the logo; Kalam's line box adds ~22pt above the glyphs.
  wordmark: { fontFamily: fonts.kalamBold, fontSize: 65, lineHeight: 90, color: colors.white, marginTop: 28 - 22 },
});
