import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewMatterDialog } from '../App.jsx';
import { DEMO_MODE } from '../config.js';

const API_BASE = import.meta.env.VITE_API_URL || '';
const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const HomePage = () => {
  const navigate = useNavigate();
  const [hoveredMatter, setHoveredMatter] = useState(null);
  const [hoveredTool, setHoveredTool] = useState(null);
  const [stats, setStats] = useState({ matters: 0, documents: 0, letters: 0, events: 0 });
  const [matters, setMatters] = useState([]);
  const [allLetters, setAllLetters] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/api/advisor/matters`).then(r => r.ok ? r.json() : { matters: [] }).catch(() => ({ matters: [] })),
      fetch(`${API_BASE}/api/drafting/letters`).then(r => r.ok ? r.json() : { letters: [] }).catch(() => ({ letters: [] })),
      fetch(`${API_BASE}/api/timeline/events`).then(r => r.ok ? r.json() : { events: [] }).catch(() => ({ events: [] })),
    ]).then(([m, l, t]) => {
      const matterList = m.matters || [];
      const letterList = l.letters || [];
      const eventList = t.events || [];
      setMatters(matterList);
      setAllLetters(letterList);
      setAllEvents(eventList);
      setStats({
        matters: matterList.length,
        documents: 0,
        letters: letterList.length,
        events: eventList.length,
      });
    });
  }, [reloadToken]);

  const handleCreated = (matter) => {
    setReloadToken(t => t + 1);
    if (matter?.id) navigate(`/case/${matter.id}`);
  };

  // Count helpers per matter
  const countFor = (list, matterId, key = 'matter_id') =>
    list.filter(x => x && x[key] === matterId).length;

  const modules = [
    {
      key: 'research',
      title: 'Case Law Research',
      description: 'Search 4,700+ English & Welsh judgments from the National Archives. AI summarises ratio decidendi and distinguishes authorities.',
      painPoint: 'Westlaw UX from 2003, solved.',
      path: '/library',
      accent: '#0A84FF',
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        </svg>
      ),
    },
    {
      key: 'advisor',
      title: 'Litigation Advisor',
      description: 'Structure a matter. Run Nash-equilibrium settlement analysis. Chat to an advisor that sees your whole case.',
      painPoint: 'Game theory for settlement strategy. Nobody else ships this.',
      path: '/advisor',
      accent: '#BF5AF2',
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      ),
    },
    {
      key: 'timeline',
      title: 'Timeline Builder',
      description: 'Upload disclosure bundles. AI extracts every date, ranks them by significance, and builds the chronology.',
      painPoint: 'Half a day of paralegal work in 90 seconds.',
      path: '/timeline',
      accent: '#32D74B',
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    {
      key: 'drafting',
      title: 'Letter Drafting',
      description: 'Letter Before Action. Part 36 Offer. Without Prejudice. Response to Claim. Pre-filled from matter. CPR-compliant.',
      painPoint: 'You bill for letters. Now write them faster.',
      path: '/drafting',
      accent: '#FF9F0A',
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      ),
    },
    {
      key: 'scanner',
      title: 'Contract Scanner',
      description: 'Drop an NDA, MSA, or acquisition agreement. Four-agent pipeline parses, analyses, redlines, summarises.',
      painPoint: 'NDA triage in 90 seconds. Full diligence in under 10 minutes.',
      path: '/scanner',
      accent: 'rgba(235, 235, 245, 0.72)',
      icon: (color) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.2px',
            color: 'rgba(235, 235, 245, 0.4)', fontWeight: 600, marginBottom: '8px',
          }}>
            Welcome to Bird Legal
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#EBEBF5', marginBottom: '10px', letterSpacing: '-0.5px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, Counsel.
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(235, 235, 245, 0.65)', lineHeight: 1.6, maxWidth: '720px' }}>
            The matter-first legal AI workspace. Five modules wired into every case — research, strategy, timeline, letters, documents — with a persistent assistant that knows the whole file.
          </p>
        </div>

        {/* MODULES — lead with what it does */}
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(235,235,245,0.7)', fontWeight: 600, marginBottom: '4px' }}>
            Modules
          </h2>
          <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.45)', marginBottom: '16px' }}>
            Each module works standalone or inside a matter. Inside a matter, they share context.
          </div>
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '12px', marginBottom: '48px',
        }}>
          {modules.map((m) => {
            const isHovered = hoveredTool === m.key;
            return (
              <div
                key={m.key}
                onClick={() => navigate(m.path)}
                onMouseEnter={() => setHoveredTool(m.key)}
                onMouseLeave={() => setHoveredTool(null)}
                style={{
                  backgroundColor: '#262628',
                  border: `1px solid ${isHovered ? m.accent : '#38383A'}`,
                  borderRadius: '10px', padding: '18px 20px', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                  {m.icon(m.accent)}
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#EBEBF5' }}>
                    {m.title}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.6)', lineHeight: 1.55 }}>
                  {m.description}
                </div>
                <div style={{ fontSize: '11px', color: m.accent, fontStyle: 'italic', marginTop: '2px' }}>
                  {m.painPoint}
                </div>
              </div>
            );
          })}
        </div>

        {/* Demo matters section header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px',
        }}>
          <div>
            <h2 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(235,235,245,0.7)', fontWeight: 600, margin: 0, marginBottom: '4px' }}>
              Demo Matters
            </h2>
            <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.45)', maxWidth: '560px', lineHeight: 1.55 }}>
              Four real cases wired end to end to prove the workflow. Parties, issues, timeline events and strategy analysis pre-loaded. Click any matter to enter its workspace.
            </div>
          </div>
          {!DEMO_MODE && (
            <button
              onClick={() => setShowDialog(true)}
              style={{
                backgroundColor: '#0A84FF', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                cursor: 'pointer', fontFamily,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
              <span>New Matter</span>
            </button>
          )}
        </div>

        {/* Matters grid or empty state */}
        {matters.length === 0 ? (
          <div style={{
            backgroundColor: '#262628', border: '1px dashed #48484A', borderRadius: '12px',
            padding: '60px 40px', textAlign: 'center', marginBottom: '48px',
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.2)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#EBEBF5', marginBottom: '8px' }}>
              {DEMO_MODE ? 'No matters loaded yet' : 'Create your first matter to get started'}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(235,235,245,0.5)', marginBottom: '20px', maxWidth: '440px', margin: '0 auto 20px' }}>
              {DEMO_MODE
                ? 'Demo matters should load automatically. If none appear, the backend may still be warming up.'
                : 'A matter is the central unit of your work. Research, strategy, documents, timeline and letters all live inside it.'}
            </div>
            {!DEMO_MODE && (
              <button
                onClick={() => setShowDialog(true)}
                style={{
                  backgroundColor: '#0A84FF', color: 'white', border: 'none',
                  padding: '10px 22px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', fontFamily,
                }}
              >
                + New Matter
              </button>
            )}
          </div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px', marginBottom: '48px',
          }}>
            {matters.map((m) => {
              const isHovered = hoveredMatter === m.id;
              const eventsCount = countFor(allEvents, m.id);
              const lettersCount = countFor(allLetters, m.id);
              const issuesCount = Array.isArray(m.issues) ? m.issues.length : 0;
              const updated = m.updated_at ? new Date(m.updated_at) : null;
              const summary = m.summary || '';

              return (
                <div
                  key={m.id}
                  onClick={() => navigate(`/case/${m.id}`)}
                  onMouseEnter={() => setHoveredMatter(m.id)}
                  onMouseLeave={() => setHoveredMatter(null)}
                  style={{
                    backgroundColor: '#262628',
                    border: `1px solid ${isHovered ? '#0A84FF' : '#38383A'}`,
                    borderRadius: '10px', padding: '20px', cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                    boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(10,132,255,0.2)' : 'none',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    minHeight: '180px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '3px 8px', borderRadius: '10px',
                      backgroundColor: 'rgba(50,215,75,0.15)', color: '#32D74B',
                      fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#32D74B' }} />
                      Active
                    </div>
                    {updated && (
                      <div style={{ fontSize: '10px', color: 'rgba(235,235,245,0.35)' }}>
                        {updated.toLocaleDateString('en-GB')}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#EBEBF5', marginBottom: '6px', letterSpacing: '-0.2px', lineHeight: 1.3 }}>
                      {m.title || 'Untitled Matter'}
                    </div>
                    <div style={{
                      fontSize: '12px', color: 'rgba(235,235,245,0.55)', lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {summary || <span style={{ fontStyle: 'italic', color: 'rgba(235,235,245,0.3)' }}>No summary</span>}
                    </div>
                  </div>

                  <div style={{ flex: 1 }} />

                  <div style={{
                    display: 'flex', justifyContent: 'space-between', gap: '8px',
                    borderTop: '1px solid #38383A', paddingTop: '12px',
                  }}>
                    {[
                      { label: 'Issues', value: issuesCount, color: '#BF5AF2' },
                      { label: 'Events', value: eventsCount, color: '#32D74B' },
                      { label: 'Letters', value: lettersCount, color: '#FF9F0A' },
                    ].map(metric => (
                      <div key={metric.label} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: metric.color }}>
                          {metric.value}
                        </div>
                        <div style={{ fontSize: '9px', color: 'rgba(235,235,245,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Compact workspace stats */}
        <div style={{
          marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px',
        }}>
          {[
            { label: 'Active Matters', value: stats.matters, accent: '#BF5AF2' },
            { label: 'Letters Drafted', value: stats.letters, accent: '#FF9F0A' },
            { label: 'Timeline Events', value: stats.events, accent: '#32D74B' },
            { label: 'Saved Cases', value: stats.documents, accent: '#0A84FF' },
          ].map((s) => (
            <div key={s.label} style={{
              backgroundColor: 'rgba(38, 38, 40, 0.5)', border: '1px solid #38383A',
              borderRadius: '8px', padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'rgba(235,235,245,0.55)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 500 }}>
                {s.label}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: s.accent }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #38383A', paddingTop: '20px', marginTop: '40px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '11px', color: 'rgba(235,235,245,0.3)',
        }}>
          <div>Bird Legal · Matter-first legal AI for English firms</div>
          <div>v0.3 · Local-model capable · UK law</div>
        </div>
      </div>

      <NewMatterDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default HomePage;
