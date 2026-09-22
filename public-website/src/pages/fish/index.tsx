import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FishItem, Category, ApiResponse } from '../../types';
import { LoadingState, EmptyState, ErrorState } from '../../components/UIStates';
import { getApiBaseUrl } from '../../utils/apiConfig';

export default function FishCataloguePage() {
  const [fishList, setFishList] = useState<FishItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const API_BASE = getApiBaseUrl();

  const loadCatalogue = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fishRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/public/fish`),
        fetch(`${API_BASE}/api/v1/public/categories`),
      ]);

      if (!fishRes.ok) throw new Error(`Server error (${fishRes.status}) loading fish catalogue.`);

      const fishData: ApiResponse<FishItem[]> = await fishRes.json();
      if (fishData.success) {
        setFishList(fishData.data || []);
      } else {
        throw new Error(fishData.error?.message || 'Failed to fetch catalogue.');
      }

      if (catRes.ok) {
        const catData: ApiResponse<Category[]> = await catRes.json();
        if (catData.success) setCategories(catData.data || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network failure loading fish catalogue.';
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
        <div className="filter-bar">
          <div className="search-group">
            <input
              type="text"
              placeholder="🔍 Search fish by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
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
            <div className="filter-pills">
              <button
                onClick={() => setSelectedCategory('ALL')}
                className={`btn btn-sm ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading / Error States */}
        {loading && <LoadingState message="Loading fish availability..." />}
        {error && !loading && <ErrorState title="Catalogue Unavailable" message={error} onRetry={loadCatalogue} />}

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
                  <div>
                    <span className="card-price-unit" style={{ display: 'block' }}>Unit Price</span>
                    <span className="card-price">
                      ₹{fish.unitPrice} <span className="card-price-unit">/ kg</span>
                    </span>
                  </div>

                  <Link href={`/fish/${fish.id}`} className="btn btn-primary btn-sm">
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
