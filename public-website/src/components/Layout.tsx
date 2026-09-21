import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Fish Catalogue', path: '/catalog' },
    { label: 'Subscriptions', path: '/subscriptions' },
    { label: 'Offers & Discounts', path: '/offers' },
    { label: 'How It Works', path: '/how-it-works' },
    { label: 'About Store & Truck', path: '/about' },
    { label: 'Track Booking', path: '/bookings' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-light)', color: 'var(--text-dark)' }}>
      {/* Top Banner Notice */}
      <div style={{ backgroundColor: '#0284c7', color: '#ffffff', textAlign: 'center', padding: '6px 16px', fontSize: '13px', fontWeight: 600, letterSpacing: '0.2px' }}>
        🐟 100% Live Pond Freshness Guarantee • Store #01 Open Daily 7:00 AM – 8:30 PM • Mobile Truck #1 Active
      </div>

      {/* Main Header / Navigation */}
      <header className="header" style={{ position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{ background: 'linear-gradient(135deg, #00A896, #028090)', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#ffffff', fontSize: '20px' }}>
              P
            </div>
            <div>
              <span className="logo" style={{ color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>PONDFISH</span>
              <span style={{ display: 'block', fontSize: '10px', color: '#94a3b8', marginTop: '-4px', letterSpacing: '1px' }}>FRESHWATER RETAIL</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <ul className="nav-links">
              {navItems.map((item) => {
                const isActive = router.pathname === item.path || (item.path !== '/' && router.pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <Link 
                      href={item.path} 
                      style={{ 
                        color: isActive ? '#00A896' : '#f8fafc', 
                        fontWeight: isActive ? 700 : 500,
                        borderBottom: isActive ? '2px solid #00A896' : 'none',
                        paddingBottom: '4px'
                      }}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Menu Hamburger Toggle */}
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', padding: '6px 12px', fontSize: '18px', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{ width: '100%', background: '#0F4C81', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path} 
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: router.pathname === item.path ? '#00A896' : '#fff', fontWeight: 600, padding: '8px 0', textDecoration: 'none' }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Body */}
      <main style={{ flex: 1 }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', textAlign: 'left', marginBottom: '30px' }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '18px', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>PondFish Retail MVP</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#94A3B8' }}>
              Direct freshwater pond-to-table delivery & physical store operations. Guaranteed 100% fresh live catch with AI bill verification and 48-hour booking expiry guarantee.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '15px', marginBottom: '12px' }}>Quick Discovery</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><Link href="/catalog" style={{ color: '#94A3B8' }}>Today's Fresh Fish Catch</Link></li>
              <li><Link href="/subscriptions" style={{ color: '#94A3B8' }}>Weekly Subscription Plans</Link></li>
              <li><Link href="/offers" style={{ color: '#94A3B8' }}>Active Discounts & Coupons</Link></li>
              <li><Link href="/bookings" style={{ color: '#94A3B8' }}>Track Booking Status</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#fff', fontSize: '15px', marginBottom: '12px' }}>Store & Mobile Truck</h4>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '6px' }}>📍 <strong>Main Store #01:</strong> Plot 42, Fresh Lake Road, Sector 62</p>
            <p style={{ fontSize: '14px', color: '#94A3B8', marginBottom: '6px' }}>🚚 <strong>Mobile Truck #1:</strong> Sector 62 Main Market Route</p>
            <p style={{ fontSize: '14px', color: '#94A3B8' }}>📞 Helpline: +91 98765 43210</p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', fontSize: '13px', color: '#64748B' }}>
          © {new Date().getFullYear()} PondFish Ecosystem. All rights reserved. Single Store + One Truck Baseline Architecture.
        </div>
      </footer>
    </div>
  );
}
