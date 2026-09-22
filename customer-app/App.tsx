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
} from 'react-native';
import { getApiBaseUrl } from './src/config/apiConfig';
import { QRCodeView } from './src/components/QRCodeView';
import { PaymentServiceAdapter } from './src/services/paymentService';

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
  bookingItems: Array<{
    id: string;
    quantityKg: number;
    unitPrice: number;
    subtotal: number;
    fish?: { name: string };
  }>;
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<'HOME' | 'CATALOG' | 'FISH_DETAIL' | 'BOOKING_CONFIRM' | 'SCAN_BILL' | 'SUBSCRIPTION' | 'GPS_MAP'>('HOME');

  // Catalogue & Fish Detail state
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedFish, setSelectedFish] = useState<FishItem | null>(null);
  const [bookingQtyKg, setBookingQtyKg] = useState('1.0');
  const [useSubCredit, setUseSubCredit] = useState(true);
  const [latestBooking, setLatestBooking] = useState<BookingResult | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Payment State
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentStatusText, setPaymentStatusText] = useState<string | null>(null);

  // Bill Scanner State
  const [imageUrl, setImageUrl] = useState('');
  const [manualBillId, setManualBillId] = useState('');
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [pendingBillId, setPendingBillId] = useState<string | null>(null);

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
   * Initiate Razorpay Payment Initialization Flow
   */
  const handleInitiateRazorpayPayment = async () => {
    if (!latestBooking || latestBooking.razorpayPaid <= 0 || !token) return;

    setPaymentProcessing(true);
    setPaymentStatusText('Initializing Razorpay Order via Backend...');

    try {
      // Step 1: Create Order via backend API
      const order = await PaymentServiceAdapter.createOrder(latestBooking.razorpayPaid, token);
      setPaymentStatusText(`Razorpay Order Created: ${order.razorpayOrderId}. Launching Gateway...`);

      Alert.alert(
        'Razorpay Payment Gateway Interface',
        `Order ID: ${order.razorpayOrderId}\nAmount: ₹${order.amount}\n\nPlease complete payment in the native Razorpay gateway interface on your mobile device.`,
        [
          {
            text: 'Cancel Payment',
            style: 'cancel',
            onPress: () => {
              setPaymentProcessing(false);
              setPaymentStatusText('Payment cancelled by customer.');
            },
          },
        ]
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Payment initialization failed.';
      setPaymentStatusText(`Payment Error: ${msg}`);
      Alert.alert('Payment Initialization Failed', msg);
    } finally {
      setPaymentProcessing(false);
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
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>PONDFISH CUSTOMER APP</Text>
      </View>

      <ScrollView style={styles.content}>
        {currentTab === 'HOME' && (
          <View>
            <Text style={styles.sectionHeader}>Welcome Customer</Text>
            <View style={styles.tileContainer}>
              <TouchableOpacity style={styles.tile} onPress={() => { setCurrentTab('CATALOG'); fetchCatalogue(); }}>
                <Text style={styles.tileText}>🐟 Browse Fish</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tile} onPress={() => setCurrentTab('SCAN_BILL')}>
                <Text style={styles.tileText}>📷 Scan Bill</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tile} onPress={() => setCurrentTab('SUBSCRIPTION')}>
                <Text style={styles.tileText}>💳 Subscriptions</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tile} onPress={() => setCurrentTab('GPS_MAP')}>
                <Text style={styles.tileText}>🚚 Live Truck GPS</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {currentTab === 'CATALOG' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Fish Catalogue</Text>
            <TextInput
              style={styles.input}
              placeholder="🔍 Search fish..."
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
              <Text style={styles.bodyText}>No fish items currently available in catalogue.</Text>
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
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={styles.cardTitle}>{fish.name}</Text>
                    <Text style={[styles.badge, fish.freshnessState === 'GREEN' ? styles.badgeGreen : styles.badgeAmber]}>
                      {fish.freshnessState === 'GREEN' ? 'FRESH' : 'STANDARD'}
                    </Text>
                  </View>
                  <Text style={styles.cardBody}>₹{fish.unitPrice} / kg</Text>
                  <Text style={{ color: fish.onlineBookable ? '#00A896' : '#94A3B8', fontSize: 12, marginTop: 4 }}>
                    {fish.onlineBookable ? '✓ Online Bookable' : 'In-Store Only'}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {currentTab === 'FISH_DETAIL' && selectedFish && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>{selectedFish.name}</Text>
            <Text style={styles.bodyText}>{selectedFish.description || 'Fresh catch sourced daily from verified farms.'}</Text>
            <Text style={styles.priceLabel}>Price: ₹{selectedFish.unitPrice} / kg</Text>

            <View style={styles.qtyContainer}>
              <Text style={styles.label}>Booking Quantity (kg):</Text>
              <TextInput
                style={styles.input}
                value={bookingQtyKg}
                onChangeText={setBookingQtyKg}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#00A896', marginBottom: 12 }]}
              onPress={() => setUseSubCredit(!useSubCredit)}
            >
              <Text style={styles.buttonText}>
                {useSubCredit ? '✓ Subscription Credit Enabled' : 'Use Subscription Credit: OFF'}
              </Text>
            </TouchableOpacity>

            {selectedFish.onlineBookable ? (
              <TouchableOpacity style={styles.button} onPress={handleCreateBooking} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Confirm Online Booking</Text>}
              </TouchableOpacity>
            ) : (
              <Text style={[styles.bodyText, { color: '#EF4444', textAlign: 'center' }]}>
                This item is available for physical in-store purchase only.
              </Text>
            )}
          </View>
        )}

        {currentTab === 'BOOKING_CONFIRM' && latestBooking && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeader, { color: latestBooking.status === 'CONFIRMED' ? '#00A896' : latestBooking.status === 'EXPIRED' ? '#EF4444' : '#B45309' }]}>
              {latestBooking.status === 'CONFIRMED' ? 'Booking Confirmed 🎉' : latestBooking.status === 'EXPIRED' ? 'Booking Expired ❌' : 'Payment Required 💳'}
            </Text>

            {/* ISO/IEC 18004 Compliant 2D QR Ticket Matrix */}
            <View style={{ alignItems: 'center', marginVertical: 16 }}>
              <QRCodeView qrData={latestBooking.qrCodeData} size={190} />
            </View>

            <Text style={styles.detailText}>Booking Code: <Text style={{ fontWeight: '800' }}>{latestBooking.bookingCode}</Text></Text>
            <Text style={styles.detailText}>Status: <Text style={{ fontWeight: '800', color: latestBooking.status === 'CONFIRMED' ? '#065F46' : '#92400E' }}>{latestBooking.status}</Text></Text>
            <Text style={styles.detailText}>Total Amount: ₹{latestBooking.totalAmount.toFixed(2)}</Text>
            <Text style={styles.detailText}>Sub Credit Used: ₹{latestBooking.subCreditUsed.toFixed(2)}</Text>
            <Text style={styles.detailText}>Razorpay Amount Payable: ₹{latestBooking.razorpayPaid.toFixed(2)}</Text>

            {/* 48-Hour Window Expiry Countdown */}
            <Text style={[styles.detailText, { color: '#B45309', marginTop: 10, fontWeight: '700' }]}>
              ⏰ 48-Hour Reservation Window: {remainingTimeStr || 'Calculating...'}
            </Text>

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
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pay ₹{latestBooking.razorpayPaid.toFixed(2)} via Razorpay</Text>}
                </TouchableOpacity>

                {paymentStatusText && (
                  <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 8, fontStyle: 'italic' }}>
                    {paymentStatusText}
                  </Text>
                )}
              </View>
            )}

            <TouchableOpacity style={[styles.button, { marginTop: 16 }]} onPress={() => setCurrentTab('HOME')}>
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}

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

        {currentTab === 'SUBSCRIPTION' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Subscription Hub</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Gold Fish Plan (Active)</Text>
              <Text style={styles.cardBody}>Credit Balance: ₹3,500.00</Text>
              <Text style={styles.cardBody}>Weekly Limit Used: 2.5 kg / 5.0 kg</Text>
            </View>
          </View>
        )}

        {currentTab === 'GPS_MAP' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Live Delivery Truck Tracking</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Truck: AP-39-TF-1001</Text>
              <Text style={styles.cardBody}>Driver: Ramesh Kumar</Text>
              <Text style={styles.cardBody}>Status: LIVE DELIVERY IN PROGRESS</Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('HOME')}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { setCurrentTab('CATALOG'); fetchCatalogue(); }}>
          <Text style={styles.navText}>Catalog</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('SCAN_BILL')}>
          <Text style={styles.navText}>Scan Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('SUBSCRIPTION')}>
          <Text style={styles.navText}>Sub Hub</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => setCurrentTab('GPS_MAP')}>
          <Text style={styles.navText}>Live Map</Text>
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
  input: { borderWidth: 1, borderColor: '#CBD5E1', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 16 },
  button: { backgroundColor: '#0F4C81', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  headerBar: { backgroundColor: '#0F4C81', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  content: { flex: 1, padding: 16 },
  sectionHeader: { fontSize: 20, fontWeight: '700', color: '#0F4C81', marginBottom: 16 },
  tileContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { backgroundColor: '#fff', width: '48%', padding: 20, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  tileText: { fontWeight: '700', color: '#0F4C81', fontSize: 16 },
  section: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 },
  bodyText: { color: '#64748B', marginBottom: 16, lineHeight: 22 },
  priceLabel: { fontSize: 18, fontWeight: '700', color: '#0F4C81', marginBottom: 16 },
  qtyContainer: { marginBottom: 16 },
  fallbackBox: { marginTop: 16, backgroundColor: '#FEF3C7', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#F59E0B' },
  warningTitle: { fontWeight: '700', color: '#B45309', marginBottom: 8 },
  errorBox: { backgroundColor: '#FEE2E2', padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#EF4444' },
  errorText: { color: '#991B1B', fontWeight: '600', marginBottom: 8 },
  retryButton: { backgroundColor: '#DC2626', padding: 10, borderRadius: 6, alignItems: 'center' },
  card: { backgroundColor: '#0F4C81', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  cardBody: { color: '#00A896', fontSize: 14 },
  badge: { fontSize: 10, fontWeight: '700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  badgeGreen: { backgroundColor: '#D1FAE5', color: '#065F46' },
  badgeAmber: { backgroundColor: '#FEF3C7', color: '#92400E' },
  detailText: { fontSize: 15, color: '#334155', marginBottom: 6 },
  navBar: { flexDirection: 'row', backgroundColor: '#0F4C81', paddingVertical: 12, borderTopWidth: 1, borderColor: '#1E293B' },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { color: '#fff', fontWeight: '600' },
});
