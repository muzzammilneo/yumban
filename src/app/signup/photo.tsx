import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { pickPhoto } from '@/components/photo-picker';
import { StepScreen } from '@/components/step-screen';
import { Avatar } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { useSignup } from '@/context/signup';
import { BackendError } from '@/services';
import { colors, fonts } from '@/theme/tokens';

/** Figma "Other details" (43:58) — signup step 4. */
export default function PhotoStep() {
  const { draft, update } = useSignup();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  async function choose() {
    const uri = await pickPhoto();
    if (uri) update({ photo: uri });
  }

  async function finish() {
    const { gender, seeking, relationshipStatus, name, address, phone, dateOfBirth, profession, password } = draft;
    if (!gender || !seeking || !relationshipStatus) return router.replace('/signup');
    if (!name || !address || !phone || !dateOfBirth || !profession || !password) return router.replace('/signup/personal');

    setLoading(true);
    try {
      await signUp({ gender, seeking, relationshipStatus, name, address, phone, dateOfBirth, profession, password, email: draft.email, photo: draft.photo ?? null, hobbies: draft.hobbies, prefs: draft.prefs });
      router.replace('/discover');
    } catch (e) {
      Alert.alert('Could not create account', e instanceof Error ? e.message : 'Please try again.');
      if (e instanceof BackendError && (e.field === 'phone' || e.field === 'email')) router.replace('/signup/personal');
    } finally {
      setLoading(false);
    }
  }

  return (
    <StepScreen step={4} eyebrow="Your photo" title="Add your latest photo" cta="Finish" onNext={finish} loading={loading}>
      <View style={styles.center}>
        <Pressable onPress={choose} accessibilityRole="button" accessibilityLabel={draft.photo ? 'Change photo' : 'Add photo'}>
          <Avatar uri={draft.photo} size={254} />
          <View style={styles.badge}>
            <Ionicons name={draft.photo ? 'pencil' : 'camera'} size={22} color={colors.white} />
          </View>
        </Pressable>
        <Text style={styles.hint}>
          {draft.photo ? 'Looking good! Tap to change.' : 'Tap to add a clear photo of yourself. You can also add it later.'}
        </Text>
      </View>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 20 },
  badge: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  hint: { fontFamily: fonts.kalam, fontSize: 16, lineHeight: 26, includeFontPadding: false, color: colors.muted, textAlign: 'center', maxWidth: 280 },
});
