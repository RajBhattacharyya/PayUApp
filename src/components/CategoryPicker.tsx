import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { CATEGORIES, Category } from '../utils/categories';
import { useTheme } from '../context/ThemeContext';

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
            <Text style={styles.icon}>{cat.icon}</Text>
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
  scroll: { marginVertical: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    gap: 6,
  },
  icon: { fontSize: 16 },
  label: { fontSize: 13, fontWeight: '500' },
});

export default CategoryPicker;
