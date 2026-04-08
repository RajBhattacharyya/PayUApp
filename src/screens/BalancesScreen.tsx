import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';
import TransactionItem from '../components/TransactionItem';
import PieChartView from '../components/PieChartView';
import SpendingBar from '../components/SpendingBar';
import MonthlySummary from '../components/MonthlySummary';
import EmptyState from '../components/EmptyState';
import { formatCurrency, getCurrentMonthKey } from '../utils/formatters';

interface Props {
  navigation: any;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FILTER_TABS = ['All', 'Income', 'Expense'];

const BalancesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const { transactions, getMonthlySummary, getFilteredTransactions } = useTransactions();
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');

  const monthKey = getCurrentMonthKey();
  const summary = getMonthlySummary(monthKey);
  const allTxns = getFilteredTransactions(monthKey);

  const filteredTxns = allTxns.filter((t) => {
    if (filter === 'Income') return t.type === 'income';
    if (filter === 'Expense') return t.type === 'expense';
    return true;
  });

  // Build last 6 months bar data
  const now = new Date();
  const barData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const s = getMonthlySummary(key);
    return {
      label: MONTHS[d.getMonth()],
      value: s.expenses,
      color: i === 5 ? theme.accent : theme.accent + '66',
    };
  });

  return (
    <LinearGradient
      colors={isDark ? ['#0D0D0D', '#111111'] : ['#F5F6FA', '#EEF2FF']}
      style={styles.gradient}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Balances</Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            Manage your multi-currency accounts
          </Text>
        </View>

        {/* Summary Cards */}
        <MonthlySummary
          income={summary.income}
          expenses={summary.expenses}
          balance={summary.balance}
        />

        {/* View Toggle */}
        <View style={[styles.viewToggle, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            onPress={() => setViewMode('chart')}
            style={[styles.viewBtn, viewMode === 'chart' && styles.viewBtnActive]}>
            <Text style={[styles.viewBtnText, { color: viewMode === 'chart' ? '#fff' : theme.textSecondary }]}>
              📊 Charts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}>
            <Text style={[styles.viewBtnText, { color: viewMode === 'list' ? '#fff' : theme.textSecondary }]}>
              📋 List
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'chart' ? (
          <>
            {/* Spending Bars */}
            <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.chartTitle, { color: theme.text }]}>Monthly Spending</Text>
              <Text style={[styles.chartSub, { color: theme.textSecondary }]}>
                Current: {formatCurrency(summary.expenses)} / {formatCurrency(summary.income + 1000)}
              </Text>
              <SpendingBar data={barData} />
            </View>

            {/* Pie Chart */}
            {Object.keys(summary.byCategory).length > 0 && (
              <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
                <Text style={[styles.chartTitle, { color: theme.text }]}>Expense Breakdown</Text>
                <PieChartView byCategory={summary.byCategory} total={summary.expenses} />
              </View>
            )}

            {/* Currency Info */}
            <View style={[styles.chartCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.chartTitle, { color: theme.text }]}>Available Currencies</Text>
              {[
                { flag: '🇨🇦', name: 'Canadian Dollar', code: 'CAD', rate: '0.74' },
                { flag: '🇪🇺', name: 'Euro', code: 'EUR', rate: '1.08' },
                { flag: '🇬🇧', name: 'British Pound', code: 'GBP', rate: '1.27' },
              ].map((c, i) => (
                <View key={i} style={[styles.currencyRow, { borderBottomColor: theme.border }]}>
                  <Text style={{ fontSize: 24 }}>{c.flag}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.currencyName, { color: theme.text }]}>{c.code}</Text>
                    <Text style={[styles.currencyFull, { color: theme.textSecondary }]}>{c.name}</Text>
                  </View>
                  <View style={[styles.enableBtn, { borderColor: theme.border }]}>
                    <Text style={[styles.enableBtnText, { color: theme.textSecondary }]}>
                      1 USD = {c.rate}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Filter Tabs */}
            <View style={[styles.filterRow, { backgroundColor: theme.card }]}>
              {FILTER_TABS.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setFilter(f)}
                  style={[styles.filterBtn, filter === f && { backgroundColor: theme.text }]}>
                  <Text style={[styles.filterText, { color: filter === f ? theme.background : theme.textSecondary }]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredTxns.length === 0 ? (
              <EmptyState icon="🧾" title="No transactions" subtitle="Add income or expenses to see them here" />
            ) : (
              filteredTxns.map((t) => <TransactionItem key={t.id} transaction={t} />)
            )}
          </>
        )}
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
  header: { marginBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
    borderBottomWidth: 1.5,
    borderBottomColor: '#F4C542',
    alignSelf: 'flex-start',
    paddingBottom: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginVertical: 12,
    gap: 4,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewBtnActive: { backgroundColor: '#333' },
  viewBtnText: { fontSize: 13, fontWeight: '600' },
  chartCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  chartSub: { fontSize: 12, marginBottom: 12 },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  currencyName: { fontSize: 14, fontWeight: '600' },
  currencyFull: { fontSize: 12 },
  enableBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  enableBtnText: { fontSize: 11, fontWeight: '500' },
  filterRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
    gap: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterText: { fontSize: 13, fontWeight: '600' },
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

export default BalancesScreen;
