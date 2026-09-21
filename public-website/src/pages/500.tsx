import React from 'react';
import Link from 'next/link';

export default function Custom500() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div style={{ fontSize: '80px', fontWeight: 900, color: 'var(--badge-red)', lineHeight: 1 }}>
        500
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '1rem 0 0.5rem 0', color: 'var(--text-dark)' }}>
        Server Connection Error
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2rem auto', fontSize: '16px' }}>
        We encountered a temporary connection issue communicating with the PondFish backend. Please try refreshing or check back in a moment.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Retry Connection
        </button>
        <Link href="/" style={{ padding: '0.8rem 1.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: 'var(--text-dark)', fontWeight: 600 }}>
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}
