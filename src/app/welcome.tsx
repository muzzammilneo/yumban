import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { figma } from '@/theme/assets';
import { colors, fonts } from '@/theme/tokens';

/**
 * Figma "Welcome" (the gold ring screen, formerly the splash). Shown after the
 * splash to signed-out users; auto-advances to Start, tap to skip.
 * The artwork block keeps the Figma frame's coordinates (offset by TOP) and is centred vertically.
 */
const TOP = 110;
const W = 360;

export default function Welcome() {
  const done = useRef(false);

  const next = useCallback(() => {
    if (done.current) return;
    done.current = true;
    router.replace('/start');
  }, []);

  useEffect(() => {
    const t = setTimeout(next, 2500);
    return () => clearTimeout(t);
  }, [next]);

  return (
    <Pressable style={styles.root} onPress={next} accessibilityLabel="Welcome to Yumban. Tap to continue">
      <StatusBar style="light" />
      <Image source={figma.splashEllipse} style={styles.ellipse} />
      <View style={styles.block}>
        <Image source={figma.logoWhite} style={styles.logo} />
        <Text style={styles.wordmark}>Yumban</Text>
        <Text style={styles.tagline}>Find your perfect partner in easy and 100% halal way!</Text>
        <Text style={styles.nikah}>Ready for Nikah? ☺️</Text>
        <Image source={figma.ringShadow} style={styles.shadow} />
        <Image source={figma.ringGold} style={styles.ring} contentFit="cover" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  ellipse: { position: 'absolute', left: -153, top: -207, width: 468, height: 468 },
  block: { width: W, height: 580 },
  // Subtract (2206:77): 125x111 at y 122
  logo: { position: 'absolute', top: 122 - TOP, left: (W - 125) / 2 + 0.5, width: 125, height: 111 },
  // Text tops in Figma are cap-trimmed; offsets below compensate for line-height padding.
  wordmark: {
    position: 'absolute',
    top: 264 - TOP - 22,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.kalamBold,
    fontSize: 65,
    lineHeight: 90,
    color: colors.white,
  },
  tagline: {
    position: 'absolute',
    top: 347 - TOP,
    left: (W - 283) / 2,
    width: 283,
    textAlign: 'center',
    fontFamily: fonts.interSemi,
    fontSize: 17,
    lineHeight: 21,
    color: colors.white,
  },
  nikah: {
    position: 'absolute',
    top: 471 - TOP - 4,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontFamily: fonts.interSemiItalic,
    fontSize: 16,
    color: colors.white,
  },
  // Ring-shadow (2207:84): 220x36 at (127, 635); the PNG includes blur padding (246x62).
  shadow: { position: 'absolute', left: 127 - 13, top: 635 - 13 - TOP, width: 246, height: 62 },
  // yellow-removebg-preview (2207:80): 195x195 at (81, 483)
  ring: { position: 'absolute', left: 81, top: 483 - TOP, width: 195, height: 195 },
});
