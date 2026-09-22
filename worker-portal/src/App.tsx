import React, { useState, useEffect } from 'react';
import { getWorkerApiBaseUrl } from './config/apiConfig';
import { WorkerAuthStorageService } from './services/authStorage';

export type AuthState = 'AUTHENTICATION_CHECKING' | 'AUTHENTICATION_REQUIRED' | 'AUTHENTICATED';

interface FishItem {
  id: string;
  name: string;
  unitPrice: number;
  physicalAvailable: boolean;
}

interface BookingItem {
  id: string;
  quantityKg: number;
  unitPrice: number;
  subtotal: number;
  fish?: { name: string };
}

interface Customer {
  id: string;
  mobileNumber: string;
  name?: string;
}

interface Booking {
  id: string;
  bookingCode: string;
  qrCodeData: string;
  totalAmount: number;
  subCreditUsed: number;
  razorpayPaid: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  customer?: Customer;
  bookingItems: BookingItem[];
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('AUTHENTICATION_CHECKING');
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Portal View Tabs
  const [activeTab, setActiveTab] = useState<'BOOKINGS' | 'CASH_CHECKOUT'>('BOOKINGS');

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [lastCompletedBooking, setLastCompletedBooking] = useState<Booking | null>(null);

  // Fish Catalog for In-store Checkout
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [selectedFishId, setSelectedFishId] = useState<string>('');
  const [checkoutCustomerInput, setCheckoutCustomerInput] = useState('');
  const [qtyKg, setQtyKg] = useState('1.0');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [lastTxnResult, setLastTxnResult] = useState<any>(null);

  const API_BASE_URL = getWorkerApiBaseUrl();

  // Startup Session Restoration
  useEffect(() => {
    try {
      const storedToken = WorkerAuthStorageService.getToken();
      if (storedToken) {
        setToken(storedToken);
        setAuthState('AUTHENTICATED');
      } else {
        setAuthState('AUTHENTICATION_REQUIRED');
      }
    } catch {
      setAuthState('AUTHENTICATION_REQUIRED');
    }
  }, []);

