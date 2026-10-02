import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { FishProduct } from '../../data/mockFishData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductCardProps {
  product: FishProduct;
  variant?: 'offer' | 'previous' | 'grid';
  onAddPress?: (product: FishProduct) => void;
  onFavoritePress?: (product: FishProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'grid',
  onAddPress,
  onFavoritePress,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (onFavoritePress) onFavoritePress(product);
  };

  // Category badge color selector for Grid cards
  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Freshwater':
        return { bg: '#1E40AF', text: '#FFFFFF' };
      case 'Marine':
        return { bg: '#0284C7', text: '#FFFFFF' };
      case 'Shellfish':
        return { bg: '#D97706', text: '#FFFFFF' };
      case 'Live Pond':
        return { bg: '#059669', text: '#FFFFFF' };
      default:
        return { bg: '#475569', text: '#FFFFFF' };
    }
  };

  const badgeStyle = getBadgeColor(product.categoryBadge);

  return (
    <View style={[styles.cardContainer, variant === 'grid' ? styles.gridCard : styles.horizontalCard]}>
      {/* Top Header Row overlay on image */}
      <View style={styles.imageOverlayHeader}>
        {/* Sale / Category Badge */}
        {variant === 'offer' && product.saleBadge ? (
          <View style={[styles.saleBadge, product.saleBadge.includes('WEEKEND') ? styles.blueSaleBadge : styles.redSaleBadge]}>
            <Text style={styles.saleBadgeText}>{product.saleBadge}</Text>
          </View>
        ) : variant === 'grid' && product.categoryBadge ? (
          <View style={[styles.categoryPillBadge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.categoryPillText, { color: badgeStyle.text }]}>{product.categoryBadge}</Text>
          </View>
        ) : (
          <View />
        )}

        {/* Wishlist Heart */}
        <TouchableOpacity style={styles.heartButton} onPress={toggleFavorite} activeOpacity={0.7}>
          <Text style={[styles.heartIcon, isFavorite && styles.heartActive]}>
            {isFavorite ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      {/* Indicator Dots for Previous/Grid */}
      {(variant === 'previous' || variant === 'grid') && (
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      )}

      {/* Weight + ADD Button Row */}
      <View style={styles.weightAddRow}>
        <Text style={styles.weightText}>{product.weight}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => onAddPress && onAddPress(product)} activeOpacity={0.7}>
          <Text style={styles.addButtonText}>+ ADD</Text>
        </TouchableOpacity>
      </View>

      {/* Price Row */}
      <View style={styles.priceRow}>
        <Text style={styles.currentPriceText}>₹{product.price}</Text>
        {product.originalPrice > product.price && (
          <Text style={styles.originalPriceText}>₹{product.originalPrice}</Text>
        )}
      </View>

      {/* Product Name */}
      <Text style={styles.productNameText} numberOfLines={2}>
        {product.name}
      </Text>

      {/* Ratings & Savings Row */}
      {variant === 'offer' ? (
        <View style={styles.saveRatingRow}>
          {product.saveAmount ? (
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>Save ₹{product.saveAmount}</Text>
            </View>
          ) : null}
          <Text style={styles.ratingText}>★ {product.rating}</Text>
        </View>
      ) : (
        <View style={styles.ratingReviewRow}>
          <Text style={styles.starText}>★ {product.rating}</Text>
          {product.reviewCount && <Text style={styles.reviewCountText}>({product.reviewCount})</Text>}
        </View>
      )}

      {/* Delivery / Stock Info */}
      <View style={styles.stockRow}>
        <Text style={[styles.stockText, product.stockStatus.includes('left') ? styles.redStockText : styles.greenStockText]}>
          ⚡ {product.deliveryTime ? `${product.deliveryTime} • ` : ''}{product.stockStatus}
        </Text>
      </View>

      {/* Bottom Category Link Tag */}
      <View style={styles.bottomTagContainer}>
        <Text style={styles.bottomTagText} numberOfLines={1}>
          {product.categoryTag}
        </Text>
        <Text style={styles.arrowChar}>›</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    position: 'relative',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  horizontalCard: {
    width: 145,
    marginRight: 10,
  },
  gridCard: {
    // Exact 3-column calculation: (SCREEN_WIDTH - 32px outer padding - 16px gap) / 3
    width: (SCREEN_WIDTH - 48) / 3,
    marginBottom: 10,
  },
  imageOverlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
  },
  saleBadge: {
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  redSaleBadge: {
    backgroundColor: '#EF4444',
  },
  blueSaleBadge: {
    backgroundColor: '#1E40AF',
  },
  saleBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  categoryPillBadge: {
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  categoryPillText: {
    fontSize: 8,
    fontWeight: '800',
  },
  heartButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 12,
    color: '#64748B',
  },
  heartActive: {
    color: '#EF4444',
  },
  imageWrapper: {
    width: '100%',
    height: 75,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    marginTop: 18,
    marginBottom: 4,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 1.5,
  },
  activeDot: {
    backgroundColor: '#334155',
  },
  weightAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  weightText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#10B981',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  addButtonText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  currentPriceText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
    marginRight: 4,
  },
  originalPriceText: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  productNameText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 2,
    height: 28, // Fixes 2 lines height alignment
    lineHeight: 14,
  },
  saveRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  saveBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 0.5,
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  saveBadgeText: {
    color: '#059669',
    fontSize: 8,
    fontWeight: '800',
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F59E0B',
  },
  ratingReviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  starText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F59E0B',
    marginRight: 2,
  },
  reviewCountText: {
    fontSize: 8,
    color: '#94A3B8',
  },
  stockRow: {
    marginTop: 2,
  },
  stockText: {
    fontSize: 8.5,
    fontWeight: '600',
  },
  redStockText: {
    color: '#EF4444',
  },
  greenStockText: {
    color: '#10B981',
  },
  bottomTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: '#F1F5F9',
    marginTop: 6,
    paddingTop: 4,
  },
  bottomTagText: {
    fontSize: 8,
    color: '#64748B',
    flex: 1,
  },
  arrowChar: {
    fontSize: 9,
    color: '#94A3B8',
    marginLeft: 2,
  },
});
