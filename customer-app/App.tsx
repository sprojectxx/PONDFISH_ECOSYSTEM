import React, { useState } from 'react';
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

const API_BASE_URL = 'http://10.0.2.2:5000/api/v1'; // Android Emulator localhost bridge

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState<'HOME' | 'CATALOG' | 'SCAN_BILL' | 'SUBSCRIPTION' | 'GPS_MAP'>('HOME');

  // Manual Bill ID Fallback State
  const [manualBillId, setManualBillId] = useState('');
  const [showManualFallback, setShowManualFallback] = useState(false);
  const [pendingBillId, setPendingBillId] = useState<string | null>(null);

  const handleSendOTP = async () => {
    if (!mobileNumber) {
      Alert.alert('Error', 'Please enter a valid mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        Alert.alert('OTP Sent', 'Use OTP code: 123456');
      } else {
        Alert.alert('Error', data.error?.message || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not connect to PondFish backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter 6-digit OTP code');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
      } else {
        Alert.alert('Authentication Failed', data.error?.message || 'Invalid OTP');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Verification failed due to connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanBill = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/bills/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: 'http://localhost/sample-bill.jpg' }),
      });
      const data = await res.json();
      if (data.success) {
        Alert.alert('Success', `Bill Extracted Successfully! Bill ID: ${data.data.extractedData.billNumber}`);
      } else if (data.error?.code === 'ERR_AI_CONFIDENCE_LOW') {
        setShowManualFallback(true);
        if (data.error.details && data.error.details[0]) {
          setPendingBillId(data.error.details[0].billId);
        }
      } else {
        Alert.alert('Scan Failed', data.error?.message || 'Could not process bill image');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to scan bill');
    } finally {
      setLoading(false);
    }
  };

  const handleManualBillIdSubmit = async () => {
    if (!manualBillId || !pendingBillId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/customer/bills/verify-extraction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ billId: pendingBillId, manualBillId }),
      });
      const data = await res.json();
      if (data.success) {
        setShowManualFallback(false);
        setManualBillId('');
        Alert.alert('Verified', 'Manual Bill ID verified successfully.');
      } else {
        Alert.alert('Verification Error', data.error?.message || 'Manual Bill ID failed');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to submit manual Bill ID');
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.label}>Enter 6-Digit OTP</Text>
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
              <TouchableOpacity style={styles.tile} onPress={() => setCurrentTab('CATALOG')}>
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

        {currentTab === 'SCAN_BILL' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Physical Bill Scanner</Text>
            <Text style={styles.bodyText}>Scan physical store receipt to apply subscription credits and process Razorpay payment for remaining balance.</Text>

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
  fallbackBox: { marginTop: 16, backgroundColor: '#FEF3C7', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#F59E0B' },
  warningTitle: { fontWeight: '700', color: '#B45309', marginBottom: 8 },
  card: { backgroundColor: '#0F4C81', padding: 16, borderRadius: 12, marginBottom: 12 },
  cardTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  cardBody: { color: '#00A896', fontSize: 14 },
  navBar: { flexDirection: 'row', backgroundColor: '#0F4C81', paddingVertical: 12, borderTopWidth: 1, borderColor: '#1E293B' },
  navItem: { flex: 1, alignItems: 'center' },
  navText: { color: '#fff', fontWeight: '600' },
});
