import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About Store #01 & Mobile Truck #1 | PondFish</title>
        <meta name="description" content="Discover PondFish physical store location, Mobile Delivery Truck #1 route schedule, and our mission for fresh live catch." />
      </Head>

      <div style={{ backgroundColor: 'var(--primary-deep-aqua)', color: '#fff', padding: '3.5rem 1rem', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            About PondFish Store & Mobile Truck
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Single Store + One Truck MVP Operational Baseline.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '5rem' }}>
        
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Store Location Card */}
          <div className="card">
            <div style={{ display: 'inline-block', background: '#E0F2FE', color: '#0369A1', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, marginBottom: '1rem' }}>
              📍 PHYSICAL STORE LOCATION
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-deep-aqua)', marginBottom: '0.5rem' }}>
              Main Store #01
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              Plot 42, Fresh Lake Road, Sector 62 Market.<br />
              Equipped with live aerated tanks, digital scale integration, and worker tablet QR scanner.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontWeight: 600, background: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
              ⏰ Timings: 7:00 AM – 8:30 PM (Daily)
            </div>
          </div>

          {/* Mobile Truck Card */}
          <div className="card">
            <div style={{ display: 'inline-block', background: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, marginBottom: '1rem' }}>
              🚚 MOBILE DELIVERY TRUCK #1
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-deep-aqua)', marginBottom: '0.5rem' }}>
              Truck Telemetry Unit
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              Active Mobile Truck serving residential apartment zones with live GPS location publishing.<br />
              Driver: Ramesh Singh • Vehicle: KA-01-PF-9081
            </p>
            <div style={{ fontSize: '0.85rem', color: '#047857', fontWeight: 600, background: '#ECFDF5', padding: '10px', borderRadius: '8px' }}>
              📡 GPS Status: ACTIVE_ROUTE (Sector 62 Market Zone)
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
