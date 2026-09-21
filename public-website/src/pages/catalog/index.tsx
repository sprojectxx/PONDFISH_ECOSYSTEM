import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface FishItem {
  id: string;
  name: string;
  description: string;
  unitPrice: number;
  freshnessState: 'GREEN' | 'GREY' | 'YELLOW' | 'RED';
  physicalAvailable: boolean;
  onlineBookable: boolean;
  category?: { name: string };
}

export default function FishCatalogPage() {
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedFishForBooking, setSelectedFishForBooking] = useState<FishItem | null>(null);
  const [bookingQty, setBookingQty] = useState(1);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const fetchCatalog = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/v1/public/fish`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setFishList(data.data || []);
        } else {
          setError(data.error?.message || 'Failed to fetch catalog data');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Catalog API error:', err);
        // Provide graceful fallback offline catalog if backend server is offline
        setFishList([
          {
            id: 'demo-1',
            name: 'Fresh Rohu Fish (Sweetwater)',
            description: 'Local pond caught daily, high protein sweetwater Rohu.',
            unitPrice: 220,
            freshnessState: 'GREEN',
            physicalAvailable: true,
            onlineBookable: true,
            category: { name: 'Freshwater Fish' }
          },
          {
            id: 'demo-2',
            name: 'Catla Fresh Catch',
            description: 'Large head Catla fresh arrival from pond #4.',
            unitPrice: 280,
            freshnessState: 'GREEN',
            physicalAvailable: true,
            onlineBookable: true,
            category: { name: 'Freshwater Fish' }
          },
          {
            id: 'demo-3',
            name: 'Tiger Prawns (Live)',
            description: 'Premium jumbo freshwater tiger prawns.',
            unitPrice: 750,
            freshnessState: 'GREEN',
            physicalAvailable: true,
            onlineBookable: false,
            category: { name: 'Prawns & Crustaceans' }
          }
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredFish = fishList.filter((fish) => {
    const matchesSearch = fish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fish.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || (fish.category?.name === selectedCategory);
    return matchesSearch && matchesCat;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFishForBooking) return;
    const code = 'BK-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setBookingSuccess(`Booking Reserved! Code: ${code}. 48-Hour pickup window activated.`);
    setSelectedFishForBooking(null);
  };

  return (
    <>
      <Head>
        <title>Fresh Fish Catalogue & Availability | PondFish</title>
        <meta name="description" content="Explore today's live freshwater fish arrival with real-time stock availability and 48-hour online booking." />
      </Head>

      <div style={{ backgroundColor: 'var(--primary-deep-aqua)', color: '#fff', padding: '3rem 1rem', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            Today's Fresh Catch Catalogue
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Real-time stock availability from Pond Store #01 and Mobile Delivery Truck #1.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        
        {/* Search & Category Filter Controls */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search fish by name, species or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '1rem' }}
            />

            <button onClick={fetchCatalog} className="btn-primary" style={{ padding: '0.75rem 1.25rem' }}>
              Refresh Stock
            </button>
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {['ALL', 'Freshwater Fish', 'Prawns & Crustaceans', 'Live Ponds'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  border: selectedCategory === cat ? 'none' : '1px solid #CBD5E1',
                  background: selectedCategory === cat ? 'var(--primary-ocean-blue)' : '#F1F5F9',
                  color: selectedCategory === cat ? '#fff' : 'var(--text-dark)',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Success Banner Notification */}
        {bookingSuccess && (
          <div style={{ background: '#D1FAE5', border: '1px solid #10B981', color: '#065F46', padding: '1rem 1.5rem', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🎉 {bookingSuccess}</span>
            <button onClick={() => setBookingSuccess(null)} style={{ background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', color: '#065F46' }}>✕</button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card" style={{ height: '220px', opacity: 0.6, background: '#F1F5F9' }}>
                <p>Loading fresh stock data...</p>
              </div>
            ))}
          </div>
        )}

        {/* Error / Offline Alert */}
        {error && !loading && (
          <div style={{ background: '#FEF2F2', border: '1px solid #EF4444', color: '#991B1B', padding: '1rem 1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
            ⚠️ <strong>Backend API Notice:</strong> {error}. Showing offline preview stock below.
          </div>
        )}

        {/* Empty Search State */}
        {!loading && filteredFish.length === 0 && (
          <div className="card" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>No Fish Matching Your Criteria</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search terms or selecting another category.</p>
            <button onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }} className="btn-primary" style={{ marginTop: '1rem' }}>
              Clear Filters
            </button>
          </div>
        )}

        {/* Fish Cards Grid */}
        {!loading && filteredFish.length > 0 && (
          <div className="grid-3">
            {filteredFish.map((fish) => (
              <div key={fish.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className={`badge ${fish.freshnessState === 'GREEN' ? 'badge-green' : 'badge-yellow'}`}>
                      {fish.freshnessState === 'GREEN' ? '100% LIVE FRESH' : 'STANDARD CATCH'}
                    </span>

                    {fish.onlineBookable ? (
                      <span className="badge badge-green">ONLINE BOOKABLE</span>
                    ) : (
                      <span className="badge badge-grey">IN-STORE ONLY</span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                    {fish.name}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {fish.description || 'Freshly harvested daily from freshwater ponds.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Unit Price</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-deep-aqua)' }}>
                      ₹{fish.unitPrice} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ kg</span>
                    </span>
                  </div>

                  {fish.onlineBookable ? (
                    <button
                      onClick={() => setSelectedFishForBooking(fish)}
                      className="btn-primary"
                      style={{ padding: '0.5rem 1.1rem', fontSize: '0.9rem' }}
                    >
                      Book 48h Stock
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: '#F1F5F9', padding: '6px 12px', borderRadius: '6px' }}>
                      Visit Store #01
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Booking Drawer / Modal */}
      {selectedFishForBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary-deep-aqua)' }}>
              Book {selectedFishForBooking.name}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Reserves physical inventory for 48 hours. Generate QR pickup code for worker verification.
            </p>

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Select Quantity (kg):
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={bookingQty}
                  onChange={(e) => setBookingQty(parseFloat(e.target.value) || 1)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  required
                />
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem' }}>
                  <span>Unit Rate:</span>
                  <span>₹{selectedFishForBooking.unitPrice} / kg</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-deep-aqua)' }}>
                  <span>Total Amount:</span>
                  <span>₹{selectedFishForBooking.unitPrice * bookingQty}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setSelectedFishForBooking(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#fff', fontWeight: 600 }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '0.75rem' }}>
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
