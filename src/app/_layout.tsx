import { Inter_400Regular, Inter_600SemiBold, Inter_600SemiBold_Italic } from '@expo-google-fonts/inter';
import { Kalam_400Regular, Kalam_700Bold } from '@expo-google-fonts/kalam';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/context/auth';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Kalam_400Regular,
    Kalam_700Bold,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_600SemiBold_Italic,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          {fontsLoaded ? <RootNavigator /> : null}
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { ready, user } = useAuth();

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />

        <Stack.Protected guard={!user}>
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="start" options={{ animation: 'fade' }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
        </Stack.Protected>

        <Stack.Protected guard={!!user}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
          <Stack.Screen name="profile/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="edit-profile" />
          <Stack.Screen name="filters" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="premium" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="help" />
          <Stack.Screen name="blocked" />
          <Stack.Screen name="requests" />
          <Stack.Screen name="info/[page]" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
