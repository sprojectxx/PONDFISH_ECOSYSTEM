import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FishProduct, MOCK_AVAILABLE_FISH } from '../../data/mockFishData';
import { FishCategoryFilters, CategoryFilterType } from './FishCategoryFilters';
import { ProductCard } from './ProductCard';

interface AvailableFishSectionProps {
  products?: FishProduct[];
  onSortPress?: () => void;
  onAddProduct?: (product: FishProduct) => void;
}

export const AvailableFishSection: React.FC<AvailableFishSectionProps> = ({
  products = MOCK_AVAILABLE_FISH,
  onSortPress,
  onAddProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilterType>('All');

  const filteredProducts = products.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.titleText}>Available Fishes</Text>
          <Text style={styles.subtitleText}>
            Fresh catches ready for instant delivery or quota claim
          </Text>
        </View>

        <TouchableOpacity onPress={onSortPress} style={styles.sortButton} activeOpacity={0.7}>
          <Text style={styles.sortButtonText}>Sort & Filter 🎛️</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <FishCategoryFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3-Column Product Grid */}
      <View style={styles.gridContainer}>
        {filteredProducts.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            variant="grid"
            onAddPress={onAddProduct}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  titleColumn: {
    flex: 1,
    marginRight: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sortButton: {
    paddingVertical: 4,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
