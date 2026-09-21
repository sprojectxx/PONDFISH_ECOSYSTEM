import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Fresh Catch Harvest & Verification',
      description: 'Daily morning harvest from verified local freshwater ponds. Each batch is inspected for live freshness and given a temperature & batch quality code.'
    },
    {
      step: '02',
      title: 'Online 48-Hour Stock Booking',
      description: 'Reserve your desired fish species (Rohu, Catla, Prawns) online. Stock is atomically reserved for 48 hours with a QR code generated for pickup.'
    },
    {
      step: '03',
      title: 'In-Store or Mobile Truck Pickup',
      description: 'Visit Store #01 or meet Mobile Truck #1 on its active route. Show your QR code to the worker tablet for instant verification and weighing.'
    },
    {
      step: '04',
      title: 'AI Bill Verification & Checkout',
      description: 'Worker verifies physical weight and issues an itemized receipt with 18% GST math. Real-time transaction appears on the Store TV display!'
    }
  ];

  return (
    <>
      <Head>
        <title>How PondFish Works | Farm-To-Table Quality</title>
        <meta name="description" content="Learn how PondFish guarantees 100% live freshwater fish catch, 48-hour booking stock protection, and worker QR verification." />
      </Head>

      <div style={{ backgroundColor: 'var(--primary-deep-aqua)', color: '#fff', padding: '3.5rem 1rem', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            How PondFish Works
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Transparent farm-to-table traceability with 48-hour inventory guarantee.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        <div className="grid-3" style={{ gap: '2rem' }}>
          {steps.map((item) => (
            <div key={item.step} className="card" style={{ position: 'relative', borderTop: '4px solid var(--primary-fresh-teal)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-ocean-blue)', opacity: 0.25, marginBottom: '0.5rem' }}>
                {item.step}
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary-deep-aqua)', marginBottom: '0.75rem' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '4rem', textAlign: 'center', background: 'linear-gradient(135deg, #0F4C81, #028090)', color: '#fff', padding: '3rem 2rem', borderRadius: '16px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1rem' }}>Ready for Guaranteed Live Freshness?</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem' }}>Browse today's available stock or explore our weekly subscription plans.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link href="/catalog" className="btn-primary" style={{ padding: '0.8rem 2rem' }}>
              Browse Fish Catalogue
            </Link>
            <Link href="/subscriptions" style={{ background: '#fff', color: 'var(--primary-deep-aqua)', padding: '0.8rem 2rem', borderRadius: '8px', fontWeight: 700 }}>
              View Subscriptions
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
