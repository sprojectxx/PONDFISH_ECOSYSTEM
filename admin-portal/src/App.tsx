import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@pondfish.com');
  const [password, setPassword] = useState('Admin@123456');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'FISH' | 'INVENTORY' | 'GPS' | 'AUDIT'>('ANALYTICS');

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);

  // New Fish Form State
  const [fishName, setFishName] = useState('');
  const [unitPrice, setUnitPrice] = useState('250');
  const [onlineBookable, setOnlineBookable] = useState(true);

  // GPS Controller State
  const [journeyId, setJourneyId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
      } else {
        alert(data.error?.message || 'Admin login failed');
      }
    } catch (err) {
      alert('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && activeTab === 'ANALYTICS') {
      fetch(`${API_BASE_URL}/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setAnalytics(data.data);
        })
        .catch(() => {});
    }
  }, [token, activeTab]);

  const handleCreateFish = async () => {
    if (!fishName) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/fish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: '00000000-0000-0000-0000-000000000001',
          name: fishName,
          unitPrice: parseFloat(unitPrice),
          onlineBookable,
          physicalAvailable: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('New fish item added to catalog successfully!');
        setFishName('');
      } else {
        alert(data.error?.message || 'Failed to create fish');
      }
    } catch (err) {
      alert('Error creating fish');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGPSJourney = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/gps/journey/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ truckNumber: 'AP-39-TF-1001', driverName: 'Ramesh Kumar' }),
      });
      const data = await res.json();
      if (data.success) {
        setJourneyId(data.data.id);
        alert('GPS Delivery Journey Started!');
      }
    } catch (err) {
      alert('Failed to start GPS journey');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishGPSJourney = async () => {
    if (!journeyId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/gps/journey/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ journeyId, publish: true }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Published Live Truck GPS map tracking to Customer App!');
      }
    } catch (err) {
      alert('Failed to publish GPS map');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '400px' }}>
          <h2 style={{ color: '#0f4c81', marginBottom: '0.5rem', textAlign: 'center' }}>ADMIN MANAGEMENT PORTAL</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>Sign in with superadmin credentials</p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: '#0f4c81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Navigation */}
      <aside style={{ width: '260px', background: '#0f4c81', color: '#fff', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2rem', letterSpacing: '1px' }}>PONDFISH ADMIN</h2>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button onClick={() => setActiveTab('ANALYTICS')} style={{ padding: '0.75rem', background: activeTab === 'ANALYTICS' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            📊 Executive Analytics
          </button>
          <button onClick={() => setActiveTab('FISH')} style={{ padding: '0.75rem', background: activeTab === 'FISH' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            🐟 Fish & Catalog Manager
          </button>
          <button onClick={() => setActiveTab('INVENTORY')} style={{ padding: '0.75rem', background: activeTab === 'INVENTORY' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            📦 Batch Stock Receiving
          </button>
          <button onClick={() => setActiveTab('GPS')} style={{ padding: '0.75rem', background: activeTab === 'GPS' ? '#00a896' : 'transparent', color: '#fff', border: 'none', borderRadius: '6px', textAlign: 'left', fontWeight: 600, cursor: 'pointer' }}>
            🚚 OneLap GPS Controller
          </button>
        </nav>

        <button onClick={() => setToken(null)} style={{ marginTop: 'auto', background: '#e76f51', color: '#fff', border: 'none', padding: '0.75rem', width: '100%', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
          Sign Out
        </button>
      </aside>

      {/* Main Admin Content */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f8fafc' }}>
        {activeTab === 'ANALYTICS' && (
          <div>
            <h2 style={{ color: '#0f4c81', marginBottom: '1.5rem' }}>Executive Revenue & Operations Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Gross Revenue</p>
                <h3 style={{ fontSize: '2rem', color: '#0f4c81' }}>₹{analytics?.totalRevenue || '0.00'}</h3>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Completed Transactions</p>
                <h3 style={{ fontSize: '2rem', color: '#00a896' }}>{analytics?.totalTransactions || 0}</h3>
              </div>
              <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total 18% GST Collected</p>
                <h3 style={{ fontSize: '2rem', color: '#e76f51' }}>₹{analytics?.totalGSTCollected || '0.00'}</h3>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FISH' && (
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
            <h2 style={{ color: '#0f4c81', marginBottom: '1.5rem' }}>Add New Fish Item to Catalog</h2>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Fish Name</label>
              <input
                type="text"
                placeholder="e.g. Fresh Pond Murrel"
                value={fishName}
                onChange={(e) => setFishName(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Unit Price (₹/kg)</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="online"
                checked={onlineBookable}
                onChange={(e) => setOnlineBookable(e.target.checked)}
              />
              <label htmlFor="online" style={{ fontWeight: 600 }}>Enable for Online Booking (Customer App Cart)</label>
            </div>
            <button onClick={handleCreateFish} disabled={loading} style={{ width: '100%', padding: '0.85rem', background: '#00a896', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Adding...' : 'Add Fish Item'}
            </button>
          </div>
        )}

        {activeTab === 'GPS' && (
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
            <h2 style={{ color: '#0f4c81', marginBottom: '1.5rem' }}>OneLap Delivery Truck GPS Controller</h2>
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Control truck delivery journey and publish live location tracking map to Customer App.</p>

            <button onClick={handleStartGPSJourney} disabled={loading || !!journeyId} style={{ padding: '0.85rem 1.5rem', background: '#0f4c81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', marginRight: '1rem' }}>
              Start Delivery Journey
            </button>

            {journeyId && (
              <button onClick={handlePublishGPSJourney} disabled={loading} style={{ padding: '0.85rem 1.5rem', background: '#00a896', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
                Publish Live Map to Customer App
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
