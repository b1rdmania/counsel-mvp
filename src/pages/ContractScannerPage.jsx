import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import IntakePage from './IntakePage.jsx';
import ProcessingPage from './ProcessingPage.jsx';
import WorkbenchPage from './WorkbenchPage.jsx';
import RiskSummaryPage from './RiskSummaryPage.jsx';
import AuditRecordPage from './AuditRecordPage.jsx';

const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const subNavItems = [
  { label: 'Upload', path: '/scanner', matchPrefix: '/scanner', exact: true },
  { label: 'Processing', path: '/scanner/processing', matchPrefix: '/scanner/processing', needsDoc: true },
  { label: 'Review', path: '/scanner/review', matchPrefix: '/scanner/review', needsDoc: true },
  { label: 'Risk Summary', path: '/scanner/risks', matchPrefix: '/scanner/risks', needsDoc: true },
  { label: 'Audit', path: '/scanner/audit', matchPrefix: '/scanner/audit', needsDoc: true },
];

const SubNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredItem, setHoveredItem] = React.useState(null);

  // Extract documentId from the URL if present
  const pathParts = location.pathname.split('/');
  const docId = pathParts.length >= 4 ? pathParts[3] : null;

  const getActivePath = () => {
    const path = location.pathname;
    if (path.startsWith('/scanner/processing')) return '/scanner/processing';
    if (path.startsWith('/scanner/review')) return '/scanner/review';
    if (path.startsWith('/scanner/risks')) return '/scanner/risks';
    if (path.startsWith('/scanner/audit')) return '/scanner/audit';
    return '/scanner';
  };

  const activePath = getActivePath();

  return (
    <div style={{
      height: '40px', backgroundColor: '#262628', borderBottom: '1px solid #48484A',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: '4px', flexShrink: 0,
    }}>
      {subNavItems.map((item) => {
        const isActive = activePath === item.matchPrefix;
        const isDisabled = item.needsDoc && !docId;
        const isHovered = hoveredItem === item.path;

        const handleClick = () => {
          if (isDisabled) return;
          if (item.needsDoc && docId) {
            navigate(`${item.path}/${docId}`);
          } else {
            navigate(item.path);
          }
        };

        return (
          <button
            key={item.path}
            onClick={handleClick}
            onMouseEnter={() => setHoveredItem(item.path)}
            onMouseLeave={() => setHoveredItem(null)}
            style={{
              background: isActive ? 'rgba(10,132,255,0.15)' : (isHovered && !isDisabled ? 'rgba(255,255,255,0.04)' : 'transparent'),
              border: 'none',
              color: isActive ? '#0A84FF' : (isDisabled ? 'rgba(235,235,245,0.15)' : 'rgba(235,235,245,0.6)'),
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: isActive ? 600 : 400,
              borderRadius: '4px',
              cursor: isDisabled ? 'default' : 'pointer',
              transition: 'all 0.15s',
              fontFamily,
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
};

const ContractScannerPage = () => {
  const location = useLocation();

  const renderContent = () => {
    const path = location.pathname;

    if (path.startsWith('/scanner/processing/')) return <ProcessingPage />;
    if (path.startsWith('/scanner/review/')) return <WorkbenchPage />;
    if (path.startsWith('/scanner/risks/')) return <RiskSummaryPage />;
    if (path.startsWith('/scanner/audit/')) return <AuditRecordPage />;
    return <IntakePage />;
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <SubNav />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default ContractScannerPage;
