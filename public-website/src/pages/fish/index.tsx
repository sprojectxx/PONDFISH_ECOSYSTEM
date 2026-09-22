import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FishItem, Category, ApiResponse } from '../../types';
import { LoadingState, EmptyState, ErrorState } from '../../components/UIStates';

export default function FishCataloguePage() {
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const loadCatalogue = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fishRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/public/fish`),
        fetch(`${API_BASE}/api/v1/public/categories`),
      ]);

      if (!fishRes.ok) throw new Error(`HTTP Error ${fishRes.status}`);

      const fishData: ApiResponse<FishItem[]> = await fishRes.json();
      if (fishData.success) {
        setFishList(fishData.data || []);
      } else {
        throw new Error(fishData.error?.message || 'Failed to fetch catalogue');
      }

      if (catRes.ok) {
        const catData: ApiResponse<Category[]> = await catRes.json();
        if (catData.success) setCategories(catData.data || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error loading fish catalogue.';
      console.error('Catalogue fetch error:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogue();
  }, []);

  const filteredFish = fishList.filter((fish) => {
    const matchesSearch = fish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (fish.description && fish.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || fish.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <>
      <Head>
        <title>Fish Catalogue | PondFish</title>
        <meta name="description" content="Browse all available freshwater fish species, check freshness status, and view online booking eligibility." />
      </Head>

      <section className="page-banner">
        <h1>Fish Catalogue</h1>
        <p>Real-time physical store availability & online booking eligibility status.</p>
      </section>

      <div className="main-container">
        {/* Search & Filter Bar */}
        <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="🔍 Search fish by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '220px', padding: '0.65rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.95rem' }}
              aria-label="Search fish catalogue"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="btn btn-secondary">
                Clear Search
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`btn ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading / Error States */}
        {loading && <LoadingState message="Fetching live fish inventory..." />}
        {error && !loading && <ErrorState message={error} onRetry={loadCatalogue} />}

        {/* Empty State */}
        {!loading && !error && filteredFish.length === 0 && (
          <EmptyState
            title={searchQuery ? 'No Matching Fish Found' : 'No Fish Available'}
            description={searchQuery ? `No fish match "${searchQuery}". Try clearing search or selecting another category.` : 'Catalogue receiving is in progress.'}
            actionLabel={searchQuery ? 'Clear Search' : 'Refresh'}
            onAction={() => { setSearchQuery(''); setSelectedCategory('ALL'); loadCatalogue(); }}
          />
        )}

        {/* Fish Cards Grid */}
        {!loading && !error && filteredFish.length > 0 && (
          <div className="card-grid">
            {filteredFish.map((fish) => (
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

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.35rem' }}>{fish.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    {fish.description || 'Freshwater catch available in store.'}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Unit Price</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--pond-navy)' }}>
                      ₹{fish.unitPrice} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ kg</span>
                    </span>
                  </div>

                  <Link href={`/fish/${fish.id}`} className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
                    View Details
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
