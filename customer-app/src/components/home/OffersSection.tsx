import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FishProduct, MOCK_OFFER_FISH } from '../../data/mockFishData';
import { ProductCard } from './ProductCard';

interface OffersSectionProps {
  products?: FishProduct[];
  onAddProduct?: (product: FishProduct) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({
  products = MOCK_OFFER_FISH,
  onAddProduct,
}) => {
  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.titleLeft}>
          <View style={styles.flameIconCircle}>
            <Text style={styles.flameEmoji}>🔥</Text>
          </View>
          <Text style={styles.sectionTitle}>Offers on Selected Fishes</Text>
        </View>

        <View style={styles.flashSaleBadge}>
          <Text style={styles.flashSaleText}>FLASH SALE</Text>
        </View>

        <View style={styles.timerPill}>
          <Text style={styles.timerText}>⏰ Ends in 03h:24m</Text>
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
    backgroundColor: '#FEFCE8', // Warm Soft Cream Yellow matching Figma Screenshot 1
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
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  flameEmoji: {
    fontSize: 13,
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
    marginRight: 4,
  },
  flashSaleText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  timerPill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F97316',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  timerText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '700',
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
