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

const bodyStyle = {
  backgroundColor: '#1C1C1E',
  color: '#EBEBF5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
  gap: '2px',
  overflowY: 'auto',
};

const settingsAreaStyle = {
  borderTop: '1px solid #38383A',
  padding: '12px 0',
};

const mainContentStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

// SVG Icons for each module
const ResearchIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1L1 7l11 6 11-6-11-6z" />
    <path d="M1 17l11 6 11-6" />
    <path d="M1 12l11 6 11-6" />
  </svg>
);

const AdvisorIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
    <circle cx="12" cy="12" r="3" fill={color} opacity="0.3" />
  </svg>
);

const ScannerIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="15" x2="15" y2="15" />
    <line x1="9" y1="11" x2="15" y2="11" />
  </svg>
);

const TimelineIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DraftingIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

const SettingsIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const navItems = [
  { path: '/research', label: 'Case Law Research', Icon: ResearchIcon },
  { path: '/advisor', label: 'Litigation Advisor', Icon: AdvisorIcon },
  { path: '/scanner', label: 'Contract Scanner', Icon: ScannerIcon },
  { path: '/timeline', label: 'Timeline Builder', Icon: TimelineIcon },
  { path: '/drafting', label: 'Letter Drafting', Icon: DraftingIcon },
];

const NavItem = ({ item, isActive, onClick, isHovered, onHover, onLeave }) => {
  const color = isActive ? '#0A84FF' : (isHovered ? '#EBEBF5' : 'rgba(235, 235, 245, 0.6)');

  return (
    <div
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 20px',
        cursor: 'pointer',
        color,
        fontSize: '13px',
        fontWeight: isActive ? 600 : 400,
        backgroundColor: isActive ? 'rgba(10, 132, 255, 0.1)' : (isHovered ? 'rgba(255, 255, 255, 0.04)' : 'transparent'),
        borderLeft: isActive ? '3px solid #0A84FF' : '3px solid transparent',
        transition: 'all 0.15s ease',
      }}
    >
      <item.Icon color={color} />
      <span>{item.label}</span>
    </div>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = React.useState(null);
  const [settingsHovered, setSettingsHovered] = React.useState(false);

  const isActive = (path) => location.pathname.startsWith(path);

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

      {/* Navigation */}
      <div style={navSectionStyle}>
        <div style={{ padding: '0 20px', marginBottom: '8px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(235, 235, 245, 0.3)', fontWeight: 600 }}>
            Modules
          </span>
        </div>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isActive={isActive(item.path)}
            onClick={() => navigate(item.path)}
            isHovered={hoveredItem === item.path}
            onHover={() => setHoveredItem(item.path)}
            onLeave={() => setHoveredItem(null)}
          />
        ))}
      </div>

      {/* Settings */}
      <div style={settingsAreaStyle}>
        <div
          onClick={() => navigate('/settings')}
          onMouseEnter={() => setSettingsHovered(true)}
          onMouseLeave={() => setSettingsHovered(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 20px',
            cursor: 'pointer',
            color: isActive('/settings') ? '#0A84FF' : (settingsHovered ? '#EBEBF5' : 'rgba(235, 235, 245, 0.6)'),
            fontSize: '13px',
            fontWeight: isActive('/settings') ? 600 : 400,
            backgroundColor: isActive('/settings') ? 'rgba(10, 132, 255, 0.1)' : (settingsHovered ? 'rgba(255, 255, 255, 0.04)' : 'transparent'),
            borderLeft: isActive('/settings') ? '3px solid #0A84FF' : '3px solid transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <SettingsIcon color={isActive('/settings') ? '#0A84FF' : (settingsHovered ? '#EBEBF5' : 'rgba(235, 235, 245, 0.6)')} />
          <span>Settings</span>
        </div>
      </div>
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

          {/* Case Law Research */}
          <Route path="/research" element={<CaseLawPage />} />

          {/* Litigation Advisor */}
          <Route path="/advisor" element={<LitigationAdvisorPage />} />

          {/* Contract Scanner — wraps existing flow */}
          <Route path="/scanner" element={<ContractScannerPage />} />
          <Route path="/scanner/upload" element={<ContractScannerPage />} />
          <Route path="/scanner/processing/:documentId" element={<ContractScannerPage />} />
          <Route path="/scanner/review/:documentId" element={<ContractScannerPage />} />
          <Route path="/scanner/risks/:documentId" element={<ContractScannerPage />} />
          <Route path="/scanner/audit/:documentId" element={<ContractScannerPage />} />

          {/* Timeline Builder */}
          <Route path="/timeline" element={<TimelinePage />} />

          {/* Letter Drafting */}
          <Route path="/drafting" element={<LetterDraftingPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />

          {/* Legacy routes redirect to scanner */}
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
