import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { getApiBaseUrl } from './src/config/apiConfig';
import { QRCodeView } from './src/components/QRCodeView';
import { PaymentServiceAdapter, PaymentState } from './src/services/paymentService';

interface CustomerProfile {
  id?: string;
  mobileNumber?: string;
  name?: string;
  age?: number;
  area?: string;
}

interface FishItem {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  physicalAvailable: boolean;
  onlineBookable: boolean;
  freshnessState: 'GREEN' | 'GREY' | 'YELLOW' | 'RED';
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

interface BookingResult {
  id: string;
  bookingCode: string;
  qrCodeData: string;
  totalAmount: number;
  subCreditUsed: number;
  razorpayPaid: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  createdAt?: string;
  bookingItems: Array<{
    id: string;
    quantityKg: number;
    unitPrice: number;
    subtotal: number;
    fish?: { name: string };
  }>;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  creditAmount: number;
  weeklyQtyLimitKg: number;
}

interface CustomerSubscription {
  id: string;
  planId: string;
  creditBalance: number;
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  plan?: SubscriptionPlan;
}

interface LiveGPSJourney {
  id?: string;
  truckId?: string;
  truckNumber?: string;
  driverName?: string;
  status?: string;
  currentLat?: number;
  currentLng?: number;
  lastUpdated?: string;
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const [currentTab, setCurrentTab] = useState<
    'HOME' | 'CATALOG' | 'FISH_DETAIL' | 'BOOKINGS' | 'BOOKING_CONFIRM' | 'SCAN_BILL' | 'SUBSCRIPTION' | 'GPS_MAP' | 'PROFILE'
  >('HOME');

