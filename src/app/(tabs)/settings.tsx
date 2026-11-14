import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { confirmAction } from '@/components/confirm';
import { useAuth, useUser } from '@/context/auth';
import { APP_INFO } from '@/content/app-info';
import { backend } from '@/services';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

type IconName = keyof typeof Ionicons.glyphMap;

export default function Settings() {
  const user = useUser();
  const { premium, logOut, deleteAccount, updateProfile } = useAuth();
  const [pending, setPending] = useState(0);

  useFocusEffect(
    useCallback(() => {
      backend.getIncomingContactRequests(user.id).then((r) => setPending(r.length));
    }, [user.id]),
  );
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const until = user.premiumUntil
    ? new Date(user.premiumUntil).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  async function email(subject: string) {
    const url = `mailto:${APP_INFO.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `\n\n—\nApp version ${version} (${Platform.OS})`,
    )}`;
    try {
      if (await Linking.canOpenURL(url)) return await Linking.openURL(url);
    } catch {}
    Alert.alert('Email us', APP_INFO.supportEmail);
  }

  function manageSubscription() {
    // Real subscriptions are managed by the store; until purchases are wired up, open our Premium screen.
    router.push('/premium');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>

        <Group title="Account">
          <Row
            icon="diamond-outline"
            label="Subscription"
            value={premium ? `Premium · until ${until}` : 'Free'}
            onPress={manageSubscription}
          />
          <Row icon="person-outline" label="Edit profile" onPress={() => router.push('/edit-profile')} />
          <Row icon="options-outline" label="Partner preferences" onPress={() => router.push('/filters')} />
          <Row icon="notifications-outline" label="Notifications" onPress={() => router.push('/notifications')} />
        </Group>

        <Group title="Privacy & safety">
          <View style={styles.row}>
            <Ionicons name="lock-closed-outline" size={21} color={colors.brandButton} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: colors.optionText }]}>Contact requests only</Text>
              <Text style={styles.rowValue}>Matches must ask before they can call or WhatsApp you</Text>
            </View>
            <Switch
              value={!!user.contactPrivacy}
              onValueChange={(contactPrivacy) => updateProfile({ contactPrivacy })}
              trackColor={{ true: colors.purple, false: colors.cardStackB }}
              thumbColor={colors.white}
              accessibilityLabel="Contact requests only"
            />
          </View>
          <Row
            icon="chatbubbles-outline"
            label="Contact requests"
            value={pending ? `${pending} waiting` : 'No pending requests'}
            onPress={() => router.push('/requests' as Href)}
          />
          <Row icon="ban-outline" label="Blocked profiles" onPress={() => router.push('/blocked' as Href)} />
        </Group>

        <Group title="Support">
          <Row icon="help-circle-outline" label="Help & FAQ" onPress={() => router.push('/help')} />
          <Row icon="mail-outline" label="Contact us" value={APP_INFO.supportEmail} onPress={() => email('Yumban support')} />
          <Row icon="flag-outline" label="Report a problem" onPress={() => email('Problem report')} />
        </Group>

        <Group title="Legal">
          <Row icon="document-text-outline" label="Terms of Service" onPress={() => router.push('/info/terms' as Href)} />
          <Row icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => router.push('/info/privacy' as Href)} />
        </Group>

        <Group title="About">
          <Row icon="heart-outline" label="About Yumban" onPress={() => router.push('/info/about' as Href)} />
          <Row icon="information-circle-outline" label="Version" value={version} />
        </Group>

        <Group>
          <Row
            icon="log-out-outline"
            label="Log out"
            onPress={() =>
              confirmAction('Log out?', 'You can log back in with your phone/email and password.', 'Log out', async () => {
                await logOut();
                router.replace('/login');
              })
            }
          />
          <Row
            icon="trash-outline"
            label="Delete account"
            danger
            onPress={() =>
              confirmAction(
                'Delete your account?',
                'This permanently deletes your profile, photos, favourites and matches. It can’t be undone.' +
                  (premium ? ' Deleting your account does not cancel a store subscription; cancel that in your App Store or Google Play settings.' : ''),
                'Delete',
                async () => {
                  await deleteAccount();
                  router.replace('/start');
                },
              )
            }
          />
        </Group>

        <Text style={styles.footer}>
          {APP_INFO.name} {version} · Made with 💕 by {APP_INFO.company}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      {title && <Text style={styles.groupTitle}>{title}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({ icon, label, value, onPress, danger }: { icon: IconName; label: string; value?: string; onPress?: () => void; danger?: boolean }) {
  const tint = danger ? colors.danger : colors.optionText;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.cardStackB }]}>
      <Ionicons name={icon} size={21} color={danger ? colors.danger : colors.brandButton} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowLabel, { color: tint }]}>{label}</Text>
        {!!value && (
          <Text style={styles.rowValue} numberOfLines={1}>
            {value}
          </Text>
        )}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 24, paddingBottom: 32, gap: 20 },
  title: { fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.brandButton },
  groupTitle: { fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.label, marginLeft: 6 },
  card: { backgroundColor: colors.field, borderRadius: radius.card, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
  rowLabel: { fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false },
  rowValue: { fontFamily: fonts.kalam, fontSize: 14, lineHeight: 22, includeFontPadding: false, color: colors.label },
  footer: { fontFamily: fonts.kalam, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.muted, textAlign: 'center' },
});
