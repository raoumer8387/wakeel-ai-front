import React, { useState } from 'react';
import {
  View, Text, StyleSheet, StatusBar, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
import { Colors, Spacing, BorderRadius } from '../constants/Theme';
import { useAuth } from '../store/AuthContext';

const BackArrow = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path d="M19 12H5M5 12L12 19M5 12L12 5" stroke={Colors.text} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const MailIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke={Colors.textMuted} strokeWidth={1.8} fill="none" />
    <Path d="M22 6L12 13L2 6" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const LockIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M19 11H5C3.9 11 3 11.9 3 13V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V13C21 11.9 20.1 11 19 11Z" stroke={Colors.textMuted} strokeWidth={1.8} fill="none" />
    <Path d="M7 11V7C7 4.24 9.24 2 12 2C14.76 2 17 4.24 17 7V11" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" />
  </Svg>
);

const UserIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke={Colors.textMuted} strokeWidth={1.8} strokeLinecap="round" fill="none" />
    <Path d="M12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11Z" stroke={Colors.textMuted} strokeWidth={1.8} fill="none" />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path d="M22 16.92V19.92C22 20.48 21.56 20.93 21 20.97C20.64 21 20.28 21 19.92 21C10.4 21 3 13.6 3 4.08C3 3.72 3 3.36 3.03 3C3.07 2.44 3.52 2 4.08 2H7.08C7.56 2 7.97 2.35 8.05 2.82C8.14 3.38 8.3 3.93 8.52 4.45L7.02 5.95C6.84 6.13 6.78 6.4 6.87 6.63C7.95 9.12 9.88 11.05 12.37 12.13C12.6 12.22 12.87 12.16 13.05 11.98L14.55 10.48C15.07 10.7 15.62 10.86 16.18 10.95C16.65 11.03 17 11.44 17 11.92V14.92" stroke={Colors.textMuted} strokeWidth={1.8} fill="none" />
  </Svg>
);

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'At least 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: any = { name: name.trim(), email: email.trim(), password };
      if (phone.trim()) payload.phone = phone.trim();
      const result = await register(payload);
      if (!result.ok) Alert.alert('Registration Failed', result.error || 'Could not create account');
    } catch { Alert.alert('Error', 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const clearError = (key: string) => setErrors(e => { const c = { ...e }; delete c[key]; return c; });

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <BackArrow />
          </TouchableOpacity>

          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Join Wakeel-AI and know your rights</Text>

          <View style={s.form}>
            {/* Name */}
            <Text style={s.label}>Full Name</Text>
            <View style={[s.inputBox, errors.name && s.inputErr]}>
              <UserIcon />
              <TextInput style={s.input} placeholder="Your full name" placeholderTextColor={Colors.textMuted} value={name} onChangeText={t => { setName(t); clearError('name'); }} autoCapitalize="words" />
            </View>
            {errors.name && <Text style={s.errTxt}>{errors.name}</Text>}

            {/* Email */}
            <Text style={[s.label, { marginTop: Spacing.md }]}>Email</Text>
            <View style={[s.inputBox, errors.email && s.inputErr]}>
              <MailIcon />
              <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={Colors.textMuted} value={email} onChangeText={t => { setEmail(t); clearError('email'); }} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
            {errors.email && <Text style={s.errTxt}>{errors.email}</Text>}

            {/* Phone (optional) */}
            <Text style={[s.label, { marginTop: Spacing.md }]}>Phone <Text style={{ fontWeight: '400', color: Colors.textMuted }}>(optional)</Text></Text>
            <View style={s.inputBox}>
              <PhoneIcon />
              <TextInput style={s.input} placeholder="+923001234567" placeholderTextColor={Colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </View>

            {/* Password */}
            <Text style={[s.label, { marginTop: Spacing.md }]}>Password</Text>
            <View style={[s.inputBox, errors.password && s.inputErr]}>
              <LockIcon />
              <TextInput style={s.input} placeholder="Min 8 characters" placeholderTextColor={Colors.textMuted} value={password} onChangeText={t => { setPassword(t); clearError('password'); }} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ color: Colors.textMuted, fontSize: 13 }}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={s.errTxt}>{errors.password}</Text>}
          </View>

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Create Account</Text>}
          </TouchableOpacity>

          <View style={s.row}>
            <Text style={{ fontSize: 15, color: Colors.textMuted }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.primary }}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10, paddingBottom: Spacing.xl },
  backBtn: { width: 44, height: 44, borderRadius: BorderRadius.md, backgroundColor: Colors.badgeBg, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  title: { fontSize: 30, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  subtitle: { fontSize: 16, color: Colors.textMuted, marginBottom: Spacing.xl },
  form: { marginBottom: Spacing.xl },
  label: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  inputBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, height: 52, borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, paddingHorizontal: Spacing.md },
  inputErr: { borderColor: '#ef4444' },
  input: { flex: 1, fontSize: 16, color: Colors.text, height: '100%' },
  errTxt: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  btn: { height: 56, borderRadius: BorderRadius.xl, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6, marginBottom: Spacing.lg },
  btnTxt: { fontSize: 17, fontWeight: '600', color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.sm },
});
