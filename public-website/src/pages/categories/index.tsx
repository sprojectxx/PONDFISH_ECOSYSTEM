import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Category, ApiResponse } from '../../types';
import { LoadingState, EmptyState, ErrorState } from '../../components/UIStates';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/categories`);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

      const data: ApiResponse<Category[]> = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Failed to load categories');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load categories.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <>
      <Head>
        <title>Fish Categories | PondFish</title>
        <meta name="description" content="Discover freshwater fish categories available at PondFish." />
      </Head>

      <section className="page-banner">
        <h1>Fish Categories</h1>
        <p>Explore freshwater fish species organized by category.</p>
      </section>

      <div className="main-container">
        {loading && <LoadingState message="Loading fish categories..." />}
        {error && !loading && <ErrorState message={error} onRetry={loadCategories} />}

        {!loading && !error && categories.length === 0 && (
          <EmptyState
            title="No Categories Configured"
            description="Categories have not been populated in the store catalogue."
          />
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="card-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="pf-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏷️</div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--pond-navy)' }}>
                    {cat.name}
                  </h2>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.5rem' }}>
                  <Link href={`/categories/${cat.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                    Browse Category →
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
