import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FishItem, ApiResponse } from '../../types';
import { LoadingState, ErrorState } from '../../components/UIStates';

export default function FishDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [fish, setFish] = useState<FishItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const loadFishDetails = async (fishId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/fish/${fishId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('This fish species is no longer listed in the catalogue.');
        throw new Error(`HTTP Error ${res.status}`);
      }

      const data: ApiResponse<FishItem> = await res.json();
      if (data.success && data.data) {
        setFish(data.data);
      } else {
        throw new Error(data.error?.message || 'Fish record not found.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load fish details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadFishDetails(id);
    }
  }, [id]);

  return (
    <>
      <Head>
        <title>{fish ? `${fish.name} | Fish Detail` : 'Fish Detail | PondFish'}</title>
      </Head>

      <div className="main-container">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--pond-blue)' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link href="/fish" style={{ color: 'var(--pond-blue)' }}>Fish</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>{fish ? fish.name : 'Detail'}</span>
        </nav>

        {loading && <LoadingState message="Loading fish information..." />}
        {error && !loading && (
          <ErrorState
            title="Fish Information Unavailable"
            message={error}
            onRetry={() => id && typeof id === 'string' && loadFishDetails(id)}
          />
        )}

        {!loading && !error && fish && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            {/* Left Column: Image Container */}
            <div style={{ background: 'var(--soft-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
              🐟
            </div>

            {/* Right Column: Fish Attributes */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <span className={`badge ${fish.freshnessState === 'GREEN' ? 'badge-green' : 'badge-amber'}`}>
                    {fish.freshnessState === 'GREEN' ? 'Fresh Catch' : 'Standard Catch'}
                  </span>
                  <span className={`badge ${fish.physicalAvailable ? 'badge-blue' : 'badge-muted'}`}>
                    {fish.physicalAvailable ? 'Available in Store' : 'Currently Out of Stock'}
                  </span>
                </div>

                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--pond-navy)', marginBottom: '0.5rem' }}>
                  {fish.name}
                </h1>

                {fish.category && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Category: <strong style={{ color: 'var(--text-primary)' }}>{fish.category.name}</strong>
                  </div>
                )}

                <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  {fish.description || 'Freshwater catch available for physical store pickup.'}
                </p>

                <div style={{ background: 'var(--soft-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Unit Price Rate</span>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--pond-navy)' }}>
                    ₹{fish.unitPrice} <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ kg</span>
                  </div>
                </div>
              </div>

              {/* Booking CTA Section */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                {fish.onlineBookable ? (
                  <div>
                    <span className="badge badge-green" style={{ marginBottom: '0.75rem', display: 'inline-block' }}>
                      Eligible for 48-Hour Online Booking
                    </span>
                    <Link href={`/booking?fishId=${fish.id}`} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}>
                      Proceed to Book Stock (48h Window)
                    </Link>
                  </div>
                ) : (
                  <div style={{ background: '#F1F5F9', padding: '0.75rem', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>
                    In-Store Purchase Only (Online Booking Disabled)
                  </div>
                )}
              </div>

            </div>

          </div>
        )}
      </div>
    </>
  );
}
