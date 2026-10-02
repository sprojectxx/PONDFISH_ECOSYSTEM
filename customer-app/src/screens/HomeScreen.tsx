import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, StatusBar, RefreshControl, Alert } from 'react-native';
import { HomeHeader } from '../components/home/HomeHeader';
import { SearchBar } from '../components/home/SearchBar';
import { GoldPlanCard, SubscriptionInfoData } from '../components/home/GoldPlanCard';
import { LiveTruckCard, LiveGpsData } from '../components/home/LiveTruckCard';
import { ActiveBookingCard, ActiveBookingData } from '../components/home/ActiveBookingCard';
import { RecentTransactionCard, RecentTransactionData } from '../components/home/RecentTransactionCard';
import { OffersSection } from '../components/home/OffersSection';
import { PreviouslyBoughtSection } from '../components/home/PreviouslyBoughtSection';
import { AvailableFishSection } from '../components/home/AvailableFishSection';
import { RecentNotificationsSection, NotificationItem } from '../components/home/RecentNotificationsSection';
import { MarketplaceCTA } from '../components/home/MarketplaceCTA';
import { BottomNavigation, NavTabType } from '../components/home/BottomNavigation';
import { HomeSkeletonLoader } from '../components/home/HomeSkeletonLoader';
import { HomeErrorView } from '../components/home/HomeErrorView';
import { FishProduct } from '../data/mockFishData';
import { getApiBaseUrl } from '../config/apiConfig';

