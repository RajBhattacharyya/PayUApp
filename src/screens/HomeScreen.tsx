import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import GradientCard from '../components/GradientCard';
import TransactionItem from '../components/TransactionItem';
import MonthlySummary from '../components/MonthlySummary';
import EmptyState from '../components/EmptyState';
import { formatCurrency, getCurrentMonthKey, getMonthYear } from '../utils/formatters';

interface Props {
  navigation: any;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, getFilteredTransactions, getMonthlySummary } = useTransactions();
  const [refreshing, setRefreshing] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <LinearGradient
      colors={isDark ? ['#0D0D0D', '#111111'] : ['#F5F6FA', '#EEF2FF']}
      style={styles.gradient}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
        contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Animated.View
          style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }] }]}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting()},</Text>
            <Text style={[styles.userName, { color: theme.text }]}>{firstName} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[styles.iconBtn, { backgroundColor: theme.card }]}>
              <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('AddTransaction')}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Balance Card */}
        <GradientCard
          gradientColors={['#1F4037', '#2ecc71', '#99F2C8']}
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
          gradientColors={['#FC5C7D', '#6A3093']}
          cardNumber="8763 1111 2222 0329"
          holderName={user.name.toUpperCase()}
          expiry="10/28"
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
            { icon: '➕', label: 'Add', action: () => navigation.navigate('AddTransaction') },
            { icon: '📊', label: 'Stats', action: () => navigation.navigate('Balances') },
            { icon: '👤', label: 'Profile', action: () => navigation.navigate('Profile') },
            { icon: isDark ? '☀️' : '🌙', label: 'Theme', action: toggleTheme },
          ].map((q, i) => (
            <TouchableOpacity
              key={i}
              onPress={q.action}
              style={[styles.quickAction, { backgroundColor: theme.card }]}>
              <Text style={{ fontSize: 22 }}>{q.icon}</Text>
              <Text style={[styles.quickLabel, { color: theme.textSecondary }]}>{q.label}</Text>
            </TouchableOpacity>
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
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.text }]}
        onPress={() => navigation.navigate('AddTransaction')}>
        <Text style={[styles.fabText, { color: theme.background }]}>+</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { fontSize: 13 },
  userName: { fontSize: 22, fontWeight: '800' },
  headerRight: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: { marginBottom: 16 },
  balanceContent: { padding: 20 },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 4 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginBottom: 4 },
  balanceSub: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginBottom: 16 },
  balanceStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
  },
  balanceStat: { flex: 1, alignItems: 'center' },
  balanceStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginBottom: 4 },
  balanceStatValue: { color: '#fff', fontSize: 15, fontWeight: '700' },
  balanceDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 8 },
  bankCard: { marginBottom: 8 },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
    gap: 8,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    gap: 6,
  },
  quickLabel: { fontSize: 11, fontWeight: '500' },
  section: { marginTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600' },
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
  fabText: { fontSize: 26, fontWeight: '300', marginTop: -2 },
});

export default HomeScreen;
