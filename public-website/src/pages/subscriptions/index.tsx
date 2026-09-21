import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function SubscriptionsPage() {
  const plans = [
    {
      id: 'plan-basic',
      title: 'Freshness Starter Plan',
      price: 999,
      creditAmount: 1100,
      weeklyQtyLimitKg: 3.0,
      validityDays: 30,
      features: [
        '₹1,100 Subscription Credit Balance (10% Bonus)',
        '3.0 kg Weekly Fish Allocation Limit',
        '30-Day Validity Window',
        'Priority 48-Hour Online Booking Slot Access',
        'Auto-Credit Debit on In-Store / Truck Checkout'
      ]
    },
    {
      id: 'plan-family',
      title: 'Family Feast Plan',
      price: 2499,
      creditAmount: 2850,
      weeklyQtyLimitKg: 8.0,
      validityDays: 60,
      popular: true,
      features: [
        '₹2,850 Subscription Credit Balance (14% Bonus)',
        '8.0 kg Weekly Fish Allocation Limit',
        '60-Day Validity Window',
        'Guaranteed Live Stock Reservation Access',
        'Free Home Delivery on Mobile Truck Routes'
      ]
    },
    {
      id: 'plan-pro',
      title: 'Commercial / bulk Plan',
      price: 4999,
      creditAmount: 5800,
      weeklyQtyLimitKg: 20.0,
      validityDays: 90,
      features: [
        '₹5,800 Subscription Credit Balance (16% Bonus)',
        '20.0 kg Weekly Fish Allocation Limit',
        '90-Day Validity Window',
        'Dedicated Store Relationship Manager',
        'Custom Fresh Fish Harvest Scheduling'
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Weekly Fish Subscription Plans | PondFish</title>
        <meta name="description" content="Subscribe to weekly freshwater fish allocations with bonus credit balance, guaranteed stock reservations, and zero-adulteration quality assurance." />
      </Head>

      <div style={{ backgroundColor: 'var(--primary-deep-aqua)', color: '#fff', padding: '3.5rem 1rem', textAlign: 'center' }}>
        <div className="container">
          <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Weekly Allocation & Credit Savings
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.75rem', fontFamily: "'Outfit', sans-serif" }}>
            Freshwater Fish Subscriptions
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '640px', margin: '0.5rem auto 0 auto' }}>
            Enjoy guaranteed fresh fish supply, bonus wallet balance, and priority 48-hour booking reservations.
          </p>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        
        <div className="grid-3" style={{ alignItems: 'stretch' }}>
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className="card" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                border: plan.popular ? '2px solid #00A896' : '1px solid #E2E8F0',
                position: 'relative'
              }}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-14px', right: '20px', background: '#00A896', color: '#fff', padding: '2px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800 }}>
                  MOST POPULAR
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-deep-aqua)', marginBottom: '0.5rem' }}>
                  {plan.title}
                </h3>
                
                <div style={{ margin: '1rem 0', paddingBottom: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-dark)' }}>
                    ₹{plan.price}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}> / {plan.validityDays} Days</span>

                  <div style={{ marginTop: '0.5rem', background: '#ECFDF5', color: '#065F46', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, display: 'inline-block' }}>
                    Gets ₹{plan.creditAmount} Store Credit
                  </div>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                  {plan.features.map((feat, idx) => (
                    <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ color: '#10B981', fontWeight: 800 }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
                <Link 
                  href={`/catalog?plan=${plan.id}`} 
                  className="btn-primary" 
                  style={{ width: '100%', textAlign: 'center', display: 'block', padding: '0.75rem' }}
                >
                  Select Plan & Subscribe
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Subscription Rules Banner */}
        <div style={{ marginTop: '4rem', background: '#F8FAFC', padding: '2rem', borderRadius: '12px', border: '1px solid #CBD5E1' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary-deep-aqua)' }}>
            📋 Subscription Rules & Allocation Policy
          </h3>
          <ul style={{ listStyle: 'circle', paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
            <li>Subscription credits can be used for both 48-hour online booking reservations and direct store/truck checkouts.</li>
            <li>Weekly quantity limits reset every 7 elapsed days from subscription activation.</li>
            <li>If a booking expires without worker completion, debited subscription credits are automatically refunded to your credit balance.</li>
          </ul>
        </div>

      </div>
    </>
  );
}
