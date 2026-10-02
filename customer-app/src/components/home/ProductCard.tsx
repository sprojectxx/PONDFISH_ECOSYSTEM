import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { FishProduct } from '../../data/mockFishData';
import { HeartIcon, FlashIcon, StarIcon, ChevronRightIcon } from './HomeIcons';

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

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'Freshwater':
        return { bg: '#1E40AF', text: '#FFFFFF' };
      case 'Marine':
      case 'Marine Catch':
        return { bg: '#0284C7', text: '#FFFFFF' };
      case 'Shellfish':
        return { bg: '#D97706', text: '#FFFFFF' };
      case 'Live Pond':
        return { bg: '#059669', text: '#FFFFFF' };
      default:
        return { bg: '#475569', text: '#FFFFFF' };
    }
  };

  const badgeStyle = getBadgeColor(product.categoryBadge || product.category);

  return (
    <View style={[styles.cardContainer, variant === 'grid' ? styles.gridCard : styles.horizontalCard]}>
      {/* Top Header Row overlay on image */}
      <View style={styles.imageOverlayHeader}>
        {variant === 'offer' && product.saleBadge ? (
          <View style={[styles.saleBadge, product.saleBadge.includes('WEEKEND') ? styles.blueSaleBadge : styles.redSaleBadge]}>
            <Text style={styles.saleBadgeText}>{product.saleBadge}</Text>
          </View>
        ) : (product.categoryBadge || product.category) ? (
          <View style={[styles.categoryPillBadge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.categoryPillText, { color: badgeStyle.text }]}>{product.categoryBadge || product.category}</Text>
          </View>
        ) : (
          <View />
        )}

        <TouchableOpacity style={styles.heartButton} onPress={toggleFavorite} activeOpacity={0.7}>
          <HeartIcon size={12} active={isFavorite} />
        </TouchableOpacity>
      </View>

      {/* Product Image */}
      <View style={styles.imageWrapper}>
        <Image
          source={{ uri: product.imageUrl || 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=400&q=80' }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>

      {/* Weight + ADD Button Row */}
      <View style={styles.weightAddRow}>
        <Text style={styles.weightText}>{product.weight || '1000 g'}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => onAddPress && onAddPress(product)} activeOpacity={0.7}>
          <Text style={styles.addButtonText}>+ ADD</Text>
        </TouchableOpacity>
      </View>

      {/* Price Row */}
      <View style={styles.priceRow}>
        <Text style={styles.currentPriceText}>₹{product.price}</Text>
        {product.originalPrice && product.originalPrice > product.price && (
          <Text style={styles.originalPriceText}>₹{product.originalPrice}</Text>
        )}
      </View>

      {/* Product Name */}
      <Text style={styles.productNameText} numberOfLines={2}>
        {product.name}
      </Text>

      {/* Ratings & Savings Row */}
      {product.rating ? (
        <View style={styles.ratingReviewRow}>
          <StarIcon size={10} color="#F59E0B" />
          <Text style={styles.starText}>{product.rating}</Text>
          {product.reviewCount && <Text style={styles.reviewCountText}>({product.reviewCount})</Text>}
        </View>
      ) : null}

      {/* Stock / Availability Info */}
      {product.stockStatus ? (
        <View style={styles.stockRow}>
          <FlashIcon size={9} color={product.stockStatus.includes('left') ? '#EF4444' : '#10B981'} />
          <Text style={[styles.stockText, product.stockStatus.includes('left') ? styles.redStockText : styles.greenStockText]}>
            {product.deliveryTime ? ` ${product.deliveryTime} • ` : ' '}{product.stockStatus}
          </Text>
        </View>
      ) : null}

      {/* Bottom Tag Container */}
      {product.categoryTag ? (
        <View style={styles.bottomTagContainer}>
          <Text style={styles.bottomTagText} numberOfLines={1}>
            {product.categoryTag}
          </Text>
          <ChevronRightIcon size={9} color="#94A3B8" />
        </View>
      ) : null}
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
    height: 28,
    lineHeight: 14,
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
    marginLeft: 2,
    marginRight: 2,
  },
  reviewCountText: {
    fontSize: 8,
    color: '#94A3B8',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
