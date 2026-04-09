import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { getCategoryById } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';
import { useTheme } from '../context/ThemeContext';

interface Props {
  byCategory: Record<string, number>;
  total: number;
}

const SIZE = 140;
const RADIUS = 55;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

const PieChartView: React.FC<Props> = ({ byCategory, total }) => {
  const { theme } = useTheme();
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [byCategory]);

  if (total === 0) return null;

  const entries = Object.entries(byCategory).sort(([, a], [, b]) => b - a);
  let offset = 0;
  const slices = entries.map(([catId, amount]) => {
    const pct = amount / total;
    const dashLength = pct * CIRCUMFERENCE;
    const gapLength = CIRCUMFERENCE - dashLength;
    const slice = { catId, pct, dashLength, gapLength, offset, amount };
    offset += dashLength;
    return slice;
  });

  return (
    <View>
      <View style={styles.row}>
        <Svg width={SIZE} height={SIZE}>
          <G rotation="-90" origin={`${CENTER},${CENTER}`}>
            {slices.map((s, i) => {
              const cat = getCategoryById(s.catId);
              return (
                <Circle
                  key={i}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth={18}
                  strokeDasharray={`${s.dashLength} ${s.gapLength}`}
                  strokeDashoffset={-s.offset}
                />
              );
            })}
          </G>
          {/* Donut hole */}
          <Circle cx={CENTER} cy={CENTER} r={38} fill={theme.surface} />
        </Svg>
        <View style={styles.legend}>
          {slices.slice(0, 5).map((s, i) => {
            const cat = getCategoryById(s.catId);
            return (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.legendName, { color: theme.text }]}>{cat.name}</Text>
                  <Text style={[styles.legendAmt, { color: theme.textSecondary }]}>
                    {(s.pct * 100).toFixed(0)}% · {formatCurrency(s.amount)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendName: {
    fontSize: 12,
    fontWeight: '600',
  },
  legendAmt: {
    fontSize: 12,
  },
});

export default PieChartView;
