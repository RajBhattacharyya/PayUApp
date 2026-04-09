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
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import CategoryPicker from '../components/CategoryPicker';
import { typography, spacing } from '../theme/typography';

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
        navigation.goBack();
    };

    const typeIndicatorLeft = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['2%', '51%'],
    });

    const typeColor = type === 'income' ? theme.income : theme.expense;

    return (
        <LinearGradient
            colors={isDark ? ['#050505', '#0B110E', '#050505'] : ['#FAFAFA', '#FFFDF8', '#FAFAFA']}
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
                            <Ionicons name="chevron-back-outline" size={18} color={theme.text} />
                        </TouchableOpacity>
                        <View style={styles.headerCenter}>
                            <Text style={[styles.headerTitle, { color: theme.text }]}>New Transaction</Text>
                            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Track income or spending instantly</Text>
                        </View>
                        <View style={[styles.headerGhost, { backgroundColor: theme.card }]}>
                            <Ionicons name={type === 'income' ? 'cash-outline' : 'receipt-outline'} size={18} color={typeColor} />
                        </View>
                    </View>

                    {/* Amount Display */}
                    <Animated.View style={[styles.amountDisplay, { transform: [{ translateX: shakeAnim }] }]}>
                        <LinearGradient
                            colors={type === 'income' ? ['#0E2A1D', '#1E5F45', '#8FD9B6'] : ['#2A0710', '#5A1225', '#B91C35']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.amountGradient}>
                            <Text style={styles.amountPrefix}>{type === 'income' ? '+' : '-'} ₹</Text>
                            <Text style={styles.amountText}>{amount || '0.00'}</Text>
                            <Text style={styles.amountType}>{type === 'income' ? 'Income' : 'Expense'}</Text>
                        </LinearGradient>
                    </Animated.View>

                    {/* Type Toggle */}
                    <View
                        style={[
                            styles.typeToggle,
                            {
                                backgroundColor: isDark ? 'rgba(10, 18, 14, 0.92)' : '#FFFFFF',
                                borderColor: isDark ? 'rgba(124, 255, 185, 0.12)' : theme.border,
                            },
                        ]}>
                        <Animated.View style={[styles.typeIndicator, { left: typeIndicatorLeft, backgroundColor: typeColor }]} />
                        <TouchableOpacity style={styles.typeBtn} onPress={() => switchType('expense')}>
                            <View style={styles.typeBtnContent}>
                                <Ionicons name="remove-circle-outline" size={16} color={type === 'expense' ? '#fff' : theme.textSecondary} />
                                <Text style={[styles.typeBtnText, { color: type === 'expense' ? '#fff' : theme.textSecondary }]}>Expense</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.typeBtn} onPress={() => switchType('income')}>
                            <View style={styles.typeBtnContent}>
                                <Ionicons name="add-circle-outline" size={16} color={type === 'income' ? '#fff' : theme.textSecondary} />
                                <Text style={[styles.typeBtnText, { color: type === 'income' ? '#fff' : theme.textSecondary }]}>Income</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View
                        style={[
                            styles.form,
                            {
                                backgroundColor: theme.surface,
                                borderColor: isDark ? 'rgba(124, 255, 185, 0.12)' : theme.border,
                            },
                        ]}>
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
                                    <Text style={[styles.quickAmountText, { color: theme.text }]}>₹{a}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                        <LinearGradient
                            colors={type === 'income' ? ['#123827', '#1E5F45', '#2ecc71'] : ['#2A0710', '#5A1225', '#B91C35']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitBtn}>
                            <View style={styles.submitContent}>
                                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                                <Text style={styles.submitText}>
                                    {loading ? 'Saving...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: { flex: 1 },
    scroll: { padding: spacing.lg, paddingTop: 60, paddingBottom: 40 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerGhost: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: { fontSize: typography.lg, fontWeight: '800' },
    headerSub: { fontSize: typography.xs, marginTop: 2, textAlign: 'center' },
    amountDisplay: { marginBottom: spacing.md },
    amountGradient: {
        borderRadius: 20,
        padding: spacing.lg,
        alignItems: 'center',
    },
    amountPrefix: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: typography.md,
        fontWeight: '500',
        marginBottom: spacing.xs,
    },
    amountText: {
        color: '#fff',
        fontSize: typography.lg,
        fontWeight: '800',
        letterSpacing: -1,
    },
    amountType: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: typography.xs,
        marginTop: spacing.xs,
    },
    typeToggle: {
        flexDirection: 'row',
        borderRadius: 14,
        padding: spacing.xs,
        marginBottom: spacing.md,
        position: 'relative',
        height: 48,
        borderWidth: 1,
    },
    typeIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        width: '47%',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    typeBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    typeBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    typeBtnText: { fontSize: typography.sm, fontWeight: '600' },
    form: {
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.md,
        backgroundColor: 'rgba(16, 24, 21, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(124, 255, 185, 0.12)',
    },
    label: { fontSize: typography.xs, marginBottom: 6, marginTop: 12 },
    input: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: typography.sm,
        borderWidth: 1.5,
    },
    noteInput: { height: 80, paddingTop: 12 },
    error: { color: '#FF6B6B', fontSize: typography.xs, marginTop: 4 },
    quickAmounts: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginTop: spacing.md,
    },
    quickAmountBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
    },
    quickAmountText: { fontSize: typography.xs, fontWeight: '700' },
    submitBtn: {
        height: 54,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    submitText: { color: '#fff', fontSize: typography.md, fontWeight: '800' },
});

export default AddTransactionScreen;
