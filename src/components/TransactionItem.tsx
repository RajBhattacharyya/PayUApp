import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Transaction } from '../utils/storage';
import { getCategoryById } from '../utils/categories';
import { formatCurrency, formatShortDate } from '../utils/formatters';
import { typography, spacing } from '../theme/typography';
import { useTheme } from '../context/ThemeContext';
import { useTransactions } from '../context/TransactionContext';

interface Props {
  transaction: Transaction;
}

const categoryIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  food: 'restaurant-outline',
  travel: 'airplane-outline',
  shopping: 'bag-handle-outline',
  health: 'medkit-outline',
  entertainment: 'film-outline',
  utilities: 'flash-outline',
  education: 'school-outline',
  rent: 'home-outline',
  salary: 'cash-outline',
  freelance: 'laptop-outline',
  investment: 'trending-up-outline',
  gift: 'gift-outline',
  other: 'apps-outline',
};

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
  const categoryIcon = categoryIconMap[category.id] || 'wallet-outline';
  const cardGradientColors = (isIncome
    ? ['#070F0B', '#0D1B14', '#13261D']
    : ['#14070A', '#2A0710', '#4A1020']) as [string, string, string];
  const accentColor = isIncome ? theme.income : theme.expense;
  const primaryTextColor = '#FFFFFF';
  const secondaryTextColor = 'rgba(255,255,255,0.72)';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onLongPress={handleLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ scale: scaleAnim }],
            shadowOpacity: 0.2,
          },
        ]}>
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
        <LinearGradient
          colors={cardGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.innerGradient}>
          <View style={[styles.iconContainer, { borderColor: category.color + '66', backgroundColor: category.color + '1F' }]}>
            <Ionicons name={categoryIcon} size={20} color={category.color} />
          </View>
          <View style={styles.details}>
            <Text style={[styles.name, { color: primaryTextColor }]}>{category.name}</Text>
            <Text style={[styles.note, { color: secondaryTextColor }]}>
              {transaction.note || formatShortDate(transaction.date)}
            </Text>
          </View>
          <View style={styles.right}>
            <Text
              style={[
                styles.amount,
                { color: accentColor },
              ]}>
              {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
            </Text>
            <Text style={[styles.date, { color: secondaryTextColor }]}>
              {formatShortDate(transaction.date)}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: spacing.xs,
    overflow: 'hidden',
    shadowColor: '#0F2A1D',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 1,
  },
  innerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
    paddingLeft: spacing.sm + 8,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  details: { flex: 1 },
  name: { fontSize: typography.sm, fontWeight: '700', marginBottom: 2 },
  note: { fontSize: typography.xs },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: typography.md, fontWeight: '800' },
  date: { fontSize: typography.xs, marginTop: 2 },
});

export default TransactionItem;
