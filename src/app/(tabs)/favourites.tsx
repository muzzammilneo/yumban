import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { profileChips } from '@/components/profile-card';
import { Button, NameWithBadge } from '@/components/ui';
import { useAuth, useUser } from '@/context/auth';
import { ageFromDob, backend, type Profile } from '@/services';
import { figma } from '@/theme/assets';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

type Section = 'favourites' | 'likes' | 'matches';

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'favourites', label: 'Favourites' },
  { key: 'likes', label: 'Likes you' },
  { key: 'matches', label: 'Matches' },
];

export default function Favourites() {
  const user = useUser();
  const { premium } = useAuth();
  const params = useLocalSearchParams<{ section?: Section }>();
  const [section, setSection] = useState<Section>(params.section ?? 'favourites');
  const [data, setData] = useState<Record<Section, Profile[]> | null>(null);

  const load = useCallback(async () => {
    const [favourites, likes, matches] = await Promise.all([
      backend.getFavourites(user.id),
      backend.getLikesReceived(user.id),
      backend.getMatches(user.id),
    ]);
    setData({ favourites, likes, matches });
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function unfavourite(id: string) {
    await backend.setFavourite(user.id, id, false);
    load();
  }

  async function likeBack(p: Profile) {
    await backend.setFavourite(user.id, p.id, true);
    await load();
    setSection('matches');
  }

  const items = data?.[section] ?? [];
  const lockedLikes = section === 'likes' && !premium;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Your people</Text>
        <View style={styles.tabs} accessibilityRole="tablist">
          {SECTIONS.map((s) => {
            const on = s.key === section;
            const count = data?.[s.key].length ?? 0;
            return (
              <Pressable
                key={s.key}
                onPress={() => setSection(s.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={[styles.tab, on && styles.tabOn]}>
                <Text style={[styles.tabText, on && { color: colors.white }]}>
                  {s.label}
                  {count ? ` ${count}` : ''}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {lockedLikes && items.length > 0 && (
        <Pressable onPress={() => router.push('/premium')} style={styles.upsell} accessibilityRole="button">
          <Ionicons name="eye" size={22} color={colors.white} />
          <Text style={styles.upsellText}>
            {items.length} {items.length === 1 ? 'person has' : 'people have'} favourited you. See who with Premium.
          </Text>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </Pressable>
      )}

      <FlatList
        key={section}
        data={items}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14 }}
        contentContainerStyle={styles.list}
        ListEmptyComponent={data ? <Empty section={section} /> : undefined}
        renderItem={({ item }) =>
          lockedLikes ? (
            <LockedTile profile={item} />
          ) : (
            <Pressable
              style={styles.tile}
              onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.id } })}
              accessibilityRole="button"
              accessibilityLabel={`View ${item.name}'s profile`}>
              <Image
                source={item.photo ? { uri: item.photo } : figma.avatarPlaceholder}
                style={styles.photo}
                contentFit={item.photo ? 'cover' : 'contain'}
              />
              <View style={styles.tileInfo}>
                <NameWithBadge name={item.name} verified={item.verified} textStyle={styles.name} badgeSize={16} />
                <Text style={styles.meta} numberOfLines={1}>
                  {profileChips(item).join(' · ')}
                </Text>
              </View>
              {section === 'favourites' && (
                <Pressable onPress={() => unfavourite(item.id)} style={styles.corner} hitSlop={8} accessibilityLabel={`Remove ${item.name} from favourites`}>
                  <Ionicons name="heart" size={18} color={colors.brandButton} />
                </Pressable>
              )}
              {section === 'likes' && (
                <Pressable onPress={() => likeBack(item)} style={styles.corner} hitSlop={8} accessibilityLabel={`Favourite ${item.name} back`}>
                  <Ionicons name="heart-outline" size={18} color={colors.brandButton} />
                </Pressable>
              )}
              {section === 'matches' && (
                <View style={styles.matchTag}>
                  <Text style={styles.matchTagText}>💕 Match</Text>
                </View>
              )}
            </Pressable>
          )
        }
      />
    </SafeAreaView>
  );
}

/** Free members see that someone liked them, but not who. */
function LockedTile({ profile }: { profile: Profile }) {
  return (
    <Pressable style={styles.tile} onPress={() => router.push('/premium')} accessibilityRole="button" accessibilityLabel="Hidden profile. Go Premium to see who.">
      <Image source={profile.photo ? { uri: profile.photo } : figma.avatarPlaceholder} style={styles.photo} contentFit="cover" blurRadius={28} />
      <View style={styles.lock}>
        <Ionicons name="lock-closed" size={22} color={colors.white} />
      </View>
      <View style={styles.tileInfo}>
        <Text style={styles.name}>Someone</Text>
        <Text style={styles.meta}>{ageFromDob(profile.dateOfBirth)}y</Text>
      </View>
    </Pressable>
  );
}

function Empty({ section }: { section: Section }) {
  const copy = {
    favourites: { icon: 'star-outline', text: 'No favourites yet. Swipe right on people you like.' },
    likes: { icon: 'eye-outline', text: 'No new likes yet. Complete your profile to get noticed.' },
    matches: { icon: 'heart-circle-outline', text: 'No matches yet. When you both favourite each other, you’ll see them here.' },
  }[section];
  return (
    <View style={styles.empty}>
      <Ionicons name={copy.icon as keyof typeof Ionicons.glyphMap} size={52} color={colors.placeholder} />
      <Text style={styles.emptyText}>{copy.text}</Text>
      <Button label="Discover people" onPress={() => router.navigate('/discover')} style={{ alignSelf: 'stretch' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: { paddingHorizontal: GUTTER, paddingTop: 24, paddingBottom: 12, gap: 10 },
  title: { fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.brandButton },
  tabs: { flexDirection: 'row', backgroundColor: colors.field, borderRadius: radius.pill, padding: 4 },
  tab: { flex: 1, alignItems: 'center', borderRadius: radius.pill, paddingVertical: 2 },
  tabOn: { backgroundColor: colors.purple },
  tabText: { fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.optionText },
  upsell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: GUTTER,
    marginBottom: 12,
    padding: 14,
    borderRadius: radius.card,
    backgroundColor: colors.brandButton,
  },
  upsellText: { flex: 1, fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 22, includeFontPadding: false, color: colors.white },
  list: { paddingHorizontal: GUTTER, paddingBottom: 24, gap: 14, flexGrow: 1 },
  tile: { flex: 1, maxWidth: '50%', borderRadius: radius.card, backgroundColor: colors.field, overflow: 'hidden' },
  photo: { width: '100%', aspectRatio: 0.8 },
  tileInfo: { padding: 10 },
  name: { fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.optionText },
  meta: { fontFamily: fonts.kalam, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.label },
  corner: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lock: {
    position: 'absolute',
    top: '30%',
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchTag: { position: 'absolute', top: 8, left: 8, backgroundColor: colors.white, borderRadius: radius.pill, paddingHorizontal: 8 },
  matchTagText: { fontFamily: fonts.kalamBold, fontSize: 12, lineHeight: 19, includeFontPadding: false, color: colors.brandButton },
  empty: { alignItems: 'center', gap: 12, marginTop: 60, paddingHorizontal: GUTTER },
  emptyText: { fontFamily: fonts.kalam, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.muted, textAlign: 'center' },
});
