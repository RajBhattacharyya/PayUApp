import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { setAuthenticated } from '../utils/storage';

interface Props {
  onAuth: () => void;
}

const AuthScreen: React.FC<Props> = ({ onAuth }) => {
  const { theme, isDark } = useTheme();
  const { updateUser } = useTransactions();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchTab = (newTab: 'signin' | 'signup') => {
    setTab(newTab);
    setErrors({});
    Animated.spring(slideAnim, {
      toValue: newTab === 'signup' ? 1 : 0,
      useNativeDriver: false,
    }).start();
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email required';
    if (!password || password.length < 6) errs.password = 'Min 6 characters';
    if (tab === 'signup') {
      if (!fullName.trim()) errs.name = 'Full name required';
      if (password !== confirmPassword) errs.confirm = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (tab === 'signup') {
      await updateUser({ name: fullName, email });
    }
    await setAuthenticated(true);
    setLoading(false);
    onAuth();
  };

  const tabIndicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '51%'],
  });

  return (
    <LinearGradient
      colors={isDark ? ['#0D0D0D', '#111827', '#0D0D0D'] : ['#F5F6FA', '#E8FFF5', '#F5F6FA']}
      style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={[styles.logoBox, { backgroundColor: theme.surface }]}>
              <Text style={[styles.logoLetter, { color: theme.text }]}>P</Text>
            </View>
            <Text style={[styles.appName, { color: theme.text }]}>Welcome to PayU</Text>
            <Text style={[styles.tagline, { color: theme.textSecondary }]}>
              Send money globally with the real exchange rate
            </Text>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: theme.surface }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Get started</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
              Sign in to your account or create a new one
            </Text>

            {/* Tab Switcher */}
            <View style={[styles.tabContainer, { backgroundColor: theme.inputBg }]}>
              <Animated.View style={[styles.tabIndicator, { left: tabIndicatorLeft }]} />
              <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('signin')}>
                <Text style={[styles.tabText, { color: tab === 'signin' ? '#000' : theme.textSecondary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('signup')}>
                <Text style={[styles.tabText, { color: tab === 'signup' ? '#000' : theme.textSecondary }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            {tab === 'signup' && (
              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: errors.name ? '#FF6B6B' : 'transparent' }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={theme.textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                />
                {errors.name && <Text style={styles.error}>{errors.name}</Text>}
              </View>
            )}

            <Text style={[styles.label, { color: theme.textSecondary }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: errors.email ? '#FF6B6B' : 'transparent' }]}
              placeholder="Enter your email"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <Text style={[styles.label, { color: theme.textSecondary }]}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, { backgroundColor: theme.inputBg, color: theme.text, borderColor: errors.password ? '#FF6B6B' : 'transparent' }]}
                placeholder={tab === 'signup' ? 'Create a password' : 'Enter your password'}
                placeholderTextColor={theme.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((p) => !p)}>
                <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}

            {tab === 'signup' && (
              <View>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: errors.confirm ? '#FF6B6B' : 'transparent' }]}
                  placeholder="Confirm your password"
                  placeholderTextColor={theme.textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
                {errors.confirm && <Text style={styles.error}>{errors.confirm}</Text>}
              </View>
            )}

            {tab === 'signin' && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={[styles.forgotText, { color: theme.textSecondary }]}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleSubmit} disabled={loading}>
              <LinearGradient
                colors={['#FFFFFF', '#EEEEEE']}
                style={styles.submitBtn}>
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text style={styles.submitText}>
                    {tab === 'signin' ? 'Sign In' : 'Create Account'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, paddingTop: 60 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  logoLetter: { fontSize: 26, fontWeight: '800' },
  appName: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  tagline: { fontSize: 13, textAlign: 'center' },
  card: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 13, marginBottom: 16 },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
    position: 'relative',
    height: 44,
  },
  tabIndicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1.5,
  },
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 48 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  forgotBtn: { alignItems: 'flex-end', marginTop: 6, marginBottom: 4 },
  forgotText: { fontSize: 13 },
  submitBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitText: { fontSize: 15, fontWeight: '700', color: '#000' },
  error: { color: '#FF6B6B', fontSize: 12, marginTop: 4 },
});

export default AuthScreen;
