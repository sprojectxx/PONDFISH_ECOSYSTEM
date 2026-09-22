import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FishItem, Category, ApiResponse } from '../../types';
import { LoadingState, EmptyState, ErrorState } from '../../components/UIStates';
import { getApiBaseUrl } from '../../utils/apiConfig';

export default function CategoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [category, setCategory] = useState<Category | null>(null);
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = getApiBaseUrl();

  const loadCategoryData = async (catId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, fishRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/public/categories`),
        fetch(`${API_BASE}/api/v1/public/fish?categoryId=${catId}`),
      ]);

      if (catRes.ok) {
        const catData: ApiResponse<Category[]> = await catRes.json();
        if (catData.success && catData.data) {
          const found = catData.data.find((c) => c.id === catId);
          if (found) setCategory(found);
        }
      }

      if (!fishRes.ok) throw new Error(`Server error (${fishRes.status}) loading category fish list.`);
      const fishData: ApiResponse<FishItem[]> = await fishRes.json();
      if (fishData.success && fishData.data) {
        setFishList(fishData.data.filter((f) => f.categoryId === catId));
      } else {
        throw new Error(fishData.error?.message || 'Failed to load category fish list.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to load category fish list.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadCategoryData(id);
    }
  }, [id]);

  return (
    <>
      <Head>
        <title>{category ? `${category.name} | Category` : 'Category | PondFish'}</title>
      </Head>

      <section className="page-banner">
        <h1>{category ? category.name : 'Category'}</h1>
        <p>Fish listed under this category.</p>
      </section>

      <div className="main-container">
        <nav aria-label="Breadcrumb" className="breadcrumb-nav">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <span className="breadcrumb-separator">/</span>
          <Link href="/categories" className="breadcrumb-link">Categories</Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{category ? category.name : 'Detail'}</span>
        </nav>

        {loading && <LoadingState message="Loading category fish..." />}
        {error && !loading && (
          <ErrorState title="Category Data Unavailable" message={error} onRetry={() => id && typeof id === 'string' && loadCategoryData(id)} />
        )}

        {!loading && !error && fishList.length === 0 && (
          <EmptyState
            title="No Fish Available in This Category"
            description="There are currently no active fish listed under this category."
            actionLabel="Browse All Fish"
            onAction={() => router.push('/fish')}
          />
        )}

        {!loading && !error && fishList.length > 0 && (
          <div className="card-grid">
            {fishList.map((fish) => (
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
      </div>
    </>
  );
}
