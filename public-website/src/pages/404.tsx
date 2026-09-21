import React from 'react';
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '5rem 1rem' }}>
      <div style={{ fontSize: '80px', fontWeight: 900, color: 'var(--primary-deep-aqua)', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '1rem 0 0.5rem 0', color: 'var(--text-dark)' }}>
        Fish Page Not Found
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 2rem auto', fontSize: '16px' }}>
        The page or fish catalogue route you are looking for does not exist or has been relocated.
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <Link href="/catalog" className="btn-primary">
          Browse Fish Catalogue
        </Link>
        <Link href="/" style={{ padding: '0.8rem 1.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', color: 'var(--text-dark)', fontWeight: 600 }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
