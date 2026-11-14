import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FaithSection } from '@/components/faith';
import { goBack } from '@/components/navigation';
import { FaithTagPicker, HobbyPicker } from '@/components/preferences';
import { Button, Field } from '@/components/ui';
import { useAuth, useUser } from '@/context/auth';
import {
  ageFromDob,
  BackendError,
  type FaithAnswers,
  formatDob,
  isValidEmail,
  isValidPhone,
  maskDob,
  parseDob,
  parseHeight,
  RELATIONSHIP_LABELS,
  type RelationshipStatus,
} from '@/services';
import { colors, fonts, GUTTER } from '@/theme/tokens';

type Errors = Partial<Record<'name' | 'address' | 'phone' | 'email' | 'dob' | 'profession' | 'height', string>>;

const STATUSES = Object.keys(RELATIONSHIP_LABELS) as RelationshipStatus[];

export default function EditProfile() {
  const user = useUser();
  const { updateProfile } = useAuth();
  const [name, setName] = useState(user.name);
  const [address, setAddress] = useState(user.address);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email ?? '');
  const [dob, setDob] = useState(formatDob(user.dateOfBirth));
  const [profession, setProfession] = useState(user.profession);
  const [height, setHeight] = useState(user.heightIn ? `${Math.floor(user.heightIn / 12)}.${user.heightIn % 12}` : '');
  const [about, setAbout] = useState(user.about ?? '');
  const [status, setStatus] = useState<RelationshipStatus>(user.relationshipStatus);
  const [hobbies, setHobbies] = useState<string[]>(user.hobbies ?? []);
  const [faith, setFaith] = useState<FaithAnswers>(user.faith ?? {});
  const [faithTags, setFaithTags] = useState<string[]>(user.faithTags ?? []);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  async function save() {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Enter your full name.';
    if (!address.trim()) e.address = 'Enter your town or locality.';
    if (!isValidPhone(phone)) e.phone = 'Enter a valid phone number.';
    if (email.trim() && !isValidEmail(email)) e.email = 'Enter a valid email or leave it empty.';
    const iso = parseDob(dob);
    if (!iso) e.dob = 'Use the format DD/MM/YYYY.';
    else if (ageFromDob(iso) < 18) e.dob = 'You must be at least 18 years old.';
    if (!profession.trim()) e.profession = 'Enter your profession.';
    const heightIn = height.trim() ? parseHeight(height) : undefined;
    if (heightIn === null) e.height = 'Use feet.inches, e.g. 5.7';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        address: address.trim(),
        phone,
        email: email.trim(),
        dateOfBirth: iso!,
        profession: profession.trim(),
        heightIn: heightIn ?? undefined,
        about: about.trim() || undefined,
        relationshipStatus: status,
        hobbies,
        faith,
        faithTags,
      });
      goBack('/me');
    } catch (err) {
      if (err instanceof BackendError && err.field) setErrors({ [err.field]: err.message });
      else Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.topBar}>
        <Pressable onPress={() => goBack('/me')} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={26} color={colors.label} />
        </Pressable>
        <Text style={styles.title}>Edit profile</Text>
        <View style={{ width: 26 }} />
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Section label="Name">
            <Field value={name} onChangeText={setName} error={errors.name} autoCapitalize="words" />
          </Section>
          <Section label="Address">
            <Field value={address} onChangeText={setAddress} error={errors.address} />
          </Section>
          <Section label="Phone">
            <Field value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" />
          </Section>
          <Section label="Email (optional)">
            <Field value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" autoCapitalize="none" />
          </Section>
          <Section label="Date of birth">
            <Field value={dob} onChangeText={(t) => setDob(maskDob(t))} error={errors.dob} keyboardType="number-pad" maxLength={10} placeholder="DD/MM/YYYY" />
          </Section>
          <Section label="Profession">
            <Field value={profession} onChangeText={setProfession} error={errors.profession} autoCapitalize="words" />
          </Section>
          <Section label="Height (optional)">
            <Field value={height} onChangeText={setHeight} error={errors.height} placeholder="e.g. 5.7" keyboardType="decimal-pad" />
          </Section>
          <Section label="About you (optional)">
            <Field
              value={about}
              onChangeText={setAbout}
              multiline
              maxLength={300}
              height={110}
              placeholder="A few words about yourself and your family"
              style={{ textAlignVertical: 'top', paddingTop: 14, fontFamily: fonts.kalam }}
            />
          </Section>
          <Section label="Hobbies">
            <HobbyPicker value={hobbies} onChange={setHobbies} />
          </Section>

          <Text style={styles.heading}>Your background</Text>
          <Section label="Relationship status">
            <View style={{ gap: 10 }}>
              {STATUSES.map((s) => (
                <Button key={s} label={RELATIONSHIP_LABELS[s]} height={46} variant={status === s ? 'optionSelected' : 'option'} onPress={() => setStatus(s)} />
              ))}
            </View>
          </Section>

          <Text style={styles.heading}>My faith</Text>
          <Section label="Faith & Practice">
            <FaithSection kind="answers" value={faith} onChange={setFaith} />
          </Section>
          <Section label="What matters most">
            <FaithTagPicker value={faithTags} onChange={setFaithTags} />
          </Section>
        </ScrollView>
        <View style={styles.footer}>
          <Button label="Save changes" onPress={save} loading={saving} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.white },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  title: { fontFamily: fonts.kalamBold, fontSize: 24, lineHeight: 38, includeFontPadding: false, color: colors.brandButton },
  scroll: { paddingHorizontal: GUTTER, paddingBottom: 24, gap: 16 },
  label: { fontFamily: fonts.kalamBold, fontSize: 15, lineHeight: 24, includeFontPadding: false, color: colors.label, marginLeft: 18 },
  heading: { fontFamily: fonts.kalamBold, fontSize: 22, lineHeight: 35, includeFontPadding: false, color: colors.brandButton, marginTop: 12 },
  footer: { paddingHorizontal: GUTTER, paddingVertical: 12 },
});
