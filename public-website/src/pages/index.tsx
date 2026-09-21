import React from 'react';
import Link from 'next/link';

export default function Home() {
  const [fishList, setFishList] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('http://localhost:5000/api/v1/public/fish')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFishList(data.data || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <header className="header">
        <div className="logo">PONDFISH</div>
        <ul className="nav-links">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/catalog">Fish Catalog</Link></li>
          <li><Link href="/subscriptions">Subscriptions</Link></li>
          <li><Link href="/about">About Store</Link></li>
        </ul>
      </header>

      <section className="hero">
        <h1>Fresh & Live Pond Fish Everyday</h1>
        <p>Direct from local freshwater ponds to your table. Guarantee of 100% live freshness.</p>
        <Link href="/catalog" className="btn-primary">Browse Today's Fish</Link>
      </section>

      <main className="container">
        <h2 style={{ marginBottom: '1.5rem' }}>Today's Fresh Fish Arrival</h2>

        {loading ? (
          <p>Loading fresh catalog...</p>
        ) : fishList.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>No Fish Currently Listed</h3>
            <p style={{ color: 'var(--text-muted)' }}>Store stock receiving in progress. Please check back shortly.</p>
          </div>
        ) : (
          <div className="grid-3">
            {fishList.map((fish: any) => (
              <div key={fish.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-green">{fish.freshnessState} FRESH</span>
                  {fish.onlineBookable ? (
                    <span className="badge badge-green">ONLINE BOOKABLE</span>
                  ) : (
                    <span className="badge badge-grey">STORE ONLY</span>
                  )}
                </div>
                <h3>{fish.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  {fish.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary-deep-aqua)' }}>
                    ₹{fish.unitPrice} / kg
                  </span>
                  {fish.onlineBookable && (
                    <Link href="/catalog" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                      Book Online
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} PondFish Retail Ecosystem. All rights reserved.</p>
        <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Physical Store: 123 Fresh Lake Road, Water Town | Phone: +91 9876543210</p>
      </footer>
    </div>
  );
}
