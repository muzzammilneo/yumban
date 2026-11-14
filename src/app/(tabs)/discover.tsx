import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CARD_HEIGHT, CARD_WIDTH, ProfileCardFace, SwipeableProfileCard, type ProfileCardHandle } from '@/components/profile-card';
import { Avatar, Button } from '@/components/ui';
import { useAuth, useUser } from '@/context/auth';
import { activeFilterCount, backend, BackendError, DEFAULT_PREFS, FREE_DAILY_SWIPES, type Profile, type SwipeAllowance, type SwipeDirection } from '@/services';
import { figma } from '@/theme/assets';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

/** Figma "Favourite" (205:22): people near you, swipe right to favourite. */
export default function Discover() {
  const user = useUser();
  const { premium } = useAuth();
  const [queue, setQueue] = useState<Profile[] | null>(null);
  const [allowance, setAllowance] = useState<SwipeAllowance | null>(null);
  const [match, setMatch] = useState<Profile | null>(null);
  const cardRef = useRef<ProfileCardHandle>(null);

  const [unread, setUnread] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);

  const load = useCallback(async () => {
    const [q, notes, a] = await Promise.all([
      backend.getDiscoverQueue(user.id),
      backend.getNotifications(user.id),
      backend.getSwipeAllowance(user.id),
    ]);
    setQueue(q);
    setUnread(notes.filter((n) => !n.read).length);
    setAllowance(a);
    // premium is a dependency so the limit lifts as soon as Premium starts.
  }, [user.id, premium]); // eslint-disable-line react-hooks/exhaustive-deps

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onSwiped = useCallback(
    async (direction: SwipeDirection) => {
      const top = queue?.[0];
      if (!top) return;
      setQueue((q) => q?.slice(1) ?? null);
      try {
        const { matched } = await backend.recordSwipe(user.id, top.id, direction);
        if (matched) {
          setMatch(top);
          setUnread((n) => n + 1);
        }
      } catch (e) {
        // Out of free swipes (e.g. a second device used them): put the card back.
        if (e instanceof BackendError && e.field === 'limit') setQueue((q) => (q ? [top, ...q] : [top]));
        else throw e;
      }
      setAllowance(await backend.getSwipeAllowance(user.id));
    },
    [queue, user.id],
  );

  async function undo() {
    if (!premium) return router.push('/premium');
    const id = await backend.undoLastSwipe(user.id);
    if (id) await load();
  }

  async function startOver() {
    await backend.resetPasses(user.id);
    load();
  }

  const outOfSwipes = allowance?.remaining === 0;
  const top = outOfSwipes ? undefined : queue?.[0];
  const next = outOfSwipes ? undefined : queue?.[1];
  // Shrink the Figma-sized card (318x506) on shorter screens so it never overflows.
  const cardScale = stageHeight ? Math.min(1, (stageHeight - 8) / (CARD_HEIGHT + 19)) : 1;
  const prefs = user.prefs ?? DEFAULT_PREFS;
  const filterCount =
    activeFilterCount(prefs.faith) +
    (prefs.verifiedOnly ? 1 : 0) +
    (prefs.ageMin !== DEFAULT_PREFS.ageMin || prefs.ageMax !== DEFAULT_PREFS.ageMax ? 1 : 0);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.topBar}>
        <View style={styles.brand} accessible accessibilityRole="header" accessibilityLabel="Yumban">
          <Image source={figma.logoPink} style={styles.brandLogo} contentFit="contain" />
          <Text style={styles.brandName}>Yumban</Text>
        </View>
        <View style={styles.topActions}>
          <IconButton
            icon="notifications-outline"
            label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
            badge={unread}
            onPress={() => router.push('/notifications')}
          />
          <IconButton
            icon="options-outline"
            label={filterCount ? `Filters, ${filterCount} active` : 'Filters'}
            badge={filterCount}
            onPress={() => router.push('/filters')}
          />
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>People near you</Text>
          {allowance?.remaining != null && !outOfSwipes && (
            <Pressable onPress={() => router.push('/premium')} style={styles.quota} accessibilityRole="button">
              <Text style={styles.quotaText}>
                {allowance.remaining}/{FREE_DAILY_SWIPES} left today
              </Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.subtitle}>Swipe right to add to your favourites</Text>
      </View>

      <View style={styles.stage} onLayout={(e) => setStageHeight(e.nativeEvent.layout.height)}>
        {queue === null || allowance === null ? (
          <ActivityIndicator color={colors.brandButton} />
        ) : outOfSwipes ? (
          <View style={styles.empty}>
            <Ionicons name="hourglass-outline" size={56} color={colors.brandButton} />
            <Text style={styles.emptyTitle}>That’s {FREE_DAILY_SWIPES} for today</Text>
            <Text style={styles.emptyText}>
              Free members can see {FREE_DAILY_SWIPES} profiles a day. Come back tomorrow, or go Premium to keep discovering now.
            </Text>
            <Button label="Get unlimited with Premium" onPress={() => router.push('/premium')} style={{ alignSelf: 'stretch', marginTop: 12 }} />
          </View>
        ) : top ? (
          <View style={[styles.stack, { transform: [{ scale: cardScale }] }]}>
            {/* Stacked plates under the card, from the Figma frame. */}
            <View style={[styles.plate, { width: 268, top: CARD_HEIGHT - 49, backgroundColor: colors.cardStackB }]} />
            <View style={[styles.plate, { width: 292, top: CARD_HEIGHT - 58, backgroundColor: colors.cardStackA }]} />
            {next && (
              <View style={styles.behind} pointerEvents="none">
                <ProfileCardFace profile={next} />
              </View>
            )}
            <SwipeableProfileCard
              key={top.id}
              ref={cardRef}
              profile={top}
              onSwiped={onSwiped}
              onPress={() => router.push({ pathname: '/profile/[id]', params: { id: top.id } })}
            />
          </View>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="heart-dislike-outline" size={56} color={colors.placeholder} />
            <Text style={styles.emptyTitle}>You’re all caught up</Text>
            <Text style={styles.emptyText}>
              No more profiles match your preferences right now. Try widening them, or look again at people you passed.
            </Text>
            <Button label="See passed profiles again" onPress={startOver} style={{ alignSelf: 'stretch', marginTop: 12 }} />
            <Button label="Adjust preferences" variant="option" onPress={() => router.push('/filters')} style={{ alignSelf: 'stretch' }} />
          </View>
        )}
      </View>

      {top && (
        <View style={styles.actions}>
          <RoundButton icon="arrow-undo" color={colors.purple} label={premium ? 'Undo last swipe' : 'Undo (Premium)'} onPress={undo} small />
          <RoundButton icon="close" color={colors.label} label="Pass" onPress={() => cardRef.current?.swipe('pass')} />
          <RoundButton icon="heart" color={colors.brandButton} label="Add to favourites" onPress={() => cardRef.current?.swipe('like')} big />
        </View>
      )}
      <MatchModal profile={match} me={user} onClose={() => setMatch(null)} />
    </SafeAreaView>
  );
}

