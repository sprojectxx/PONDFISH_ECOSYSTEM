import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FishItem, Category, DiscountOffer, ApiResponse } from '../types';
import { LoadingState, EmptyState, ErrorState } from '../components/UIStates';
import { getApiBaseUrl } from '../utils/apiConfig';

interface SectionState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export default function HomePage() {
  const [fishState, setFishState] = useState<SectionState<FishItem>>({ data: [], loading: true, error: null });
  const [categoryState, setCategoryState] = useState<SectionState<Category>>({ data: [], loading: true, error: null });
  const [discountState, setDiscountState] = useState<SectionState<DiscountOffer>>({ data: [], loading: true, error: null });

  const API_BASE = getApiBaseUrl();

  const loadFish = async () => {
    setFishState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/fish`);
      if (!res.ok) throw new Error(`Server error (${res.status}) fetching fish catalogue.`);
      const result: ApiResponse<FishItem[]> = await res.json();
      if (result.success) {
        setFishState({ data: result.data || [], loading: false, error: null });
      } else {
        throw new Error(result.error?.message || 'Failed to load fish catalogue.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure loading fish catalogue.';
      setFishState({ data: [], loading: false, error: msg });
    }
  };

  const loadCategories = async () => {
    setCategoryState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/categories`);
      if (!res.ok) throw new Error(`Server error (${res.status}) fetching categories.`);
      const result: ApiResponse<Category[]> = await res.json();
      if (result.success) {
        setCategoryState({ data: result.data || [], loading: false, error: null });
      } else {
        throw new Error(result.error?.message || 'Failed to load categories.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure loading categories.';
      setCategoryState({ data: [], loading: false, error: msg });
    }
  };

  const loadDiscounts = async () => {
    setDiscountState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/discounts`);
      if (!res.ok) throw new Error(`Server error (${res.status}) fetching active offers.`);
      const result: ApiResponse<DiscountOffer[]> = await res.json();
      if (result.success) {
        setDiscountState({ data: result.data || [], loading: false, error: null });
      } else {
        throw new Error(result.error?.message || 'Failed to load active offers.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure loading active offers.';
      setDiscountState({ data: [], loading: false, error: msg });
    }
  };

  useEffect(() => {
    loadFish();
    loadCategories();
    loadDiscounts();
  }, []);

  return (
    <>
      <Head>
        <title>PondFish | Freshwater Fish Discovery & Retail</title>
        <meta name="description" content="Discover fresh arrival freshwater fish, browse categories, check store availability, and enter 48-hour online booking reservations." />
      </Head>

      {/* Hero Banner */}
      <section className="page-banner">
        <h1>Freshwater Fish Discovery</h1>
        <p>Explore arrival stock, category availability, and online 48-hour booking reservations.</p>
        <div className="hero-cta-group">
          <Link href="/fish" className="btn btn-primary">
            Browse Fish Catalogue
          </Link>
          <Link href="/categories" className="btn btn-secondary">
            View Categories
          </Link>
        </div>
      </section>

      <div className="main-container">

        {/* Featured Fish Section */}
        <section className="section-block">
          <div className="section-header">
            <h2 className="section-title">Today's Fish Catalogue</h2>
            <Link href="/fish" className="section-link">
              View All Fish →
            </Link>
          </div>

          {fishState.loading && <LoadingState message="Loading current fish availability..." />}
          {fishState.error && !fishState.loading && (
            <ErrorState title="Fish Catalogue Unavailable" message={fishState.error} onRetry={loadFish} />
          )}
          {!fishState.loading && !fishState.error && fishState.data.length === 0 && (
            <EmptyState title="No Fish Currently Listed" description="Store receiving in progress. Please check back shortly." />
          )}
          {!fishState.loading && !fishState.error && fishState.data.length > 0 && (
            <div className="card-grid">
              {fishState.data.slice(0, 6).map((fish) => (
                <div key={fish.id} className="pf-card">
                  <div>
                    <div className="card-header-meta">
                      <span className={`badge ${fish.freshnessState === 'GREEN' ? 'badge-green' : 'badge-amber'}`}>
                        {fish.freshnessState === 'GREEN' ? 'Fresh' : 'Standard'}
                      </span>
                      {fish.onlineBookable ? (
                        <span className="badge badge-blue">Online Bookable</span>
                      ) : (
                        <span className="badge badge-muted">In-Store Only</span>
                      )}
                    </div>

                    <h3 className="card-title">{fish.name}</h3>
                    <p className="card-description">
                      {fish.description || 'Freshwater catch available in store.'}
                    </p>
                  </div>

                  <div className="card-footer">
                    <span className="card-price">
                      ₹{fish.unitPrice} <span className="card-price-unit">/ kg</span>
                    </span>

                    <Link href={`/fish/${fish.id}`} className="btn btn-secondary btn-sm">
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Categories Section */}
        <section className="section-block">
          <div className="section-header">
            <h2 className="section-title">Fish Categories</h2>
            <Link href="/categories" className="section-link">
              All Categories →
            </Link>
          </div>

          {categoryState.loading && <LoadingState message="Loading categories..." />}
          {categoryState.error && !categoryState.loading && (
            <ErrorState title="Categories Unavailable" message={categoryState.error} onRetry={loadCategories} />
          )}
          {!categoryState.loading && !categoryState.error && categoryState.data.length > 0 && (
            <div className="card-grid-sm">
              {categoryState.data.map((cat) => (
                <Link key={cat.id} href={`/categories/${cat.id}`} className="pf-card text-center">
                  <div style={{ fontSize: '2rem' }} aria-hidden="true">🏷️</div>
                  <h3 className="card-title mb-sm">{cat.name}</h3>
                  <span className="section-link">Browse →</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Active Discounts Section */}
        <section className="section-block">
          <div className="section-header">
            <h2 className="section-title">Active Store Offers</h2>
            <Link href="/discounts" className="section-link">
              View Offers →
            </Link>
          </div>

          {discountState.loading && <LoadingState message="Loading active store offers..." />}
          {discountState.error && !discountState.loading && (
            <ErrorState title="Offers Unavailable" message={discountState.error} onRetry={loadDiscounts} />
          )}
          {!discountState.loading && !discountState.error && discountState.data.length > 0 && (
            <div className="card-grid">
              {discountState.data.map((disc) => (
                <div key={disc.id} className="pf-card pf-card-offer">
                  <span className="badge badge-coral mb-sm">
                    {disc.discountPercent ? `${disc.discountPercent}% OFF` : `₹${disc.flatDiscountAmount} OFF`}
                  </span>
                  <h3 className="card-title">Code: {disc.discountCode}</h3>
                  <p className="card-description">
                    {disc.description || 'Active promotional discount.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </>
  );
}
