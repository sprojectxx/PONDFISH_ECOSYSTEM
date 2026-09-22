import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FishItem, ApiResponse } from '../../types';
import { LoadingState, ErrorState } from '../../components/UIStates';
import { getApiBaseUrl } from '../../utils/apiConfig';

export default function FishDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [fish, setFish] = useState<FishItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = getApiBaseUrl();

  const loadFishDetails = async (fishId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/fish/${fishId}`);
      if (!res.ok) {
        if (res.status === 404) throw new Error('This fish species is no longer listed in the catalogue.');
        throw new Error(`Server error (${res.status}) fetching fish detail.`);
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
        <nav aria-label="Breadcrumb" className="breadcrumb-nav">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link href="/fish" className="breadcrumb-link">Fish</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{fish ? fish.name : 'Detail'}</span>
        </nav>

        {loading && <LoadingState message="Loading fish details..." />}
        {error && !loading && (
          <ErrorState
            title="Fish Information Unavailable"
            message={error}
            onRetry={() => id && typeof id === 'string' && loadFishDetails(id)}
          />
        )}

        {!loading && !error && fish && (
          <div className="detail-grid">
            
            {/* Left Column: Media Container */}
            <div className="detail-media">
              🐟
            </div>

            {/* Right Column: Fish Attributes */}
            <div className="detail-content">
              <div>
                <div className="flex-row-gap mb-sm">
                  <span className={`badge ${fish.freshnessState === 'GREEN' ? 'badge-green' : 'badge-amber'}`}>
                    {fish.freshnessState === 'GREEN' ? 'Fresh Catch' : 'Standard Catch'}
                  </span>
                  <span className={`badge ${fish.physicalAvailable ? 'badge-blue' : 'badge-muted'}`}>
                    {fish.physicalAvailable ? 'Available in Store' : 'Currently Out of Stock'}
                  </span>
                </div>

                <h1 className="section-title mb-sm" style={{ fontSize: '2rem' }}>
                  {fish.name}
                </h1>

                {fish.category && (
                  <div className="card-description mb-md">
                    Category: <strong className="breadcrumb-current">{fish.category.name}</strong>
                  </div>
                )}

                <p className="card-description mb-lg" style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                  {fish.description || 'Freshwater catch available for physical store pickup.'}
                </p>

                <div className="price-box">
                  <span className="card-price-unit" style={{ display: 'block' }}>Unit Price Rate</span>
                  <div className="card-price" style={{ fontSize: '1.8rem' }}>
                    ₹{fish.unitPrice} <span className="card-price-unit">/ kg</span>
                  </div>
                </div>
              </div>

              {/* Booking CTA Section */}
              <div className="action-box">
                {fish.onlineBookable ? (
                  <div>
                    <span className="badge badge-green mb-sm">
                      Eligible for 48-Hour Online Booking
                    </span>
                    <Link href={`/booking?fishId=${fish.id}`} className="btn btn-primary btn-full">
                      Proceed to Book Stock (48h Window)
                    </Link>
                  </div>
                ) : (
                  <div className="card-description text-center" style={{ background: '#F1F5F9', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
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
