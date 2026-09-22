import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DiscountOffer, ApiResponse } from '../../types';
import { LoadingState, EmptyState, ErrorState } from '../../components/UIStates';
import { getApiBaseUrl } from '../../utils/apiConfig';

export default function DiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<DiscountOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = getApiBaseUrl();

  const loadDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/discounts`);
      if (!res.ok) throw new Error(`Server error (${res.status}) fetching active offers.`);

      const data: ApiResponse<DiscountOffer[]> = await res.json();
      if (data.success) {
        setDiscounts(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Failed to load active offers.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load active discounts.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  return (
    <>
      <Head>
        <title>Active Discounts & Offers | PondFish</title>
        <meta name="description" content="View currently active promotional discounts and offer codes at PondFish." />
      </Head>

      <section className="page-banner">
        <h1>Active Discounts & Offers</h1>
        <p>Promotional offer codes dynamically updated by store management.</p>
      </section>

      <div className="main-container">
        {loading && <LoadingState message="Loading active store offers..." />}
        {error && !loading && <ErrorState title="Offers Unavailable" message={error} onRetry={loadDiscounts} />}

        {!loading && !error && discounts.length === 0 && (
          <EmptyState
            title="No Active Offers Right Now"
            description="There are currently no active promotional discount codes configured."
            actionLabel="Browse Fish Catalogue"
            onAction={() => router.push('/fish')}
          />
        )}

        {!loading && !error && discounts.length > 0 && (
          <div className="card-grid">
            {discounts.map((offer) => (
              <div key={offer.id} className="pf-card pf-card-offer">
                <div>
                  <div className="card-header-meta">
                    <span className="badge badge-coral">
                      {offer.discountPercent ? `${offer.discountPercent}% OFF` : `₹${offer.flatDiscountAmount} OFF`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="card-title">Code: {offer.discountCode}</h3>
                  <p className="card-description">
                    {offer.description || 'Promotional discount applicable to qualifying fish purchases.'}
                  </p>
                </div>

                <div className="card-footer">
                  <span className="card-price-unit">Active Offer</span>
                  <Link href="/fish" className="btn btn-primary btn-sm">
                    Shop & Apply
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