function MatchModal({ profile, me, onClose }: { profile: Profile | null; me: Profile; onClose: () => void }) {
  return (
    <Modal visible={!!profile} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.matchBackdrop}>
        {profile && (
          <View style={styles.matchCard}>
            <Text style={styles.matchTitle}>It’s a match! 💕</Text>
            <Text style={styles.matchText}>You and {profile.name.split(' ')[0]} favourited each other.</Text>
            <View style={styles.matchAvatars}>
              <Avatar uri={me.photo} size={96} />
              <View style={{ marginLeft: -18 }}>
                <Avatar uri={profile.photo} size={96} />
              </View>
            </View>
            <Button
              label="View profile"
              onPress={() => {
                onClose();
                router.push({ pathname: '/profile/[id]', params: { id: profile.id } });
              }}
              style={{ alignSelf: 'stretch' }}
            />
            <Button label="Keep swiping" variant="option" onPress={onClose} style={{ alignSelf: 'stretch' }} />
          </View>
        )}
      </View>
    </Modal>
  );
}

function IconButton({
  icon,
  label,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={label}>
      <Ionicons name={icon} size={22} color={colors.optionText} />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

function RoundButton({
  icon,
  color,
  label,
  onPress,
  big,
  small,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  label: string;
  onPress: () => void;
  big?: boolean;
  small?: boolean;
}) {
  const size = big ? 64 : small ? 44 : 54;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.round, { width: size, height: size, borderRadius: size / 2 }, pressed && { transform: [{ scale: 0.92 }] }]}>
      <Ionicons name={icon} size={big ? 32 : small ? 20 : 26} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  quota: { backgroundColor: colors.field, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 2 },
  quotaText: { fontFamily: fonts.kalamBold, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.purple },
  matchBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: GUTTER },
  matchCard: { width: '100%', maxWidth: 340, backgroundColor: colors.white, borderRadius: 28, padding: 24, alignItems: 'center', gap: 10 },
  matchTitle: { fontFamily: fonts.kalamBold, fontSize: 32, lineHeight: 51, includeFontPadding: false, color: colors.brandButton },
  matchText: { fontFamily: fonts.kalam, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.body, textAlign: 'center' },
  matchAvatars: { flexDirection: 'row', marginVertical: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: GUTTER, paddingTop: 8 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Pink logo ("Icon", 2206:75) is 84.5x74.8
  brandLogo: { width: 34, height: 30 },
  brandName: { fontFamily: fonts.kalamBold, fontSize: 28, lineHeight: 45, includeFontPadding: false, color: colors.brandButton },
  topActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.field, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.brandButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.interSemi, fontSize: 11, color: colors.white },
  header: { paddingHorizontal: GUTTER, paddingTop: 10, gap: 0 },
  title: { fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.brandButton },
  subtitle: { fontFamily: fonts.kalamBold, fontSize: 20, lineHeight: 32, includeFontPadding: false, color: colors.title },
  stage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stack: { width: CARD_WIDTH, height: CARD_HEIGHT + 19 },
  plate: { position: 'absolute', height: 68, borderRadius: radius.card, alignSelf: 'center' },
  behind: { position: 'absolute', top: 0, transform: [{ scale: 0.96 }], opacity: 0.9 },
  actions: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28, paddingBottom: 14 },
  round: {
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  empty: { alignItems: 'center', paddingHorizontal: GUTTER * 1.5, gap: 6 },
  emptyTitle: { fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.title, marginTop: 8 },
  emptyText: { fontFamily: fonts.kalam, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.muted, textAlign: 'center' },
});
