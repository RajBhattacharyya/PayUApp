import React, { useEffect, useRef } from 'react';
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
  const borderGlowAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(borderGlowAnim, {
          toValue: 0.9,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(borderGlowAnim, {
          toValue: 0.35,
          duration: 1300,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, [borderGlowAnim]);

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
  const borderColor = isIncome ? 'rgba(67, 125, 95, 0.55)' : 'rgba(255, 97, 122, 0.56)';
  const animatedBorderColor = isIncome ? 'rgba(104, 208, 156, 0.6)' : 'rgba(255, 120, 140, 0.66)';

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
            borderColor,
            shadowOpacity: 0.2,
          },
        ]}>
        <LinearGradient
          colors={cardGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.innerGradient}>
          <View style={[styles.iconContainer, { borderColor: category.color + '66', backgroundColor: category.color + '1F' }]}>
            <Ionicons name={categoryIcon} size={20} color={category.color} />
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
        </LinearGradient>
        <Animated.View
          pointerEvents="none"
          style={[styles.animatedBorder, { opacity: borderGlowAnim, borderColor: animatedBorderColor }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#0F2A1D',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 5,
  },
  innerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  animatedBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1,
    borderRadius: 16,
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
  name: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  note: { fontSize: 12 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '800' },
  date: { fontSize: 11, marginTop: 2 },
});

export default TransactionItem;
