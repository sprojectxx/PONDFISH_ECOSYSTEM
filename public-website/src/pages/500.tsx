import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom500Page() {
  return (
    <>
      <Head>
        <title>500 Server Error | PondFish</title>
      </Head>

      <div className="main-container" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--offer-coral)', lineHeight: 1 }}>
          500
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '1rem 0 0.5rem 0', color: 'var(--text-primary)' }}>
          Server Connection Error
        </h1>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2rem auto', fontSize: '0.95rem' }}>
          We encountered a temporary connection issue communicating with the PondFish backend service.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry Connection
          </button>
          <Link href="/" className="btn btn-secondary">
            Go to Homepage
          </Link>
        </div>
      </div>
    </>
  );
}
