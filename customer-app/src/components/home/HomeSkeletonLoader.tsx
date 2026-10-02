import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

export const HomeSkeletonLoader: React.FC = () => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Skeleton */}
      <View style={styles.headerSkeleton}>
        <View style={styles.topRow}>
          <View style={[styles.skeletonBlock, { width: 140, height: 22 }]} />
          <View style={[styles.skeletonBlock, { width: 90, height: 28, borderRadius: 14 }]} />
        </View>
        <View style={[styles.skeletonBlock, { width: 220, height: 14, marginTop: 8 }]} />
      </View>

      {/* Search Skeleton */}
      <View style={[styles.skeletonBlock, styles.searchSkeleton]} />

      {/* Quota Card Skeleton */}
      <View style={[styles.skeletonBlock, styles.cardSkeleton]} />

      {/* Truck Card Skeleton */}
      <View style={[styles.skeletonBlock, styles.truckSkeleton]} />

      {/* Offers Skeleton */}
      <View style={styles.sectionSkeleton}>
        <View style={[styles.skeletonBlock, { width: 180, height: 18, marginBottom: 12 }]} />
        <View style={styles.horizontalRow}>
          <View style={[styles.skeletonBlock, styles.productCardSkeleton]} />
          <View style={[styles.skeletonBlock, styles.productCardSkeleton]} />
          <View style={[styles.skeletonBlock, styles.productCardSkeleton]} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  skeletonBlock: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  headerSkeleton: {
    backgroundColor: '#0B192C',
    padding: 16,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchSkeleton: {
    height: 44,
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
  },
  cardSkeleton: {
    height: 60,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  truckSkeleton: {
    height: 90,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
  },
  sectionSkeleton: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  horizontalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCardSkeleton: {
    width: 105,
    height: 140,
    borderRadius: 10,
  },
});
