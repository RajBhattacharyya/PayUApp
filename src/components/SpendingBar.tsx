import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: BarData[];
  max?: number;
}

const SpendingBar: React.FC<Props> = ({ data, max }) => {
  const { theme } = useTheme();
  const maxVal = max || Math.max(...data.map((d) => d.value), 1);
  const anims = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(
      80,
      anims.map((a, i) =>
        Animated.spring(a, {
          toValue: data[i].value / maxVal,
          friction: 6,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [data]);

  const BAR_HEIGHT = 80;

  return (
    <View style={styles.container}>
      {data.map((d, i) => (
        <View key={i} style={styles.barWrapper}>
          <View style={[styles.track, { height: BAR_HEIGHT, backgroundColor: theme.inputBg }]}>
            <Animated.View
              style={[
                styles.fill,
                {
                  backgroundColor: d.color || theme.accent,
                  height: anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, BAR_HEIGHT],
                  }),
                },
              ]}
            />
          </View>
          <Text style={[styles.label, { color: theme.textSecondary }]}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 8,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  track: {
    width: 24,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    borderRadius: 12,
  },
  label: {
    fontSize: 11,
  },
});

export default SpendingBar;
