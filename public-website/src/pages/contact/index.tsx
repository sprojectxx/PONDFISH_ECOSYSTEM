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

      <div className="main-container-narrow">
        <div className="card-grid">
          
          <div className="pf-card">
            <div style={{ fontSize: '2rem' }} className="mb-sm" aria-hidden="true">📍</div>
            <h2 className="card-title">Physical Store Location</h2>
            <p className="card-description">
              Main Fish Retail Store<br />
              Equipped with live aerated tanks, digital weighing scale integration, and worker tablet QR verification.
            </p>
          </div>

          <div className="pf-card">
            <div style={{ fontSize: '2rem' }} className="mb-sm" aria-hidden="true">⏰</div>
            <h2 className="card-title">Store Hours & Assistance</h2>
            <p className="card-description mb-md">
              Open daily during regular retail store operating hours.<br />
              Customer support assistance available during open store hours.
            </p>
            <Link href="/fish" className="btn btn-primary btn-full">
              Browse Catalogue
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}
