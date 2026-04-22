import React from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import IntakePage from './pages/IntakePage.jsx';
import ProcessingPage from './pages/ProcessingPage.jsx';
import WorkbenchPage from './pages/WorkbenchPage.jsx';
import RiskSummaryPage from './pages/RiskSummaryPage.jsx';
import AuditRecordPage from './pages/AuditRecordPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import CaseLawPage from './pages/CaseLawPage.jsx';
import LitigationAdvisorPage from './pages/LitigationAdvisorPage.jsx';
import ContractScannerPage from './pages/ContractScannerPage.jsx';
import TimelinePage from './pages/TimelinePage.jsx';
import LetterDraftingPage from './pages/LetterDraftingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import CaseWorkspacePage from './pages/CaseWorkspacePage.jsx';
import { DEMO_MODE } from './config.js';

const API_BASE = import.meta.env.VITE_API_URL || '';
const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const bodyStyle = {
  backgroundColor: '#1C1C1E',
  color: '#EBEBF5',
  fontFamily,
  fontSize: '13px',
  lineHeight: '1.5',
  height: '100vh',
  display: 'flex',
  overflow: 'hidden',
  WebkitFontSmoothing: 'antialiased',
};

const sidebarStyle = {
  width: '240px',
  minWidth: '240px',
  backgroundColor: '#262628',
  borderRight: '1px solid #48484A',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
};

const brandingStyle = {
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  padding: '0 20px',
  borderBottom: '1px solid #38383A',
  flexShrink: 0,
};

const navSectionStyle = {
  flex: 1,
  padding: '12px 0',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
};

const settingsAreaStyle = {
  borderTop: '1px solid #38383A',
  padding: '8px 0',
};

const mainContentStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const LibraryIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
  </svg>
);

