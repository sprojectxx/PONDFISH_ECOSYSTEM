import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, Alert } from 'react-native';
import { HomeHeader } from '../components/home/HomeHeader';
import { SearchBar } from '../components/home/SearchBar';
import { GoldPlanCard } from '../components/home/GoldPlanCard';
import { LiveTruckCard } from '../components/home/LiveTruckCard';
import { OffersSection } from '../components/home/OffersSection';
import { PreviouslyBoughtSection } from '../components/home/PreviouslyBoughtSection';
import { AvailableFishSection } from '../components/home/AvailableFishSection';
import { MarketplaceCTA } from '../components/home/MarketplaceCTA';
import { BottomNavigation, NavTabType } from '../components/home/BottomNavigation';
import { FishProduct } from '../data/mockFishData';

interface HomeScreenProps {
  userProfile?: {
    name?: string;
    mobileNumber?: string;
  } | null;
  currentTab?: NavTabType;
  onNavigate?: (tab: NavTabType) => void;
  onAddToCart?: (product: FishProduct) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  currentTab = 'HOME',
  onNavigate,
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabPress = (tab: NavTabType) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleAddProduct = (product: FishProduct) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      Alert.alert('Added to Cart', `${product.name} (${product.weight}) added at ₹${product.price}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B192C" />

      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Header */}
          <HomeHeader
            userName={userProfile?.name || 'Stevan'}
            creditBalance={3420}
            onProfilePress={() => handleTabPress('PROFILE')}
            onCreditPress={() => handleTabPress('SUBSCRIPTION')}
          />

          {/* 2. Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearchPress={() => Alert.alert('Search', `Searching for: ${searchQuery}`)}
            onMicPress={() => Alert.alert('Voice Search', 'Voice search activated...')}
          />

          {/* 3. Gold Plan Quota Card */}
          <GoldPlanCard
            remainingKgToday={0.6}
            resetDays={2}
            claimedThisWeekKg={1.4}
            onRechargePress={() => handleTabPress('SUBSCRIPTION')}
          />

          {/* 4. Live Fresh Catch Truck Card */}
          <LiveTruckCard
            truckNumber="#OD-04"
            etaMins={18}
            origin="Godavari Farm"
            destination="Madhapur Cold Hub"
            onTrackPress={() => handleTabPress('GPS_MAP')}
          />

          {/* 5. Offers Section */}
          <OffersSection onAddProduct={handleAddProduct} />

          {/* 6. Previously Bought Section */}
          <PreviouslyBoughtSection
            onSeeAllPress={() => Alert.alert('Previously Bought', 'Viewing all previous purchases...')}
            onAddProduct={handleAddProduct}
          />

          {/* 7. Available Fishes Section (with 3-Column Grid) */}
          <AvailableFishSection
            onSortPress={() => Alert.alert('Sort & Filter', 'Filter options modal opened.')}
            onAddProduct={handleAddProduct}
          />

          {/* 8. Marketplace CTA */}
          <MarketplaceCTA
            onPress={() => Alert.alert('Marketplace', 'Navigating to full fish marketplace...')}
          />
        </ScrollView>

        {/* 9. Fixed Bottom Navigation */}
        <BottomNavigation currentTab={currentTab} onTabPress={handleTabPress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B192C', // Matches dark status bar header top
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Crisp light background for main content
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90, // Prevents content from hiding behind fixed bottom navigation
  },
});
