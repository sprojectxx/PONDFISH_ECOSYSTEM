import React, { useState, useEffect } from 'react';
import { getWorkerApiBaseUrl } from './config/apiConfig';

interface FishItem {
  id: string;
  name: string;
  unitPrice: number;
  physicalAvailable: boolean;
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fish Catalog for Worker Selection
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [selectedFishId, setSelectedFishId] = useState<string>('');

  // In-store checkout state
  const [customerId, setCustomerId] = useState('');
  const [qtyKg, setQtyKg] = useState('2.0');
  const [lastTxnResult, setLastTxnResult] = useState<any>(null);

  // Booking verification state
  const [bookingIdInput, setBookingIdInput] = useState('');
  const [lastBookingResult, setLastBookingResult] = useState<any>(null);
  const [bookingCompleted, setBookingCompleted] = useState(false);

  const API_BASE_URL = getWorkerApiBaseUrl();

  // Fetch Fish Catalogue when authenticated
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE_URL}/public/fish`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data && data.data.length > 0) {
            setFishList(data.data);
            setSelectedFishId(data.data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [token, API_BASE_URL]);

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
      if (data.success) {
        setToken(data.data.token);
      } else {
        setErrorMsg(data.error?.message || 'Worker login failed.');
      }
    } catch {
      setErrorMsg('Could not connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectCashCheckout = async () => {
    if (!customerId || customerId.trim().length === 0) {
      alert('Please enter valid Customer ID or Mobile Number.');
      return;
    }

    if (!selectedFishId) {
      alert('Please select a fish item from the inventory catalog.');
      return;
    }

    const quantity = parseFloat(qtyKg);
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please specify a valid quantity greater than zero.');
      return;
    }

    setLoading(true);
    setLastTxnResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/worker/transactions/collect-cash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerId: customerId.trim(),
          items: [{ fishId: selectedFishId, quantityKg: quantity }],
          useSubscriptionCredit: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastTxnResult(data.data);
        alert(`Cash Transaction Completed!\nTxn Number: ${data.data.transactionNumber}\nFinal Paid: ₹${data.data.finalPaidAmount}\nBroadcasted to TV portal.`);
      } else {
        alert(data.error?.message || 'Checkout failed.');
      }
    } catch {
      alert('Failed to complete store cash transaction due to network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteBooking = async () => {
    const targetBookingId = bookingIdInput.trim();
    if (!targetBookingId) {
      alert('Please enter Booking Code or Booking ID.');
      return;
    }

    setLoading(true);
    setLastBookingResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/worker/bookings/${targetBookingId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setLastBookingResult(data.data);
        setBookingCompleted(true);
        alert(`Booking ${data.data.bookingCode || targetBookingId} marked COMPLETED!\nInventory physical stock deducted.`);
      } else {
        alert(data.error?.message || 'Failed to complete booking pickup.');
      }
    } catch {
      alert('Error connecting to backend for booking completion.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <form onSubmit={handleLogin} style={{ background: '#fff', padding: '2.5rem', borderRadius: '12px', width: '380px' }}>
          <h2 style={{ color: '#0f4c81', marginBottom: '0.5rem', textAlign: 'center' }}>WORKER TABLET PORTAL</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>Sign in with store worker credentials</p>

          {errorMsg && (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem' }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Worker Email</label>
            <input
              type="email"
              placeholder="e.g. worker@pondfish.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
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
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Process cash transaction for walk-in customer. Applies active subscription credit automatically.</p>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Customer ID / Mobile Number</label>
              <input
                type="text"
                placeholder="e.g. Customer UUID or mobile"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Select Fish Item from Inventory</label>
              <select
                value={selectedFishId}
                onChange={(e) => setSelectedFishId(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {fishList.map((fish) => (
                  <option key={fish.id} value={fish.id}>
                    {fish.name} — ₹{fish.unitPrice}/kg
                  </option>
                ))}
              </select>
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

            {lastTxnResult && (
              <div style={{ marginTop: '1.5rem', background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #22c55e' }}>
                <h4 style={{ color: '#15803d', margin: '0 0 0.5rem 0' }}>Transaction Success</h4>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>Txn Number: <strong>{lastTxnResult.transactionNumber}</strong></p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>Sub Credit Used: ₹{lastTxnResult.subCreditUsed}</p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>Cash Amount Paid: ₹{lastTxnResult.finalPaidAmount}</p>
              </div>
            )}
          </div>

          {/* Section 2: Booking Pickup Verification */}
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ color: '#0f4c81', marginBottom: '1rem' }}>Online Booking Pickup Verification</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              Enter Booking Code (e.g. BK-987654) or Booking ID to verify customer pickup.
            </p>
            <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>
              (Note: Tablet camera hardware QR scanner integration is device hardware dependent.)
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem' }}>Manual Booking Code / ID Entry</label>
              <input
                type="text"
                placeholder="e.g. BK-987654 or Booking UUID"
                value={bookingIdInput}
                onChange={(e) => {
                  setBookingIdInput(e.target.value);
                  setBookingCompleted(false);
                }}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              />
            </div>

            <button
              onClick={handleCompleteBooking}
              disabled={loading || bookingCompleted}
              style={{ width: '100%', padding: '0.85rem', background: bookingCompleted ? '#94a3b8' : '#0f4c81', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, cursor: bookingCompleted ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Verifying...' : bookingCompleted ? 'Booking Already Completed' : 'Verify & Mark Booking Complete'}
            </button>

            {lastBookingResult && (
              <div style={{ marginTop: '1.5rem', background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #22c55e' }}>
                <h4 style={{ color: '#15803d', margin: '0 0 0.5rem 0' }}>Pickup Verification Success</h4>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>Booking Code: <strong>{lastBookingResult.bookingCode}</strong></p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem' }}>Status: <strong>COMPLETED</strong></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
