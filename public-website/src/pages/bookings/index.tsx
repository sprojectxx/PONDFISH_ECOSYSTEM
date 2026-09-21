import React, { useState } from 'react';
import Head from 'next/head';

export default function BookingsTrackerPage() {
  const [bookingCode, setBookingCode] = useState('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingCode.trim()) return;

    setError(null);
    // Simulate lookup from backend API
    if (bookingCode.toUpperCase().startsWith('BK-')) {
      setBookingDetails({
        bookingCode: bookingCode.toUpperCase(),
        status: 'CONFIRMED',
        createdAt: new Date().toLocaleDateString(),
        expiresAt: new Date(Date.now() + 42 * 60 * 60 * 1000).toLocaleString(),
        hoursRemaining: 42,
        totalAmount: 550,
        subCreditUsed: 200,
        items: [
          { name: 'Fresh Rohu Fish', quantityKg: 2.5, price: 550 }
        ]
      });
    } else {
      setError('Booking code not found. Please enter a valid booking code (e.g. BK-98A72F).');
      setBookingDetails(null);
    }
  };

  return (
    <>
      <Head>
        <title>Track Booking Status & 48h Expiry | PondFish</title>
        <meta name="description" content="Check your active freshwater fish booking status, remaining 48-hour pickup window, and QR code verification details." />
      </Head>

      <div style={{ backgroundColor: 'var(--primary-deep-aqua)', color: '#fff', padding: '3.5rem 1rem', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            Track Your Stock Booking
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Check your 48-hour stock reservation window and pickup QR details.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '640px' }}>
        
        <div className="card" style={{ marginBottom: '2rem' }}>
          <form onSubmit={handleLookup} style={{ display: 'flex', gap: '1rem' }}>
            <input
              type="text"
              placeholder="Enter Booking Code (e.g. BK-98A72F)"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value)}
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem' }}
              required
            />
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
              Lookup
            </button>
          </form>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', color: '#991B1B', padding: '1rem', borderRadius: '8px', marginBottom: '2rem' }}>
            ⚠️ {error}
          </div>
        )}

        {bookingDetails && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>BOOKING CODE</span>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary-deep-aqua)', margin: 0 }}>
                  {bookingDetails.bookingCode}
                </h3>
              </div>
              <span className="badge badge-green">{bookingDetails.status}</span>
            </div>

            {/* 48h Expiry Progress Bar */}
            <div style={{ background: '#ECFDF5', padding: '1rem', borderRadius: '8px', border: '1px solid #A7F3D0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#065F46', fontWeight: 700, marginBottom: '6px' }}>
                <span>⏱️ 48-Hour Pickup Window</span>
                <span>{bookingDetails.hoursRemaining} Hours Remaining</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#D1FAE5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(bookingDetails.hoursRemaining / 48) * 100}%`, height: '100%', background: '#10B981' }}></div>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '6px' }}>
                Expires on: {bookingDetails.expiresAt}
              </div>
            </div>

            {/* Items List */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Reserved Items</h4>
              {bookingDetails.items.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 600, padding: '6px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span>{item.name} ({item.quantityKg} kg)</span>
                  <span style={{ color: 'var(--primary-deep-aqua)' }}>₹{item.price}</span>
                </div>
              ))}
            </div>

            {/* QR Code Placeholder for Worker Scan */}
            <div style={{ textAlign: 'center', background: '#F8FAFC', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ width: '120px', height: '120px', background: '#0F172A', margin: '0 auto 0.75rem auto', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 700 }}>
                [QR SCAN DATA]
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Present this QR code or Booking ID to the worker at Store #01 or Mobile Truck #1 for pickup.
              </p>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
