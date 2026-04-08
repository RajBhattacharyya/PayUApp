import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/formatters';

interface Props {
  income: number;
  expenses: number;
  balance: number;
}

const MonthlySummary: React.FC<Props> = ({ income, expenses, balance }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.item, { backgroundColor: theme.card }]}>
        <View style={[styles.dot, { backgroundColor: theme.income }]} />
        <View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Income</Text>
          <Text style={[styles.value, { color: theme.income }]}>{formatCurrency(income)}</Text>
        </View>
      </View>
      <View style={[styles.item, { backgroundColor: theme.card }]}>
        <View style={[styles.dot, { backgroundColor: theme.expense }]} />
        <View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Expenses</Text>
          <Text style={[styles.value, { color: theme.expense }]}>{formatCurrency(expenses)}</Text>
        </View>
      </View>
      <LinearGradient
        colors={balance >= 0 ? ['#1F4037', '#99F2C8'] : ['#FC5C7D', '#6A3093']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.item}>
        <View>
          <Text style={[styles.label, { color: 'rgba(255,255,255,0.7)' }]}>Net</Text>
          <Text style={[styles.value, { color: '#fff' }]}>{formatCurrency(Math.abs(balance))}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  item: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 11,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default MonthlySummary;
