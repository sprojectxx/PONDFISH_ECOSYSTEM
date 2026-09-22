import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { DiscountOffer, ApiResponse } from '../../types';
import { LoadingState, EmptyState, ErrorState } from '../../components/UIStates';

export default function DiscountsPage() {
  const router = useRouter();
  const [discounts, setDiscounts] = useState<DiscountOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const loadDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/discounts`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data: ApiResponse<DiscountOffer[]> = await res.json();
      if (data.success) {
        setDiscounts(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Failed to load offers');
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
        {error && !loading && <ErrorState message={error} onRetry={loadDiscounts} />}

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
              <div key={offer.id} className="pf-card" style={{ borderLeft: '4px solid var(--offer-coral)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(244, 63, 94, 0.12)', color: 'var(--offer-coral)', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                      {offer.discountPercent ? `${offer.discountPercent}% OFF` : `₹${offer.flatDiscountAmount} OFF`}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pond-navy)', marginBottom: '0.35rem' }}>
                    Code: {offer.discountCode}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {offer.description || 'Promotional discount applicable to qualifying fish purchases.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Offer</span>
                  <Link href="/fish" className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
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
