import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts } from '@/theme/tokens';

/**
 * Our own label: the navigator's built-in label box is sized for system fonts and
 * clips Kalam's tall letters, so we render the text with the line height it needs.
 */
function TabLabel({ title, color }: { title: string; color: string }) {
  return (
    <Text
      style={{
        fontFamily: fonts.kalamBold,
        fontSize: 12,
        lineHeight: 19,
        height: 19,
        flexShrink: 0,
        includeFontPadding: false,
        color,
        textAlign: 'center',
      }}>
      {title}
    </Text>
  );
}

const TABS = [
  { name: 'discover', title: 'Discover', icon: 'heart-circle', grow: 2 },
  { name: 'favourites', title: 'Favourites', icon: 'star', grow: 0 },
  { name: 'me', title: 'Profile', icon: 'person-circle', grow: 2 },
  { name: 'settings', title: 'Settings', icon: 'settings-outline', grow: 0 },
] as const;

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandButton,
        tabBarInactiveTintColor: colors.placeholder,
        // Room for the icon + 19pt label above the home indicator.
        tabBarStyle: { borderTopColor: colors.field, height: 68 + insets.bottom, paddingTop: 6, paddingBottom: insets.bottom + 8 },
      }}>
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarLabel: ({ color }) => <TabLabel title={t.title} color={color as string} />,
            tabBarIcon: ({ color, size }) => <Ionicons name={t.icon} color={color as string} size={size + t.grow} />,
          }}
        />
      ))}
    </Tabs>
  );
}
