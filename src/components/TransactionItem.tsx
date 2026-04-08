import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { Transaction } from '../utils/storage';
import { getCategoryById } from '../utils/categories';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';

interface Props {
  transaction: Transaction;
}

const TransactionItem: React.FC<Props> = ({ transaction }) => {
  const { theme } = useTheme();
  const { deleteTransaction } = useTransactions();
  const category = getCategoryById(transaction.category);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleLongPress = () => {
    Alert.alert('Delete Transaction', 'Remove this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteTransaction(transaction.id) },
    ]);
  };

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  const isIncome = transaction.type === 'income';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: theme.card, transform: [{ scale: scaleAnim }] },
        ]}>
        <View style={[styles.iconContainer, { backgroundColor: category.color + '22' }]}>
          <Text style={styles.icon}>{category.icon}</Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.name, { color: theme.text }]}>{category.name}</Text>
          <Text style={[styles.note, { color: theme.textSecondary }]}>
            {transaction.note || formatShortDate(transaction.date)}
          </Text>
        </View>
        <View style={styles.right}>
          <Text
            style={[
              styles.amount,
              { color: isIncome ? theme.income : theme.expense },
            ]}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {formatShortDate(transaction.date)}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 20 },
  details: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  note: { fontSize: 12 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700' },
  date: { fontSize: 11, marginTop: 2 },
});

export default TransactionItem;
