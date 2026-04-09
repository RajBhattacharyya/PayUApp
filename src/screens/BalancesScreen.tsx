import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
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
import { typography, spacing } from '../theme/typography';

interface Props {
  navigation: any;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FILTER_TABS = ['All', 'Income', 'Expense'];
const CREDIT_SCORE = 660;
const SCORE_MIN = 300;
const SCORE_MAX = 850;

const getCreditStatus = (score: number) => {
  if (score >= 800) return 'Excellent';
  if (score >= 740) return 'Very Good';
  if (score >= 670) return 'Good';
  if (score >= 580) return 'Fair';
  return 'Poor';
};

const BalancesScreen: React.FC<Props> = ({ navigation }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { transactions, getMonthlySummary, getFilteredTransactions } = useTransactions();
  const [filter, setFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [gaugeKey, setGaugeKey] = useState(0);
  const fabAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const fabHidden = useRef(false);

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
  const creditStatus = getCreditStatus(CREDIT_SCORE);
  const pointerAngle = Math.PI - scoreProgress * Math.PI;
  const pointerX = gaugeRadius + gaugeRadius * Math.cos(pointerAngle);
  const pointerY = gaugeRadius - gaugeRadius * Math.sin(pointerAngle);

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scroll}>

        {/* App Bar */}
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
                    <Text style={[styles.creditStatus, { color: theme.textSecondary }]}>{creditStatus}</Text>
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
  topBarRight: { flexDirection: 'row', gap: spacing.xs },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: { marginBottom: spacing.md },
  headerTitle: { fontSize: typography.lg, fontWeight: '800' },
  headerSub: {
    fontSize: typography.xs,
    marginTop: 2,
    alignSelf: 'flex-start',
    paddingBottom: 1,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: spacing.xs,
    marginVertical: spacing.sm,
    gap: spacing.xs,
  },
  viewBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  viewBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewBtnActive: { backgroundColor: '#1B1B1B' },
  viewBtnText: { fontSize: typography.sm, fontWeight: '600' },
  creditCard: {
    borderRadius: 20,
    padding: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  creditHeader: {
    alignItems: 'center',
    marginTop: 0,
  },
  creditTitle: { fontSize: typography.md, fontWeight: '800' },
  creditMeta: { fontSize: typography.xs, marginTop: 2 },
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
    marginTop: -6,
    width: 190,
  },
  creditScore: { fontSize: 34, fontWeight: '900', letterSpacing: -0.6 },
  creditStatus: { fontSize: typography.xs, fontWeight: '600', marginTop: 2, textAlign: 'center', letterSpacing: 0.3 },
  chartCard: {
    borderRadius: 20,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  chartTitle: { fontSize: typography.md, fontWeight: '700', marginBottom: 2 },
  chartSub: { fontSize: typography.xs, marginBottom: 12 },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  currencyName: { fontSize: typography.sm, fontWeight: '600' },
  currencyFull: { fontSize: typography.xs },
  enableBtn: {
    paddingHorizontal: spacing.xs - 2,
    paddingVertical: spacing.xs / 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  enableBtnText: { fontSize: typography.xs, fontWeight: '500' },
  filterRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: spacing.xs,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterText: { fontSize: typography.sm, fontWeight: '600' },
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

export default BalancesScreen;
