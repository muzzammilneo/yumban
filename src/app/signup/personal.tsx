import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { StepScreen } from '@/components/step-screen';
import { Field } from '@/components/ui';
import { useSignup } from '@/context/signup';
import { ageFromDob, backend, formatDob, isValidEmail, isValidPhone, maskDob, parseDob } from '@/services';

type Errors = Partial<Record<'name' | 'address' | 'phone' | 'email' | 'dob' | 'profession' | 'password' | 'confirm', string>>;

/** Figma "Personal info" (31:172) — signup step 3, plus password fields for login. */
export default function PersonalStep() {
  const { draft, update } = useSignup();
  const [name, setName] = useState(draft.name ?? '');
  const [address, setAddress] = useState(draft.address ?? '');
  const [phone, setPhone] = useState(draft.phone ?? '');
  const [email, setEmail] = useState(draft.email ?? '');
  const [dob, setDob] = useState(draft.dateOfBirth ? formatDob(draft.dateOfBirth) : '');
  const [profession, setProfession] = useState(draft.profession ?? '');
  const [password, setPassword] = useState(draft.password ?? '');
  const [confirm, setConfirm] = useState(draft.password ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const [checking, setChecking] = useState(false);

  async function next() {
    const e: Errors = {};
    if (name.trim().length < 2) e.name = 'Enter your full name.';
    if (!address.trim()) e.address = 'Enter your town or locality.';
    if (!isValidPhone(phone)) e.phone = 'Enter a valid phone number.';
    if (email.trim() && !isValidEmail(email)) e.email = 'Enter a valid email or leave it empty.';
    const iso = parseDob(dob);
    if (!iso) e.dob = 'Use the format DD/MM/YYYY.';
    else if (ageFromDob(iso) < 18) e.dob = 'You must be at least 18 years old.';
    else if (ageFromDob(iso) > 100) e.dob = 'Please check your date of birth.';
    if (!profession.trim()) e.profession = 'Enter your profession.';
    if (password.length < 6) e.password = 'Use at least 6 characters.';
    if (confirm !== password) e.confirm = 'Passwords do not match.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setChecking(true);
    try {
      if (await backend.isRegistered(phone)) return setErrors({ phone: 'This phone number is already registered. Try logging in.' });
      if (email.trim() && (await backend.isRegistered(email))) return setErrors({ email: 'This email is already registered.' });
    } finally {
      setChecking(false);
    }

    update({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      dateOfBirth: iso!,
      profession: profession.trim(),
      password,
    });
    router.push('/signup/hobbies');
  }

  return (
    <StepScreen step={3} eyebrow="Personal details" title="We maintain your privacy" onNext={next} loading={checking}>
      <View style={{ gap: 8 }}>
        <Field placeholder="Name" value={name} onChangeText={setName} error={errors.name} autoComplete="name" textContentType="name" autoCapitalize="words" />
        <Field placeholder="Address" value={address} onChangeText={setAddress} error={errors.address} autoComplete="address-line1" />
        <Field placeholder="Phone*" value={phone} onChangeText={setPhone} error={errors.phone} keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
        <Field
          placeholder="email (optional)"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field
          placeholder="Date of birth (DD/MM/YYYY)"
          value={dob}
          onChangeText={(t) => setDob(maskDob(t))}
          error={errors.dob}
          keyboardType="number-pad"
          maxLength={10}
        />
        <Field placeholder="Profession" value={profession} onChangeText={setProfession} error={errors.profession} autoCapitalize="words" />
        <Field
          placeholder="Create password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
        <Field
          placeholder="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
        />
      </View>
    </StepScreen>
  );
}
