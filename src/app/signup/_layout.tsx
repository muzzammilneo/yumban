import { Stack } from 'expo-router';

import { SignupProvider } from '@/context/signup';

export default function SignupLayout() {
  return (
    <SignupProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#fff' } }} />
    </SignupProvider>
  );
}
