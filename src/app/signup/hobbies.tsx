import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { HobbyPicker } from '@/components/preferences';
import { StepScreen } from '@/components/step-screen';
import { useSignup } from '@/context/signup';
import { MAX_HOBBIES } from '@/services';
import { colors, fonts } from '@/theme/tokens';

/** Hobbies, shown between personal details (step 3) and photo (step 4). */
export default function HobbiesStep() {
  const { draft, update } = useSignup();
  const [hobbies, setHobbies] = useState<string[]>(draft.hobbies ?? []);
  const [error, setError] = useState<string | null>(null);

  function next() {
    if (hobbies.length === 0) return setError('Pick at least one hobby, or skip for now.');
    update({ hobbies });
    router.push('/signup/photo');
  }

  return (
    <StepScreen
      step={3}
      eyebrow="About you"
      title={`Pick up to ${MAX_HOBBIES} hobbies`}
      onNext={next}
      footer={
        <Pressable
          style={styles.skip}
          onPress={() => {
            update({ hobbies: [] });
            router.push('/signup/photo');
          }}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      }>
      <HobbyPicker
        value={hobbies}
        onChange={(h) => {
          setError(null);
          setHobbies(h);
        }}
      />
      {!!error && <Text style={styles.error}>{error}</Text>}
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  skip: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontFamily: fonts.kalamBold, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.brandButton },
  error: { fontFamily: fonts.kalam, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.danger, marginTop: 12 },
});
