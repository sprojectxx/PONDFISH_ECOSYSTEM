import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FishItem, Category, ApiResponse } from '../../types';
import { LoadingState, EmptyState, ErrorState } from '../../components/UIStates';

export default function CategoryDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [category, setCategory] = useState<Category | null>(null);
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

      if (!fishRes.ok) throw new Error(`HTTP Error ${fishRes.status}`);
      const fishData: ApiResponse<FishItem[]> = await fishRes.json();
      if (fishData.success && fishData.data) {
        setFishList(fishData.data.filter((f) => f.categoryId === catId));
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
        <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--pond-blue)' }}>Home</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <Link href="/categories" style={{ color: 'var(--pond-blue)' }}>Categories</Link>
          <span style={{ margin: '0 0.5rem' }}>/</span>
          <span>{category ? category.name : 'Detail'}</span>
        </nav>

        {loading && <LoadingState message="Loading category fish data..." />}
        {error && !loading && (
          <ErrorState message={error} onRetry={() => id && typeof id === 'string' && loadCategoryData(id)} />
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
                    {fish.description || 'Freshwater catch available in store.'}
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
      </div>
    </>
  );
}
