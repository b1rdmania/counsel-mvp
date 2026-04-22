import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || '';

const HomePage = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [stats, setStats] = useState({ matters: 0, documents: 0, letters: 0, events: 0 });
  const [recentMatters, setRecentMatters] = useState([]);

  useEffect(() => {
    // Fetch basic stats across modules
    Promise.all([
      fetch(`${API_BASE}/api/advisor/matters`).then(r => r.ok ? r.json() : { matters: [] }).catch(() => ({ matters: [] })),
      fetch(`${API_BASE}/api/drafting/letters`).then(r => r.ok ? r.json() : { letters: [] }).catch(() => ({ letters: [] })),
      fetch(`${API_BASE}/api/timeline/events`).then(r => r.ok ? r.json() : { events: [] }).catch(() => ({ events: [] })),
    ]).then(([m, l, t]) => {
      setStats({
        matters: (m.matters || []).length,
        documents: 0,
        letters: (l.letters || []).length,
        events: (t.events || []).length,
      });
      setRecentMatters((m.matters || []).slice(0, 3));
    });
  }, []);

  const modules = [
    {
      key: 'research',
      title: 'Case Law Research',
      description: 'Search English & Welsh case law. Ranked precedent with citations and AI-powered summaries.',
      path: '/research',
      accent: '#0A84FF',
      icon: (color) => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 1L1 7l11 6 11-6-11-6z" />
          <path d="M1 17l11 6 11-6" />
          <path d="M1 12l11 6 11-6" />
        </svg>
      ),
      badge: 'NEW',
    },
    {
      key: 'advisor',
      title: 'Litigation Advisor',
      description: 'Matter management with Nash equilibrium strategy analysis, SWOT, and real-time AI consultation.',
      path: '/advisor',
      accent: '#BF5AF2',
      icon: (color) => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
          <circle cx="12" cy="12" r="3" fill={color} opacity="0.3" />
        </svg>
      ),
      badge: 'NEW',
    },
    {
      key: 'timeline',
      title: 'Timeline Builder',
      description: 'Extract every date from case bundles. Build chronologies automatically from disclosure documents.',
      path: '/timeline',
      accent: '#32D74B',
      icon: (color) => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      key: 'drafting',
      title: 'Letter Drafting',
      description: 'Letter Before Action, Part 36 Offers, Without Prejudice correspondence. English legal style.',
      path: '/drafting',
      accent: '#FF9F0A',
      icon: (color) => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      ),
    },
    {
      key: 'scanner',
      title: 'Contract Scanner',
      description: 'Upload NDAs, MSAs, and acquisition agreements. Get redlines and risk analysis in minutes.',
      path: '/scanner',
      accent: 'rgba(235, 235, 245, 0.6)',
      icon: (color) => (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="9" y1="15" x2="15" y2="15" />
          <line x1="9" y1="11" x2="15" y2="11" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#1C1C1E' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 40px' }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1.2px',
            color: 'rgba(235, 235, 245, 0.4)',
            fontWeight: 600,
            marginBottom: '8px',
          }}>
            Welcome to Bird Legal
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#EBEBF5', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, Counsel.
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(235, 235, 245, 0.6)', lineHeight: 1.6, maxWidth: '640px' }}>
            A private-cloud legal platform built for boutique firms and in-house teams. Case law research, litigation strategy, document analysis — all in one workspace.
          </p>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '40px',
        }}>
          {[
            { label: 'Active Matters', value: stats.matters, accent: '#BF5AF2' },
            { label: 'Letters Drafted', value: stats.letters, accent: '#FF9F0A' },
            { label: 'Timeline Events', value: stats.events, accent: '#32D74B' },
            { label: 'Documents', value: stats.documents, accent: 'rgba(235,235,245,0.4)' },
          ].map((s) => (
            <div key={s.label} style={{
              backgroundColor: '#262628',
              border: '1px solid #38383A',
              borderRadius: '8px',
              padding: '16px 20px',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: 600, marginBottom: '4px' }}>
                {s.label}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: s.accent }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Module Cards */}
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(235,235,245,0.6)', fontWeight: 600, marginBottom: '16px' }}>
            Modules
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {modules.map((m) => {
            const isHovered = hoveredCard === m.key;
            return (
              <div
                key={m.key}
                onClick={() => navigate(m.path)}
                onMouseEnter={() => setHoveredCard(m.key)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: '#262628',
                  border: `1px solid ${isHovered ? m.accent : '#38383A'}`,
                  borderRadius: '10px',
                  padding: '24px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered ? `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${m.accent}20` : 'none',
                  position: 'relative',
                }}
              >
                {m.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: `${m.accent}25`,
                    color: m.accent,
                    fontSize: '9px',
                    fontWeight: 700,
                    letterSpacing: '0.5px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}>
                    {m.badge}
                  </div>
                )}
                <div style={{ marginBottom: '16px' }}>
                  {m.icon(m.accent)}
                </div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#EBEBF5', marginBottom: '6px' }}>
                  {m.title}
                </div>
                <div style={{ fontSize: '13px', color: 'rgba(235,235,245,0.6)', lineHeight: 1.5 }}>
                  {m.description}
                </div>
                <div style={{
                  marginTop: '16px',
                  fontSize: '12px',
                  color: isHovered ? m.accent : 'rgba(235,235,245,0.4)',
                  fontWeight: 500,
                  transition: 'color 0.15s',
                }}>
                  Open →
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Matters */}
        {recentMatters.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(235,235,245,0.6)', fontWeight: 600, marginBottom: '16px' }}>
              Recent Matters
            </h2>
            <div style={{
              backgroundColor: '#262628',
              border: '1px solid #38383A',
              borderRadius: '8px',
              overflow: 'hidden',
            }}>
              {recentMatters.map((matter, i) => (
                <div
                  key={matter.id}
                  onClick={() => navigate('/advisor')}
                  style={{
                    padding: '16px 20px',
                    borderBottom: i < recentMatters.length - 1 ? '1px solid #38383A' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#EBEBF5', marginBottom: '2px' }}>
                      {matter.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.5)' }}>
                      {matter.summary ? matter.summary.substring(0, 120) + (matter.summary.length > 120 ? '...' : '') : 'No summary'}
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(235,235,245,0.4)' }}>
                    {new Date(matter.updated_at).toLocaleDateString('en-GB')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #38383A',
          paddingTop: '20px',
          marginTop: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'rgba(235,235,245,0.3)',
        }}>
          <div>Bird Legal · Private AI for law firms</div>
          <div>v0.2 · API-driven · SOC 2 roadmap</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
