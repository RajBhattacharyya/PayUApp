import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

const EmptyState: React.FC<Props> = ({ icon = '📭', title, subtitle }) => {
  const { theme } = useTheme();
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.icon, { transform: [{ translateY: floatAnim }] }]}>
        {icon}
      </Animated.Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  icon: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 13, textAlign: 'center', maxWidth: 220 },
});

export default EmptyState;
