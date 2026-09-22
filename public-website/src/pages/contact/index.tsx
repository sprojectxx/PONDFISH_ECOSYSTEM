import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <>
      <Head>
        <title>Store Location & Contact | PondFish</title>
        <meta name="description" content="Find PondFish physical store location, customer helpline details, and operating hours." />
      </Head>

      <section className="page-banner">
        <h1>Contact & Store Information</h1>
        <p>Visit our physical store or reach out to customer support.</p>
      </section>

      <div className="main-container" style={{ maxWidth: '800px' }}>
        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          
          <div className="pf-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📍</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--pond-navy)', marginBottom: '0.5rem' }}>
              Physical Store Location
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Main Fish Retail Store<br />
              Equipped with live aerated tanks, digital weighing scale integration, and worker tablet QR verification.
            </p>
          </div>

          <div className="pf-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏰</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--pond-navy)', marginBottom: '0.5rem' }}>
              Store Hours & Assistance
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Open daily during regular retail store operating hours.<br />
              Customer support assistance available during open store hours.
            </p>
            <Link href="/fish" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Browse Catalogue
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
