import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FishItem, Category, DiscountOffer, ApiResponse } from '../types';
import { LoadingState, EmptyState, ErrorState } from '../components/UIStates';

export default function HomePage() {
  const [featuredFish, setFeaturedFish] = useState<FishItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [discounts, setDiscounts] = useState<DiscountOffer[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const loadHomeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fishRes, catRes, discRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/v1/public/fish`),
        fetch(`${API_BASE}/api/v1/public/categories`),
        fetch(`${API_BASE}/api/v1/public/discounts`),
      ]);

      if (fishRes.status === 'fulfilled' && fishRes.value.ok) {
        const fishData: ApiResponse<FishItem[]> = await fishRes.value.json();
        if (fishData.success) setFeaturedFish(fishData.data || []);
      }

      if (catRes.status === 'fulfilled' && catRes.value.ok) {
        const catData: ApiResponse<Category[]> = await catRes.value.json();
        if (catData.success) setCategories(catData.data || []);
      }

      if (discRes.status === 'fulfilled' && discRes.value.ok) {
        const discData: ApiResponse<DiscountOffer[]> = await discRes.value.json();
        if (discData.success) setDiscounts(discData.data || []);
      }
    } catch (err) {
      console.error('Home data load error:', err);
      setError('Unable to load live availability data from store server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  return (
    <>
      <Head>
        <title>PondFish | Freshwater Fish Discovery & Retail</title>
        <meta name="description" content="Discover fresh arrival freshwater fish, browse categories, check live store availability, and enter online 48-hour stock booking." />
      </Head>

      {/* Hero Section */}
      <section className="page-banner">
        <h1>Fresh Freshwater Fish Discovery</h1>
        <p>Explore today's arrival stock, category availability, and online 48-hour booking reservations.</p>
        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/fish" className="btn btn-primary" style={{ backgroundColor: 'var(--fresh-green)', color: '#fff' }}>
            Browse Fish Catalogue
          </Link>
          <Link href="/categories" className="btn btn-secondary">
            View Categories
          </Link>
        </div>
      </section>

      <div className="main-container">

        {/* Global Loading / Error */}
        {loading && <LoadingState message="Loading today's fish availability..." />}
        {error && !loading && <ErrorState message={error} onRetry={loadHomeData} />}

        {/* Featured Fish Section */}
        {!loading && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--pond-navy)' }}>
                Today's Fish Catalogue
              </h2>
              <Link href="/fish" style={{ color: 'var(--pond-blue)', fontWeight: 600, fontSize: '0.95rem' }}>
                View All Fish →
              </Link>
            </div>

            {featuredFish.length === 0 ? (
              <EmptyState title="No Fish Currently Listed" description="Store receiving in progress. Please check back shortly for updated availability." />
            ) : (
              <div className="card-grid">
                {featuredFish.slice(0, 6).map((fish) => (
                  <div key={fish.id} className="pf-card">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span className={`badge ${fish.freshnessState === 'GREEN' ? 'badge-green' : 'badge-amber'}`}>
                          {fish.freshnessState === 'GREEN' ? 'Fresh' : 'Standard'}
                        </span>
                        {fish.onlineBookable ? (
                          <span className="badge badge-blue">Online Bookable</span>
                        ) : (
                          <span className="badge badge-muted">In-Store Only</span>
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.35rem' }}>{fish.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        {fish.description || 'Freshwater catch from verified ponds.'}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pond-navy)' }}>
                        ₹{fish.unitPrice} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ kg</span>
                      </span>

                      <Link href={`/fish/${fish.id}`} className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}>
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Categories Discovery */}
        {!loading && categories.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--pond-navy)', marginBottom: '1.25rem' }}>
              Fish Categories
            </h2>
            <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {categories.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.id}`} className="pf-card" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏷️</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{cat.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--pond-blue)', fontWeight: 600, marginTop: '0.5rem', display: 'inline-block' }}>
                    Browse Category →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Active Discounts */}
        {!loading && discounts.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--pond-navy)', marginBottom: '1.25rem' }}>
              Active Store Offers
            </h2>
            <div className="card-grid">
              {discounts.map((disc) => (
                <div key={disc.id} className="pf-card" style={{ borderLeft: '4px solid var(--offer-coral)' }}>
                  <span className="badge" style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'var(--offer-coral)', alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
                    {disc.discountPercent ? `${disc.discountPercent}% OFF` : `₹${disc.flatDiscountAmount} OFF`}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Code: {disc.discountCode}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    {disc.description || 'Active promotional discount.'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </>
  );
}
