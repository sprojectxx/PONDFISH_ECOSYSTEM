import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Category, ApiResponse } from '../../types';
import { LoadingState, EmptyState, ErrorState } from '../../components/UIStates';
import { getApiBaseUrl } from '../../utils/apiConfig';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = getApiBaseUrl();

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/v1/public/categories`);
      if (!res.ok) throw new Error(`Server error (${res.status}) fetching categories.`);

      const data: ApiResponse<Category[]> = await res.json();
      if (data.success) {
        setCategories(data.data || []);
      } else {
        throw new Error(data.error?.message || 'Failed to load categories.');
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
        {loading && <LoadingState message="Loading categories..." />}
        {error && !loading && <ErrorState title="Categories Unavailable" message={error} onRetry={loadCategories} />}

        {!loading && !error && categories.length === 0 && (
          <EmptyState
            title="No Categories Configured"
            description="Categories have not been populated in the store catalogue."
          />
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="card-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="pf-card">
                <div>
                  <div style={{ fontSize: '2.5rem' }} className="mb-sm" aria-hidden="true">🏷️</div>
                  <h2 className="card-title">{cat.name}</h2>
                </div>

                <div className="card-footer" style={{ marginTop: '1.5rem' }}>
                  <Link href={`/categories/${cat.id}`} className="btn btn-primary btn-full">
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
