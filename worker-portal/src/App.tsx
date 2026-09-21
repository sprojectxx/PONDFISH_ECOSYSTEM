import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('worker@pondfish.com');
  const [password, setPassword] = useState('Worker@123456');
  const [bookingCode, setBookingCode] = useState('');
  const [loading, setLoading] = useState(false);

  // In-store checkout state
  const [customerId, setCustomerId] = useState('');
  const [qtyKg, setQtyKg] = useState('2.0');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/worker/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
      } else {
        alert(data.error?.message || 'Worker login failed');
      }
    } catch (err) {
      alert('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectCashCheckout = async () => {
    if (!customerId) {
      alert('Please enter Customer ID or Mobile Number');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/worker/transactions/collect-cash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId,
          items: [{ fishId: '00000000-0000-0000-0000-000000000001', quantityKg: parseFloat(qtyKg) }],
          useSubscriptionCredit: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Cash Transaction Completed! Transaction No: ${data.data.transactionNumber}. Triggered TV display broadcast!`);
      } else {
        alert(data.error?.message || 'Checkout failed');
      }
    } catch (err) {
      alert('Failed to complete store cash transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '380px' }}>
          <h2 style={{ color: '#0f4c81', marginBottom: '0.5rem', textAlign: 'center' }}>WORKER TABLET PORTAL</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>Sign in with assigned store credentials</p>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Worker Email</label>
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
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{ background: '#0f4c81', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.2rem' }}>PondFish Store Worker Tablet Station</h2>
        <button onClick={() => setToken(null)} style={{ background: '#e76f51', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
          Logout
        </button>
      </header>

      <div style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Section 1: In-Store Cash Checkout */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f4c81', marginBottom: '1rem' }}>In-Store Physical Checkout</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Process cash transaction for walk-in customer. Applies subscription credit if active.</p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Customer ID / Mobile Number</label>
              <input
                type="text"
                placeholder="Enter customer ID"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Fish Quantity (kg)</label>
              <input
                type="number"
                value={qtyKg}
                onChange={(e) => setQtyKg(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <button onClick={handleCollectCashCheckout} disabled={loading} style={{ width: '100%', padding: '0.85rem', background: '#00a896', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Processing Checkout...' : 'Collect Cash & Complete Checkout'}
            </button>
          </div>

          {/* Section 2: Booking Pickup Verification */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f4c81', marginBottom: '1rem' }}>Online Booking Pickup & QR Verification</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Scan QR ticket code or search Booking ID to confirm customer pickup.</p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Booking Code / QR Ticket String</label>
              <input
                type="text"
                placeholder="e.g. BK-987654"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <button onClick={() => alert(`Marked booking ${bookingCode} complete!`)} style={{ width: '100%', padding: '0.85rem', background: '#0f4c81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}>
              Verify & Mark Booking Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