const SettingsIcon = ({ color }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

// --- New Matter Dialog ---
export const NewMatterDialog = ({ open, onClose, onCreated }) => {
  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [parties, setParties] = React.useState('');
  const [issues, setIssues] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (!open) {
      setTitle(''); setSummary(''); setParties(''); setIssues('');
      setError(null); setSaving(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const partiesList = parties.split(',').map(p => p.trim()).filter(Boolean);
      const issuesList = issues.split('\n').map(i => i.trim()).filter(Boolean);
      const res = await fetch(`${API_BASE}/api/advisor/matters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          parties: partiesList,
          issues: issuesList,
        }),
      });
      if (!res.ok) throw new Error('Failed to create matter');
      const data = await res.json();
      onCreated?.(data);
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(0,0,0,0.25)', border: '1px solid #38383A', borderRadius: '6px',
    padding: '10px 12px', color: '#EBEBF5', fontSize: '13px', outline: 'none', fontFamily, width: '100%',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#262628', border: '1px solid #48484A', borderRadius: '10px',
          padding: '24px', width: '480px', maxWidth: '90vw',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 600, color: '#EBEBF5', marginBottom: '4px' }}>
          New Matter
        </div>
        <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.5)', marginBottom: '20px' }}>
          Create a new legal matter to organise your workflow around it.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.4)', fontWeight: 600, marginBottom: '6px' }}>
              Title (required)
            </label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Smith v Jones — Breach of NDA"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.4)', fontWeight: 600, marginBottom: '6px' }}>
              Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Short description of the case..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.4)', fontWeight: 600, marginBottom: '6px' }}>
              Parties (comma-separated)
            </label>
            <input
              value={parties}
              onChange={(e) => setParties(e.target.value)}
              placeholder="Acme Ltd, John Smith, Acme USA Inc"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.4)', fontWeight: 600, marginBottom: '6px' }}>
              Issues (one per line)
            </label>
            <textarea
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
              placeholder={'Breach of confidentiality\nInjunctive relief\nDamages quantum'}
              rows={4}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>
        </div>

        {error && (
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#FF453A' }}>{error}</div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              backgroundColor: 'transparent', border: '1px solid #48484A', color: '#EBEBF5',
              padding: '8px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || !title.trim()}
            style={{
              backgroundColor: saving || !title.trim() ? '#48484A' : '#0A84FF', color: 'white',
              border: 'none', padding: '8px 18px', borderRadius: '6px', fontSize: '12px',
              fontWeight: 600, cursor: saving || !title.trim() ? 'default' : 'pointer', fontFamily,
            }}
          >
            {saving ? 'Creating...' : 'Create Matter'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sidebar ---
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [matters, setMatters] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [hovered, setHovered] = React.useState(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const [reloadToken, setReloadToken] = React.useState(0);

  // Figure out active matter id from URL (handles /case/:matterId and sub-paths)
  const activeMatterId = React.useMemo(() => {
    const m = location.pathname.match(/^\/case\/([^/]+)/);
    return m ? m[1] : null;
  }, [location.pathname]);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`${API_BASE}/api/advisor/matters`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { if (!cancelled) setMatters((data.matters || []).slice(0, 10)); })
      .catch(() => { if (!cancelled) setMatters([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [reloadToken]);

  const handleCreated = (matter) => {
    setReloadToken(t => t + 1);
    if (matter?.id) navigate(`/case/${matter.id}`);
  };

  const isLibraryActive = location.pathname.startsWith('/library');
  const isSettingsActive = location.pathname.startsWith('/settings');

  const rowBase = {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '9px 20px', cursor: 'pointer', fontSize: '13px',
    transition: 'all 0.12s ease',
  };

  return (
    <div style={sidebarStyle}>
      {/* Branding */}
      <div style={brandingStyle}>
        <div
          style={{ fontWeight: 700, letterSpacing: '-0.5px', color: '#EBEBF5', fontSize: '15px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          BIRD <span style={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 500 }}>LEGAL</span>
        </div>
      </div>

      {/* New Matter button — hidden in demo mode */}
      {!DEMO_MODE && (
        <div style={{ padding: '14px 16px 10px 16px', borderBottom: '1px solid #38383A' }}>
          <button
            onClick={() => setShowDialog(true)}
            style={{
              width: '100%', backgroundColor: '#0A84FF', color: 'white', border: 'none',
              padding: '9px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', fontFamily,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
            <span>New Matter</span>
          </button>
        </div>
      )}

      {/* Matters list */}
      <div style={navSectionStyle}>
        <div style={{ padding: '4px 20px 8px 20px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(235, 235, 245, 0.35)', fontWeight: 600 }}>
            Matters
          </span>
        </div>
        {loading ? (
          <div style={{ padding: '12px 20px', fontSize: '12px', color: 'rgba(235,235,245,0.3)' }}>
            Loading...
          </div>
        ) : matters.length === 0 ? (
          <div style={{ padding: '12px 20px', fontSize: '12px', color: 'rgba(235,235,245,0.35)', lineHeight: 1.5 }}>
            No matters yet. Create one to get started.
          </div>
        ) : (
          matters.map((m) => {
            const isActive = m.id === activeMatterId;
            const isHovered = hovered === m.id;
            return (
              <div
                key={m.id}
                onClick={() => navigate(`/case/${m.id}`)}
                onMouseEnter={() => setHovered(m.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  padding: '9px 20px', cursor: 'pointer',
                  borderLeft: isActive ? '3px solid #0A84FF' : '3px solid transparent',
                  backgroundColor: isActive ? 'rgba(10,132,255,0.12)' : (isHovered ? 'rgba(255,255,255,0.04)' : 'transparent'),
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: isActive ? '#0A84FF' : '#32D74B', flexShrink: 0,
                  }} />
                  <div style={{
                    fontSize: '12px', fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#EBEBF5' : 'rgba(235,235,245,0.85)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {m.title || 'Untitled'}
                  </div>
                </div>
                {m.summary && (
                  <div style={{
                    fontSize: '11px', color: 'rgba(235,235,245,0.4)', lineHeight: 1.35,
                    paddingLeft: '14px',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {m.summary}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Library + Settings */}
      <div style={settingsAreaStyle}>
        <div
          onClick={() => navigate('/library')}
          onMouseEnter={() => setHovered('__library')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...rowBase,
            color: isLibraryActive ? '#0A84FF' : (hovered === '__library' ? '#EBEBF5' : 'rgba(235,235,245,0.6)'),
            fontWeight: isLibraryActive ? 600 : 400,
            backgroundColor: isLibraryActive ? 'rgba(10,132,255,0.1)' : (hovered === '__library' ? 'rgba(255,255,255,0.04)' : 'transparent'),
            borderLeft: isLibraryActive ? '3px solid #0A84FF' : '3px solid transparent',
          }}
        >
          <LibraryIcon color={isLibraryActive ? '#0A84FF' : (hovered === '__library' ? '#EBEBF5' : 'rgba(235,235,245,0.6)')} />
          <span>Library</span>
        </div>
        <div
          onClick={() => navigate('/settings')}
          onMouseEnter={() => setHovered('__settings')}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...rowBase,
            color: isSettingsActive ? '#0A84FF' : (hovered === '__settings' ? '#EBEBF5' : 'rgba(235,235,245,0.6)'),
            fontWeight: isSettingsActive ? 600 : 400,
            backgroundColor: isSettingsActive ? 'rgba(10,132,255,0.1)' : (hovered === '__settings' ? 'rgba(255,255,255,0.04)' : 'transparent'),
            borderLeft: isSettingsActive ? '3px solid #0A84FF' : '3px solid transparent',
          }}
        >
          <SettingsIcon color={isSettingsActive ? '#0A84FF' : (hovered === '__settings' ? '#EBEBF5' : 'rgba(235,235,245,0.6)')} />
          <span>Settings</span>
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

const App = () => {
  return (
    <div style={bodyStyle}>
      <Sidebar />
      <div style={mainContentStyle}>
        <Routes>
          {/* Home dashboard */}
          <Route path="/" element={<HomePage />} />

          {/* Case workspace (matter-centric) */}
          <Route path="/case/:matterId" element={<CaseWorkspacePage />} />
          <Route path="/case/:matterId/overview" element={<CaseWorkspacePage />} />
          <Route path="/case/:matterId/research" element={<CaseWorkspacePage />} />
          <Route path="/case/:matterId/strategy" element={<CaseWorkspacePage />} />
          <Route path="/case/:matterId/documents" element={<CaseWorkspacePage />} />
          <Route path="/case/:matterId/timeline" element={<CaseWorkspacePage />} />
          <Route path="/case/:matterId/letters" element={<CaseWorkspacePage />} />

          {/* Global Library (case law research, no matter context) */}
          <Route path="/library" element={<CaseLawPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Legacy global module routes (still work as "global" mode) */}
          <Route path="/research" element={<CaseLawPage />} />
          <Route path="/advisor" element={<LitigationAdvisorPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
          <Route path="/drafting" element={<LetterDraftingPage />} />
          <Route path="/scanner" element={<ContractScannerPage />} />
          <Route path="/scanner/upload" element={<ContractScannerPage />} />
          <Route path="/scanner/processing/:documentId" element={<ContractScannerPage />} />
          <Route path="/scanner/review/:documentId" element={<ContractScannerPage />} />
          <Route path="/scanner/risks/:documentId" element={<ContractScannerPage />} />
          <Route path="/scanner/audit/:documentId" element={<ContractScannerPage />} />

          {/* Legacy redirects */}
          <Route path="/processing/:documentId" element={<Navigate to="/scanner" replace />} />
          <Route path="/workbench/:documentId" element={<Navigate to="/scanner" replace />} />
          <Route path="/risks/:documentId" element={<Navigate to="/scanner" replace />} />
          <Route path="/audit/:documentId" element={<Navigate to="/scanner" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
