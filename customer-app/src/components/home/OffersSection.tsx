import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FishProduct } from '../../data/mockFishData';
import { ProductCard } from './ProductCard';
import { FlameIcon } from './HomeIcons';

interface OffersSectionProps {
  products?: FishProduct[];
  onAddProduct?: (product: FishProduct) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({
  products = [],
  onAddProduct,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleLeft}>
          <View style={styles.flameIconCircle}>
            <FlameIcon size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.sectionTitle}>Offers on Selected Fishes</Text>
        </View>

        <View style={styles.flashSaleBadge}>
          <Text style={styles.flashSaleText}>SPECIAL OFFERS</Text>
        </View>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitleText}>Limited stocks at verified farm-gate prices</Text>

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
            variant="offer"
            onAddPress={onAddProduct}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEFCE8',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
  },
  flashSaleBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  flashSaleText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  subtitleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 10,
  },
  scrollContent: {
    paddingRight: 8,
  },
});
