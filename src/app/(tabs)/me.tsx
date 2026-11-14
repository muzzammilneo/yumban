import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { pickPhoto } from '@/components/photo-picker';
import { Avatar, Button, Chip, NameWithBadge } from '@/components/ui';
import { useAuth, useUser } from '@/context/auth';
import { FaithChips } from '@/components/faith';
import { HobbyList } from '@/components/preferences';
import { activeFilterCount, ageFromDob, DEFAULT_PREFS, formatHeight, RELATIONSHIP_LABELS } from '@/services';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';


export default function Me() {
  const user = useUser();
  const { updateProfile, premium } = useAuth();

  const prefs = user.prefs ?? DEFAULT_PREFS;

  async function changePhoto() {
    const uri = await pickPhoto();
    if (uri) await updateProfile({ photo: uri });
  }

  const rows: [keyof typeof Ionicons.glyphMap, string, string | undefined][] = [
    ['call-outline', 'Phone', user.phone],
    ['mail-outline', 'Email', user.email],
    ['location-outline', 'Address', user.address],
    ['briefcase-outline', 'Profession', user.profession],
    ['heart-outline', 'Relationship status', RELATIONSHIP_LABELS[user.relationshipStatus]],
    [
      'search-outline',
      'Seeking',
      `${user.seeking === 'man' ? 'Man' : 'Woman'}, aged ${prefs.ageMin}–${prefs.ageMax}${prefs.verifiedOnly ? ', verified only' : ''}${
        activeFilterCount(prefs.faith) ? `, ${activeFilterCount(prefs.faith)} faith filter${activeFilterCount(prefs.faith) > 1 ? 's' : ''}` : ''
      }`,
    ],
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Pressable onPress={changePhoto} accessibilityRole="button" accessibilityLabel="Change profile photo">
            <Avatar uri={user.photo} size={140} />
            <View style={styles.camBadge}>
              <Ionicons name="camera" size={18} color={colors.white} />
            </View>
          </Pressable>
          <NameWithBadge name={user.name} verified={user.verified} textStyle={styles.name} badgeSize={22} />
          <View style={styles.chips}>
            <Chip variant="solid" label={`${ageFromDob(user.dateOfBirth)}y`} />
            {formatHeight(user.heightIn) && <Chip variant="solid" label={formatHeight(user.heightIn)!} />}
            <Chip variant="solid" label={user.address} />
          </View>
        </View>

        {!!user.about && <Text style={styles.about}>{user.about}</Text>}

        <Pressable onPress={() => router.push('/premium')} style={[styles.premium, premium && styles.premiumOn]} accessibilityRole="button">
          <Ionicons name="diamond" size={22} color={premium ? colors.purple : colors.white} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.premiumTitle, premium && { color: colors.purple }]}>{premium ? 'Yumban Premium' : 'Go Premium'}</Text>
            <Text style={[styles.premiumBody, premium && { color: colors.label }]}>
              {premium
                ? `Active until ${new Date(user.premiumUntil!).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'Unlimited Discover, see who likes you, contact matches'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={premium ? colors.purple : colors.white} />
        </Pressable>

        <View style={{ gap: 10, marginTop: 24 }}>
          <Text style={styles.section}>Hobbies</Text>
          {user.hobbies?.length ? (
            <HobbyList hobbies={user.hobbies} />
          ) : (
            <Text style={styles.emptyNote}>No hobbies yet. Add some in Edit profile.</Text>
          )}
        </View>

        <View style={{ gap: 10, marginTop: 24 }}>
          <Text style={styles.section}>My faith</Text>
          {Object.keys(user.faith ?? {}).length || user.faithTags?.length ? (
            <FaithChips answers={user.faith} tags={user.faithTags} />
          ) : (
            <Text style={styles.emptyNote}>Not filled in yet. Add it in Edit profile.</Text>
          )}
        </View>

        <View style={styles.card}>
          {rows.map(([icon, label, value]) => (
            <View key={label} style={styles.row}>
              <Ionicons name={icon} size={20} color={colors.brandButton} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>{label}</Text>
                <Text style={styles.rowValue}>{value || '—'}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ gap: 12, marginTop: 24 }}>
          <Button label="Edit profile" onPress={() => router.push('/edit-profile')} />
          <Button label="Partner preferences" variant="option" onPress={() => router.push('/filters')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 24, paddingBottom: 32 },
  hero: { alignItems: 'center', gap: 8 },
  camBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  name: { fontFamily: fonts.kalamBold, fontSize: 28, lineHeight: 36, color: colors.title, marginTop: 6 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  about: { fontFamily: fonts.kalam, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.body, textAlign: 'center', marginTop: 16 },
  premium: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    padding: 16,
    borderRadius: radius.card,
    backgroundColor: colors.purple,
  },
  premiumOn: { backgroundColor: '#F1EAFD' },
  premiumTitle: { fontFamily: fonts.kalamBold, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.white },
  premiumBody: { fontFamily: fonts.kalam, fontSize: 14, lineHeight: 22, includeFontPadding: false, color: colors.white },
  section: { fontFamily: fonts.kalamBold, fontSize: 22, lineHeight: 35, includeFontPadding: false, color: colors.brandButton },
  emptyNote: { fontFamily: fonts.kalam, fontSize: 16, lineHeight: 26, includeFontPadding: false, color: colors.muted },
  card: { backgroundColor: colors.field, borderRadius: radius.card, padding: 16, gap: 14, marginTop: 24 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  rowLabel: { fontFamily: fonts.kalam, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.label },
  rowValue: { fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.optionText },
});
