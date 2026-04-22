import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import CaseLawPage from './CaseLawPage.jsx';
import LitigationAdvisorPage from './LitigationAdvisorPage.jsx';
import TimelinePage from './TimelinePage.jsx';
import LetterDraftingPage from './LetterDraftingPage.jsx';
import ContractScannerPage from './ContractScannerPage.jsx';

const API_BASE = import.meta.env.VITE_API_URL || '';
const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'research', label: 'Research' },
  { key: 'strategy', label: 'Strategy' },
  { key: 'documents', label: 'Documents' },
  { key: 'timeline', label: 'Timeline' },
  { key: 'letters', label: 'Letters' },
];

const getActiveTab = (pathname, matterId) => {
  // pathname: /case/:matterId or /case/:matterId/<tab>
  const prefix = `/case/${matterId}`;
  if (pathname === prefix || pathname === `${prefix}/`) return 'overview';
  const rest = pathname.slice(prefix.length + 1).split('/')[0];
  const match = TABS.find(t => t.key === rest);
  return match ? match.key : 'overview';
};

const OverviewTab = ({ matter, timelineEvents, letters }) => {
  const upcoming = useMemo(() => {
    const today = new Date();
    return (timelineEvents || [])
      .filter(e => e.date && new Date(e.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  }, [timelineEvents]);

  const recent = useMemo(() => {
    return (timelineEvents || [])
      .slice()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  }, [timelineEvents]);

  const sectionHeader = {
    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.6px',
    color: 'rgba(235,235,245,0.4)', fontWeight: 600, marginBottom: '10px',
  };

  const card = {
    backgroundColor: '#262628', border: '1px solid #38383A',
    borderRadius: '10px', padding: '20px',
  };

  return (
    <div style={{ padding: '28px 36px', overflowY: 'auto', flex: 1 }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Summary + quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div style={card}>
            <div style={sectionHeader}>Summary</div>
            <div style={{ fontSize: '14px', color: '#EBEBF5', lineHeight: 1.6 }}>
              {matter?.summary || <span style={{ color: 'rgba(235,235,245,0.35)', fontStyle: 'italic' }}>No summary recorded.</span>}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Issues', value: (matter?.issues || []).length, color: '#BF5AF2' },
              { label: 'Timeline Events', value: (timelineEvents || []).length, color: '#32D74B' },
              { label: 'Letters', value: (letters || []).length, color: '#FF9F0A' },
            ].map(s => (
              <div key={s.label} style={{ ...card, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.6)' }}>{s.label}</div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Parties + Issues */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <div style={card}>
            <div style={sectionHeader}>Parties</div>
            {(matter?.parties || []).length === 0 ? (
              <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.3)', fontStyle: 'italic' }}>No parties recorded.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {matter.parties.map((p, i) => (
                  <span key={i} style={{
                    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500,
                    backgroundColor: 'rgba(10,132,255,0.15)', color: '#0A84FF',
                  }}>{p}</span>
                ))}
              </div>
            )}
          </div>
          <div style={card}>
            <div style={sectionHeader}>Issues</div>
            {(matter?.issues || []).length === 0 ? (
              <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.3)', fontStyle: 'italic' }}>No issues recorded.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {matter.issues.map((iss, i) => (
                  <div key={i} style={{
                    fontSize: '12px', color: '#EBEBF5', padding: '6px 10px',
                    borderRadius: '6px', backgroundColor: 'rgba(191,90,242,0.1)',
                    borderLeft: '2px solid #BF5AF2',
                  }}>{iss}</div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming + Recent activity */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={card}>
            <div style={sectionHeader}>Upcoming</div>
            {upcoming.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.3)', fontStyle: 'italic' }}>Nothing upcoming.</div>
            ) : upcoming.map((e, i) => (
              <div key={e.id || i} style={{
                padding: '8px 0', borderBottom: i < upcoming.length - 1 ? '1px solid #38383A' : 'none',
              }}>
                <div style={{ fontSize: '11px', fontFamily: '"SF Mono", monospace', color: '#0A84FF' }}>{e.date}</div>
                <div style={{ fontSize: '12px', color: '#EBEBF5', marginTop: '2px' }}>{e.description}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={sectionHeader}>Recent Activity</div>
            {recent.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.3)', fontStyle: 'italic' }}>No activity yet.</div>
            ) : recent.map((e, i) => (
              <div key={e.id || i} style={{
                padding: '8px 0', borderBottom: i < recent.length - 1 ? '1px solid #38383A' : 'none',
              }}>
                <div style={{ fontSize: '11px', fontFamily: '"SF Mono", monospace', color: 'rgba(235,235,245,0.5)' }}>{e.date}</div>
                <div style={{ fontSize: '12px', color: '#EBEBF5', marginTop: '2px' }}>{e.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const CaseWorkspacePage = () => {
  const { matterId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = getActiveTab(location.pathname, matterId);

  // Keyed data fetch state — reset whenever matterId changes (no setState-in-effect)
  const [data, setData] = useState({ key: null, matter: null, error: null, loading: true });
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [letters, setLetters] = useState([]);

  if (data.key !== matterId) {
    setData({ key: matterId, matter: null, error: null, loading: true });
  }

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/api/advisor/matters/${matterId}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error(r.status === 404 ? 'Matter not found' : 'Failed to load matter')))
      .then(m => { if (!cancelled) setData({ key: matterId, matter: m, error: null, loading: false }); })
      .catch(err => { if (!cancelled) setData({ key: matterId, matter: null, error: err.message, loading: false }); });

    // Best-effort extras for overview
    fetch(`${API_BASE}/api/timeline/events?matter_id=${encodeURIComponent(matterId)}`)
      .then(r => r.ok ? r.json() : { events: [] })
      .then(d => { if (!cancelled) setTimelineEvents(d.events || []); })
      .catch(() => {});

    fetch(`${API_BASE}/api/drafting/letters?matter_id=${encodeURIComponent(matterId)}`)
      .then(r => r.ok ? r.json() : { letters: [] })
      .then(d => { if (!cancelled) setLetters(d.letters || []); })
      .catch(() => {});

    return () => { cancelled = true; };
  }, [matterId]);

  const { matter, loading, error } = data;

  const handleTabClick = (tabKey) => {
    if (tabKey === 'overview') {
      navigate(`/case/${matterId}`);
    } else {
      navigate(`/case/${matterId}/${tabKey}`);
    }
  };

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C1E' }}>
        <div style={{ color: 'rgba(235,235,245,0.4)', fontSize: '13px' }}>Loading matter...</div>
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C1E' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#EBEBF5', marginBottom: '8px' }}>
            {error || 'Matter not found'}
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              marginTop: '12px', backgroundColor: '#0A84FF', color: 'white', border: 'none',
              padding: '8px 20px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', fontFamily,
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab matter={matter} timelineEvents={timelineEvents} letters={letters} />;
      case 'research':
        return <CaseLawPage matterId={matterId} />;
      case 'strategy':
        return <LitigationAdvisorPage matterId={matterId} />;
      case 'documents':
        return <ContractScannerPage matterId={matterId} />;
      case 'timeline':
        return <TimelinePage matterId={matterId} />;
      case 'letters':
        return <LetterDraftingPage matterId={matterId} />;
      default:
        return <OverviewTab matter={matter} timelineEvents={timelineEvents} letters={letters} />;
    }
  };

  const partiesSummary = (matter.parties || []).slice(0, 3).join(' · ');
  const createdDate = matter.created_at ? new Date(matter.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#1C1C1E' }}>
      {/* Matter Header */}
      <div style={{
        backgroundColor: '#262628', borderBottom: '1px solid #38383A',
        padding: '16px 36px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px',
              color: 'rgba(235,235,245,0.4)', fontWeight: 600, marginBottom: '4px',
            }}>
              Matter
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#EBEBF5', marginBottom: '6px', letterSpacing: '-0.3px' }}>
              {matter.title || 'Untitled Matter'}
            </div>
            {matter.summary && (
              <div style={{
                fontSize: '12px', color: 'rgba(235,235,245,0.55)', lineHeight: 1.5,
                maxWidth: '700px',
                overflow: 'hidden', textOverflow: 'ellipsis',
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {matter.summary}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, fontSize: '11px', color: 'rgba(235,235,245,0.45)' }}>
            {partiesSummary && <div style={{ marginBottom: '4px' }}>{partiesSummary}</div>}
            {createdDate && <div>Created {createdDate}</div>}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        backgroundColor: '#262628', borderBottom: '1px solid #48484A',
        display: 'flex', padding: '0 24px', flexShrink: 0, gap: '2px',
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              style={{
                background: 'transparent', border: 'none',
                padding: '12px 18px', cursor: 'pointer', fontFamily,
                fontSize: '12px', fontWeight: isActive ? 600 : 500,
                color: isActive ? '#0A84FF' : 'rgba(235,235,245,0.55)',
                borderBottom: isActive ? '2px solid #0A84FF' : '2px solid transparent',
                marginBottom: '-1px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#EBEBF5'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(235,235,245,0.55)'; }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CaseWorkspacePage;