  // Customer Profile state
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editArea, setEditArea] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Catalogue & Fish Detail state
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFish, setSelectedFish] = useState<FishItem | null>(null);
  const [bookingQtyKg, setBookingQtyKg] = useState('1.0');
  const [useSubCredit, setUseSubCredit] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Booking history & active booking state
  const [bookingHistory, setBookingHistory] = useState<BookingResult[]>([]);
  const [latestBooking, setLatestBooking] = useState<BookingResult | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  // Payment Lifecycle State
  const [paymentState, setPaymentState] = useState<PaymentState>('PAYMENT_REQUIRED');
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string | null>(null);

  // Bill Scanner State
  const [imageUrl, setImageUrl] = useState('');
  const [manualBillId, setManualBillId] = useState('');
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [pendingBillId, setPendingBillId] = useState<string | null>(null);

  // Subscription Hub state
  const [subscription, setSubscription] = useState<CustomerSubscription | null>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [subLoading, setSubLoading] = useState(false);

  // Live GPS state
  const [liveGPS, setLiveGPS] = useState<LiveGPSJourney | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Expiry Countdown State
  const [remainingTimeStr, setRemainingTimeStr] = useState<string>('');

  const API_BASE = getApiBaseUrl();

  // 48-Hour Expiry Countdown Effect (UI Countdown display only - backend is authoritative)
  useEffect(() => {
    if (!latestBooking || !latestBooking.expiresAt) return;

    const interval = setInterval(() => {
      const expires = new Date(latestBooking.expiresAt).getTime();
      const now = Date.now();
      const diff = expires - now;

      if (diff <= 0) {
        setRemainingTimeStr('EXPIRED');
        clearInterval(interval);
        // Automatically refetch authoritative status when expiry timer elapses
        if (latestBooking.status === 'PENDING') {
          fetchAuthoritativeBooking(latestBooking.id);
        }
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setRemainingTimeStr(`${hours}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [latestBooking]);

  /**
   * Refetch Authoritative Booking State from Backend DB
   */
  const fetchAuthoritativeBooking = async (bookingId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/customer/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLatestBooking(data.data);
      }
    } catch {
      // Retry refetch silently if network hiccup
    }
  };

  /**
   * Fetch All Customer Bookings History
   */
  const fetchBookingHistory = async () => {
    if (!token) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      const res = await fetch(`${API_BASE}/customer/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookingHistory(data.data || []);
      } else {
        setBookingsError(data.error?.message || 'Failed to fetch booking history.');
      }
    } catch (err) {
      setBookingsError('Network error loading booking history.');
    } finally {
      setBookingsLoading(false);
    }
  };

  /**
   * Fetch Customer Profile
   */
  const fetchProfile = async () => {
    if (!token) return;
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setProfile(data.data);
        setEditName(data.data.name || '');
        setEditAge(data.data.age ? String(data.data.age) : '');
        setEditArea(data.data.area || '');
        // Prompt for profile completion if name or area is missing
        if (!data.data.name || !data.data.area) {
          setShowProfileModal(true);
        }
      }
    } catch {
      // Profile fetch retry available in Profile tab
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Update Customer Profile
   */
  const handleUpdateProfile = async () => {
    if (!editName.trim() || !editArea.trim()) {
      Alert.alert('Required Fields', 'Please enter your Name and Area/Locality.');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          age: editAge ? parseInt(editAge, 10) : undefined,
          area: editArea.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.data);
        setShowProfileModal(false);
        Alert.alert('Profile Saved', 'Your customer profile has been updated.');
      } else {
        Alert.alert('Profile Error', data.error?.message || 'Failed to update profile.');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not save profile changes.');
    } finally {
      setProfileLoading(false);
    }
  };

  /**
   * Fetch Customer Subscription & Available Plans
   */
  const fetchSubscriptionInfo = async () => {
    if (!token) return;
    setSubLoading(true);
    try {
      const [subRes, plansRes] = await Promise.all([
        fetch(`${API_BASE}/customer/subscription`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/public/subscription-plans`),
      ]);

      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.success) setSubscription(subData.data);
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        if (plansData.success) setSubscriptionPlans(plansData.data || []);
      }
    } catch {
      // Subscription failure state handled in Subscription UI tab
    } finally {
      setSubLoading(false);
    }
  };

  /**
   * Purchase Subscription Plan
   */
  const handlePurchaseSubscription = async (planId: string) => {
    if (!token) return;
    setSubLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/subscription/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSubscription(data.data);
        Alert.alert('Subscription Active!', 'Your subscription plan has been activated.');
      } else {
        Alert.alert('Purchase Error', data.error?.message || 'Failed to purchase subscription plan.');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Connection error purchasing subscription.');
    } finally {
      setSubLoading(false);
    }
  };

  /**
   * Fetch Live Delivery Truck GPS Status
   */
  const fetchLiveGPS = async () => {
    if (!token) return;
    setGpsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/gps/live`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLiveGPS(data.data);
      } else {
        setLiveGPS(null);
      }
    } catch {
      setLiveGPS(null);
    } finally {
      setGpsLoading(false);
    }
  };

  const fetchCatalogue = async () => {
    setLoading(true);
    setNetworkError(null);
    try {
      const [fishRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/public/fish`),
        fetch(`${API_BASE}/public/categories`),
      ]);

      if (!fishRes.ok) {
        throw new Error(`Server error (${fishRes.status}) loading catalogue.`);
      }

      const fishData = await fishRes.json();
      if (fishData.success) {
        setFishList(fishData.data || []);
      } else {
        setNetworkError(fishData.error?.message || 'Failed to load fish catalogue.');
      }

      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.data || []);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network connection failure.';
      setNetworkError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCatalogue();
      fetchProfile();
      fetchSubscriptionInfo();
      fetchBookingHistory();
    }
  }, [token]);

  const handleSendOTP = async () => {
    if (!mobileNumber || mobileNumber.trim().length < 10) {
      Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setNetworkError(null);
    try {
      const res = await fetch(`${API_BASE}/customer/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobileNumber.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        Alert.alert('OTP Sent', `Verification code sent to ${mobileNumber}.`);
      } else {
        Alert.alert('OTP Request Error', data.error?.message || 'Failed to send OTP.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Connection error sending OTP.';
      Alert.alert('Network Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.trim().length < 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobileNumber.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
      } else {
        Alert.alert('Authentication Failed', data.error?.message || 'Invalid OTP code.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Verification connection error.';
      Alert.alert('Network Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setMobileNumber('');
    setOtp('');
    setOtpSent(false);
    setProfile(null);
    setLatestBooking(null);
    setBookingHistory([]);
    setCurrentTab('HOME');
  };

  const handleCreateBooking = async () => {
    if (!selectedFish) return;
    const qty = parseFloat(bookingQtyKg);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Invalid Quantity', 'Please specify a quantity greater than 0 kg.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: [{ fishId: selectedFish.id, quantityKg: qty }],
          useSubscriptionCredit: useSubCredit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLatestBooking(data.data);
        setPaymentState('PAYMENT_REQUIRED');
        setPaymentStatusMessage(null);
        fetchBookingHistory();
        setCurrentTab('BOOKING_CONFIRM');
      } else {
        Alert.alert('Booking Creation Error', data.error?.message || 'Failed to create booking.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect for booking creation.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiate Razorpay Payment Initialization & Native Checkout Flow
   */
  const handleInitiateRazorpayPayment = async () => {
    if (!latestBooking || latestBooking.razorpayPaid <= 0 || !token) return;

    try {
      const result = await PaymentServiceAdapter.launchNativeCheckout({
        amount: latestBooking.razorpayPaid,
        token,
        bookingId: latestBooking.id,
        customerMobile: mobileNumber,
        onStateChange: (state, message) => {
          setPaymentState(state);
          if (message) setPaymentStatusMessage(message);
        },
      });

      if (result.success) {
        // Refetch authoritative booking state from backend after successful verification
        await fetchAuthoritativeBooking(latestBooking.id);
        fetchBookingHistory();
        Alert.alert('Payment Verified', 'Razorpay payment verified successfully with backend! Booking confirmed.');
      } else if (!result.cancelled) {
        Alert.alert('Payment Failed', result.error || 'Payment signature verification failed.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Razorpay checkout failed.';
      setPaymentState('PAYMENT_FAILED');
      setPaymentStatusMessage(msg);
      Alert.alert('Payment Error', msg);
    }
  };

  const handleScanBill = async () => {
    if (!imageUrl || imageUrl.trim().length === 0) {
      Alert.alert('Image Required', 'Please select or provide a receipt image file/URL.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/bills/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: imageUrl.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Scan Success', `Bill Extracted Successfully! Bill Number: ${data.data.extractedData?.billNumber || 'VERIFIED'}`);
        fetchSubscriptionInfo();
      } else if (data.error?.code === 'ERR_AI_CONFIDENCE_LOW') {
        setShowManualFallback(true);
        if (data.error.details && data.error.details[0]) {
          setPendingBillId(data.error.details[0].billId);
        }
      } else {
        Alert.alert('Scan Failed', data.error?.message || 'Could not process bill image.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to scan bill.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleManualBillIdSubmit = async () => {
    if (!manualBillId || !pendingBillId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customer/bills/verify-extraction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ billId: pendingBillId, manualBillId: manualBillId.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setShowManualFallback(false);
        setManualBillId('');
        fetchSubscriptionInfo();
        Alert.alert('Verified', 'Manual Bill ID verified successfully.');
      } else {
        Alert.alert('Verification Error', data.error?.message || 'Manual Bill ID failed.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit manual Bill ID.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredFish = fishList.filter((fish) => {
    const matchesSearch = fish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || fish.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Auth Screen Flow
  if (!token) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <Text style={styles.title}>PONDFISH</Text>
        <Text style={styles.subtitle}>Fresh & Live Fish Retail App</Text>

        {!otpSent ? (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 9876543210"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Get OTP</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Enter 6-Digit Verification Code</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity style={styles.button} onPress={handleVerifyOTP} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Verify & Login</Text>}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar with Profile summary & Logout */}
      <View style={styles.headerBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>PONDFISH</Text>
          {profile?.name && <Text style={styles.headerSubtitle}>Welcome, {profile.name}</Text>}
        </View>
        <TouchableOpacity style={styles.headerLogoutBtn} onPress={handleLogout}>
          <Text style={styles.headerLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Completion Modal for First Time Login */}
      <Modal visible={showProfileModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Complete Your Profile</Text>
            <Text style={styles.bodyText}>Please provide your name and locality to start browsing fresh fish.</Text>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Ramesh Varma" value={editName} onChangeText={setEditName} />

            <Text style={styles.label}>Age (Optional)</Text>
            <TextInput style={styles.input} placeholder="e.g. 35" value={editAge} onChangeText={setEditAge} keyboardType="number-pad" />

            <Text style={styles.label}>Area / Locality *</Text>
            <TextInput style={styles.input} placeholder="e.g. Vijayawada East" value={editArea} onChangeText={setEditArea} />

            <TouchableOpacity style={[styles.button, { backgroundColor: '#00A896', marginTop: 8 }]} onPress={handleUpdateProfile} disabled={profileLoading}>
              {profileLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Profile</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.content}>
        {/* HOME TAB */}
        {currentTab === 'HOME' && (
          <View>
            <Text style={styles.sectionHeader}>Customer Hub</Text>

            {/* Profile Greeting Card */}
            <View style={[styles.card, { backgroundColor: '#00A896', marginBottom: 16 }]}>
              <Text style={styles.cardTitle}>👋 Hello {profile?.name || 'Valued Customer'}</Text>
              <Text style={{ color: '#fff', fontSize: 14 }}>Mobile: {profile?.mobileNumber || mobileNumber}</Text>
              {profile?.area && <Text style={{ color: '#E0F2FE', fontSize: 13 }}>Locality: {profile.area}</Text>}
            </View>

            {/* Quick Action Tiles */}
            <View style={styles.tileContainer}>
              <TouchableOpacity style={styles.tile} onPress={() => { setCurrentTab('CATALOG'); fetchCatalogue(); }}>
                <Text style={styles.tileText}>🐟 Browse Fish</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tile} onPress={() => { setCurrentTab('BOOKINGS'); fetchBookingHistory(); }}>
                <Text style={styles.tileText}>📦 My Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tile} onPress={() => setCurrentTab('SCAN_BILL')}>
                <Text style={styles.tileText}>📷 Scan Bill</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tile} onPress={() => { setCurrentTab('SUBSCRIPTION'); fetchSubscriptionInfo(); }}>
                <Text style={styles.tileText}>💳 Subscriptions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tile} onPress={() => { setCurrentTab('GPS_MAP'); fetchLiveGPS(); }}>
                <Text style={styles.tileText}>🚚 Live Truck GPS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tile} onPress={() => setCurrentTab('PROFILE')}>
                <Text style={styles.tileText}>👤 My Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Latest Active Booking Widget */}
            {latestBooking && (
              <View style={[styles.section, { marginTop: 16 }]}>
                <Text style={styles.sectionHeader}>Active Booking Summary</Text>
                <Text style={styles.detailText}>Code: <Text style={{ fontWeight: '800' }}>{latestBooking.bookingCode}</Text></Text>
                <Text style={styles.detailText}>Status: <Text style={{ fontWeight: '800', color: latestBooking.status === 'CONFIRMED' ? '#065F46' : '#92400E' }}>{latestBooking.status}</Text></Text>
                <TouchableOpacity
                  style={[styles.button, { marginTop: 8, backgroundColor: '#0F4C81' }]}
                  onPress={() => setCurrentTab('BOOKING_CONFIRM')}
                >
                  <Text style={styles.buttonText}>View Ticket & QR Code</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* CATALOGUE TAB */}
        {currentTab === 'CATALOG' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Fish Catalogue</Text>

            {/* Category Filter Chips */}
            {categories.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.chip, selectedCategory === 'ALL' && styles.chipSelected]}
                  onPress={() => setSelectedCategory('ALL')}
                >
                  <Text style={[styles.chipText, selectedCategory === 'ALL' && styles.chipTextSelected]}>All Categories</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.chip, selectedCategory === cat.id && styles.chipSelected]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={[styles.chipText, selectedCategory === cat.id && styles.chipTextSelected]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TextInput
              style={styles.input}
              placeholder="🔍 Search fish by name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />

            {networkError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {networkError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchCatalogue}>
                  <Text style={styles.buttonText}>Retry Loading</Text>
                </TouchableOpacity>
              </View>
            )}

            {loading ? (
              <ActivityIndicator size="large" color="#0F4C81" style={{ marginVertical: 20 }} />
            ) : !networkError && filteredFish.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No fish items matching your search criteria.</Text>
              </View>
            ) : (
              filteredFish.map((fish) => (
                <TouchableOpacity
                  key={fish.id}
                  style={styles.card}
                  onPress={() => {
                    setSelectedFish(fish);
                    setCurrentTab('FISH_DETAIL');
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.cardTitle}>{fish.name}</Text>
                    <Text style={[styles.badge, fish.freshnessState === 'GREEN' ? styles.badgeGreen : styles.badgeAmber]}>
                      {fish.freshnessState === 'GREEN' ? 'FRESH' : 'STANDARD'}
                    </Text>
                  </View>
                  <Text style={styles.cardBody}>₹{fish.unitPrice} / kg</Text>
                  <Text style={{ color: fish.onlineBookable ? '#00A896' : '#94A3B8', fontSize: 12, marginTop: 4 }}>
                    {fish.onlineBookable ? '✓ Available for Online Booking' : 'In-Store Physical Purchase Only'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* FISH DETAIL TAB */}
        {currentTab === 'FISH_DETAIL' && selectedFish && (
          <View style={styles.section}>
            <TouchableOpacity style={{ marginBottom: 12 }} onPress={() => setCurrentTab('CATALOG')}>
              <Text style={{ color: '#0F4C81', fontWeight: '700' }}>← Back to Catalogue</Text>
            </TouchableOpacity>

            <Text style={styles.sectionHeader}>{selectedFish.name}</Text>
            <Text style={styles.bodyText}>{selectedFish.description || 'Fresh catch sourced daily from verified farms.'}</Text>
            <Text style={styles.priceLabel}>Unit Price: ₹{selectedFish.unitPrice} / kg</Text>

            <View style={styles.qtyContainer}>
              <Text style={styles.label}>Booking Quantity (kg):</Text>
              <TextInput
                style={styles.input}
                value={bookingQtyKg}
                onChangeText={setBookingQtyKg}
                keyboardType="decimal-pad"
              />
              {parseFloat(bookingQtyKg) > 0 && (
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#0F4C81' }}>
                  Subtotal: ₹{(parseFloat(bookingQtyKg) * selectedFish.unitPrice).toFixed(2)}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: useSubCredit ? '#00A896' : '#64748B', marginBottom: 12 }]}
              onPress={() => setUseSubCredit(!useSubCredit)}
            >
              <Text style={styles.buttonText}>
                {useSubCredit ? '✓ Subscription Credit: ON' : 'Use Subscription Credit: OFF'}
              </Text>
            </TouchableOpacity>

            {selectedFish.onlineBookable ? (
              <TouchableOpacity style={styles.button} onPress={handleCreateBooking} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Online Booking</Text>}
              </TouchableOpacity>
            ) : (
              <Text style={[styles.bodyText, { color: '#EF4444', textAlign: 'center', marginTop: 12 }]}>
                This item is available for physical in-store purchase only.
              </Text>
            )}
          </View>
        )}

        {/* BOOKING HISTORY TAB */}
        {currentTab === 'BOOKINGS' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Booking History</Text>

            {bookingsError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {bookingsError}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchBookingHistory}>
                  <Text style={styles.buttonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {bookingsLoading ? (
              <ActivityIndicator size="large" color="#0F4C81" style={{ marginVertical: 20 }} />
            ) : bookingHistory.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>You have no previous or active bookings.</Text>
                <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={() => setCurrentTab('CATALOG')}>
                  <Text style={styles.buttonText}>Browse Fish Catalogue</Text>
                </TouchableOpacity>
              </View>
            ) : (
              bookingHistory.map((bk) => (
                <TouchableOpacity
                  key={bk.id}
                  style={styles.historyCard}
                  onPress={() => {
                    setLatestBooking(bk);
                    setCurrentTab('BOOKING_CONFIRM');
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontWeight: '800', fontSize: 16, color: '#0F4C81' }}>{bk.bookingCode}</Text>
                    <Text
                      style={[
                        styles.badge,
                        bk.status === 'CONFIRMED' || bk.status === 'COMPLETED'
                          ? styles.badgeGreen
                          : bk.status === 'EXPIRED' || bk.status === 'CANCELLED'
                          ? styles.badgeRed
                          : styles.badgeAmber,
                      ]}
                    >
                      {bk.status}
                    </Text>
                  </View>
                  <Text style={{ color: '#475569', marginVertical: 4 }}>
                    Total: ₹{bk.totalAmount.toFixed(2)} | Razorpay: ₹{bk.razorpayPaid.toFixed(2)}
                  </Text>
                  {bk.createdAt && (
                    <Text style={{ fontSize: 12, color: '#94A3B8' }}>
                      Booked: {new Date(bk.createdAt).toLocaleDateString()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* BOOKING CONFIRMATION & TICKET DETAIL TAB */}
        {currentTab === 'BOOKING_CONFIRM' && latestBooking && (
          <View style={styles.section}>
            <TouchableOpacity style={{ marginBottom: 12 }} onPress={() => setCurrentTab('BOOKINGS')}>
              <Text style={{ color: '#0F4C81', fontWeight: '700' }}>← Back to Booking History</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionHeader, { color: latestBooking.status === 'CONFIRMED' ? '#00A896' : latestBooking.status === 'EXPIRED' ? '#EF4444' : '#B45309' }]}>
              {latestBooking.status === 'CONFIRMED' ? 'Booking Confirmed 🎉' : latestBooking.status === 'EXPIRED' ? 'Booking Expired ❌' : 'Payment Required 💳'}
            </Text>

            {/* ISO/IEC 18004 Compliant 2D QR Ticket Matrix */}
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <QRCodeView qrData={latestBooking.qrCodeData} size={190} />
            </View>

            <Text style={styles.detailText}>Booking Code: <Text style={{ fontWeight: '800' }}>{latestBooking.bookingCode}</Text></Text>
            <Text style={styles.detailText}>Status: <Text style={{ fontWeight: '800', color: latestBooking.status === 'CONFIRMED' ? '#065F46' : latestBooking.status === 'EXPIRED' ? '#991B1B' : '#92400E' }}>{latestBooking.status}</Text></Text>
            <Text style={styles.detailText}>Total Amount: ₹{latestBooking.totalAmount.toFixed(2)}</Text>
            <Text style={styles.detailText}>Sub Credit Used: ₹{latestBooking.subCreditUsed.toFixed(2)}</Text>
            <Text style={styles.detailText}>Razorpay Amount Payable: ₹{latestBooking.razorpayPaid.toFixed(2)}</Text>

            {/* 48-Hour Window Expiry Countdown */}
            {latestBooking.status === 'PENDING' && (
              <Text style={[styles.detailText, { color: '#B45309', marginTop: 10, fontWeight: '700' }]}>
                ⏰ 48-Hour Reservation Window: {remainingTimeStr || 'Calculating...'}
              </Text>
            )}

            {/* Refresh Authoritative Backend Booking State Button */}
            <TouchableOpacity
              style={{ marginVertical: 10, padding: 8, alignItems: 'center' }}
              onPress={() => fetchAuthoritativeBooking(latestBooking.id)}
            >
              <Text style={{ color: '#0F4C81', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }}>
                🔄 Refresh Authoritative Booking Status from Backend
              </Text>
            </TouchableOpacity>

            {/* Razorpay Gateway Action Button */}
            {latestBooking.status === 'PENDING' && latestBooking.razorpayPaid > 0 && (
              <View style={{ marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: '#00A896' }]}
                  onPress={handleInitiateRazorpayPayment}
                  disabled={paymentState === 'PAYMENT_PROCESSING' || paymentState === 'PAYMENT_VERIFICATION'}
                >
                  {paymentState === 'PAYMENT_PROCESSING' || paymentState === 'PAYMENT_VERIFICATION' ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Pay ₹{latestBooking.razorpayPaid.toFixed(2)} via Razorpay SDK</Text>
                  )}
                </TouchableOpacity>

                {paymentStatusMessage && (
                  <Text style={{ fontSize: 12, color: paymentState === 'PAYMENT_FAILED' ? '#EF4444' : '#64748B', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
                    {paymentStatusMessage}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={() => setCurrentTab('HOME')}>
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* BILL SCANNER TAB */}
        {currentTab === 'SCAN_BILL' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Physical Bill Scanner</Text>
            <Text style={styles.bodyText}>Provide receipt image file/URL to extract Bill ID and apply subscription credits.</Text>

            <Text style={styles.label}>Bill Image Path / Camera URL:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. file:///camera/receipt_001.jpg"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            <TouchableOpacity style={styles.button} onPress={handleScanBill} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Upload & AI OCR Scan Bill</Text>}
            </TouchableOpacity>

            {showManualFallback && (
              <View style={styles.fallbackBox}>
                <Text style={styles.warningTitle}>⚠️ Low AI Confidence Threshold</Text>
                <Text style={styles.bodyText}>AI OCR could not clearly read the Bill ID. Please manually enter the printed Bill Number:</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. BILL-987654"
                  value={manualBillId}
                  onChangeText={setManualBillId}
                />
                <TouchableOpacity style={[styles.button, { backgroundColor: '#00A896' }]} onPress={handleManualBillIdSubmit}>
                  <Text style={styles.buttonText}>Submit Manual Bill ID</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* SUBSCRIPTION HUB TAB */}
        {currentTab === 'SUBSCRIPTION' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Subscription Hub</Text>

            {subLoading ? (
              <ActivityIndicator size="large" color="#0F4C81" style={{ marginVertical: 20 }} />
            ) : (
              <View>
                {/* Active Subscription Card */}
                {subscription ? (
                  <View style={[styles.card, { backgroundColor: '#00A896', marginBottom: 16 }]}>
                    <Text style={styles.cardTitle}>Active Subscription ({subscription.plan?.name || 'Customer Plan'})</Text>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginVertical: 4 }}>
                      Credit Balance: ₹{subscription.creditBalance.toFixed(2)}
                    </Text>
                    <Text style={{ color: '#E0F2FE', fontSize: 12 }}>
                      Expires: {new Date(subscription.expiresAt).toLocaleDateString()}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>You do not currently have an active subscription plan.</Text>
                  </View>
                )}

                {/* Available Subscription Plans */}
                <Text style={[styles.sectionHeader, { fontSize: 16, marginTop: 12 }]}>Available Subscription Plans</Text>
                {subscriptionPlans.length === 0 ? (
                  <Text style={styles.bodyText}>No subscription plans available at this time.</Text>
                ) : (
                  subscriptionPlans.map((plan) => (
                    <View key={plan.id} style={styles.planCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontWeight: '800', fontSize: 16, color: '#0F4C81' }}>{plan.name}</Text>
                        <Text style={{ fontWeight: '700', fontSize: 16, color: '#00A896' }}>₹{plan.price}</Text>
                      </View>
                      <Text style={{ color: '#475569', marginVertical: 4 }}>
                        Includes ₹{plan.creditAmount} Subscription Credit | {plan.weeklyQtyLimitKg} kg/week limit
                      </Text>
                      <TouchableOpacity
                        style={[styles.button, { marginTop: 8, backgroundColor: '#0F4C81' }]}
                        onPress={() => handlePurchaseSubscription(plan.id)}
                      >
                        <Text style={styles.buttonText}>Purchase Plan</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* LIVE TRUCK GPS TAB */}
        {currentTab === 'GPS_MAP' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Live Delivery Truck Tracking</Text>

            {gpsLoading ? (
              <ActivityIndicator size="large" color="#0F4C81" style={{ marginVertical: 20 }} />
            ) : liveGPS && liveGPS.truckNumber ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>🚛 Truck: {liveGPS.truckNumber}</Text>
                <Text style={styles.cardBody}>Driver: {liveGPS.driverName || 'Assigned Driver'}</Text>
                <Text style={styles.cardBody}>Status: {liveGPS.status || 'LIVE IN TRANSIT'}</Text>
                {liveGPS.currentLat && (
                  <Text style={{ color: '#E0F2FE', fontSize: 12, marginTop: 4 }}>
                    Coordinates: {liveGPS.currentLat.toFixed(4)}, {liveGPS.currentLng?.toFixed(4)}
                  </Text>
                )}
                {liveGPS.lastUpdated && (
                  <Text style={{ color: '#E0F2FE', fontSize: 12, marginTop: 2 }}>
                    Updated: {new Date(liveGPS.lastUpdated).toLocaleTimeString()}
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No delivery truck is currently published live in transit for your route.</Text>
                <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={fetchLiveGPS}>
                  <Text style={styles.buttonText}>Refresh GPS Signal</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* CUSTOMER PROFILE TAB */}
        {currentTab === 'PROFILE' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Customer Profile</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Mobile Number (Verified)</Text>
              <TextInput style={[styles.input, { backgroundColor: '#F1F5F9' }]} value={profile?.mobileNumber || mobileNumber} editable={false} />

              <Text style={styles.label}>Full Name</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName} placeholder="Enter your name" />

              <Text style={styles.label}>Age</Text>
              <TextInput style={styles.input} value={editAge} onChangeText={setEditAge} placeholder="Enter age" keyboardType="number-pad" />

              <Text style={styles.label}>Area / Locality</Text>
              <TextInput style={styles.input} value={editArea} onChangeText={setEditArea} placeholder="Enter area/locality" />

              <TouchableOpacity style={[styles.button, { backgroundColor: '#00A896', marginTop: 8 }]} onPress={handleUpdateProfile} disabled={profileLoading}>
                {profileLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Profile Changes</Text>}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.button, { backgroundColor: '#EF4444', marginTop: 16 }]} onPress={handleLogout}>
              <Text style={styles.buttonText}>Logout Account</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('HOME')}>
          <Text style={[styles.navText, currentTab === 'HOME' && styles.navTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentTab('CATALOG'); fetchCatalogue(); }}>
          <Text style={[styles.navText, currentTab === 'CATALOG' && styles.navTextActive]}>Catalog</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentTab('BOOKINGS'); fetchBookingHistory(); }}>
          <Text style={[styles.navText, currentTab === 'BOOKINGS' && styles.navTextActive]}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('SCAN_BILL')}>
          <Text style={[styles.navText, currentTab === 'SCAN_BILL' && styles.navTextActive]}>Scan Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentTab('SUBSCRIPTION'); fetchSubscriptionInfo(); }}>
          <Text style={[styles.navText, currentTab === 'SUBSCRIPTION' && styles.navTextActive]}>Sub Hub</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentTab('GPS_MAP'); fetchLiveGPS(); }}>
          <Text style={[styles.navText, currentTab === 'GPS_MAP' && styles.navTextActive]}>Live Map</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('PROFILE')}>
          <Text style={[styles.navText, currentTab === 'PROFILE' && styles.navTextActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  authContainer: { flex: 1, backgroundColor: '#0F4C81', justifyContent: 'center', padding: 24 },
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  title: { fontSize: 32, fontWeight: '800', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#00A896', textAlign: 'center', marginBottom: 32 },
  formGroup: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#1E293B' },
  input: { borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16, backgroundColor: '#fff' },
  button: { backgroundColor: '#0F4C81', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  headerBar: { backgroundColor: '#0F4C81', padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  headerSubtitle: { color: '#00A896', fontSize: 12, fontWeight: '600' },
  headerLogoutBtn: { backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  headerLogoutText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { flex: 1, padding: 16 },
  sectionHeader: { fontSize: 20, fontWeight: '700', color: '#0F4C81', marginBottom: 16 },
  tileContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { backgroundColor: '#fff', width: '48%', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  tileText: { fontWeight: '700', color: '#0F4C81', fontSize: 14 },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 },
  bodyText: { color: '#64748B', marginBottom: 16, lineHeight: 22 },
  priceLabel: { fontSize: 18, fontWeight: '700', color: '#0F4C81', marginBottom: 16 },
  qtyContainer: { marginBottom: 16 },
  fallbackBox: { marginTop: 16, backgroundColor: '#FEF3C7', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#F59E0B' },
  warningTitle: { fontWeight: '700', color: '#B45309', marginBottom: 8 },
  errorBox: { backgroundColor: '#FEE2E2', padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#EF4444' },
  errorText: { color: '#991B1B', fontWeight: '600', marginBottom: 8 },
  emptyBox: { backgroundColor: '#F1F5F9', padding: 16, borderRadius: 8, marginVertical: 12, alignItems: 'center' },
  emptyText: { color: '#64748B', fontSize: 14, textAlign: 'center' },
  retryButton: { backgroundColor: '#DC2626', padding: 10, borderRadius: 6, alignItems: 'center' },
  card: { backgroundColor: '#0F4C81', padding: 16, borderRadius: 12, marginBottom: 12 },
  historyCard: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  planCard: { backgroundColor: '#F8FAFC', padding: 14, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#CBD5E1' },
  cardTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  cardBody: { color: '#00A896', fontSize: 14 },
  badge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  badgeGreen: { backgroundColor: '#D1FAE5', color: '#065F46' },
  badgeAmber: { backgroundColor: '#FEF3C7', color: '#92400E' },
  badgeRed: { backgroundColor: '#FEE2E2', color: '#991B1B' },
  detailText: { fontSize: 15, color: '#334155', marginBottom: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  chipSelected: { backgroundColor: '#0F4C81', borderColor: '#0F4C81' },
  chipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  chipTextSelected: { color: '#fff' },
  navBar: { flexDirection: 'row', backgroundColor: '#0F4C81', paddingVertical: 10, borderTopWidth: 1, borderColor: '#1E293B' },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { color: '#94A3B8', fontWeight: '600', fontSize: 11 },
  navTextActive: { color: '#00A896', fontWeight: '800' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F4C81', marginBottom: 8 },
});
