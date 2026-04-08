import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import CategoryPicker from '../components/CategoryPicker';

interface Props {
  navigation: any;
}

const AddTransactionScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { addTransaction } = useTransactions();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const switchType = (t: 'expense' | 'income') => {
    setType(t);
    setCategory(t === 'income' ? 'salary' : 'food');
    Animated.spring(slideAnim, {
      toValue: t === 'income' ? 1 : 0,
      useNativeDriver: false,
    }).start();
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    const amtNum = parseFloat(amount);
    if (!amount || isNaN(amtNum) || amtNum <= 0) errs.amount = 'Enter a valid amount';
    if (!category) errs.category = 'Pick a category';
    if (!date) errs.date = 'Date required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) shake();
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    await addTransaction({
      type,
      amount: parseFloat(amount),
      category,
      date,
      note,
    });
    setLoading(false);
    Alert.alert('✅ Added!', `${type === 'income' ? 'Income' : 'Expense'} of $${amount} recorded.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const typeIndicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['2%', '51%'],
  });

  const typeColor = type === 'income' ? theme.income : theme.expense;

  return (
    <LinearGradient
      colors={isDark ? ['#0D0D0D', '#111111'] : ['#F5F6FA', '#EEF2FF']}
      style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card }]}>
              <Text style={{ color: theme.text, fontSize: 18 }}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Add Transaction</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Amount Display */}
          <Animated.View style={[styles.amountDisplay, { transform: [{ translateX: shakeAnim }] }]}>
            <LinearGradient
              colors={type === 'income' ? ['#1F4037', '#99F2C8'] : ['#FC5C7D', '#6A3093']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.amountGradient}>
              <Text style={styles.amountPrefix}>{type === 'income' ? '+' : '-'} $</Text>
              <Text style={styles.amountText}>{amount || '0.00'}</Text>
              <Text style={styles.amountType}>{type === 'income' ? 'Income' : 'Expense'}</Text>
            </LinearGradient>
          </Animated.View>

          {/* Type Toggle */}
          <View style={[styles.typeToggle, { backgroundColor: theme.card }]}>
            <Animated.View style={[styles.typeIndicator, { left: typeIndicatorLeft, backgroundColor: typeColor }]} />
            <TouchableOpacity style={styles.typeBtn} onPress={() => switchType('expense')}>
              <Text style={[styles.typeBtnText, { color: type === 'expense' ? '#fff' : theme.textSecondary }]}>
                💸 Expense
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.typeBtn} onPress={() => switchType('income')}>
              <Text style={[styles.typeBtnText, { color: type === 'income' ? '#fff' : theme.textSecondary }]}>
                💰 Income
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={[styles.form, { backgroundColor: theme.surface }]}>
            {/* Amount Input */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Amount</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: errors.amount ? '#FF6B6B' : typeColor + '44' }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            {errors.amount && <Text style={styles.error}>{errors.amount}</Text>}

            {/* Category */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
            <CategoryPicker type={type} selected={category} onSelect={setCategory} />
            {errors.category && <Text style={styles.error}>{errors.category}</Text>}

            {/* Date */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Date</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBg, color: theme.text, borderColor: errors.date ? '#FF6B6B' : 'transparent' }]}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={theme.textSecondary}
              value={date}
              onChangeText={setDate}
            />
            {errors.date && <Text style={styles.error}>{errors.date}</Text>}

            {/* Note */}
            <Text style={[styles.label, { color: theme.textSecondary }]}>Note (optional)</Text>
            <TextInput
              style={[styles.input, styles.noteInput, { backgroundColor: theme.inputBg, color: theme.text }]}
              placeholder="Add a note..."
              placeholderTextColor={theme.textSecondary}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {['50', '100', '500', '1000'].map((a) => (
                <TouchableOpacity
                  key={a}
                  onPress={() => setAmount(a)}
                  style={[styles.quickAmountBtn, { backgroundColor: theme.inputBg, borderColor: typeColor + '55' }]}>
                  <Text style={[styles.quickAmountText, { color: theme.text }]}>${a}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity onPress={handleSubmit} disabled={loading}>
            <LinearGradient
              colors={type === 'income' ? ['#1F4037', '#2ecc71'] : ['#FC5C7D', '#6A3093']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitBtn}>
              <Text style={styles.submitText}>
                {loading ? 'Saving...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  amountDisplay: { marginBottom: 16 },
  amountGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  amountPrefix: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  amountText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  amountType: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 4,
  },
  typeToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    position: 'relative',
    height: 48,
  },
  typeIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '47%',
    borderRadius: 10,
  },
  typeBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  typeBtnText: { fontSize: 14, fontWeight: '600' },
  form: { borderRadius: 20, padding: 20, marginBottom: 16 },
  label: { fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1.5,
  },
  noteInput: { height: 80, paddingTop: 12 },
  error: { color: '#FF6B6B', fontSize: 12, marginTop: 4 },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickAmountText: { fontSize: 13, fontWeight: '600' },
  submitBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default AddTransactionScreen;
