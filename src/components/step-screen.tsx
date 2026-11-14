import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, StepHeader } from '@/components/ui';
import { colors, GUTTER } from '@/theme/tokens';

/** Shared shell for the four signup steps: stepper, headings, content, bottom CTA. */
export function StepScreen({
  step,
  eyebrow,
  title,
  cta = 'Next',
  onNext,
  loading,
  footer,
  background,
  children,
}: {
  step: 1 | 2 | 3 | 4;
  eyebrow: string;
  title: string;
  cta?: string;
  onNext: () => void;
  loading?: boolean;
  footer?: ReactNode;
  background?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.root}>
      {background}
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/login'))}
            style={styles.back}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={26} color={colors.label} />
          </Pressable>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <StepHeader step={step} eyebrow={eyebrow} title={title} />
            <View style={styles.content}>{children}</View>
          </ScrollView>
          <View style={styles.footer}>
            <Button label={cta} onPress={onNext} loading={loading} />
            {footer}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white, overflow: 'hidden' },
  back: { position: 'absolute', left: 14, top: 22, zIndex: 2 },
  scroll: { paddingHorizontal: GUTTER, paddingTop: 24, paddingBottom: 24, flexGrow: 1 },
  content: { marginTop: 32, flex: 1 },
  footer: { paddingHorizontal: GUTTER, paddingBottom: 16, paddingTop: 8, gap: 4 },
});
