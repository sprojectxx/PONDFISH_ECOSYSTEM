import React, { useState, useEffect, useCallback } from 'react';
import { AdminAuthStorageService } from './services/authStorage';
import { ADMIN_API_CONFIG } from './config/apiConfig';

type AuthState = 'AUTHENTICATION_CHECKING' | 'AUTHENTICATION_REQUIRED' | 'AUTHENTICATED';

type Tab = 'ANALYTICS' | 'FISH' | 'INVENTORY' | 'BOOKINGS' | 'TRANSACTIONS' | 'GPS' | 'WORKERS' | 'AUDIT';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('AUTHENTICATION_CHECKING');
  const [token, setToken] = useState<string | null>(null);

  // Login form state - strictly unpopulated initially
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Main active tab
  const [activeTab, setActiveTab] = useState<Tab>('ANALYTICS');

  // Universal Tab Data States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Tab 1: Executive Analytics State
  const [analytics, setAnalytics] = useState<any>(null);

  // Tab 2: Fish Catalogue & Categories State
  const [fishList, setFishList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [fishSearch, setFishSearch] = useState('');
  const [fishCategoryFilter, setFishCategoryFilter] = useState('');

  // New Fish Form State - Category loaded from backend dynamically
  const [newFishCategoryId, setNewFishCategoryId] = useState('');
  const [newFishName, setNewFishName] = useState('');
  const [newFishPrice, setNewFishPrice] = useState('250');
  const [newFishFreshness, setNewFishFreshness] = useState('GREEN');
  const [newFishOnline, setNewFishOnline] = useState(true);
  const [newFishPhysical, setNewFishPhysical] = useState(true);
  const [fishSuccessMsg, setFishSuccessMsg] = useState<string | null>(null);

  // Edit Fish State
  const [editingFishId, setEditingFishId] = useState<string | null>(null);
  const [editFishPrice, setEditFishPrice] = useState('');
  const [editFishFreshness, setEditFishFreshness] = useState('GREEN');

  // Tab 3: Inventory State
  const [batches, setBatches] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [stockFishId, setStockFishId] = useState('');
  const [stockBatchCode, setStockBatchCode] = useState('');
  const [stockQty, setStockQty] = useState('50');
  const [stockExpiryHours, setStockExpiryHours] = useState('48');
  const [stockSuccessMsg, setStockSuccessMsg] = useState<string | null>(null);

  // Tab 4: Booking Management State
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');

  // Tab 5: Transaction Ledger State
  const [transactions, setTransactions] = useState<any[]>([]);

  // Tab 6: OneLap GPS State - unpopulated truck & driver inputs
  const [activeJourney, setActiveJourney] = useState<any>(null);
  const [truckNumber, setTruckNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [gpsLat, setGpsLat] = useState('16.5062');
  const [gpsLng, setGpsLng] = useState('80.6480');
  const [gpsSuccessMsg, setGpsSuccessMsg] = useState<string | null>(null);

  // Tab 7: Workers State
  const [workers, setWorkers] = useState<any[]>([]);
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');

  // Tab 8: Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Helper fetch with automatic 401/403 session clearing & error handling
  const apiFetch = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    const currentToken = token || AdminAuthStorageService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const response = await fetch(`${ADMIN_API_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 || response.status === 403) {
      AdminAuthStorageService.clearToken();
      setToken(null);
      setAuthState('AUTHENTICATION_REQUIRED');
      throw new Error('Session expired or unauthorized. Please sign in again.');
    }

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || data.message || `Request failed (${response.status})`);
    }

    return data.data;
  }, [token]);

  // Session check on startup to prevent authenticated content flashing
  useEffect(() => {
    const storedToken = AdminAuthStorageService.getToken();
    if (storedToken) {
      setToken(storedToken);
      setAuthState('AUTHENTICATED');
    } else {
      setAuthState('AUTHENTICATION_REQUIRED');
    }
  }, []);

  // Admin login submission handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!email.trim() || !password.trim()) {
      setLoginError('Please enter admin email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${ADMIN_API_CONFIG.baseUrl}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Invalid admin credentials');
      }

      const jwt = data.data.token;
      AdminAuthStorageService.saveToken(jwt);
      setToken(jwt);
      setAuthState('AUTHENTICATED');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logout handler - purges session, memory token, and resets navigation
  const handleLogout = () => {
    AdminAuthStorageService.clearToken();
    setToken(null);
    setAuthState('AUTHENTICATION_REQUIRED');
    setActiveTab('ANALYTICS');
    setAnalytics(null);
    setFishList([]);
    setCategories([]);
    setBookings([]);
    setTransactions([]);
    setActiveJourney(null);
  };

  // Load Tab Data
  const loadTabData = useCallback(async () => {
    if (authState !== 'AUTHENTICATED') return;
    setLoading(true);
    setErrorMsg(null);

    try {
      if (activeTab === 'ANALYTICS') {
        const res = await apiFetch('/admin/analytics');
        setAnalytics(res);
      } else if (activeTab === 'FISH') {
        const [cats, fishes] = await Promise.all([
          apiFetch('/admin/categories'),
          apiFetch('/admin/fish'),
        ]);
        setCategories(cats || []);
        setFishList(fishes || []);
        if (cats && cats.length > 0 && !newFishCategoryId) {
          setNewFishCategoryId(cats[0].id);
        }
      } else if (activeTab === 'INVENTORY') {
        const [cats, fishes, batchData, ledgerData] = await Promise.all([
          apiFetch('/admin/categories'),
          apiFetch('/admin/fish'),
          apiFetch('/admin/inventory/batches'),
          apiFetch('/admin/inventory/ledger'),
        ]);
        setCategories(cats || []);
        setFishList(fishes || []);
        setBatches(batchData || []);
        setLedger(ledgerData || []);
        if (fishes && fishes.length > 0 && !stockFishId) {
          setStockFishId(fishes[0].id);
        }
      } else if (activeTab === 'BOOKINGS') {
        let query = `/admin/bookings?`;
        if (bookingSearch.trim()) query += `search=${encodeURIComponent(bookingSearch.trim())}&`;
        if (bookingStatusFilter) query += `status=${encodeURIComponent(bookingStatusFilter)}`;
        const res = await apiFetch(query);
        setBookings(res || []);
      } else if (activeTab === 'TRANSACTIONS') {
        const res = await apiFetch('/admin/transactions');
        setTransactions(res || []);
      } else if (activeTab === 'GPS') {
        const res = await apiFetch('/admin/gps/journey/active');
        setActiveJourney(res);
      } else if (activeTab === 'WORKERS') {
        const res = await apiFetch('/admin/workers');
        setWorkers(res || []);
      } else if (activeTab === 'AUDIT') {
        const res = await apiFetch('/admin/audit-logs');
        setAuditLogs(res || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load data from backend server.');
    } finally {
      setLoading(false);
    }
  }, [authState, activeTab, bookingSearch, bookingStatusFilter, apiFetch, newFishCategoryId, stockFishId]);

  useEffect(() => {
    loadTabData();
  }, [loadTabData]);

  // Create Fish Handler
  const handleCreateFish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFishSuccessMsg(null);
    setErrorMsg(null);

    if (!newFishCategoryId) {
      setErrorMsg('Please select a valid category.');
      return;
    }

    if (!newFishName.trim()) {
      setErrorMsg('Fish name is required.');
      return;
    }
    const priceNum = parseFloat(newFishPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Price per kg must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/admin/fish', {
        method: 'POST',
        body: JSON.stringify({
          categoryId: newFishCategoryId,
          name: newFishName.trim(),
          unitPrice: priceNum,
          freshnessState: newFishFreshness,
          onlineBookable: newFishOnline,
          physicalAvailable: newFishPhysical,
        }),
      });
      setFishSuccessMsg(`Fish "${newFishName}" added to catalogue successfully!`);
      setNewFishName('');
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create fish item');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Fish Handler
  const handleUpdateFish = async (id: string, updates: any) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await apiFetch(`/admin/fish/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setEditingFishId(null);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update fish details');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Receive Stock Handler
  const handleReceiveStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setStockSuccessMsg(null);
    setErrorMsg(null);

    if (!stockFishId) {
      setErrorMsg('Please select a fish item.');
      return;
    }
    const code = stockBatchCode.trim() || `BATCH-${Date.now().toString(36).toUpperCase()}`;
    const qty = parseFloat(stockQty);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Stock quantity must be greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch('/admin/inventory/receive', {
        method: 'POST',
        body: JSON.stringify({
          fishId: stockFishId,
          batchCode: code,
          receivedQty: qty,
          expiryHours: parseInt(stockExpiryHours) || 48,
        }),
      });
      setStockSuccessMsg(`Received ${qty}kg for batch ${code}!`);
      setStockBatchCode('');
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to receive stock batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  // GPS Controller Handlers
  const handleStartGPS = async () => {
    if (!truckNumber.trim() || !driverName.trim()) {
      setErrorMsg('Truck vehicle number and driver name are required to start a journey.');
      return;
    }
    setIsSubmitting(true);
    setGpsSuccessMsg(null);
    setErrorMsg(null);
    try {
      const journey = await apiFetch('/admin/gps/journey/start', {
        method: 'POST',
        body: JSON.stringify({ truckNumber: truckNumber.trim(), driverName: driverName.trim() }),
      });
      setActiveJourney(journey);
      setGpsSuccessMsg(`Live Truck Journey started for ${truckNumber.trim()}!`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start GPS journey');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishGPS = async (publish: boolean) => {
    if (!activeJourney) return;
    setIsSubmitting(true);
    setGpsSuccessMsg(null);
    setErrorMsg(null);
    try {
      const updated = await apiFetch('/admin/gps/journey/publish', {
        method: 'POST',
        body: JSON.stringify({ journeyId: activeJourney.id, publish }),
      });
      setActiveJourney(updated);
      setGpsSuccessMsg(`Live GPS tracking map ${publish ? 'published to Customer App' : 'unpublished'}.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update GPS map publishing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordGPSPosition = async () => {
    if (!activeJourney) return;
    const lat = parseFloat(gpsLat);
    const lng = parseFloat(gpsLng);
    if (isNaN(lat) || isNaN(lng)) {
      setErrorMsg('Valid latitude and longitude are required.');
      return;
    }
    setIsSubmitting(true);
    setGpsSuccessMsg(null);
    setErrorMsg(null);
    try {
      await apiFetch('/admin/gps/position', {
        method: 'POST',
        body: JSON.stringify({ journeyId: activeJourney.id, latitude: lat, longitude: lng, speed: 45 }),
      });
      setGpsSuccessMsg(`Recorded position (${lat}, ${lng})!`);
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record GPS telemetry position');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopGPS = async () => {
    if (!activeJourney) return;
    setIsSubmitting(true);
    setGpsSuccessMsg(null);
    setErrorMsg(null);
    try {
      await apiFetch('/admin/gps/journey/stop', {
        method: 'POST',
        body: JSON.stringify({ journeyId: activeJourney.id }),
      });
      setActiveJourney(null);
      setGpsSuccessMsg('Truck delivery journey stopped & cleared.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to stop GPS journey');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Worker Account Handler
  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerName.trim() || !workerPhone.trim() || !workerPassword.trim()) {
      setErrorMsg('Worker name, mobile number, and password are required.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await apiFetch('/admin/workers', {
        method: 'POST',
        body: JSON.stringify({ name: workerName.trim(), mobileNumber: workerPhone.trim(), password: workerPassword }),
      });
      setWorkerName('');
      setWorkerPhone('');
      setWorkerPassword('');
      loadTabData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create worker account');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render Startup Session Checking
  if (authState === 'AUTHENTICATION_CHECKING') {
    return (
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', color: '#fff' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #00a896', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <h3 style={{ marginTop: '1rem', fontWeight: 600 }}>Restoring Admin Session...</h3>
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Render Admin Login Screen
  if (authState === 'AUTHENTICATION_REQUIRED') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: '#ffffff', padding: '2.5rem', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ color: '#0f4c81', margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.5px' }}>PONDFISH ADMIN</h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>Single-Store Operational Command Center</p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', marginBottom: '1rem' }}>
              <strong>Error:</strong> {loginError}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.35rem', fontSize: '0.875rem' }}>Admin Email Address</label>
            <input
              type="email"
              placeholder="e.g. admin@pondfish.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.35rem', fontSize: '0.875rem' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', padding: '0.85rem', background: '#0f4c81', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
          >
            {isSubmitting ? 'Authenticating Admin...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    );
  }

  // Render Authenticated Admin Portal Layout
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ width: '270px', background: '#0f4c81', color: '#ffffff', padding: '1.5rem', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, letterSpacing: '1px' }}>PONDFISH</h2>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Admin Command Portal</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <button onClick={() => setActiveTab('ANALYTICS')} style={{ padding: '0.75rem 1rem', background: activeTab === 'ANALYTICS' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            📊 Executive Analytics
          </button>
          <button onClick={() => setActiveTab('FISH')} style={{ padding: '0.75rem 1rem', background: activeTab === 'FISH' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            🐟 Catalogue & Pricing
          </button>
          <button onClick={() => setActiveTab('INVENTORY')} style={{ padding: '0.75rem 1rem', background: activeTab === 'INVENTORY' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            📦 Stock Batches & Ledger
          </button>
          <button onClick={() => setActiveTab('BOOKINGS')} style={{ padding: '0.75rem 1rem', background: activeTab === 'BOOKINGS' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            📋 Customer Bookings
          </button>
          <button onClick={() => setActiveTab('TRANSACTIONS')} style={{ padding: '0.75rem 1rem', background: activeTab === 'TRANSACTIONS' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            💳 Financial Transactions
          </button>
          <button onClick={() => setActiveTab('GPS')} style={{ padding: '0.75rem 1rem', background: activeTab === 'GPS' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            🚚 OneLap Live Truck GPS
          </button>
          <button onClick={() => setActiveTab('WORKERS')} style={{ padding: '0.75rem 1rem', background: activeTab === 'WORKERS' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            👥 Worker Accounts
          </button>
          <button onClick={() => setActiveTab('AUDIT')} style={{ padding: '0.75rem 1rem', background: activeTab === 'AUDIT' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            🛡️ Audit Logs
          </button>
        </nav>

        <button onClick={handleLogout} style={{ marginTop: 'auto', background: '#e76f51', color: '#ffffff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          Sign Out Admin
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {/* Error Banner with Retry Button */}
        {errorMsg && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Error:</strong> {errorMsg}
            </div>
            <button onClick={loadTabData} style={{ background: '#991b1b', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
              Retry API Call
            </button>
          </div>
        )}

        {/* Global Loading Spinner */}
        {loading && (
          <div style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
            🔄 Synchronizing data from backend...
          </div>
        )}

        {/* TAB 1: EXECUTIVE ANALYTICS */}
        {activeTab === 'ANALYTICS' && (
          <div>
            <h2 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1.5rem' }}>Executive Operations & Financial Dashboard</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Total Gross Revenue</p>
                <h3 style={{ fontSize: '2rem', color: '#0f4c81', margin: '0.5rem 0 0 0' }}>₹{analytics?.totalRevenue ?? '0.00'}</h3>
              </div>

              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Completed Transactions</p>
                <h3 style={{ fontSize: '2rem', color: '#00a896', margin: '0.5rem 0 0 0' }}>{analytics?.totalTransactions ?? 0}</h3>
              </div>

              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Razorpay 18% GST Collected</p>
                <h3 style={{ fontSize: '2rem', color: '#e76f51', margin: '0.5rem 0 0 0' }}>₹{analytics?.totalGSTCollected ?? '0.00'}</h3>
              </div>

              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Total Active Bookings</p>
                <h3 style={{ fontSize: '2rem', color: '#2563eb', margin: '0.5rem 0 0 0' }}>{analytics?.totalBookings ?? 0}</h3>
              </div>
            </div>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#334155', marginTop: 0 }}>Operational Status Summary</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Single-Store Fresh Pond Fish Ecosystem operating strictly under authoritative PostgreSQL business rules and transaction atomicity.</p>
            </div>
          </div>
        )}

        {/* TAB 2: FISH CATALOGUE MANAGEMENT */}
        {activeTab === 'FISH' && (
          <div>
            <h2 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1.5rem' }}>Fish Catalogue & Pricing Management</h2>

            {fishSuccessMsg && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                {fishSuccessMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
              {/* Fish List Table */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Search fish catalogue..."
                    value={fishSearch}
                    onChange={(e) => setFishSearch(e.target.value)}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <select
                    value={fishCategoryFilter}
                    onChange={(e) => setFishCategoryFilter(e.target.value)}
                    style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Name</th>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Category</th>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Price (₹/kg)</th>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Freshness</th>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Online</th>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Physical</th>
                      <th style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fishList
                      .filter((f) => !fishSearch || f.name.toLowerCase().includes(fishSearch.toLowerCase()))
                      .filter((f) => !fishCategoryFilter || f.categoryId === fishCategoryFilter)
                      .map((fish) => (
                        <tr key={fish.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600 }}>{fish.name}</td>
                          <td style={{ padding: '0.75rem', color: '#64748b' }}>{fish.category?.name || 'Uncategorized'}</td>
                          <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0f4c81' }}>
                            {editingFishId === fish.id ? (
                              <input
                                type="number"
                                value={editFishPrice}
                                onChange={(e) => setEditFishPrice(e.target.value)}
                                style={{ width: '70px', padding: '0.3rem' }}
                              />
                            ) : (
                              `₹${fish.unitPrice}`
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            {editingFishId === fish.id ? (
                              <select value={editFishFreshness} onChange={(e) => setEditFishFreshness(e.target.value)}>
                                <option value="GREEN">GREEN</option>
                                <option value="AMBER">AMBER</option>
                                <option value="RED">RED</option>
                              </select>
                            ) : (
                              <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: fish.freshnessState === 'GREEN' ? '#dcfce7' : fish.freshnessState === 'AMBER' ? '#fef9c3' : '#fee2e2', color: fish.freshnessState === 'GREEN' ? '#15803d' : fish.freshnessState === 'AMBER' ? '#a16207' : '#b91c1c' }}>
                                {fish.freshnessState}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input
                              type="checkbox"
                              checked={fish.onlineBookable}
                              onChange={(e) => handleUpdateFish(fish.id, { onlineBookable: e.target.checked })}
                              disabled={isSubmitting}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <input
                              type="checkbox"
                              checked={fish.physicalAvailable}
                              onChange={(e) => handleUpdateFish(fish.id, { physicalAvailable: e.target.checked })}
                              disabled={isSubmitting}
                            />
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            {editingFishId === fish.id ? (
                              <button
                                onClick={() => handleUpdateFish(fish.id, { unitPrice: parseFloat(editFishPrice), freshnessState: editFishFreshness })}
                                style={{ background: '#00a896', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingFishId(fish.id);
                                  setEditFishPrice(fish.unitPrice.toString());
                                  setEditFishFreshness(fish.freshnessState);
                                }}
                                style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    {fishList.length === 0 && !loading && (
                      <tr>
                        <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No fish items found in catalogue.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add New Fish Form */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                <h3 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1rem' }}>Add New Fish Item</h3>
                <form onSubmit={handleCreateFish}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Category</label>
                    <select
                      value={newFishCategoryId}
                      onChange={(e) => setNewFishCategoryId(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Fish Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Fresh Pond Murrel"
                      value={newFishName}
                      onChange={(e) => setNewFishName(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Unit Price (₹/kg)</label>
                    <input
                      type="number"
                      value={newFishPrice}
                      onChange={(e) => setNewFishPrice(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Freshness Grade</label>
                    <select
                      value={newFishFreshness}
                      onChange={(e) => setNewFishFreshness(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="GREEN">GREEN (Prime Freshness)</option>
                      <option value="AMBER">AMBER (Standard Freshness)</option>
                      <option value="RED">RED (Near Expiry)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="onlineBookable"
                      checked={newFishOnline}
                      onChange={(e) => setNewFishOnline(e.target.checked)}
                    />
                    <label htmlFor="onlineBookable" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enable Online Booking</label>
                  </div>

                  <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="physicalAvailable"
                      checked={newFishPhysical}
                      onChange={(e) => setNewFishPhysical(e.target.checked)}
                    />
                    <label htmlFor="physicalAvailable" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Physically Available in Store</label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '0.75rem', background: '#00a896', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isSubmitting ? 'Creating...' : 'Add Fish to Catalogue'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY BATCHES & RECEIVING */}
        {activeTab === 'INVENTORY' && (
          <div>
            <h2 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1.5rem' }}>Inventory Batches & Stock Ledger</h2>

            {stockSuccessMsg && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                {stockSuccessMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', marginBottom: '2rem' }}>
              {/* Batches Table */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ color: '#334155', marginTop: 0 }}>Active Inventory Batches</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem' }}>Batch Code</th>
                      <th style={{ padding: '0.6rem' }}>Fish Item</th>
                      <th style={{ padding: '0.6rem' }}>Received</th>
                      <th style={{ padding: '0.6rem' }}>Physical</th>
                      <th style={{ padding: '0.6rem' }}>Reserved</th>
                      <th style={{ padding: '0.6rem' }}>Available</th>
                      <th style={{ padding: '0.6rem' }}>Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem', fontWeight: 700, color: '#0f4c81' }}>{b.batchCode}</td>
                        <td style={{ padding: '0.6rem' }}>{b.fish?.name || 'N/A'}</td>
                        <td style={{ padding: '0.6rem' }}>{b.receivedQty} kg</td>
                        <td style={{ padding: '0.6rem', fontWeight: 600 }}>{b.physicalQty} kg</td>
                        <td style={{ padding: '0.6rem', color: '#e76f51' }}>{b.reservedQty} kg</td>
                        <td style={{ padding: '0.6rem', fontWeight: 700, color: '#00a896' }}>{b.availableQty} kg</td>
                        <td style={{ padding: '0.6rem', color: '#64748b' }}>{new Date(b.expiryAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {batches.length === 0 && !loading && (
                      <tr>
                        <td colSpan={7} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No inventory batches found. Receive stock below.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Receive Stock Form */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                <h3 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1rem' }}>Receive Stock Batch</h3>
                <form onSubmit={handleReceiveStock}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Select Fish</label>
                    <select
                      value={stockFishId}
                      onChange={(e) => setStockFishId(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="">-- Select Fish --</option>
                      {fishList.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Batch Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. BATCH-2026-MURREL-01"
                      value={stockBatchCode}
                      onChange={(e) => setStockBatchCode(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Received Quantity (kg)</label>
                    <input
                      type="number"
                      value={stockQty}
                      onChange={(e) => setStockQty(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Expiry Hours</label>
                    <input
                      type="number"
                      value={stockExpiryHours}
                      onChange={(e) => setStockExpiryHours(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ width: '100%', padding: '0.75rem', background: '#0f4c81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    {isSubmitting ? 'Receiving...' : 'Receive Stock Batch'}
                  </button>
                </form>
              </div>
            </div>

            {/* Ledger */}
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ color: '#334155', marginTop: 0 }}>Inventory Audit Ledger History</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>Timestamp</th>
                    <th style={{ padding: '0.6rem' }}>Fish Item</th>
                    <th style={{ padding: '0.6rem' }}>Change Type</th>
                    <th style={{ padding: '0.6rem' }}>Qty Change</th>
                    <th style={{ padding: '0.6rem' }}>Resulting Qty</th>
                    <th style={{ padding: '0.6rem' }}>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.map((l) => (
                    <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>{new Date(l.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 600 }}>{l.fish?.name || 'N/A'}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: l.changeType === 'RECEIVING' ? '#166534' : l.changeType === 'SALE' ? '#991b1b' : '#0284c7' }}>{l.changeType}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 700 }}>{l.quantityChange > 0 ? `+${l.quantityChange}` : l.quantityChange} kg</td>
                      <td style={{ padding: '0.6rem' }}>{l.resultingQty} kg</td>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>{l.referenceId}</td>
                    </tr>
                  ))}
                  {ledger.length === 0 && !loading && (
                    <tr>
                      <td colSpan={6} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No inventory audit entries logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BOOKING MANAGEMENT */}
        {activeTab === 'BOOKINGS' && (
          <div>
            <h2 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1.5rem' }}>Customer Bookings Management</h2>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  placeholder="Search by customer name, mobile, booking code..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="EXPIRED">EXPIRED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>Code</th>
                    <th style={{ padding: '0.6rem' }}>Customer</th>
                    <th style={{ padding: '0.6rem' }}>Mobile</th>
                    <th style={{ padding: '0.6rem' }}>Items</th>
                    <th style={{ padding: '0.6rem' }}>Total Amount</th>
                    <th style={{ padding: '0.6rem' }}>Sub Credit Used</th>
                    <th style={{ padding: '0.6rem' }}>Razorpay Amount</th>
                    <th style={{ padding: '0.6rem' }}>Status</th>
                    <th style={{ padding: '0.6rem' }}>Expires At</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: '#0f4c81' }}>{b.bookingCode}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 600 }}>{b.customer?.name || 'N/A'}</td>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>{b.customer?.mobileNumber || 'N/A'}</td>
                      <td style={{ padding: '0.6rem' }}>
                        {b.bookingItems?.map((i: any) => `${i.fish?.name} (${i.quantityKg}kg)`).join(', ')}
                      </td>
                      <td style={{ padding: '0.6rem', fontWeight: 700 }}>₹{b.totalAmount}</td>
                      <td style={{ padding: '0.6rem', color: '#2563eb' }}>₹{b.subCreditUsed}</td>
                      <td style={{ padding: '0.6rem', color: '#00a896', fontWeight: 600 }}>₹{b.razorpayPaid}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: b.status === 'CONFIRMED' ? '#dcfce7' : b.status === 'COMPLETED' ? '#e0f2fe' : b.status === 'PENDING' ? '#fef9c3' : '#fee2e2', color: b.status === 'CONFIRMED' ? '#166534' : b.status === 'COMPLETED' ? '#0369a1' : b.status === 'PENDING' ? '#854d0e' : '#991b1b' }}>
                          {b.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>{new Date(b.expiresAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {bookings.length === 0 && !loading && (
                    <tr>
                      <td colSpan={9} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No bookings found matching filter criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: FINANCIAL TRANSACTIONS */}
        {activeTab === 'TRANSACTIONS' && (
          <div>
            <h2 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1.5rem' }}>Financial Transactions & Payment Ledger</h2>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>Txn Number</th>
                    <th style={{ padding: '0.6rem' }}>Booking Ref</th>
                    <th style={{ padding: '0.6rem' }}>Customer</th>
                    <th style={{ padding: '0.6rem' }}>Method</th>
                    <th style={{ padding: '0.6rem' }}>Bill Total</th>
                    <th style={{ padding: '0.6rem' }}>Sub Credit</th>
                    <th style={{ padding: '0.6rem' }}>Extra Payable</th>
                    <th style={{ padding: '0.6rem' }}>Gateway Fee</th>
                    <th style={{ padding: '0.6rem' }}>18% GST</th>
                    <th style={{ padding: '0.6rem' }}>Final Paid</th>
                    <th style={{ padding: '0.6rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: '#0f4c81' }}>{t.transactionNumber}</td>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>{t.booking?.bookingCode || 'STORE_DIRECT'}</td>
                      <td style={{ padding: '0.6rem' }}>{t.customer?.name || 'N/A'}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 600 }}>{t.paymentMethod}</td>
                      <td style={{ padding: '0.6rem' }}>₹{t.totalBillAmount}</td>
                      <td style={{ padding: '0.6rem', color: '#2563eb' }}>₹{t.subCreditUsed}</td>
                      <td style={{ padding: '0.6rem' }}>₹{t.extraAmountPayable}</td>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>₹{t.razorpayGatewayFee}</td>
                      <td style={{ padding: '0.6rem', color: '#e76f51' }}>₹{t.gstOnFee18}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: '#00a896' }}>₹{t.finalPaidAmount}</td>
                      <td style={{ padding: '0.6rem' }}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: t.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3', color: t.status === 'COMPLETED' ? '#166534' : '#854d0e' }}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && !loading && (
                    <tr>
                      <td colSpan={11} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No financial transactions logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: ONELAP LIVE TRUCK GPS */}
        {activeTab === 'GPS' && (
          <div>
            <h2 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1.5rem' }}>OneLap Live Truck GPS Controller</h2>

            {gpsSuccessMsg && (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                {gpsSuccessMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
              {/* Active Tracking Box */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ color: '#334155', marginTop: 0 }}>Live Tracking State</h3>

                {activeJourney ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: 0, color: '#0f4c81' }}>Truck: {activeJourney.truckNumber}</h4>
                        <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Driver: {activeJourney.driverName}</p>
                      </div>
                      <div>
                        <span style={{ padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534' }}>
                          {activeJourney.status}
                        </span>
                        <span style={{ marginLeft: '0.5rem', padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: activeJourney.publishedToCustomer ? '#e0f2fe' : '#f1f5f9', color: activeJourney.publishedToCustomer ? '#0369a1' : '#64748b' }}>
                          {activeJourney.publishedToCustomer ? 'Published to Customer App' : 'Internal Only'}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                      <h4 style={{ color: '#334155', marginBottom: '0.5rem' }}>Recorded GPS Telemetry Coordinates</h4>
                      {activeJourney.positions && activeJourney.positions.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                          <thead>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                              <th style={{ padding: '0.5rem' }}>Time</th>
                              <th style={{ padding: '0.5rem' }}>Latitude</th>
                              <th style={{ padding: '0.5rem' }}>Longitude</th>
                              <th style={{ padding: '0.5rem' }}>Speed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeJourney.positions.map((p: any) => (
                              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.5rem', color: '#64748b' }}>{new Date(p.recordedAt).toLocaleTimeString()}</td>
                                <td style={{ padding: '0.5rem', fontWeight: 600 }}>{p.latitude}</td>
                                <td style={{ padding: '0.5rem', fontWeight: 600 }}>{p.longitude}</td>
                                <td style={{ padding: '0.5rem' }}>{p.speed ? `${p.speed} km/h` : 'N/A'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No GPS positions recorded yet for this journey.</p>
                      )}
                    </div>

                    {/* Record Telemetry Inputs */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>Simulate Telemetry Update</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Latitude"
                          value={gpsLat}
                          onChange={(e) => setGpsLat(e.target.value)}
                          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                        <input
                          type="text"
                          placeholder="Longitude"
                          value={gpsLng}
                          onChange={(e) => setGpsLng(e.target.value)}
                          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                      <button onClick={handleRecordGPSPosition} disabled={isSubmitting} style={{ width: '100%', background: '#00a896', color: '#fff', border: 'none', padding: '0.5rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                        Push Location Update
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => handlePublishGPS(!activeJourney.publishedToCustomer)} disabled={isSubmitting} style={{ flex: 1, background: activeJourney.publishedToCustomer ? '#e76f51' : '#00a896', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                        {activeJourney.publishedToCustomer ? 'Unpublish from Customer App' : 'Publish Live Map to Customer App'}
                      </button>
                      <button onClick={handleStopGPS} disabled={isSubmitting} style={{ background: '#991b1b', color: '#fff', border: 'none', padding: '0.75rem 1rem', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                        Stop & Complete Journey
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    <p style={{ margin: 0 }}>No active delivery truck journey in progress.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Start a delivery truck tracking journey using the form on the right.</p>
                  </div>
                )}
              </div>

              {/* Start Tracking Form */}
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                <h3 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1rem' }}>Start New Truck Journey</h3>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Truck Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="e.g. AP-39-TF-1001"
                    value={truckNumber}
                    onChange={(e) => setTruckNumber(e.target.value)}
                    disabled={!!activeJourney}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Driver Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    disabled={!!activeJourney}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <button
                  onClick={handleStartGPS}
                  disabled={isSubmitting || !!activeJourney}
                  style={{ width: '100%', padding: '0.75rem', background: '#0f4c81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: activeJourney ? 'not-allowed' : 'pointer', opacity: activeJourney ? 0.6 : 1 }}
                >
                  {activeJourney ? 'Journey In Progress' : 'Start Delivery Journey'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: WORKER ACCOUNTS */}
        {activeTab === 'WORKERS' && (
          <div>
            <h2 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1.5rem' }}>Store Worker Account Management</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ color: '#334155', marginTop: 0 }}>Registered Workers</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem' }}>Name</th>
                      <th style={{ padding: '0.6rem' }}>Mobile Number</th>
                      <th style={{ padding: '0.6rem' }}>Role</th>
                      <th style={{ padding: '0.6rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((w) => (
                      <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem', fontWeight: 600 }}>{w.name}</td>
                        <td style={{ padding: '0.6rem', color: '#64748b' }}>{w.mobileNumber}</td>
                        <td style={{ padding: '0.6rem', fontWeight: 700, color: '#0f4c81' }}>{w.role}</td>
                        <td style={{ padding: '0.6rem' }}>
                          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: w.active ? '#dcfce7' : '#fee2e2', color: w.active ? '#166534' : '#991b1b' }}>
                            {w.active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {workers.length === 0 && !loading && (
                      <tr>
                        <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No worker accounts created yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'fit-content' }}>
                <h3 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1rem' }}>Create Worker Account</h3>
                <form onSubmit={handleCreateWorker}>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Worker Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Worker Suresh"
                      value={workerName}
                      onChange={(e) => setWorkerName(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Mobile Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={workerPhone}
                      onChange={(e) => setWorkerPhone(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={workerPassword}
                      onChange={(e) => setWorkerPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '0.75rem', background: '#0f4c81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                    {isSubmitting ? 'Creating Account...' : 'Create Worker Account'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: AUDIT LOGS */}
        {activeTab === 'AUDIT' && (
          <div>
            <h2 style={{ color: '#0f4c81', marginTop: 0, marginBottom: '1.5rem' }}>System Audit Logs</h2>

            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '0.6rem' }}>Timestamp</th>
                    <th style={{ padding: '0.6rem' }}>Action</th>
                    <th style={{ padding: '0.6rem' }}>User / Role</th>
                    <th style={{ padding: '0.6rem' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.6rem', color: '#64748b' }}>{new Date(log.createdAt).toLocaleString()}</td>
                      <td style={{ padding: '0.6rem', fontWeight: 700, color: '#0f4c81' }}>{log.action}</td>
                      <td style={{ padding: '0.6rem' }}>{log.user || 'ADMIN'}</td>
                      <td style={{ padding: '0.6rem', color: '#334155' }}>{JSON.stringify(log.details || {})}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && !loading && (
                    <tr>
                      <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>No audit log entries recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
