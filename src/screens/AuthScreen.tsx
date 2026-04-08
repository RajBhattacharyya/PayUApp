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
import Ionicons from '@expo/vector-icons/Ionicons';
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
      colors={['#050505', '#0E1114', '#050505']}
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
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>P</Text>
            </View>
            <Text style={styles.appName}>Welcome to PayU</Text>
            <Text style={styles.tagline}>
              Send money globally with the real exchange rate
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Get started</Text>
            <Text style={styles.cardSub}>
              Sign in to your account or create a new one
            </Text>

            {/* Tab Switcher */}
            <View style={styles.tabContainer}>
              <Animated.View style={[styles.tabIndicator, { left: tabIndicatorLeft }]} />
              <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('signin')}>
                <Text style={[styles.tabText, { color: tab === 'signin' ? '#FFFFFF' : '#7C8490' }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabBtn} onPress={() => switchTab('signup')}>
                <Text style={[styles.tabText, { color: tab === 'signup' ? '#FFFFFF' : '#7C8490' }]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            {tab === 'signup' && (
              <View>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={[styles.input, { borderColor: errors.name ? '#FF6B6B' : '#2A2F36' }]}
                  placeholder="Enter your full name"
                  placeholderTextColor="#7C8490"
                  value={fullName}
                  onChangeText={setFullName}
                />
                {errors.name && <Text style={styles.error}>{errors.name}</Text>}
              </View>
            )}

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, { borderColor: errors.email ? '#FF6B6B' : '#2A2F36' }]}
              placeholder="Enter your email"
              placeholderTextColor="#7C8490"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput, { borderColor: errors.password ? '#FF6B6B' : '#2A2F36' }]}
                placeholder={tab === 'signup' ? 'Create a password' : 'Enter your password'}
                placeholderTextColor="#7C8490"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((p) => !p)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#B9C0CA"
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}

            {tab === 'signup' && (
              <View>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, { borderColor: errors.confirm ? '#FF6B6B' : '#2A2F36' }]}
                  placeholder="Confirm your password"
                  placeholderTextColor="#7C8490"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                />
                {errors.confirm && <Text style={styles.error}>{errors.confirm}</Text>}
              </View>
            )}

            {tab === 'signin' && (
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleSubmit} disabled={loading}>
              <LinearGradient
                colors={['#20262D', '#101317']}
                style={styles.submitBtn}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
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
    backgroundColor: '#111418',
    borderWidth: 1,
    borderColor: '#2E353E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  logoLetter: { fontSize: 26, fontWeight: '800', color: '#FFFFFF' },
  appName: { fontSize: 24, fontWeight: '700', marginBottom: 6, color: '#F5F7FA' },
  tagline: { fontSize: 13, textAlign: 'center', color: '#8D96A2' },
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#0F1318',
    borderWidth: 1,
    borderColor: '#232A33',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4, color: '#FFFFFF' },
  cardSub: { fontSize: 13, marginBottom: 16, color: '#8D96A2' },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#171C22',
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
    backgroundColor: '#2A323C',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  tabBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, marginBottom: 6, marginTop: 12, color: '#A8B1BC' },
  input: {
    height: 48,
    backgroundColor: '#161B21',
    color: '#FFFFFF',
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
    alignItems: 'center',
  },
  forgotBtn: { alignItems: 'flex-end', marginTop: 6, marginBottom: 4 },
  forgotText: { fontSize: 13, color: '#8D96A2' },
  submitBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3B4552',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  submitText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  error: { color: '#FF6B6B', fontSize: 12, marginTop: 4 },
});

export default AuthScreen;
