import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FishProduct } from '../../data/mockFishData';
import { FishCategoryFilters, CategoryFilterType } from './FishCategoryFilters';
import { ProductCard } from './ProductCard';
import { FilterIcon } from './HomeIcons';

interface AvailableFishSectionProps {
  products?: FishProduct[];
  onSortPress?: () => void;
  onAddProduct?: (product: FishProduct) => void;
  onRefreshPress?: () => void;
}

export const AvailableFishSection: React.FC<AvailableFishSectionProps> = ({
  products = [],
  onSortPress,
  onAddProduct,
  onRefreshPress,
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
          <View style={styles.sortContent}>
            <Text style={styles.sortButtonText}>Filter </Text>
            <FilterIcon size={13} color="#0284C7" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Category Filter Pills */}
      <FishCategoryFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* CP-02 Section 25: Empty Catalogue State */}
      {products.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Fresh Fish Available Today</Text>
          <Text style={styles.emptySubtext}>Check back later or refresh the catalogue for updates.</Text>
          {onRefreshPress && (
            <TouchableOpacity style={styles.refreshBtn} onPress={onRefreshPress} activeOpacity={0.8}>
              <Text style={styles.refreshBtnText}>Refresh Catalogue</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No fish match this category right now</Text>
          <TouchableOpacity onPress={() => setSelectedCategory('All')}>
            <Text style={styles.clearFilterText}>Show All Fish</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* 3-Column Product Grid */
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
      )}
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
  sortContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  refreshBtn: {
    backgroundColor: '#2463A8',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  refreshBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  clearFilterText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
});
