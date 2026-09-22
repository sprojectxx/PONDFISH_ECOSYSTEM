import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404Page() {
  return (
    <>
      <Head>
        <title>404 Page Not Found | PondFish</title>
      </Head>

      <div className="main-container" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--pond-navy)', lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '1rem 0 0.5rem 0', color: 'var(--text-primary)' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2rem auto', fontSize: '0.95rem' }}>
          The catalogue page or route you are looking for does not exist or has been relocated.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/fish" className="btn btn-primary">
            Browse Fish Catalogue
          </Link>
          <Link href="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}
