import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FishProduct, MOCK_PREVIOUSLY_BOUGHT_FISH } from '../../data/mockFishData';
import { ProductCard } from './ProductCard';

interface PreviouslyBoughtSectionProps {
  products?: FishProduct[];
  onSeeAllPress?: () => void;
  onAddProduct?: (product: FishProduct) => void;
}

export const PreviouslyBoughtSection: React.FC<PreviouslyBoughtSectionProps> = ({
  products = MOCK_PREVIOUSLY_BOUGHT_FISH,
  onSeeAllPress,
  onAddProduct,
}) => {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.headerRow}>
        <Text style={styles.titleText}>Previously bought</Text>
        <TouchableOpacity onPress={onSeeAllPress} activeOpacity={0.7}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Carousel */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((item) => (
          <ProductCard
            key={item.id}
            product={item}
            variant="previous"
            onAddPress={onAddProduct}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
  },
  scrollContent: {
    paddingRight: 8,
  },
});
