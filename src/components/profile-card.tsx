import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { forwardRef, useImperativeHandle } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Chip, NameWithBadge } from '@/components/ui';
import { ageFromDob, formatHeight, type Profile, type SwipeDirection } from '@/services';
import { figma } from '@/theme/assets';
import { colors, fonts, radius } from '@/theme/tokens';

export const CARD_WIDTH = 318;
export const CARD_HEIGHT = 506;

export interface ProfileCardHandle {
  swipe(direction: SwipeDirection): void;
}

export function profileChips(p: Profile) {
  return [`${ageFromDob(p.dateOfBirth)}y`, formatHeight(p.heightIn), p.address].filter(Boolean) as string[];
}

/** Static card matching Figma "Favourite" (205:59). */
export function ProfileCardFace({ profile }: { profile: Profile }) {
  return (
    <View style={styles.card}>
      <Image
        source={profile.photo ? { uri: profile.photo } : figma.avatarPlaceholder}
        style={StyleSheet.absoluteFill}
        contentFit={profile.photo ? 'cover' : 'contain'}
        transition={200}
      />
      <BlurView intensity={25} tint="dark" style={styles.info}>
        <NameWithBadge name={profile.name} verified={profile.verified} textStyle={styles.name} />
        <View style={styles.chips}>
          {profileChips(profile).map((c) => (
            <Chip key={c} label={c} />
          ))}
        </View>
      </BlurView>
    </View>
  );
}

/** Top card of the Discover stack: drag right to favourite, left to pass. */
export const SwipeableProfileCard = forwardRef<
  ProfileCardHandle,
  { profile: Profile; onSwiped: (direction: SwipeDirection) => void; onPress: () => void }
>(function SwipeableProfileCard({ profile, onSwiped, onPress }, ref) {
  const { width } = useWindowDimensions();
  const threshold = width * 0.28;
  const offscreen = width * 1.5;
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const fling = (direction: SwipeDirection) => {
    tx.set(withTiming(direction === 'like' ? offscreen : -offscreen, { duration: 260 }, (finished) => {
      if (finished) scheduleOnRN(onSwiped, direction);
    }));
  };

  useImperativeHandle(ref, () => ({ swipe: fling }));

  const pan = usePanGesture({
    activeOffsetX: [-10, 10],
    onUpdate: (e) => {
      'worklet';
      tx.set(e.translationX);
      ty.set(e.translationY * 0.3);
    },
    onDeactivate: (e) => {
      'worklet';
      const projected = e.translationX + e.velocityX * 0.15;
      if (Math.abs(projected) > threshold) {
        const direction: SwipeDirection = projected > 0 ? 'like' : 'pass';
        tx.set(withTiming(direction === 'like' ? offscreen : -offscreen, { duration: 220 }, (finished) => {
          if (finished) scheduleOnRN(onSwiped, direction);
        }));
      } else {
        tx.set(withSpring(0));
      }
      ty.set(withSpring(0));
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { rotate: `${interpolate(tx.value, [-width, 0, width], [-12, 0, 12])}deg` },
    ],
  }));
  const likeStyle = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [0, threshold], [0, 1], 'clamp') }));
  const passStyle = useAnimatedStyle(() => ({ opacity: interpolate(tx.value, [-threshold, 0], [1, 0], 'clamp') }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={cardStyle}>
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`View ${profile.name}'s profile`}>
          <ProfileCardFace profile={profile} />
        </Pressable>
        <Animated.View style={[styles.stamp, styles.stampLike, likeStyle]} pointerEvents="none">
          <Text style={[styles.stampText, { color: colors.brandButton }]}>FAVOURITE</Text>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampPass, passStyle]} pointerEvents="none">
          <Text style={[styles.stampText, { color: colors.label }]}>PASS</Text>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.field,
  },
  info: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 100,
    paddingHorizontal: 24,
    paddingVertical: 18,
    gap: 8,
    justifyContent: 'flex-end',
  },
  name: { fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.white, paddingLeft: 1 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stamp: {
    position: 'absolute',
    top: 36,
    borderWidth: 4,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  stampLike: { left: 24, borderColor: colors.brandButton, transform: [{ rotate: '-14deg' }] },
  stampPass: { right: 24, borderColor: colors.label, transform: [{ rotate: '14deg' }] },
  stampText: { fontFamily: fonts.kalamBold, fontSize: 30, lineHeight: 40 },
});
