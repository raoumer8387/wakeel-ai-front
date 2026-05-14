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

export const LoginScreen = ({ navigation }: any) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const result = await login({ email: email.trim(), password });
      if (!result.ok) Alert.alert('Login Failed', result.error || 'Incorrect email or password');
    } catch { Alert.alert('Error', 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <SafeAreaView style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <BackArrow />
          </TouchableOpacity>

          <Text style={s.title}>Welcome back</Text>
          <Text style={s.subtitle}>Sign in to continue your legal journey</Text>

          <View style={s.form}>
            <Text style={s.label}>Email</Text>
            <View style={[s.inputBox, errors.email && s.inputErr]}>
              <MailIcon />
              <TextInput style={s.input} placeholder="you@example.com" placeholderTextColor={Colors.textMuted} value={email} onChangeText={t => { setEmail(t); setErrors(e => ({ ...e, email: undefined })); }} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>
            {errors.email && <Text style={s.errTxt}>{errors.email}</Text>}

            <Text style={[s.label, { marginTop: Spacing.md }]}>Password</Text>
            <View style={[s.inputBox, errors.password && s.inputErr]}>
              <LockIcon />
              <TextInput style={s.input} placeholder="Enter your password" placeholderTextColor={Colors.textMuted} value={password} onChangeText={t => { setPassword(t); setErrors(e => ({ ...e, password: undefined })); }} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ color: Colors.textMuted, fontSize: 13 }}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={s.errTxt}>{errors.password}</Text>}

            <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: Spacing.sm }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: Colors.primary }}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.btn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnTxt}>Sign In</Text>}
          </TouchableOpacity>

          <View style={s.row}>
            <Text style={{ fontSize: 15, color: Colors.textMuted }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace('Register')}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: Colors.primary }}>Sign Up</Text>
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
