import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StepScreen } from '@/components/step-screen';
import { Button } from '@/components/ui';
import { useSignup } from '@/context/signup';
import { RELATIONSHIP_LABELS, type RelationshipStatus } from '@/services';
import { colors, fonts } from '@/theme/tokens';

const OPTIONS: RelationshipStatus[] = ['never_married', 'separated', 'divorced', 'widowed'];

/** Figma "Relationship Status" (20:108) — signup step 2. */
export default function StatusStep() {
  const { draft, update } = useSignup();
  const [error, setError] = useState<string | null>(null);

  function next() {
    if (!draft.relationshipStatus) return setError('Please choose an option.');
    setError(null);
    router.push('/signup/personal');
  }

  return (
    <StepScreen
      step={2}
      eyebrow="Background"
      title="What is your relationship status?"
      onNext={next}
      footer={
        <Pressable
          style={styles.skip}
          onPress={() => {
            update({ relationshipStatus: 'undisclosed' });
            router.push('/signup/personal');
          }}>
          <Text style={styles.skipText}>I’d rather not say</Text>
        </Pressable>
      }>
      <View style={{ gap: 12 }} accessibilityRole="radiogroup">
        {OPTIONS.map((s) => (
          <Button
            key={s}
            label={RELATIONSHIP_LABELS[s]}
            variant={draft.relationshipStatus === s ? 'optionSelected' : 'option'}
            onPress={() => {
              setError(null);
              update({ relationshipStatus: s });
            }}
          />
        ))}
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </StepScreen>
  );
}

const styles = StyleSheet.create({
  skip: { alignItems: 'center', paddingVertical: 12 },
  skipText: { fontFamily: fonts.kalamBold, fontSize: 13, lineHeight: 21, includeFontPadding: false, color: colors.brandButton },
  error: { fontFamily: fonts.kalam, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.danger, textAlign: 'center' },
});