interface HomeScreenProps {
  userProfile?: {
    name?: string;
    mobileNumber?: string;
    area?: string;
  } | null;
  token?: string | null;
  currentTab?: NavTabType;
  onNavigate?: (tab: NavTabType) => void;
  onAddToCart?: (product: FishProduct) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  token,
  currentTab = 'HOME',
  onNavigate,
  onAddToCart,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Home Dashboard Backend Data States
  const [subscription, setSubscription] = useState<SubscriptionInfoData | null>(null);
  const [liveGps, setLiveGps] = useState<LiveGpsData | null>(null);
  const [activeBooking, setActiveBooking] = useState<ActiveBookingData | null>(null);
  const [recentTransaction, setRecentTransaction] = useState<RecentTransactionData | null>(null);
  const [fishCatalogue, setFishCatalogue] = useState<FishProduct[]>([]);
  const [offerProducts, setOfferProducts] = useState<FishProduct[]>([]);
  const [previousProducts, setPreviousProducts] = useState<FishProduct[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchDashboardData = useCallback(async () => {
    const API_BASE = getApiBaseUrl();
    setNetworkError(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch authoritative public fish catalogue
      const fishPromise = fetch(`${API_BASE}/public/fish`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.data)) {
            const mappedFish: FishProduct[] = data.data.map((item: any) => ({
              id: item.id,
              name: item.name,
              weight: item.weight || '1000 g',
              price: item.unitPrice || item.price || 0,
              originalPrice: item.originalPrice || Math.round((item.unitPrice || 0) * 1.15),
              stockStatus: item.physicalAvailable ? (item.stockCount ? `${item.stockCount} in stock` : 'In stock') : 'Out of stock',
              category: item.category?.name || 'Freshwater',
              categoryBadge: item.category?.name || 'Freshwater',
              categoryTag: item.category?.name || 'Freshwater',
              imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=400&q=80',
              rating: 4.8,
            }));
            setFishCatalogue(mappedFish);
            setOfferProducts(mappedFish.filter((_, idx) => idx % 2 === 0));
            setPreviousProducts(mappedFish.slice(0, 3));
          }
        })
        .catch(() => {});

      // Fetch subscription info if authenticated
      const subPromise = token
        ? fetch(`${API_BASE}/customer/subscription`, { headers })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.data) {
                setSubscription({
                  id: data.data.id,
                  planName: data.data.plan?.name || 'Gold Plan',
                  status: data.data.status,
                  creditBalance: data.data.creditBalance || 0,
                  weeklyQtyLimitKg: data.data.plan?.weeklyQtyLimitKg || 2,
                  remainingWeeklyQtyKg: data.data.remainingWeeklyQtyKg ?? 0.6,
                  resetDays: data.data.resetDays ?? 2,
                });
              } else {
                setSubscription(null);
              }
            })
            .catch(() => setSubscription(null))
        : Promise.resolve();

      // Fetch live delivery GPS if authenticated
      const gpsPromise = token
        ? fetch(`${API_BASE}/customer/gps/live`, { headers })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.data) {
                setLiveGps({
                  id: data.data.id,
                  truckNumber: data.data.truckNumber,
                  driverName: data.data.driverName,
                  status: data.data.status,
                  origin: data.data.origin,
                  destination: data.data.destination,
                  etaMins: data.data.etaMins,
                  isPublished: data.data.isPublished ?? true,
                });
              } else {
                setLiveGps(null);
              }
            })
            .catch(() => setLiveGps(null))
        : Promise.resolve();

      // Fetch active bookings if authenticated
      const bookingPromise = token
        ? fetch(`${API_BASE}/customer/bookings`, { headers })
            .then(res => res.json())
            .then(data => {
              if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                const active = data.data.find((b: any) => b.status === 'CONFIRMED' || b.status === 'PENDING');
                if (active) {
                  setActiveBooking({
                    id: active.id,
                    bookingCode: active.bookingCode,
                    status: active.status,
                    expiresAt: active.expiresAt,
                    totalAmount: active.totalAmount,
                    itemsSummary: active.bookingItems?.map((i: any) => i.fish?.name).join(', ') || 'Fresh Fish Booking',
                    qrCodeData: active.qrCodeData,
                  });
                } else {
                  setActiveBooking(null);
                }
              } else {
                setActiveBooking(null);
              }
            })
            .catch(() => setActiveBooking(null))
        : Promise.resolve();

      await Promise.all([fishPromise, subPromise, gpsPromise, bookingPromise]);
    } catch (err) {
      setNetworkError('We couldn\'t connect to PondFish. Check your connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleTabPress = (tab: NavTabType) => {
    if (onNavigate) onNavigate(tab);
  };

  const handleAddProduct = (product: FishProduct) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      Alert.alert('Added to Cart', `${product.name} added at ₹${product.price}`);
    }
  };

  // State 1: Network Error & Retry View
  if (networkError && !refreshing && fishCatalogue.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <HomeErrorView errorMessage={networkError} onRetry={fetchDashboardData} />
      </SafeAreaView>
    );
  }

  // State 2: Structural Loading Skeleton View
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0B192C" />
        <HomeSkeletonLoader />
      </SafeAreaView>
    );
  }

  const filteredCatalogue = fishCatalogue.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0B192C" />

      <View style={styles.mainContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2463A8']} />
          }
        >
          {/* 1. Header */}
          <HomeHeader
            userName={userProfile?.name}
            creditBalance={subscription?.creditBalance}
            hasSubscription={subscription?.status === 'ACTIVE'}
            onProfilePress={() => handleTabPress('PROFILE')}
            onCreditPress={() => handleTabPress('SUBSCRIPTION')}
          />

          {/* 2. Search Bar */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSearchPress={() => handleTabPress('CATALOG')}
          />

          {/* 3. Subscription Summary / Quota Card */}
          <GoldPlanCard
            subscription={subscription}
            onExplorePlansPress={() => handleTabPress('SUBSCRIPTION')}
            onRechargePress={() => handleTabPress('SUBSCRIPTION')}
          />

          {/* 4. Live Fresh Catch Truck Card */}
          <LiveTruckCard
            gpsData={liveGps}
            onTrackPress={() => handleTabPress('GPS_MAP')}
          />

          {/* 5. Active Booking Card (CP-02 Section 20) */}
          <ActiveBookingCard
            booking={activeBooking}
            onViewBookingPress={() => handleTabPress('BOOKINGS')}
          />

          {/* 6. Recent Transaction Card (CP-02 Section 21) */}
          <RecentTransactionCard
            transaction={recentTransaction}
            onViewTransactionPress={() => handleTabPress('PROFILE')}
          />

          {/* 7. Offers Section */}
          <OffersSection
            products={offerProducts}
            onAddProduct={handleAddProduct}
          />

          {/* 8. Previously Bought Section */}
          <PreviouslyBoughtSection
            onSeeAllPress={() => handleTabPress('PROFILE')}
            onAddProduct={handleAddProduct}
          />

          {/* 9. Available Fishes Grid Section */}
          <AvailableFishSection
            products={filteredCatalogue}
            onAddProduct={handleAddProduct}
            onRefreshPress={fetchDashboardData}
          />

          {/* 10. Recent Notifications Preview Section (CP-02 Section 22) */}
          <RecentNotificationsSection
            notifications={notifications}
            onViewAllPress={() => handleTabPress('PROFILE')}
          />

          {/* 11. Marketplace CTA Banner */}
          <MarketplaceCTA
            onPress={() => handleTabPress('CATALOG')}
          />
        </ScrollView>

        {/* 12. Fixed Bottom Navigation Shell */}
        <BottomNavigation currentTab={currentTab} onTabPress={handleTabPress} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B192C',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
});
