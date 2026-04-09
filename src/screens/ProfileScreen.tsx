import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import { clearAll, setAuthenticated } from '../utils/storage';
import { formatCurrency } from '../utils/formatters';
import { typography, spacing } from '../theme/typography';

interface Props {
  navigation: any;
  onLogout: () => void;
}

const ProfileScreen: React.FC<Props> = ({ navigation, onLogout }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, updateUser } = useTransactions();
  const [tab, setTab] = useState<'preview' | 'edit'>('preview');
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fabAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const fabHidden = useRef(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name required';
    if (!email || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Valid email required';
    if (password && password.length < 6) errs.password = 'Min 6 characters';
    if (password && password !== confirmPassword) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    await updateUser({ name, email });
    Alert.alert('✅ Updated', 'Your profile has been updated.');
    setTab('preview');
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          onLogout();
        },
      },
    ]);
  };

  const initial = user.name.charAt(0).toUpperCase();

  const toggleFab = (hide: boolean) => {
    if (fabHidden.current === hide) return;
    fabHidden.current = hide;
    Animated.timing(fabAnim, {
      toValue: hide ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  };

  const handleScroll = (event: any) => {
    const currentY = event.nativeEvent.contentOffset.y;
    const delta = currentY - lastScrollY.current;

    if (currentY <= 16) {
      toggleFab(false);
    } else if (delta > 8) {
      toggleFab(true);
    } else if (delta < -8) {
      toggleFab(false);
    }

    lastScrollY.current = currentY;
  };

  return (
    <LinearGradient
      colors={isDark ? ['#0D0D0D', '#111111'] : ['#FAFAFA', '#FFFDF8']}
      style={styles.gradient}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <Text style={[styles.appName, { color: theme.text }]}>PayU</Text>
            <View style={styles.topBarRight}>
              <TouchableOpacity
                onPress={toggleTheme}
                style={[
                  styles.topIconBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.08)',
                  },
                ]}>
                <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.topIconBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)',
                    borderColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15,23,42,0.08)',
                  },
                ]}>
                <Ionicons name="notifications-outline" size={18} color={theme.text} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <LinearGradient
              colors={['#6A3093', '#FC5C7D']}
              style={styles.avatar}>
              <Text style={styles.avatarLetter}>{initial}</Text>
            </LinearGradient>
            <Text style={[styles.userName, { color: theme.text }]}>{user.name}</Text>
          </View>

          {/* Tab Toggle */}
          <View style={[styles.tabToggle, { backgroundColor: theme.card }]}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'preview' && styles.tabBtnActive]}
              onPress={() => setTab('preview')}>
              <Text style={[styles.tabText, { color: tab === 'preview' ? '#fff' : theme.textSecondary }]}>
                Preview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'edit' && styles.tabBtnActive]}
              onPress={() => setTab('edit')}>
              <Text style={[styles.tabText, { color: tab === 'edit' ? '#fff' : theme.textSecondary }]}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          {tab === 'preview' ? (
            <View style={[styles.previewCard, { backgroundColor: theme.surface }]}>
              {[
                { label: 'Total spendings', value: formatCurrency(user.totalExpenses) },
                { label: 'Email', value: user.email },
                { label: 'Balance', value: formatCurrency(user.balance) },
                { label: 'Total Income', value: formatCurrency(user.totalIncome) },
              ].map((item, i) => (
                <View key={i} style={[styles.previewRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>{item.label} :</Text>
                  <Text style={[styles.previewValue, { color: theme.text }]}>{item.value}</Text>
                </View>
              ))}

              {/* Stats Row */}
              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.statValue, { color: theme.income }]}>{formatCurrency(user.totalIncome)}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Income</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.statValue, { color: theme.expense }]}>{formatCurrency(user.totalExpenses)}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Spent</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.inputBg }]}>
                  <Text style={[styles.statValue, { color: theme.accent }]}>{formatCurrency(user.balance)}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Balance</Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.logoutBtn, { borderColor: theme.expense }]}>
                <Text style={[styles.logoutText, { color: theme.expense }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.editCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Full Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: errors.name ? '#FF6B6B' : 'transparent' }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={theme.textSecondary}
              />
              {errors.name && <Text style={styles.error}>{errors.name}</Text>}

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Email</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: errors.email ? '#FF6B6B' : 'transparent' }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Password</Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, paddingRight: 48, borderColor: errors.password ? '#FF6B6B' : 'transparent' }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  style={styles.eyeBtn}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.error}>{errors.password}</Text>}

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Confirm Password</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: errors.confirm ? '#FF6B6B' : 'transparent' }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry={!showPassword}
              />
              {errors.confirm && <Text style={styles.error}>{errors.confirm}</Text>}

              <TouchableOpacity onPress={handleUpdate}>
                <LinearGradient
                  colors={['#fff', '#eee']}
                  style={styles.updateBtn}>
                  <Text style={styles.updateBtnText}>Update Details</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FAB */}
      <Animated.View
        style={{
          transform: [
            {
              translateY: fabAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 100],
              }),
            },
          ],
          opacity: fabAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0],
          }),
        }}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.text }]}
          onPress={() => navigation.navigate('AddTransaction')}>
          <Text style={[styles.fabText, { color: theme.background }]}>+</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { padding: spacing.lg, paddingTop: 60, paddingBottom: 100 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  appName: { fontSize: typography.md, fontWeight: '800', letterSpacing: 0.3 },
  topBarRight: { flexDirection: 'row', gap: spacing.xs },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: { alignItems: 'center', marginBottom: spacing.lg },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarLetter: { fontSize: typography.lg, color: '#fff', fontWeight: '700' },
  userName: { fontSize: typography.md, fontWeight: '700' },
  tabToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: spacing.xs,
    marginBottom: spacing.md,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: '#333' },
  tabText: { fontSize: typography.sm, fontWeight: '600' },
  previewCard: { borderRadius: 20, padding: 20 },
  previewRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 4,
  },
  previewLabel: { fontSize: typography.xs },
  previewValue: { fontSize: typography.md, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.md, marginBottom: spacing.md },
  statBox: { flex: 1, borderRadius: 12, padding: spacing.sm, alignItems: 'center' },
  statValue: { fontSize: typography.sm, fontWeight: '700', marginBottom: 2 },
  statLabel: { fontSize: typography.xs },
  logoutBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  logoutText: { fontSize: typography.md, fontWeight: '700' },
  editCard: { borderRadius: 20, padding: 20 },
  fieldLabel: { fontSize: typography.xs, marginBottom: 6, marginTop: 12 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: typography.sm,
    borderWidth: 1.5,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  updateBtn: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  updateBtnText: { fontSize: typography.md, fontWeight: '700', color: '#000' },
  error: { color: '#FF6B6B', fontSize: typography.xs, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  fabText: { fontSize: typography.lg, fontWeight: '300', marginTop: -2 },
});

export default ProfileScreen;
