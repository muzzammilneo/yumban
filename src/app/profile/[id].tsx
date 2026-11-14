import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FaithChips } from '@/components/faith';
import { confirmAction } from '@/components/confirm';
import { goBack } from '@/components/navigation';
import { ProfileActionsSheet, ReportScreen } from '@/components/safety';
import { HobbyList } from '@/components/preferences';
import { profileChips } from '@/components/profile-card';
import { Button, Chip, NameWithBadge } from '@/components/ui';
import { useAuth, useUser } from '@/context/auth';
import { backend, RELATIONSHIP_LABELS, type ContactAccess, type Profile } from '@/services';
import { figma } from '@/theme/assets';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

function notify(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n\n${message}`);
  else Alert.alert(title, message);
}

export default function ProfileDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = useUser();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [favourite, setFavourite] = useState(false);
  const [matched, setMatched] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [access, setAccess] = useState<ContactAccess>('open');
  const [requesting, setRequesting] = useState(false);
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const { premium } = useAuth();

  useEffect(() => {
    backend.getProfile(id).then(setProfile);
    backend.isFavourite(user.id, id).then(setFavourite);
    backend.isMatch(user.id, id).then(setMatched);
    backend.isBlocked(user.id, id).then(setBlocked);
    backend.getContactAccess(user.id, id).then(setAccess);
  }, [id, user.id]);

  async function toggleFavourite() {
    const next = !favourite;
    setFavourite(next);
    const { matched: m } = await backend.setFavourite(user.id, id, next);
    setMatched(m);
    if (m) Alert.alert('It’s a match! 💕', `You and ${profile?.name.split(' ')[0]} favourited each other.`);
  }

  async function block() {
    await backend.blockProfile(user.id, id);
    goBack('/discover');
  }

  /** Contact is for matches only, and needs Premium. */
  function contact(go: () => void) {
    if (!matched) {
      return Alert.alert('Match first', `You can contact ${profile?.name.split(' ')[0]} once you’ve both favourited each other.`);
    }
    if (!premium) return router.push('/premium');
    go();
  }

  async function requestContact() {
    setRequesting(true);
    try {
      await backend.requestContact(user.id, id);
      setAccess(await backend.getContactAccess(user.id, id));
    } finally {
      setRequesting(false);
    }
  }

  async function open(url: string, fallback: string) {
    try {
      if (await Linking.canOpenURL(url)) return await Linking.openURL(url);
    } catch {}
    Alert.alert('Not available', fallback);
  }

  if (profile === undefined) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color={colors.brandButton} />
      </View>
    );
  }
  if (!profile || blocked) {
    return (
      <View style={[styles.root, styles.center, { padding: GUTTER }]}>
        <Text style={styles.sectionTitle}>{blocked ? 'You’ve blocked this profile, or they’ve blocked you.' : 'This profile is no longer available.'}</Text>
        <Button label="Go back" onPress={() => goBack('/discover')} style={{ alignSelf: 'stretch', marginTop: 16 }} />
      </View>
    );
  }

  const digits = profile.phone.replace(/\D/g, '');
  const first = profile.name.split(' ')[0];
  // Premium matches can contact directly, unless the other person requires contact requests.
  const needsRequest = matched && premium && access !== 'open' && access !== 'accepted';
  const canContact = matched && premium && (access === 'open' || access === 'accepted');
  const contactNote = !matched
    ? 'Favourite each other to unlock contact.'
    : !premium
      ? '💕 You’re a match. Go Premium to call or WhatsApp.'
      : access === 'open' || access === 'accepted'
        ? '💕 You’re a match. Say salaam!'
        : access === 'pending'
          ? `🔒 ${first} keeps contact private. Waiting for them to accept.`
          : access === 'declined'
            ? `${first} isn’t ready to be contacted yet.`
            : `🔒 ${first} keeps contact private. Send a request to call or WhatsApp.`;
  const common = (profile.hobbies ?? []).filter((h) => user.hobbies?.includes(h));
  const details: [string, string][] = [
    ['Profession', profile.profession],
    ['Relationship status', RELATIONSHIP_LABELS[profile.relationshipStatus]],
    ['Lives in', profile.address],
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 140 }} bounces={false}>
        <View style={styles.hero}>
          <Image
            source={profile.photo ? { uri: profile.photo } : figma.avatarPlaceholder}
            style={StyleSheet.absoluteFill}
            contentFit={profile.photo ? 'cover' : 'contain'}
          />
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
          <View style={styles.heroInfo}>
            <NameWithBadge name={profile.name} verified={profile.verified} textStyle={styles.name} badgeSize={24} numberOfLines={2} />
            {profile.verified && <Text style={styles.verifiedNote}>Verified by Yumban</Text>}
            <View style={styles.chips}>
              {profileChips(profile).map((c) => (
                <Chip key={c} label={c} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {!!profile.about && (
            <View style={{ gap: 6 }}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.about}>{profile.about}</Text>
            </View>
          )}
          {!!profile.hobbies?.length && (
            <View style={{ gap: 10 }}>
              <Text style={styles.sectionTitle}>
                Hobbies
                {common.length > 0 && <Text style={styles.common}>{`  ·  ${common.length} in common`}</Text>}
              </Text>
              <HobbyList hobbies={profile.hobbies} highlight={common} />
            </View>
          )}
          {(Object.keys(profile.faith ?? {}).length > 0 || !!profile.faithTags?.length) && (
            <View style={{ gap: 10 }}>
              <Text style={styles.sectionTitle}>{profile.name.split(' ')[0]}’s faith</Text>
              <FaithChips answers={profile.faith} tags={profile.faithTags} />
            </View>
          )}
          <View style={styles.card}>
            {details.map(([label, value]) => (
              <View key={label}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.value}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Pressable
        onPress={() => goBack('/discover')}
        style={[styles.back, { top: insets.top + 8 }]}
        accessibilityRole="button"
        accessibilityLabel="Back">
        <Ionicons name="chevron-back" size={24} color={colors.white} />
      </Pressable>

      <Pressable
        onPress={() => setMenu(true)}
        style={[styles.more, { top: insets.top + 8 }]}
        accessibilityRole="button"
        accessibilityLabel={`More options for ${first}`}>
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.white} />
      </Pressable>

      <ProfileActionsSheet
        name={first}
        visible={menu}
        onClose={() => setMenu(false)}
        onReport={() => {
          setMenu(false);
          setReporting(true);
        }}
        onBlock={() => {
          setMenu(false);
          confirmAction(`Block ${first}?`, 'You won’t see each other anywhere on Yumban. You can unblock them in Settings.', 'Block', block);
        }}
      />
      <ReportScreen
        name={first}
        visible={reporting}
        onClose={() => setReporting(false)}
        onSubmit={async ({ reason, details, block: alsoBlock }) => {
          await backend.reportProfile(user.id, id, reason, details);
          setReporting(false);
          if (alsoBlock) await block();
          notify('Thanks for your report', 'Our team will review it. We may contact you if we need more details.');
        }}
      />

      <View style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.contactNote}>{contactNote}</Text>
        <Pressable
          onPress={toggleFavourite}
          style={[styles.favBtn, favourite && { backgroundColor: colors.brandButton }]}
          accessibilityRole="button"
          accessibilityState={{ selected: favourite }}
          accessibilityLabel={favourite ? 'Remove from favourites' : 'Add to favourites'}>
          <Ionicons name={favourite ? 'heart' : 'heart-outline'} size={26} color={favourite ? colors.white : colors.brandButton} />
        </Pressable>
        {needsRequest ? (
          <Button
            label={access === 'pending' ? 'Request sent' : access === 'declined' ? 'Request declined' : 'Request to contact'}
            style={{ flex: 1 }}
            disabled={access !== 'none'}
            loading={requesting}
            trailing={<Ionicons name={access === 'pending' ? 'time-outline' : 'chatbubbles-outline'} size={18} color={colors.white} />}
            onPress={requestContact}
          />
        ) : (
          <>
            <Button
              label="Call"
              variant="option"
              style={{ flex: 1 }}
              trailing={<Ionicons name={canContact ? 'call' : 'lock-closed'} size={18} color={colors.optionText} />}
              onPress={() => contact(() => open(`tel:${profile.phone}`, 'Calling is not supported on this device.'))}
            />
            <Button
              label="WhatsApp"
              style={{ flex: 1.3 }}
              trailing={<Ionicons name={canContact ? 'logo-whatsapp' : 'lock-closed'} size={18} color={colors.white} />}
              onPress={() =>
                contact(() =>
                  open(
                    `https://wa.me/${digits}?text=${encodeURIComponent(`Assalamu alaikum ${first}, I found your profile on Yumban.`)}`,
                    'WhatsApp could not be opened.',
                  ),
                )
              }
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  center: { alignItems: 'center', justifyContent: 'center' },
  hero: { height: 460, backgroundColor: colors.field, justifyContent: 'flex-end' },
  heroInfo: { padding: GUTTER, gap: 8 },
  name: { fontFamily: fonts.kalamBold, fontSize: 32, lineHeight: 40, color: colors.white },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  verifiedNote: { fontFamily: fonts.kalamBold, fontSize: 14, lineHeight: 22, includeFontPadding: false, color: colors.white, marginTop: -6 },
  body: { padding: GUTTER, gap: 20 },
  sectionTitle: { fontFamily: fonts.kalamBold, fontSize: 22, lineHeight: 35, includeFontPadding: false, color: colors.brandButton, textAlign: 'left' },
  common: { fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.label },
  about: { fontFamily: fonts.kalam, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.body },
  card: { backgroundColor: colors.field, borderRadius: radius.card, padding: 16, gap: 12 },
  label: { fontFamily: fonts.kalam, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.label },
  value: { fontFamily: fonts.kalamBold, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.optionText },
  more: {
    position: 'absolute',
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    position: 'absolute',
    left: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    rowGap: 8,
    paddingHorizontal: GUTTER,
    paddingTop: 10,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.field,
    alignItems: 'center',
  },
  contactNote: { width: '100%', textAlign: 'center', fontFamily: fonts.kalamBold, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.label },
  favBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.brandButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
