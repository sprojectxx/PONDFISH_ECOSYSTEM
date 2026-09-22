import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FishItem, ApiResponse } from '../../types';
import { LoadingState, ErrorState } from '../../components/UIStates';

export default function BookingEntryPage() {
  const router = useRouter();
  const { fishId } = router.query;

  const [selectedFish, setSelectedFish] = useState<FishItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (fishId && typeof fishId === 'string') {
      setLoading(true);
      setError(null);
      fetch(`${API_BASE}/api/v1/public/fish/${fishId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Fish record not found.');
          return res.json();
        })
        .then((data: ApiResponse<FishItem>) => {
          if (data.success && data.data) {
            if (!data.data.onlineBookable) {
              setError('This fish is currently not available for online booking. You may purchase it directly in store.');
            } else {
              setSelectedFish(data.data);
            }
          }
        })
        .catch((err) => {
          setError(err.message || 'Unable to check fish booking eligibility.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [fishId, API_BASE]);

  return (
    <>
      <Head>
        <title>Online Booking Entry | PondFish</title>
        <meta name="description" content="Online 48-hour stock booking reservation entry for PondFish." />
      </Head>

      <section className="page-banner">
        <h1>Online Stock Booking Entry</h1>
        <p>Transition from public discovery to authenticated customer stock reservation.</p>
      </section>

      <div className="main-container" style={{ maxWidth: '640px' }}>
        
        {loading && <LoadingState message="Verifying fish booking eligibility..." />}

        {error && !loading && (
          <ErrorState
            title="Booking Action Unavailable"
            message={error}
            onRetry={() => router.push('/fish')}
          />
        )}

        {!loading && !error && selectedFish && (
          <div className="pf-card">
            <span className="badge badge-green" style={{ alignSelf: 'flex-start', marginBottom: '0.75rem' }}>
              Eligible for 48-Hour Reservation
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pond-navy)', marginBottom: '0.5rem' }}>
              {selectedFish.name}
            </h2>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--pond-blue)', marginBottom: '1rem' }}>
              Rate: ₹{selectedFish.unitPrice} / kg
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Submitting a booking request reserves physical inventory for 48 elapsed hours. Authenticated customer credentials are required to complete reservation.
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/fish" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                Back to Catalogue
              </Link>
              <Link href={`/contact`} className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                Store Directions
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && !selectedFish && (
          <div className="pf-card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Select a Fish to Reserve
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Choose an online-bookable fish from our catalogue to begin the 48-hour stock reservation flow.
            </p>
            <Link href="/fish" className="btn btn-primary">
              Browse Fish Catalogue
            </Link>
          </div>
        )}

      </div>
    </>
  );
}
