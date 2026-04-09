import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Pressable,
    Animated,
    RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import GradientCard from '../components/GradientCard';
import TransactionItem from '../components/TransactionItem';
import MonthlySummary from '../components/MonthlySummary';
import EmptyState from '../components/EmptyState';
import { formatCurrency, getCurrentMonthKey, getMonthYear } from '../utils/formatters';
import { typography, spacing } from '../theme/typography';

interface Props {
    navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
    const { theme, isDark, toggleTheme } = useTheme();
    const { user, getFilteredTransactions, getMonthlySummary } = useTransactions();
    const [refreshing, setRefreshing] = useState(false);
    const headerAnim = useRef(new Animated.Value(0)).current;
    const fabAnim = useRef(new Animated.Value(0)).current;
    const lastScrollY = useRef(0);
    const fabHidden = useRef(false);
    const lastThemeToggleAt = useRef(0);

    const monthKey = getCurrentMonthKey();
    const txns = getFilteredTransactions(monthKey);
    const summary = getMonthlySummary(monthKey);
    const recentTxns = txns.slice(0, 5);

    useEffect(() => {
        Animated.spring(headerAnim, { toValue: 1, friction: 6, useNativeDriver: true }).start();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await new Promise((r) => setTimeout(r, 600));
        setRefreshing(false);
    };

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const firstName = user.name.split(' ')[0];

    const handleThemeToggle = () => {
        const now = Date.now();
        // Guard against accidental double taps causing instant toggle-back.
        if (now - lastThemeToggleAt.current < 220) return;
        lastThemeToggleAt.current = now;
        toggleTheme();
    };

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
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scroll}>

                {/* App Bar */}
                <View style={styles.topBar}>
                    <Text style={[styles.appName, { color: theme.text }]}>PayU</Text>
                    <View style={styles.topBarRight}>
                        <TouchableOpacity
                            onPress={handleThemeToggle}
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

                {/* Header */}
                <Animated.View
                    style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
                    <View>
                        <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting()},</Text>
                        <Text style={[styles.userName, { color: theme.text }]}>{firstName} 👋</Text>
                    </View>
                </Animated.View>

                {/* Balance Card */}
                <GradientCard
                    gradientColors={['#0B1A12', '#1E5F45', '#8FD9B6']}
                    style={styles.balanceCard}>
                    <View style={styles.balanceContent}>
                        <Text style={styles.balanceLabel}>Total Balance</Text>
                        <Text style={styles.balanceAmount}>{formatCurrency(user.balance)}</Text>
                        <Text style={styles.balanceSub}>
                            {getMonthYear(new Date().toISOString())}
                        </Text>
                        <View style={styles.balanceStats}>
                            <View style={styles.balanceStat}>
                                <Text style={styles.balanceStatLabel}>↗ Income</Text>
                                <Text style={styles.balanceStatValue}>{formatCurrency(summary.income)}</Text>
                            </View>
                            <View style={styles.balanceDivider} />
                            <View style={styles.balanceStat}>
                                <Text style={styles.balanceStatLabel}>↘ Spent</Text>
                                <Text style={styles.balanceStatValue}>{formatCurrency(summary.expenses)}</Text>
                            </View>
                        </View>
                    </View>
                </GradientCard>

                {/* Bank Card Preview */}
                <GradientCard
                    gradientColors={['#FF5C9D', '#6A3093']}
                    bankName="PayU Bank"
                    cardNumber="8763 1111 2222 0329"
                    holderName={user.name.toUpperCase()}
                    expiry="10/28"
                    start={{ x: 1, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.bankCard}
                />

                {/* Monthly Summary Pills */}
                <MonthlySummary
                    income={summary.income}
                    expenses={summary.expenses}
                    balance={summary.balance}
                />

                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    {[
                        {
                            icon: 'add-circle-outline',
                            label: 'Add',
                            action: () => navigation.navigate('AddTransaction'),
                            iconColor: isDark ? '#6CF2C1' : '#0C8E5E',
                        },
                        {
                            icon: 'wallet-outline',
                            label: 'Stats',
                            action: () => navigation.navigate('Balances'),
                            iconColor: isDark ? '#8BC3FF' : '#2E6FD8',
                        },
                        {
                            icon: 'person-outline',
                            label: 'Profile',
                            action: () => navigation.navigate('Profile'),
                            iconColor: isDark ? '#F8B4D9' : '#B24E91',
                        },
                        {
                            icon: isDark ? 'sunny-outline' : 'moon-outline',
                            label: 'Theme',
                            action: handleThemeToggle,
                            iconColor: isDark ? '#F7D37D' : '#6B5BDE',
                        },
                    ].map((q, i) => (
                        <Pressable
                            key={q.label}
                            onPress={q.action}
                            android_ripple={{
                                color: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)',
                                borderless: false,
                            }}
                            style={({ pressed }) => [
                                styles.quickAction,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                                    borderColor: isDark ? 'rgba(255,255,255,0.16)' : '#E4E8EF',
                                    opacity: pressed ? 0.92 : 1,
                                    transform: [{ scale: pressed ? 0.98 : 1 }],
                                },
                            ]}>
                            <Ionicons name={q.icon as any} size={22} color={q.iconColor} />
                            <Text style={[styles.quickLabel, { color: theme.secondary }]}>{q.label}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* Recent Transactions */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Transactions</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Balances')}>
                            <Text style={[styles.seeAll, { color: theme.accent }]}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    {recentTxns.length === 0 ? (
                        <EmptyState
                            icon="💸"
                            title="No transactions yet"
                            subtitle="Tap + to add your first income or expense"
                        />
                    ) : (
                        recentTxns.map((t) => <TransactionItem key={t.id} transaction={t} />)
                    )}
                </View>
            </ScrollView>

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
        marginBottom: spacing.md,
    },
    appName: { fontSize: typography.md, fontWeight: '800', letterSpacing: 0.3 },
    topBarRight: { flexDirection: 'row', gap: 10 },
    topIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    greeting: { fontSize: typography.xs, fontWeight: '400', letterSpacing: 0.2 },
    userName: { fontSize: typography.lg, fontWeight: '800' },
    balanceCard: { marginBottom: spacing.md },
    balanceContent: { padding: spacing.lg },
    balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: typography.xs, marginBottom: spacing.xs },
    balanceAmount: { color: '#fff', fontSize: typography.lg, fontWeight: '800', marginBottom: spacing.xs },
    balanceSub: { color: 'rgba(255,255,255,0.5)', fontSize: typography.xs, marginBottom: spacing.md },
    balanceStats: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 12,
    },
    balanceStat: { flex: 1, alignItems: 'center' },
    balanceStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: typography.xs, marginBottom: 4 },
    balanceStatValue: { color: '#fff', fontSize: typography.sm, fontWeight: '700' },
    balanceDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
    bankCard: { marginBottom: spacing.xs },
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: spacing.sm,
        gap: spacing.xs,
    },
    quickAction: {
        flex: 1,
        alignItems: 'center',
        padding: spacing.md - 2,
        borderRadius: 20,
        borderWidth: 1,
        gap: spacing.xs - 2,
    },
    quickLabel: { fontSize: typography.xs, fontWeight: '500' },
    section: { marginTop: spacing.xs },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    sectionTitle: { fontSize: typography.md, fontWeight: '700' },
    seeAll: { fontSize: typography.sm, fontWeight: '600' },
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

export default HomeScreen;
