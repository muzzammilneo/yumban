import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AgeRangePicker } from '@/components/preferences';
import { StepScreen } from '@/components/step-screen';
import { Segmented } from '@/components/ui';
import { useSignup } from '@/context/signup';
import { DEFAULT_PREFS, type Gender } from '@/services';
import { figma } from '@/theme/assets';
import { colors, fonts } from '@/theme/tokens';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'man', label: '🤵🏻Man' },
  { value: 'woman', label: '👰🏻Woman' },
];

/** Figma "Preference" (14:22) — signup step 1. */
export default function PreferenceStep() {
  const { draft, update } = useSignup();
  const [error, setError] = useState<string | null>(null);
  const prefs = draft.prefs ?? DEFAULT_PREFS;

  function next() {
    if (!draft.gender || !draft.seeking) return setError('Please choose both options.');
    setError(null);
    router.push('/signup/status');
  }

  return (
    <StepScreen
      step={1}
      eyebrow="Basic information"
      title="Choose your preference"
      onNext={next}
      background={<Watermark />}>
      <View style={{ gap: 32 }}>
        <View style={styles.group}>
          <Text style={styles.label}>I’m a</Text>
          <Segmented
            options={GENDERS}
            value={draft.gender}
            onChange={(gender) => update({ gender, seeking: draft.seeking ?? (gender === 'man' ? 'woman' : 'man') })}
          />
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>Seeking a</Text>
          <Segmented options={GENDERS} value={draft.seeking} onChange={(seeking) => update({ seeking })} />
        </View>
        <View style={styles.group}>
          <Text style={styles.label}>Aged between</Text>
          <AgeRangePicker
            min={prefs.ageMin}
            max={prefs.ageMax}
            onChange={({ min, max }) => update({ prefs: { ...prefs, ageMin: min, ageMax: max } })}
          />
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </StepScreen>
  );
}

/** Faint background shapes from the Preference frame (#FCFCFC on white). */
function Watermark() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.bigHeart}>
        <Image source={figma.prefHeartStroke} style={{ width: 505.48, height: 505.48, transform: [{ rotate: '-45deg' }] }} />
      </View>
      <View style={styles.markWrap}>
        <Image source={figma.prefHeart} style={{ width: 73.25, height: 73.25, transform: [{ rotate: '-45deg' }], marginBottom: 2 }} />
        <Image source={figma.prefWordmark} style={{ width: 309, height: 72.48 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { alignItems: 'center', gap: 12 },
  label: { fontFamily: fonts.kalam, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.label },
  error: { fontFamily: fonts.kalam, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.danger, textAlign: 'center' },
  bigHeart: { position: 'absolute', left: -293, top: 432, width: 714.85, height: 714.85, alignItems: 'center', justifyContent: 'center' },
  markWrap: { position: 'absolute', top: 201, left: 0, right: 0, alignItems: 'center' },
});
