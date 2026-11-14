import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View, type TextInputInstance } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Field } from '@/components/ui';
import { useAuth } from '@/context/auth';
import { isValidEmail, isValidPhone } from '@/services';
import { figma } from '@/theme/assets';
import { colors, fonts, GUTTER } from '@/theme/tokens';

/** Figma "Login" (43:18). */
export default function Login() {
  const { logIn } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<TextInputInstance>(null);

  async function submit() {
    const id = identifier.trim();
    if (!id || !password) return setError('Enter your phone/email and password.');
    if (id.includes('@') ? !isValidEmail(id) : !isValidPhone(id)) {
      return setError('Enter a valid phone number or email.');
    }
    setError(null);
    setLoading(true);
    try {
      await logIn(id, password);
      router.replace('/discover');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not log in.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image source={figma.splashEllipse} style={styles.ellipse} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
            <View style={styles.header}>
              <Image source={figma.logoWhiteLogin} style={styles.logo} accessibilityLabel="Yumban logo" />
              <Text style={styles.wordmark}>Yumban</Text>
              <Text style={styles.subtitle}>Enter your email and password to login</Text>
            </View>

            <View style={styles.form}>
              <Field
                tone="pink"
                height={44}
                placeholder="Phone/email"
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <Field
                ref={passwordRef}
                tone="pink"
                height={44}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
                right={
                  <Pressable
                    hitSlop={10}
                    onPress={() => setShowPassword((s) => !s)}
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.brandPlaceholder} />
                  </Pressable>
                }
              />
              {!!error && <Text style={styles.error}>{error}</Text>}
            </View>

            <View style={styles.footer}>
              <Button label="Log In" variant="white" height={44} loading={loading} onPress={submit} />
              <Pressable onPress={() => router.push('/signup')} style={styles.signupLink} accessibilityRole="link">
                <Text style={styles.signupText}>
                  Don’t have an account? <Text style={styles.signupBold}>Sign Up</Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand, overflow: 'hidden' },
  ellipse: { position: 'absolute', left: -153, top: -207, width: 468, height: 468 },
  scroll: { flexGrow: 1, paddingHorizontal: GUTTER, paddingBottom: 20 },
  header: { alignItems: 'center', marginTop: 20 },
  // Subtract (2206:78): 90x80
  logo: { width: 90, height: 80, marginTop: 24, marginBottom: 6 },
  wordmark: { fontFamily: fonts.kalamBold, fontSize: 65, lineHeight: 90, color: colors.white, marginTop: -6 },
  subtitle: {
    fontFamily: fonts.interSemi,
    fontSize: 17,
    lineHeight: 21,
    color: colors.white,
    textAlign: 'center',
    maxWidth: 283,
    marginTop: 8,
  },
  form: { gap: 16, marginTop: 56 },
  error: { fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.white, textAlign: 'center' },
  footer: { flex: 1, justifyContent: 'flex-end', paddingTop: 40 },
  signupLink: { alignItems: 'center', paddingVertical: 14 },
  signupText: { fontFamily: fonts.kalam, fontSize: 18, lineHeight: 29, includeFontPadding: false, color: colors.brandSoft },
  signupBold: { fontFamily: fonts.kalamBold, color: colors.white },
});
