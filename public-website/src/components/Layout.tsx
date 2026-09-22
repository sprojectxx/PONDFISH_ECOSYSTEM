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
    { label: 'Fish Catalogue', path: '/fish' },
    { label: 'Categories', path: '/categories' },
    { label: 'Discounts & Offers', path: '/discounts' },
    { label: 'Booking Entry', path: '/booking' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Navigation */}
      <header className="site-header">
        <div className="header-container">
          
          <Link href="/" className="brand-logo" aria-label="PondFish Homepage">
            <div className="brand-icon">P</div>
            <span className="brand-title">PondFish</span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main Navigation">
            <ul className="desktop-nav">
              {navItems.map((item) => {
                const isActive = router.pathname === item.path || (item.path !== '/' && router.pathname.startsWith(item.path));
                return (
                  <li key={item.path}>
                    <Link 
                      href={item.path} 
                      className={`nav-link ${isActive ? 'active' : ''}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Menu Toggle Button */}
          <button 
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div style={{ backgroundColor: 'var(--pond-navy)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path} 
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: router.pathname === item.path ? '#ffffff' : '#D9E2EC', fontWeight: 600, padding: '0.5rem 0', textDecoration: 'none' }}
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
      <footer className="site-footer">
        <div className="footer-container">
          <div>
            <h3 className="footer-title">PondFish</h3>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              Freshwater fish discovery & retail store operations. Real-time availability, category browsing, and 48-hour online booking reservation entries.
            </p>
          </div>

          <div>
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/fish">Fish Catalogue</Link></li>
              <li><Link href="/categories">Fish Categories</Link></li>
              <li><Link href="/discounts">Active Discounts</Link></li>
              <li><Link href="/booking">Online Booking Entry</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Information & Contact</h4>
            <ul className="footer-links">
              <li><Link href="/about">About Store</Link></li>
              <li><Link href="/contact">Store Location & Hours</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} PondFish. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
