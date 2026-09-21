import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function OffersPage() {
  const discounts = [
    {
      code: 'FRESH10',
      title: '10% Off First Booking',
      description: 'Applicable on all freshwater fish online bookings of 2kg or more.',
      discountPercent: 10,
      validUntil: '30 Sep 2026',
      badge: 'POPULAR'
    },
    {
      code: 'PRAWNS50',
      title: 'Flat ₹50 Off Tiger Prawns',
      description: 'Exclusive discount code for in-store & truck cash checkout on jumbo prawns.',
      flatDiscountAmount: 50,
      validUntil: '15 Oct 2026',
      badge: 'STORE ONLY'
    },
    {
      code: 'WEEKEND20',
      title: '20% Weekend Fish Feast',
      description: 'Special weekend harvest offer on Catla & Rohu freshwater catch.',
      discountPercent: 20,
      validUntil: 'Every Sat-Sun',
      badge: 'WEEKEND'
    }
  ];

  return (
    <>
      <Head>
        <title>Active Discounts & Coupon Offers | PondFish</title>
        <meta name="description" content="View active promotions, discount codes, and seasonal freshwater catch deals at PondFish Store #01 and Mobile Truck #1." />
      </Head>

      <div style={{ backgroundColor: 'var(--primary-deep-aqua)', color: '#fff', padding: '3.5rem 1rem', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
            Active Offers & Discount Coupons
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
            Save on your daily fresh fish catch with verified promotional discounts.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="grid-3">
          {discounts.map((offer) => (
            <div key={offer.code} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge badge-yellow">{offer.badge}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Valid: {offer.validUntil}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-deep-aqua)', marginBottom: '0.5rem' }}>
                  {offer.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                  {offer.description}
                </p>
              </div>

              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px border-dashed #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>COUPON CODE</span>
                  <strong style={{ fontSize: '1.2rem', letterSpacing: '1px', color: 'var(--primary-ocean-blue)' }}>{offer.code}</strong>
                </div>
                <Link href="/catalog" className="btn-primary" style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
                  Apply & Shop
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
