import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientCardProps {
  gradientColors: string[];
  title?: string;
  subtitle?: string;
  amount?: string;
  cardNumber?: string;
  holderName?: string;
  expiry?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

const GradientCard: React.FC<GradientCardProps> = ({
  gradientColors,
  title,
  subtitle,
  amount,
  cardNumber,
  holderName,
  expiry,
  children,
  style,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}>
          {cardNumber ? (
            <View style={styles.bankCard}>
              <View style={styles.bankCardTop}>
                <View style={styles.chipRow}>
                  <View style={styles.chip} />
                  <View style={styles.chipInner} />
                </View>
                <View style={styles.wifiIcon}>
                  <View style={styles.wifiArc1} />
                  <View style={styles.wifiArc2} />
                  <View style={styles.wifiDot} />
                </View>
              </View>
              <Text style={styles.cardNumber}>{cardNumber}</Text>
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
    padding: 20,
  },
  title: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  amount: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  bankCard: {
    padding: 20,
    height: 180,
    justifyContent: 'space-between',
  },
  bankCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  wifiIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
  },
  wifiArc1: {
    width: 20,
    height: 10,
    borderTopWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    marginBottom: 2,
  },
  wifiArc2: {
    width: 12,
    height: 6,
    borderTopWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 6,
    marginBottom: 2,
  },
  wifiDot: {
    width: 4,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 2,
  },
  cardNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginBottom: 2,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default GradientCard;
