import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FishItem, ApiResponse } from '../../types';
import { LoadingState, ErrorState } from '../../components/UIStates';
import { getApiBaseUrl } from '../../utils/apiConfig';

export default function BookingEntryPage() {
  const router = useRouter();
  const { fishId } = router.query;

  const [selectedFish, setSelectedFish] = useState<FishItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = getApiBaseUrl();

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
          } else {
            throw new Error(data.error?.message || 'Fish record not found.');
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

      <div className="main-container-sm">
        
        {loading && <LoadingState message="Checking booking eligibility..." />}

        {error && !loading && (
          <ErrorState
            title="Booking Action Unavailable"
            message={error}
            onRetry={() => router.push('/fish')}
          />
        )}

        {!loading && !error && selectedFish && (
          <div className="pf-card">
            <span className="badge badge-green mb-sm" style={{ alignSelf: 'flex-start' }}>
              Eligible for 48-Hour Reservation
            </span>
            <h2 className="card-title mb-sm">{selectedFish.name}</h2>
            <div className="card-price mb-md" style={{ color: 'var(--pond-blue)' }}>
              Rate: ₹{selectedFish.unitPrice} / kg
            </div>

            <p className="card-description mb-lg">
              Submitting a booking request reserves physical inventory for 48 elapsed hours. Authenticated customer credentials are required to complete reservation.
            </p>

            <div className="flex-row-gap">
              <Link href="/fish" className="btn btn-secondary flex-1">
                Back to Catalogue
              </Link>
              <Link href="/contact" className="btn btn-primary flex-1">
                Store Directions
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && !selectedFish && (
          <div className="pf-card text-center" style={{ padding: '2.5rem 1.5rem' }}>
            <div style={{ fontSize: '2.5rem' }} className="mb-sm" aria-hidden="true">📋</div>
            <h2 className="card-title mb-sm">Select a Fish to Reserve</h2>
            <p className="card-description mb-lg">
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
