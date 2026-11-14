import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { goBack } from '@/components/navigation';
import { useUser } from '@/context/auth';
import { backend, type AppNotification } from '@/services';
import { colors, fonts, GUTTER, radius } from '@/theme/tokens';

function timeAgo(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return 'Just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? 'Yesterday' : `${d}d ago`;
}

export default function Notifications() {
  const user = useUser();
  const [items, setItems] = useState<AppNotification[] | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const list = await backend.getNotifications(user.id);
        if (!active) return;
        // Show which ones are new this visit, then mark them all as read.
        setItems(list);
        await backend.markNotificationsRead(user.id);
      })();
      return () => {
        active = false;
      };
    }, [user.id]),
  );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => goBack('/discover')} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={colors.optionText} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      {items === null ? (
        <ActivityIndicator color={colors.brandButton} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={52} color={colors.placeholder} />
              <Text style={styles.emptyText}>You’re all caught up.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => item.link && router.push(item.link as Href)}
              disabled={!item.link}
              accessibilityRole={item.link ? 'button' : undefined}
              style={({ pressed }) => [styles.item, !item.read && styles.itemNew, pressed && { opacity: 0.7 }]}>
              <View style={styles.iconWrap}>
                <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.brandButton} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={styles.itemTop}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
                </View>
                <Text style={styles.body}>{item.body}</Text>
              </View>
              {!item.read && <View style={styles.dot} accessibilityLabel="New" />}
            </Pressable>
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
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.cardStackB,
  },
  headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.field, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.brandButton },
  list: { padding: GUTTER, gap: 12, flexGrow: 1 },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: radius.card, backgroundColor: colors.field },
  itemNew: { backgroundColor: '#FFF0F6' },
  iconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: { flex: 1, fontFamily: fonts.kalamBold, fontSize: 17, lineHeight: 27, includeFontPadding: false, color: colors.optionText },
  time: { fontFamily: fonts.kalam, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.label },
  body: { fontFamily: fonts.kalam, fontSize: 15, lineHeight: 22, includeFontPadding: false, color: colors.body },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.brandButton, marginTop: 8 },
  empty: { alignItems: 'center', gap: 10, marginTop: 80 },
  emptyText: { fontFamily: fonts.kalam, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.muted },
});
