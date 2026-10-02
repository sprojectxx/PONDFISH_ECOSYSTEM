import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export type CategoryFilterType = 'All' | 'Freshwater' | 'Marine Catch' | 'Ready to Cook' | 'Shellfish';

interface FishCategoryFiltersProps {
  selectedCategory?: string;
  onSelectCategory?: (category: CategoryFilterType) => void;
}

const CATEGORIES: { label: string; value: CategoryFilterType; count?: number }[] = [
  { label: 'All (32)', value: 'All' },
  { label: 'Freshwater', value: 'Freshwater' },
  { label: 'Marine Catch', value: 'Marine Catch' },
  { label: 'Ready to Cook', value: 'Ready to Cook' },
  { label: 'Shellfish', value: 'Shellfish' },
];

export const FishCategoryFilters: React.FC<FishCategoryFiltersProps> = ({
  selectedCategory = 'All',
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.value || (selectedCategory === 'ALL' && cat.value === 'All');
          return (
            <TouchableOpacity
              key={cat.value}
              style={[styles.pill, isActive ? styles.activePill : styles.inactivePill]}
              onPress={() => onSelectCategory && onSelectCategory(cat.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, isActive ? styles.activePillText : styles.inactivePillText]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
  },
  activePill: {
    backgroundColor: '#0F294A', // Dark Navy Active Pill matching Figma
    borderColor: '#0F294A',
  },
  inactivePill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  activePillText: {
    color: '#FFFFFF',
  },
  inactivePillText: {
    color: '#475569',
  },
});
