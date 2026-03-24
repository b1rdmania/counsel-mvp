import React from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import IntakePage from './pages/IntakePage.jsx';
import ProcessingPage from './pages/ProcessingPage.jsx';
import WorkbenchPage from './pages/WorkbenchPage.jsx';
import RiskSummaryPage from './pages/RiskSummaryPage.jsx';
import AuditRecordPage from './pages/AuditRecordPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const bodyStyle = {
  backgroundColor: '#1C1C1E',
  color: '#EBEBF5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontSize: '13px',
  lineHeight: '1.5',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  WebkitFontSmoothing: 'antialiased',
};

const Header = ({ docName, showViewSwitcher, activeView, showSettings }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const docId = params.documentId || '';

  const viewTabs = ['Processing', 'Workbench', 'Audit Record'];
  const viewRoutes = {
    'Processing': docId ? `/processing/${docId}` : '/processing',
    'Workbench': docId ? `/workbench/${docId}` : '/workbench',
    'Audit Record': docId ? `/audit/${docId}` : '/audit',
  };

  const currentView = activeView || (() => {
    if (location.pathname.startsWith('/processing')) return 'Processing';
    if (location.pathname.startsWith('/workbench')) return 'Workbench';
    if (location.pathname.startsWith('/risks')) return 'Workbench';
    if (location.pathname.startsWith('/audit')) return 'Audit Record';
    return null;
  })();

  return (
    <header style={{
      height: '52px',
      backgroundColor: '#262628',
      borderBottom: '1px solid #48484A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{ fontWeight: 700, letterSpacing: '-0.5px', color: '#EBEBF5', fontSize: '14px', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          STELLA <span style={{ color: 'rgba(235, 235, 245, 0.6)', fontWeight: 500 }}>COUNSEL</span>
        </div>
        {docName && (
          <div style={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '1px', height: '12px', backgroundColor: '#38383A' }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
            </svg>
            {docName}
          </div>
        )}
        {showSettings && (
          <div style={{ fontSize: '12px', color: 'rgba(235, 235, 245, 0.3)', marginLeft: '8px' }}>Configuration Mode</div>
        )}
      </div>

      {showViewSwitcher && (
        <nav style={{
          display: 'flex',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '6px',
          padding: '2px',
          border: '1px solid #38383A',
        }}>
          {viewTabs.map(tab => (
            <button
              key={tab}
              onClick={() => navigate(viewRoutes[tab])}
              style={{
                background: currentView === tab ? '#48484A' : 'transparent',
                border: 'none',
                color: currentView === tab ? '#EBEBF5' : 'rgba(235, 235, 245, 0.6)',
                padding: '4px 16px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '4px',
                cursor: 'pointer',
                boxShadow: currentView === tab ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {showSettings && (
          <button
            onClick={() => {}}
            style={{
              backgroundColor: '#0A84FF',
              color: 'white',
              border: '1px solid transparent',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          >
            Save Changes
          </button>
        )}
        {!showSettings && (
          <svg
            onClick={() => navigate('/settings')}
            style={{ cursor: 'pointer' }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.6)" strokeWidth="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        )}
      </div>
    </header>
  );
};

const DocHeader = ({ activeView }) => {
  const { documentId } = useParams();
  const [docName, setDocName] = React.useState('Loading...');

  React.useEffect(() => {
    if (!documentId) return;
    fetch(`/api/documents/${documentId}`)
      .then(r => r.json())
      .then(d => setDocName(d.filename))
      .catch(() => setDocName('Document'));
  }, [documentId]);

  return <Header docName={docName} showViewSwitcher activeView={activeView} />;
};

const App = () => {
  return (
    <div style={bodyStyle}>
      <Routes>
        <Route path="/" element={<><Header /><IntakePage /></>} />
        {/* Routes with document ID */}
        <Route path="/processing/:documentId" element={<><DocHeader activeView="Processing" /><ProcessingPage /></>} />
        <Route path="/workbench/:documentId" element={<><DocHeader activeView="Workbench" /><WorkbenchPage /></>} />
        <Route path="/risks/:documentId" element={<><DocHeader activeView="Workbench" /><RiskSummaryPage /></>} />
        <Route path="/audit/:documentId" element={<><DocHeader activeView="Audit Record" /><AuditRecordPage /></>} />
        {/* Legacy routes (demo mode, no real data) */}
        <Route path="/processing" element={<><Header docName="Demo Document" showViewSwitcher activeView="Processing" /><ProcessingPage /></>} />
        <Route path="/workbench" element={<><Header docName="Demo Document" showViewSwitcher activeView="Workbench" /><WorkbenchPage /></>} />
        <Route path="/risks" element={<><Header docName="Demo Document" showViewSwitcher activeView="Workbench" /><RiskSummaryPage /></>} />
        <Route path="/audit" element={<><Header docName="Demo Document" showViewSwitcher activeView="Audit Record" /><AuditRecordPage /></>} />
        <Route path="/settings" element={<><Header showSettings /><SettingsPage /></>} />
      </Routes>
    </div>
  );
};

export default App;
