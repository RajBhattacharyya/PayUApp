import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CATEGORIES, Category } from '../utils/categories';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing } from '../theme/typography';

interface Props {
  selected: string;
  type: 'income' | 'expense';
  onSelect: (id: string) => void;
}

const CategoryPicker: React.FC<Props> = ({ selected, type, onSelect }) => {
  const { theme } = useTheme();
  const filtered = CATEGORIES.filter((c) => c.type === type || c.type === 'both');

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      {filtered.map((cat) => {
        const isSelected = cat.id === selected;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? cat.color : theme.inputBg,
                borderColor: isSelected ? cat.color : theme.border,
              },
            ]}>
            <Ionicons name={cat.icon as any} size={16} color={isSelected ? '#fff' : cat.color} />
            <Text style={[styles.label, { color: isSelected ? '#fff' : theme.textSecondary }]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { marginVertical: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm - 2,
    paddingVertical: spacing.xs - 2,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.xs,
    gap: spacing.xs - 2,
  },
  label: { fontSize: typography.xs, fontWeight: '500' },
});

export default CategoryPicker;
