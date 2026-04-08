import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PieChart } from 'react-native-gifted-charts';
import { useFocusEffect } from '@react-navigation/native';
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
const CREDIT_SCORE = 660;
const SCORE_MIN = 300;
const SCORE_MAX = 850;

const BalancesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { transactions, getMonthlySummary, getFilteredTransactions } = useTransactions();
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [gaugeKey, setGaugeKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setGaugeKey((v) => v + 1);
    }, [])
  );

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

  const creditGaugeData = [
    { value: 36, color: '#46D6C6', strokeColor: theme.surface, strokeWidth: 7 },
    { value: 20, color: '#E27AD8', strokeColor: theme.surface, strokeWidth: 7 },
    { value: 24, color: '#8BC3FF', strokeColor: theme.surface, strokeWidth: 7 },
    { value: 20, color: '#F8D78B', strokeColor: theme.surface, strokeWidth: 7 },
  ];

  const gaugeRadius = 112;
  const scoreProgress = Math.max(0, Math.min(1, (CREDIT_SCORE - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)));
  const pointerAngle = Math.PI - scoreProgress * Math.PI;
  const pointerX = gaugeRadius + gaugeRadius * Math.cos(pointerAngle);
  const pointerY = gaugeRadius - gaugeRadius * Math.sin(pointerAngle);

  return (
    <LinearGradient
      colors={isDark ? ['#0D0D0D', '#111111'] : ['#F5F6FA', '#EEF2FF']}
      style={styles.gradient}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {/* App Bar */}
        <View style={styles.topBar}>
          <Text style={[styles.appName, { color: theme.text }]}>PayU</Text>
          <View style={styles.topBarRight}>
            <TouchableOpacity onPress={toggleTheme} style={[styles.topBtn, { backgroundColor: theme.card }]}>
              <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.topBtn, { backgroundColor: theme.card }]}>
              <Ionicons name="notifications-outline" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

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

        {/* Credit Score */}
        <View style={[styles.creditCard, { backgroundColor: theme.surface }]}>
          <View style={styles.creditGaugeWrap}>
            <View style={styles.gaugeBox}>
              <PieChart
                key={gaugeKey}
                data={creditGaugeData}
                donut
                semiCircle
                radius={gaugeRadius}
                innerRadius={100}
                curvedStartEdges
                curvedEndEdges
                edgesRadius={7}
                innerCircleColor={isDark ? '#0A0C0F' : '#FFFFFF'}
                centerLabelComponent={() => (
                  <View style={styles.creditCenterLabel}>
                    <Text style={[styles.creditScore, { color: theme.text }]}>{CREDIT_SCORE}</Text>
                  </View>
                )}
                isAnimated
                animationDuration={1100}
                backgroundColor="transparent"
              />

              <View
                pointerEvents="none"
                style={[
                  styles.pointerOuter,
                  {
                    left: pointerX - 15,
                    top: pointerY - 5,
                  },
                ]}>
                <View style={styles.pointerInner} />
              </View>
            </View>
          </View>

          <View style={styles.creditHeader}>
            <Text style={[styles.creditTitle, { color: theme.text }]}>Credit Score</Text>
            <Text style={[styles.creditMeta, { color: theme.textSecondary }]}>Last Check on 21 Apr</Text>
          </View>
        </View>

        {/* View Toggle */}
        <View style={[styles.viewToggle, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            onPress={() => setViewMode('chart')}
            style={[styles.viewBtn, viewMode === 'chart' && styles.viewBtnActive]}>
            <View style={styles.viewBtnContent}>
              <Ionicons
                name={viewMode === 'chart' ? 'pie-chart' : 'pie-chart-outline'}
                size={16}
                color={viewMode === 'chart' ? '#fff' : theme.textSecondary}
              />
              <Text style={[styles.viewBtnText, { color: viewMode === 'chart' ? '#fff' : theme.textSecondary }]}>
                Charts
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.viewBtn, viewMode === 'list' && styles.viewBtnActive]}>
            <View style={styles.viewBtnContent}>
              <Ionicons
                name={viewMode === 'list' ? 'list' : 'list-outline'}
                size={16}
                color={viewMode === 'list' ? '#fff' : theme.textSecondary}
              />
              <Text style={[styles.viewBtnText, { color: viewMode === 'list' ? '#fff' : theme.textSecondary }]}>
                List
              </Text>
            </View>
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
              <Text style={[styles.chartTitle, { color: theme.text }]}>Currency Rates (INR)</Text>
              {[
                { flag: '🇨🇦', name: 'Canadian Dollar', code: 'CAD', inrRate: '61.50' },
                { flag: '🇪🇺', name: 'Euro', code: 'EUR', inrRate: '90.30' },
                { flag: '🇬🇧', name: 'British Pound', code: 'GBP', inrRate: '105.20' },
              ].map((c, i) => (
                <View key={i} style={[styles.currencyRow, { borderBottomColor: theme.border }]}>
                  <Text style={{ fontSize: 24 }}>{c.flag}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.currencyName, { color: theme.text }]}>{c.code}</Text>
                    <Text style={[styles.currencyFull, { color: theme.textSecondary }]}>{c.name}</Text>
                  </View>
                  <View style={[styles.enableBtn, { borderColor: theme.border }]}>
                    <Text style={[styles.enableBtnText, { color: theme.textSecondary }]}>
                      1 {c.code} = ₹{c.inrRate}
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: { fontSize: 18, fontWeight: '800', letterSpacing: 0.3 },
  topBarRight: { flexDirection: 'row', gap: 10 },
  topBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { marginBottom: 8 },
  headerTitle: { fontSize: 26, fontWeight: '800' },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
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
  viewBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewBtnActive: { backgroundColor: '#1B1B1B' },
  viewBtnText: { fontSize: 13, fontWeight: '600' },
  creditCard: {
    borderRadius: 20,
    padding: 16,
    marginTop: 4,
    marginBottom: 8,
  },
  creditHeader: {
    alignItems: 'center',
    marginTop: 0,
  },
  creditTitle: { fontSize: 16, fontWeight: '800' },
  creditMeta: { fontSize: 12, marginTop: 2 },
  creditGaugeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
    marginBottom: -24,
    height: 190,
  },
  gaugeBox: {
    width: 224,
    height: 130,
    position: 'relative',
  },
  pointerOuter: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8BC3FF',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8BC3FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 6,
  },
  pointerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  creditCenterLabel: {
    alignItems: 'center',
    marginTop: -2,
    width: 190,
  },
  creditScore: { fontSize: 48, fontWeight: '800', letterSpacing: -1 },
  creditStatus: { fontSize: 13, fontWeight: '700', marginTop: 2, textAlign: 'center' },
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
