import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Tv, 
  Sparkles, 
  CheckCircle2, 
  Truck, 
  Clock, 
  ShoppingBag, 
  TrendingUp, 
  Volume2, 
  VolumeX, 
  Award,
  Zap
} from 'lucide-react';

interface TransactionEvent {
  transactionId: string;
  orderId?: string;
  billId?: string;
  customerName: string;
  items: Array<{ name: string; quantityKg: number; price: number }>;
  totalAmount: number;
  workerName: string;
  timestamp: string;
  paymentMethod: string;
}

export default function App() {
  const [socketStatus, setSocketStatus] = useState<'CONNECTED' | 'DISCONNECTED'>('DISCONNECTED');
  const [activeCelebration, setActiveCelebration] = useState<TransactionEvent | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<TransactionEvent[]>([
    {
      transactionId: 'TXN-DEMO-901',
      billId: 'BILL-8891',
      customerName: 'Rajesh Sharma',
      items: [
        { name: 'Fresh Rohu Fish', quantityKg: 2.5, price: 550 },
        { name: 'Catla Fresh Catch', quantityKg: 1.0, price: 280 }
      ],
      totalAmount: 830,
      workerName: 'Sunil Kumar (Store)',
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'UPI'
    },
    {
      transactionId: 'TXN-DEMO-900',
      billId: 'BILL-8890',
      customerName: 'Priya Verma',
      items: [
        { name: 'Prem. Tiger Prawns', quantityKg: 1.5, price: 1125 }
      ],
      totalAmount: 1125,
      workerName: 'Truck Delivery Operator',
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      paymentMethod: 'CASH'
    }
  ]);

  const [storeStats, setStoreStats] = useState({
    todayRevenue: 24580,
    todayOrders: 34,
    totalKgSold: 86.5
  });

  const [truckStatus, setTruckStatus] = useState({
    name: 'Mobile Delivery Truck #1',
    driver: 'Ramesh Singh',
    location: 'Sector 62 Main Market',
    status: 'ACTIVE_ROUTE',
    lat: 28.6271,
    lng: 77.3726,
    speedKm: 24
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const seenIdsRef = useRef<Set<string>>(new Set(['TXN-DEMO-901', 'TXN-DEMO-900']));
  const celebrationTimerRef = useRef<any>(null);

  // Audio synthesis for zero external dependency chime
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Play pleasant 3-note celebration arpeggio
      playNote(523.25, 0.0, 0.4); // C5
      playNote(659.25, 0.15, 0.4); // E5
      playNote(783.99, 0.3, 0.6); // G5
    } catch (e) {
      console.warn('Audio synthesis not allowed before user gesture', e);
    }
  };

  // Update Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket connection
  useEffect(() => {
    const socket: Socket = io('http://localhost:3000', {
      reconnectionAttempts: 10,
      timeout: 5000
    });

    socket.on('connect', () => {
      setSocketStatus('CONNECTED');
    });

    socket.on('disconnect', () => {
      setSocketStatus('DISCONNECTED');
    });

    // Listen to real-time post-commit transaction completed event
    socket.on('TRANSACTION_COMPLETED', (data: TransactionEvent) => {
      if (!data || !data.transactionId) return;

      // Client-side deduplication check
      if (seenIdsRef.current.has(data.transactionId)) {
        console.log('Duplicate transaction event skipped:', data.transactionId);
        return;
      }

      seenIdsRef.current.add(data.transactionId);

      // Trigger Audio Chime
      playChime();

      // Trigger Celebration Modal
      setActiveCelebration(data);

      // Update local feed & stats
      setRecentTransactions((prev) => [data, ...prev.slice(0, 7)]);
      setStoreStats((prev) => ({
        todayRevenue: prev.todayRevenue + (data.totalAmount || 0),
        todayOrders: prev.todayOrders + 1,
        totalKgSold: prev.totalKgSold + data.items.reduce((acc, item) => acc + (item.quantityKg || 0), 0)
      }));

      // Auto-dismiss celebration after 8 seconds
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
      celebrationTimerRef.current = setTimeout(() => {
        setActiveCelebration(null);
      }, 8000);
    });

    return () => {
      socket.disconnect();
      if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    };
  }, [soundEnabled]);

  const dismissCelebration = () => {
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    setActiveCelebration(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #030712 0%, #0b132b 50%, #1c2541 100%)', color: '#f9fafb', padding: '24px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top TV Navigation Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-[#030712]', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', padding: '16px 28px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', padding: '12px', borderRadius: '12px', display: 'flex' }}>
            <Tv style={{ width: '32px', height: '32px', color: '#ffffff' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
              PONDFISH <span style={{ color: '#06b6d4' }}>LIVE TV</span>
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Store #01 & Mobile Truck Real-Time Display</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Socket Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', background: socketStatus === 'CONNECTED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: socketStatus === 'CONNECTED' ? '1px solid #10b981' : '1px solid #ef4444' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: socketStatus === 'CONNECTED' ? '#10b981' : '#ef4444', boxShadow: socketStatus === 'CONNECTED' ? '0 0 10px #10b981' : 'none' }}></div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: socketStatus === 'CONNECTED' ? '#34d399' : '#f87171' }}>
              {socketStatus === 'CONNECTED' ? 'LIVE SYNC ACTIVE' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Sound Toggle Button */}
          <button onClick={() => setSoundEnabled(!soundEnabled)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {soundEnabled ? <Volume2 style={{ width: '20px', height: '20px', color: '#38bdf8' }} /> : <VolumeX style={{ width: '20px', height: '20px', color: '#9ca3af' }} />}
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Live Clock Widget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.05)', padding: '10px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Clock style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
            <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '1px' }}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          </div>
        </div>
      </header>

      {/* Main TV Dashboard Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Metrics & Live Transaction Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Top KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            
            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 600 }}>Today's Sales</span>
                <TrendingUp style={{ width: '24px', height: '24px', color: '#38bdf8' }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#38bdf8' }}>
                ₹{storeStats.todayRevenue.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>▲ 18.5% vs yesterday</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 600 }}>Orders Completed</span>
                <ShoppingBag style={{ width: '24px', height: '24px', color: '#34d399' }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#34d399' }}>
                {storeStats.todayOrders} <span style={{ fontSize: '18px', fontWeight: 600 }}>orders</span>
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>In-Store & Mobile Truck</div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.7)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#9ca3af', fontWeight: 600 }}>Fresh Fish Sold</span>
                <Zap style={{ width: '24px', height: '24px', color: '#f59e0b' }} />
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: '#f59e0b' }}>
                {storeStats.totalKgSold.toFixed(1)} <span style={{ fontSize: '18px', fontWeight: 600 }}>kg</span>
              </div>
              <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px' }}>100% Guaranteed Fresh</div>
            </div>

          </div>

          {/* Live Recent Completed Transactions List */}
          <div style={{ flex: 1, background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 style={{ width: '24px', height: '24px', color: '#34d399' }} />
                Recent Verified Checkout Feed
              </h2>
              <span style={{ fontSize: '13px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '4px 12px', borderRadius: '12px' }}>
                Auto-Updating Real-Time
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              {recentTransactions.map((txn, idx) => (
                <div key={txn.transactionId + idx} style={{ background: idx === 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)', padding: '16px 20px', borderRadius: '14px', border: idx === 0 ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: idx === 0 ? '#06b6d4' : 'rgba(255,255,255,0.1)', width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{txn.customerName}</div>
                      <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>
                        {txn.billId || txn.orderId} • {txn.workerName} • <span style={{ color: '#38bdf8' }}>{txn.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: '#34d399' }}>₹{txn.totalAmount.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>{txn.timestamp}</div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Truck GPS Tracker & Store Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Truck Telemetry */}
          <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '24px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Truck style={{ width: '28px', height: '28px', color: '#f59e0b' }} />
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{truckStatus.name}</h3>
                <span style={{ fontSize: '12px', color: '#34d399' }}>Driver: {truckStatus.driver}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>Current Route Zone</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{truckStatus.location}</div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
                <span>GPS: {truckStatus.lat.toFixed(4)}, {truckStatus.lng.toFixed(4)}</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{truckStatus.speedKm} km/h</span>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))', padding: '12px', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: '#fbbf24' }}>
              📡 Live Telemetry Stream Connected
            </div>
          </div>

          {/* Freshness Commitment Banner */}
          <div style={{ flex: 1, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <Award style={{ position: 'absolute', right: '-20px', bottom: '-20px', width: '160px', height: '160px', opacity: 0.15 }} />
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                <Sparkles style={{ width: '14px', height: '14px' }} /> PondFish Guarantee
              </div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 900, lineHeight: 1.2 }}>
                100% Farm-To-Table Freshness Audit
              </h3>
              <p style={{ margin: '12px 0 0 0', fontSize: '14px', opacity: 0.9, lineHeight: 1.5 }}>
                Every purchase is AI bill-verified, temperature monitored, and backed by our zero-adulteration guarantee.
              </p>
            </div>

            <div style={{ marginTop: '24px', fontSize: '13px', background: 'rgba(0,0,0,0.2)', padding: '12px 16px', borderRadius: '12px' }}>
              Store Location: Main Store #01 • Ground Floor
            </div>
          </div>

        </div>

      </div>

      {/* REAL-TIME CELEBRATION OVERLAY MODAL */}
      {activeCelebration && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.3s ease-out' }}>
          
          <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '3px solid #06b6d4', boxShadow: '0 0 50px rgba(6, 182, 212, 0.4)', borderRadius: '28px', padding: '40px', maxWidth: '650px', width: '90%', textCenter: 'center', position: 'relative' }}>
            
            <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '10px 24px', borderRadius: '30px', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>
              🎉 SUCCESSFUL CHECKOUT
            </div>

            <h2 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 8px 0', fontFamily: "'Outfit', sans-serif" }}>
              {activeCelebration.customerName}
            </h2>
            <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>
              Bill ID: <strong style={{ color: '#38bdf8' }}>{activeCelebration.billId || activeCelebration.orderId}</strong> • Verified by {activeCelebration.workerName}
            </p>

            {/* Items Purchased List */}
            <div style={{ margin: '28px 0', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
              <div style={{ fontSize: '13px', color: '#9ca3af', fontWeight: 700, marginBottom: '12px', textTransform: 'uppercase' }}>Items Checked Out</div>
              {activeCelebration.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 600, borderBottom: idx < activeCelebration.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', padding: '8px 0' }}>
                  <span>{item.name} ({item.quantityKg} kg)</span>
                  <span style={{ color: '#38bdf8' }}>₹{item.price}</span>
                </div>
              ))}
            </div>

            {/* Big Amount Badge */}
            <div style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))', border: '1px solid #06b6d4', padding: '16px', borderRadius: '16px', marginBottom: '28px' }}>
              <span style={{ fontSize: '14px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 700 }}>Total Paid ({activeCelebration.paymentMethod})</span>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#34d399', lineHeight: 1.1, marginTop: '4px' }}>
                ₹{activeCelebration.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>

            <button onClick={dismissCelebration} style={{ background: '#06b6d4', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '14px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)' }}>
              Back to Status Board (Auto-closes in 8s)
            </button>

          </div>

        </div>
      )}

    </div>
  );
}