  // Fetch Bookings from Backend API
  const fetchBookings = async () => {
    if (!token) return;
    setBookingsLoading(true);
    setBookingsError(null);
    try {
      let url = `${API_BASE_URL}/worker/bookings`;
      const queryParams: string[] = [];
      if (searchQuery.trim()) queryParams.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      if (statusFilter !== 'ALL') queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings(data.data || []);
      } else {
        setBookingsError(data.error?.message || 'Failed to fetch bookings.');
      }
    } catch {
      setBookingsError('Network connection error loading bookings.');
    } finally {
      setBookingsLoading(false);
    }
  };

  // Fetch Fish Catalogue for cash checkout
  const fetchFishCatalogue = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/public/fish`);
      const data = await res.json();
      if (res.ok && data.success && data.data && data.data.length > 0) {
        setFishList(data.data);
        if (!selectedFishId) setSelectedFishId(data.data[0].id);
      }
    } catch {
      // Fish catalogue silent fallback
    }
  };

  useEffect(() => {
    if (token && authState === 'AUTHENTICATED') {
      fetchBookings();
      fetchFishCatalogue();
    }
  }, [token, authState]);

  // Trigger search on query or filter change
  useEffect(() => {
    if (!token || authState !== 'AUTHENTICATED') return;
    const timer = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, token, authState]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter worker email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/worker/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.token) {
        const verifiedToken = data.data.token;
        WorkerAuthStorageService.saveToken(verifiedToken);
        setToken(verifiedToken);
        setAuthState('AUTHENTICATED');
      } else {
        setErrorMsg(data.error?.message || 'Worker login failed.');
      }
    } catch {
      setErrorMsg('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    WorkerAuthStorageService.clearToken();
    setToken(null);
    setEmail('');
    setPassword('');
    setSelectedBooking(null);
    setBookings([]);
    setLastCompletedBooking(null);
    setLastTxnResult(null);
    setAuthState('AUTHENTICATION_REQUIRED');
  };

  /**
   * Complete Booking Pickup via POST /api/v1/worker/bookings/:id/complete
   */
  const handleCompleteBooking = async (bookingId: string) => {
    if (!token || !bookingId) return;
    setCompletionLoading(true);
    setCompletionError(null);
    setLastCompletedBooking(null);

    try {
      const res = await fetch(`${API_BASE_URL}/worker/bookings/${bookingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastCompletedBooking(data.data);
        if (selectedBooking && selectedBooking.id === bookingId) {
          setSelectedBooking(data.data);
        }
        fetchBookings();
      } else {
        setCompletionError(data.error?.message || 'Failed to complete booking pickup.');
      }
    } catch {
      setCompletionError('Error connecting to backend for booking completion.');
    } finally {
      setCompletionLoading(false);
    }
  };

  /**
   * In-store Cash Checkout via POST /api/v1/worker/transactions/collect-cash
   */
  const handleCollectCashCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCustomerInput.trim()) {
      setCheckoutError('Please enter Customer ID or Mobile Number.');
      return;
    }
    if (!selectedFishId) {
      setCheckoutError('Please select a fish item.');
      return;
    }
    const quantity = parseFloat(qtyKg);
    if (isNaN(quantity) || quantity <= 0) {
      setCheckoutError('Please enter a valid quantity in kg greater than zero.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);
    setLastTxnResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/worker/transactions/collect-cash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: checkoutCustomerInput.trim(),
          items: [{ fishId: selectedFishId, quantityKg: quantity }],
          useSubscriptionCredit: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLastTxnResult(data.data);
        setCheckoutCustomerInput('');
      } else {
        setCheckoutError(data.error?.message || 'Store checkout failed.');
      }
    } catch {
      setCheckoutError('Failed to complete cash checkout due to network error.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // State 1: AUTHENTICATION_CHECKING Splash Loading View
  if (authState === 'AUTHENTICATION_CHECKING') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#fff', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '2rem', color: '#00a896', margin: 0 }}>PONDFISH WORKER PORTAL</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>Restoring worker station session...</p>
      </div>
    );
  }

  // State 2: AUTHENTICATION_REQUIRED Login Screen
  if (authState === 'AUTHENTICATION_REQUIRED' || !token) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '380px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
          <h2 style={{ color: '#0f4c81', marginBottom: '0.25rem', textAlign: 'center', fontSize: '1.5rem' }}>PONDFISH</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>Worker Tablet Operations Station</p>

          {errorMsg && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Worker Email</label>
            <input
              type="email"
              placeholder="e.g. worker@pondfish.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: '#0f4c81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
            {loading ? 'Authenticating...' : 'Sign In to Worker Station'}
          </button>
        </form>
      </div>
    );
  }

  // State 3: AUTHENTICATED Worker Station
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header Bar */}
      <header style={{ background: '#0f4c81', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>PONDFISH STORE WORKER TABLET</h2>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: '#00a896' }}>Worker Session Active</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('BOOKINGS')}
            style={{ padding: '0.5rem 1rem', background: activeTab === 'BOOKINGS' ? '#00a896' : 'transparent', color: '#fff', border: '1px solid #00a896', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            📦 Booking Pickups
          </button>
          <button
            onClick={() => setActiveTab('CASH_CHECKOUT')}
            style={{ padding: '0.5rem 1rem', background: activeTab === 'CASH_CHECKOUT' ? '#00a896' : 'transparent', color: '#fff', border: '1px solid #00a896', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            💵 In-Store Cash Checkout
          </button>
          <button onClick={handleLogout} style={{ background: '#1e293b', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {activeTab === 'BOOKINGS' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            {/* Left Column: Bookings Search & List */}
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: '#0f4c81', margin: '0 0 1rem 0' }}>Customer Booking Pickups</h3>

              {/* Search & Filter Controls */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="🔍 Search name, phone, booking code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                />
                <button onClick={fetchBookings} style={{ padding: '0.75rem 1rem', background: '#0f4c81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Search
                </button>
              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', overflowX: 'auto' }}>
                {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'EXPIRED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '16px',
                      border: '1px solid #cbd5e1',
                      background: statusFilter === st ? '#0f4c81' : '#f1f5f9',
                      color: statusFilter === st ? '#fff' : '#475569',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Error Callout */}
              {bookingsError && (
                <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚠️ {bookingsError}</span>
                  <button onClick={fetchBookings} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.35rem 0.65rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Retry</button>
                </div>
              )}

              {/* Booking List Container */}
              {bookingsLoading ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Loading backend bookings...</p>
              ) : bookings.length === 0 ? (
                <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                  No active or past bookings match your search query.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto' }}>
                  {bookings.map((bk) => (
                    <div
                      key={bk.id}
                      onClick={() => setSelectedBooking(bk)}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        border: selectedBooking?.id === bk.id ? '2px solid #00a896' : '1px solid #e2e8f0',
                        background: selectedBooking?.id === bk.id ? '#f0fdf4' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 800, color: '#0f4c81', fontSize: '1rem' }}>{bk.bookingCode}</span>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: bk.status === 'CONFIRMED' || bk.status === 'COMPLETED' ? '#d1fae5' : bk.status === 'EXPIRED' ? '#fee2e2' : '#fef3c7',
                            color: bk.status === 'CONFIRMED' || bk.status === 'COMPLETED' ? '#065f46' : bk.status === 'EXPIRED' ? '#991b1b' : '#92400e',
                          }}
                        >
                          {bk.status}
                        </span>
                      </div>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#334155' }}>
                        Customer: <strong>{bk.customer?.name || 'Customer'}</strong> ({bk.customer?.mobileNumber || 'N/A'})
                      </p>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: '#64748b' }}>
                        Total: ₹{bk.totalAmount.toFixed(2)} | Razorpay Paid: ₹{bk.razorpayPaid.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Selected Booking Detail & Verification Action */}
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <h3 style={{ color: '#0f4c81', margin: '0 0 1rem 0' }}>Order Fulfillment & Verification</h3>

              {!selectedBooking ? (
                <div style={{ background: '#f8fafc', padding: '3rem 1.5rem', borderRadius: '8px', textAlign: 'center', color: '#64748b' }}>
                  👈 Select a booking record from the list to view backend details and complete customer pickup.
                </div>
              ) : (
                <div>
                  <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>Booking Code: <strong style={{ color: '#0f4c81' }}>{selectedBooking.bookingCode}</strong></p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>Booking ID: <code style={{ fontSize: '0.8rem', background: '#e2e8f0', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{selectedBooking.id}</code></p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>Status: <strong style={{ color: selectedBooking.status === 'CONFIRMED' || selectedBooking.status === 'COMPLETED' ? '#065f46' : '#991b1b' }}>{selectedBooking.status}</strong></p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>Customer: <strong>{selectedBooking.customer?.name || 'Verified Customer'}</strong> ({selectedBooking.customer?.mobileNumber})</p>
                  </div>

                  <h4 style={{ color: '#0f4c81', margin: '1rem 0 0.5rem 0' }}>Reserved Fish Items</h4>
                  <ul style={{ paddingLeft: '1.25rem', margin: '0 0 1rem 0', color: '#334155' }}>
                    {selectedBooking.bookingItems.map((item) => (
                      <li key={item.id} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                        {item.fish?.name || 'Fish'} — {item.quantityKg} kg @ ₹{item.unitPrice}/kg (Subtotal: ₹{item.subtotal.toFixed(2)})
                      </li>
                    ))}
                  </ul>

                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', marginBottom: '1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                    <div>Total Booking Amount: ₹{selectedBooking.totalAmount.toFixed(2)}</div>
                    <div>Subscription Credit Applied: ₹{selectedBooking.subCreditUsed.toFixed(2)}</div>
                    <div>Razorpay Online Paid: ₹{selectedBooking.razorpayPaid.toFixed(2)}</div>
                  </div>

                  {/* Completion Error Alert */}
                  {completionError && (
                    <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                      ⚠️ {completionError}
                    </div>
                  )}

                  {/* Completion Success Alert */}
                  {lastCompletedBooking && lastCompletedBooking.id === selectedBooking.id && (
                    <div style={{ background: '#f0fdf4', color: '#15803d', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid #22c55e' }}>
                      ✅ Booking verified & marked COMPLETED! Physical inventory stock deducted. Broadcasted to TV portal.
                    </div>
                  )}

                  {/* Action Button */}
                  {selectedBooking.status === 'EXPIRED' ? (
                    <button disabled style={{ width: '100%', padding: '0.85rem', background: '#94a3b8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'not-allowed' }}>
                      🚫 Cannot Complete: Booking Expired (48h Elapsed)
                    </button>
                  ) : selectedBooking.status === 'COMPLETED' ? (
                    <button disabled style={{ width: '100%', padding: '0.85rem', background: '#64748b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'not-allowed' }}>
                      ✓ Booking Already Completed
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCompleteBooking(selectedBooking.id)}
                      disabled={completionLoading}
                      style={{ width: '100%', padding: '0.85rem', background: '#00a896', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
                    >
                      {completionLoading ? 'Completing Order...' : 'Verify & Complete Pickup Handover'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: IN-STORE PHYSICAL CASH CHECKOUT */}
        {activeTab === 'CASH_CHECKOUT' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ color: '#0f4c81', margin: '0 0 0.5rem 0' }}>In-Store Physical Cash Checkout</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Process cash checkout for walk-in store customer. Applies active subscription credit and broadcasts real-time transaction event.
            </p>

            {checkoutError && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                ⚠️ {checkoutError}
              </div>
            )}

            {lastTxnResult && (
              <div style={{ background: '#f0fdf4', color: '#15803d', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #22c55e' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>✅ Transaction Completed</h4>
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}>Txn Number: <strong>{lastTxnResult.transactionNumber}</strong></p>
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}>Sub Credit Used: ₹{lastTxnResult.subCreditUsed}</p>
                <p style={{ margin: '0.2rem 0', fontSize: '0.85rem' }}>Cash Collected: ₹{lastTxnResult.finalPaidAmount}</p>
              </div>
            )}

            <form onSubmit={handleCollectCashCheckout}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Customer ID or Mobile Number *</label>
                <input
                  type="text"
                  placeholder="e.g. Customer UUID or 10-digit mobile"
                  value={checkoutCustomerInput}
                  onChange={(e) => setCheckoutCustomerInput(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Select Fish Item *</label>
                <select
                  value={selectedFishId}
                  onChange={(e) => setSelectedFishId(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                >
                  {fishList.map((fish) => (
                    <option key={fish.id} value={fish.id}>
                      {fish.name} — ₹{fish.unitPrice}/kg
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#334155' }}>Quantity (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  value={qtyKg}
                  onChange={(e) => setQtyKg(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', boxSizing: 'border-box' }}
                />
              </div>

              <button
                type="submit"
                disabled={checkoutLoading}
                style={{ width: '100%', padding: '0.85rem', background: '#00a896', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
              >
                {checkoutLoading ? 'Processing Checkout...' : 'Collect Cash & Finalize Order'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
