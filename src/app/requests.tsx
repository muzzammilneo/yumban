import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { goBack } from '@/components/navigation';
import { Avatar, Button, NameWithBadge } from '@/components/ui';
import { useUser } from '@/context/auth';
import { backend, type ContactRequest, type Profile } from '@/services';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

type Item = { request: ContactRequest; from: Profile };

/** Settings → Contact requests: accept or decline matches who want to call / WhatsApp you. */
export default function Requests() {
  const user = useUser();
  const [items, setItems] = useState<Item[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setItems(await backend.getIncomingContactRequests(user.id));
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function respond(id: string, accept: boolean) {
    setBusy(id);
    try {
      await backend.respondToContactRequest(user.id, id, accept);
      await load();
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack('/settings')} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={colors.optionText} />
        </Pressable>
        <Text style={styles.title}>Contact requests</Text>
        <View style={{ width: 44 }} />
      </View>
      {items === null ? (
        <ActivityIndicator color={colors.brandButton} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.request.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.note}>
              {user.contactPrivacy
                ? 'Your contact details are private. Matches who want to call or WhatsApp you appear here.'
                : 'Contact privacy is off, so matches with Premium can contact you directly. Turn it on in Settings to approve each person first.'}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={52} color={colors.placeholder} />
              <Text style={styles.emptyText}>No pending requests.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.who}
                onPress={() => router.push({ pathname: '/profile/[id]', params: { id: item.from.id } })}
                accessibilityRole="button"
                accessibilityLabel={`View ${item.from.name}'s profile`}>
                <Avatar uri={item.from.photo} size={52} />
                <View style={{ flex: 1 }}>
                  <NameWithBadge name={item.from.name} verified={item.from.verified} textStyle={styles.name} badgeSize={16} />
                  <Text style={styles.meta}>Wants to call or WhatsApp you</Text>
                </View>
              </Pressable>
              <View style={styles.actions}>
                <Button
                  label="Decline"
                  variant="option"
                  height={42}
                  style={{ flex: 1, backgroundColor: colors.white }}
                  disabled={busy === item.request.id}
                  onPress={() => respond(item.request.id, false)}
                />
                <Button
                  label="Accept"
                  height={42}
                  style={{ flex: 1 }}
                  loading={busy === item.request.id}
                  onPress={() => respond(item.request.id, true)}
                />
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardStackB,
  },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.field, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontFamily: fonts.kalamBold, fontSize: 22, lineHeight: 35, includeFontPadding: false, color: colors.brandButton },
  list: { padding: GUTTER, gap: 12, flexGrow: 1 },
  note: { fontFamily: fonts.kalam, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.label, marginBottom: 4 },
  card: { padding: 14, borderRadius: radius.card, backgroundColor: colors.field, gap: 12 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.optionText },
  meta: { fontFamily: fonts.kalam, fontSize: 14, lineHeight: 22, includeFontPadding: false, color: colors.label },
  actions: { flexDirection: 'row', gap: 10 },
  empty: { alignItems: 'center', gap: 10, marginTop: 80 },
  emptyText: { fontFamily: fonts.kalam, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.muted },
});
