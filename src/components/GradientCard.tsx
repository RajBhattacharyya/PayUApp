import React, { useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { typography, spacing } from '../theme/typography';

interface GradientCardProps {
  gradientColors: string[];
  title?: string;
  subtitle?: string;
  amount?: string;
  bankName?: string;
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const GradientCard: React.FC<GradientCardProps> = ({
  gradientColors,
  title,
  subtitle,
  amount,
  bankName = 'PayU Bank',
  cardNumber,
  holderName,
  expiry,
  children,
  style,
  onPress,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showFullCardNumber, setShowFullCardNumber] = useState(false);

  const randomBankIcon = useMemo(() => {
    const icons = ['business-outline', 'card-outline', 'shield-checkmark-outline'];
    return icons[Math.floor(Math.random() * icons.length)];
  }, []);

  const formattedMaskedCardNumber = useMemo(() => {
    if (!cardNumber) return '';
    const digits = cardNumber.replace(/\D/g, '');
    const masked = `${'X'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
    return masked.match(/.{1,4}/g)?.join(' ') ?? masked;
  }, [cardNumber]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}>
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        <LinearGradient
          colors={gradientColors as any}
          start={start}
          end={end}
          style={styles.card}>
          {cardNumber ? (
            <View style={styles.bankCard}>
              <View style={styles.bankCardTop}>
                <View style={styles.bankBrandRow}>
                  <Ionicons name={randomBankIcon as any} size={18} color="#FFFFFF" style={styles.bankIcon} />
                  <Text style={styles.bankName}>{bankName}</Text>
                </View>
                <View style={styles.chipRow}>
                  <View style={styles.chip} />
                  <View style={styles.chipInner} />
                </View>
              </View>

              <View style={styles.cardNumberRow}>
                <Text style={styles.cardNumber}>{showFullCardNumber ? cardNumber : formattedMaskedCardNumber}</Text>
                <TouchableOpacity
                  onPress={() => setShowFullCardNumber((prev) => !prev)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name={showFullCardNumber ? 'eye-off-outline' : 'eye-outline'} size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.cardLabel}>Card Holder Name</Text>
                  <Text style={styles.cardValue}>{holderName}</Text>
                </View>
                <View>
                  <Text style={styles.cardLabel}>Expired Date</Text>
                  <Text style={styles.cardValue}>{expiry}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.content}>
              {title && <Text style={styles.title}>{title}</Text>}
              {amount && <Text style={styles.amount}>{amount}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
              {children}
            </View>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: typography.xs,
    fontWeight: '500',
    marginBottom: 6,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: typography.lg,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: typography.xs,
    marginTop: 4,
  },
  bankCard: {
    padding: spacing.lg,
    height: 180,
    justifyContent: 'space-between',
  },
  bankCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bankBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankIcon: {
    opacity: 0.95,
  },
  bankName: {
    color: '#FFFFFF',
    fontSize: typography.sm,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  chip: {
    width: 32,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  chipInner: {
    position: 'absolute',
    left: 4,
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 3,
  },
  cardNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: typography.md,
    fontWeight: '600',
    letterSpacing: 2,
  },
  eyeButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: typography.xs,
    marginBottom: 2,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: typography.sm,
    fontWeight: '600',
  },
});

export default GradientCard;
