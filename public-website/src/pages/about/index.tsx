import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Store & Operations | PondFish</title>
        <meta name="description" content="Learn about PondFish freshwater fish discovery, physical store operations, and live stock booking system." />
      </Head>

      <section className="page-banner">
        <h1>About PondFish</h1>
        <p>Freshwater fish retail & digital stock reservation system.</p>
      </section>

      <div className="main-container" style={{ maxWidth: '800px' }}>
        <div className="pf-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--pond-navy)', marginBottom: '0.85rem' }}>
            Freshwater Fish Discovery & Retail
          </h2>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>
            PondFish provides freshwater fish species directly from verified local ponds. Our digital ecosystem integrates real-time physical store inventory, category browsing, and 48-hour online booking stock reservations.
          </p>

          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--pond-navy)', marginBottom: '0.5rem' }}>
            Core System Features
          </h3>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            <li>Real-time physical store inventory tracking across species and batches.</li>
            <li>Separate visibility for physical store availability and 48-hour online booking eligibility.</li>
            <li>Automated 48-hour booking expiry to ensure fair stock release.</li>
            <li>Integrated worker tablet verification and receipt generation.</li>
          </ul>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', gap: '1rem' }}>
            <Link href="/fish" className="btn btn-primary">
              Explore Fish Catalogue
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Contact & Store Hours
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
