import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { goBack } from '@/components/navigation';
import { Avatar, Button } from '@/components/ui';
import { useUser } from '@/context/auth';
import { backend, type Profile } from '@/services';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

/** Settings → Blocked profiles: everyone this user has blocked, with Unblock. */
export default function Blocked() {
  const user = useUser();
  const [items, setItems] = useState<Profile[] | null>(null);

  const load = useCallback(async () => {
    setItems(await backend.getBlocked(user.id));
  }, [user.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function unblock(id: string) {
    await backend.unblockProfile(user.id, id);
    load();
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack('/settings')} style={styles.back} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={colors.optionText} />
        </Pressable>
        <Text style={styles.title}>Blocked profiles</Text>
        <View style={{ width: 44 }} />
      </View>
      {items === null ? (
        <ActivityIndicator color={colors.brandButton} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(p) => p.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            items.length ? <Text style={styles.note}>Blocked people can’t see you, and you won’t see them.</Text> : undefined
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="shield-checkmark-outline" size={52} color={colors.placeholder} />
              <Text style={styles.emptyText}>You haven’t blocked anyone.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Avatar uri={item.photo} size={48} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.address}</Text>
              </View>
              <Button label="Unblock" variant="option" height={40} onPress={() => unblock(item.id)} textStyle={{ fontSize: 15 }} />
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
  list: { padding: GUTTER, gap: 10, flexGrow: 1 },
  note: { fontFamily: fonts.kalam, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.label, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.card, backgroundColor: colors.field },
  name: { fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.optionText },
  meta: { fontFamily: fonts.kalam, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.label },
  empty: { alignItems: 'center', gap: 10, marginTop: 80 },
  emptyText: { fontFamily: fonts.kalam, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.muted },
});
