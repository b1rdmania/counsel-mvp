import React, { useState } from 'react';

const customStyles = {
  mainWorkspace: { flex: 1, display: 'flex', overflow: 'hidden' },
  documentPane: { flex: 1, backgroundColor: '#1C1C1E', overflowY: 'auto', padding: '40px 60px', display: 'flex', justifyContent: 'center' },
  documentContent: { maxWidth: '720px', width: '100%', color: '#D1D1D6', fontSize: '14px', lineHeight: 1.7 },
  documentH2: { fontSize: '16px', fontWeight: 600, marginTop: '32px', marginBottom: '16px', color: '#EBEBF5' },
  hlHigh: { backgroundColor: 'rgba(255, 69, 58, 0.1)', color: '#FF8A84', borderBottom: '1px dotted #FF453A', borderRadius: '3px', cursor: 'pointer', padding: '2px 4px', margin: '0 -4px' },
  hlHighActive: { backgroundColor: 'rgba(255, 69, 58, 0.1)', color: '#FF8A84', borderBottom: '1px dotted #FF453A', borderRadius: '3px', cursor: 'pointer', padding: '2px 4px', margin: '0 -4px', boxShadow: '0 0 0 1px #FF8A84' },
  hlMed: { backgroundColor: 'rgba(255, 159, 10, 0.1)', color: '#FFD426', borderBottom: '1px dotted #FF9F0A', borderRadius: '3px', cursor: 'pointer', padding: '2px 4px', margin: '0 -4px' },
  hlMedActive: { backgroundColor: 'rgba(255, 159, 10, 0.1)', color: '#FFD426', borderBottom: '1px dotted #FF9F0A', borderRadius: '3px', cursor: 'pointer', padding: '2px 4px', margin: '0 -4px', boxShadow: '0 0 0 1px #FFD426' },
  riskDashboard: { width: '480px', backgroundColor: '#262628', borderLeft: '1px solid #48484A', display: 'flex', flexDirection: 'column' },
  panelHeader: { height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', backgroundColor: '#2D2D2F', borderBottom: '1px solid #48484A' },
  headerTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 },
  riskStats: { display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.1)', borderBottom: '1px solid #38383A' },
  statPill: { flex: 1, padding: '10px', borderRadius: '6px', backgroundColor: '#1E1E20', border: '1px solid #38383A' },
  statCount: { fontSize: '18px', fontWeight: 600, display: 'block' },
  statLabel: { fontSize: '10px', color: 'rgba(235, 235, 245, 0.6)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  riskList: { flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' },
  riskItem: { backgroundColor: '#1E1E20', border: '1px solid #38383A', borderRadius: '8px', padding: '12px', cursor: 'pointer', transition: 'border-color 0.2s' },
  riskItemActive: { backgroundColor: 'rgba(255, 255, 255, 0.1)', border: '1px solid #0A84FF', borderRadius: '8px', padding: '12px', cursor: 'pointer', transition: 'border-color 0.2s' },
  riskItemHover: { backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid #48484A', borderRadius: '8px', padding: '12px', cursor: 'pointer', transition: 'border-color 0.2s' },
  riskMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' },
  badgeHigh: { padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: 'rgba(255, 69, 58, 0.1)', color: '#FF453A' },
  badgeMed: { padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: 'rgba(255, 159, 10, 0.1)', color: '#FF9F0A' },
  riskClauseRef: { fontSize: '11px', color: 'rgba(235, 235, 245, 0.3)', fontFamily: '"SF Mono", "Menlo", "Consolas", monospace' },
  riskTitle: { fontSize: '13px', fontWeight: 600, color: '#EBEBF5', marginBottom: '4px' },
  riskPreview: { fontSize: '12px', color: 'rgba(235, 235, 245, 0.6)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  quickActions: { display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '8px' },
  actionLink: { fontSize: '11px', color: '#0A84FF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' },
  icon: { width: '14px', height: '14px', fill: 'currentColor' },
};

const riskData = [
  { id: 1, severity: 'high', clause: 'Clause 8.1(c)', title: 'Uncapped IP Indemnification', preview: 'Strict liability for IP infringement regardless of knowledge or foreseeability. Removes standard qualifiers.', highlightId: 'hl-8-1-c' },
  { id: 2, severity: 'high', clause: 'Clause 9.1', title: 'Broad Direct Damage Exclusion', preview: 'Potential exclusion of core service failure damages due to narrow definition of direct losses.', highlightId: null },
  { id: 3, severity: 'high', clause: 'Clause 14.2', title: 'Unlimited Audit Rights', preview: 'Customer may audit Vendor facilities at any time without prior notice or scope limitations.', highlightId: null },
  { id: 4, severity: 'medium', clause: 'Clause 8.2', title: 'Asymmetric Indemnity Caps', preview: 'Purchaser indemnity is capped at SOW value while Vendor indemnity remains uncapped.', highlightId: 'hl-8-2' },
  { id: 5, severity: 'medium', clause: 'Clause 10.1', title: 'Termination for Convenience', preview: '30-day notice period is shorter than market standard for enterprise implementations (90 days).', highlightId: 'hl-10-1' },
  { id: 6, severity: 'medium', clause: 'Clause 4.3', title: 'Net 90 Payment Terms', preview: 'Payment cycle exceeds typical Net 30/45. Impacts cash flow projections for fiscal year.', highlightId: null },
  { id: 7, severity: 'medium', clause: 'Clause 22.1', title: 'Governing Law: England & Wales', preview: 'Deviation from US HQ standard (Delaware). Requires local counsel review for enforcement.', highlightId: null },
];

const WarningIcon = () => (
  <svg style={{ ...customStyles.icon, color: '#FF453A' }} viewBox="0 0 24 24">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
  </svg>
);

const RiskItem = ({ risk, isActive, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  let itemStyle = customStyles.riskItem;
  if (isActive) itemStyle = customStyles.riskItemActive;
  else if (isHovered) itemStyle = customStyles.riskItemHover;

  return (
    <div style={itemStyle} onClick={() => onClick(risk)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div style={customStyles.riskMeta}>
        <span style={risk.severity === 'high' ? customStyles.badgeHigh : customStyles.badgeMed}>
          {risk.severity === 'high' ? 'High Risk' : 'Medium Risk'}
        </span>
        <span style={customStyles.riskClauseRef}>{risk.clause}</span>
      </div>
      <div style={customStyles.riskTitle}>{risk.title}</div>
      <div style={customStyles.riskPreview}>{risk.preview}</div>
      {(isHovered || isActive) && (
        <div style={customStyles.quickActions}>
          <button style={customStyles.actionLink} onClick={(e) => { e.stopPropagation(); onClick(risk); }}>
            Jump to Clause →
          </button>
        </div>
      )}
    </div>
  );
};

const RiskSummaryPage = () => {
  const [activeRisk, setActiveRisk] = useState(riskData[0]);

  const handleRiskClick = (risk) => { setActiveRisk(risk); };

  const getHighlightStyle = (highlightId) => {
    if (!highlightId) return customStyles.hlHigh;
    if (activeRisk && activeRisk.highlightId === highlightId) {
      return highlightId.includes('8-1') ? customStyles.hlHighActive : customStyles.hlMedActive;
    }
    if (highlightId === 'hl-8-1-c') return customStyles.hlHigh;
    return customStyles.hlMed;
  };

  return (
    <div style={customStyles.mainWorkspace}>
      <div style={customStyles.documentPane}>
        <div style={customStyles.documentContent}>
          <h2 style={customStyles.documentH2}>8. Indemnification</h2>
          <p>
            8.1 <strong>By Vendor.</strong> Vendor shall indemnify, defend, and hold harmless Purchaser and its
            officers, directors, employees, and agents from and against any and all claims, damages, liabilities,
            costs, and expenses (including reasonable attorneys' fees) arising out of or related to: (a) any breach of
            Vendor's representations or warranties herein; (b) any negligence or willful misconduct by Vendor; or{' '}
            <span style={getHighlightStyle('hl-8-1-c')} onClick={() => handleRiskClick(riskData[0])}>
              (c) any claim that the Services or Deliverables infringe upon the intellectual property rights of any
              third party, regardless of whether such infringement was reasonably foreseeable or known to Vendor.
            </span>
          </p>
          <p style={{ marginTop: '16px' }}>
            8.2 <strong>By Purchaser.</strong> Purchaser shall indemnify and hold harmless Vendor against claims
            arising solely from Vendor's compliance with Purchaser's specific written designs or instructions,{' '}
            <span style={getHighlightStyle('hl-8-2')} onClick={() => handleRiskClick(riskData[3])}>
              provided liability is capped at amounts paid under the applicable SOW.
            </span>
          </p>
          <h2 style={customStyles.documentH2}>9. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL EITHER PARTY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR
            CONSEQUENTIAL DAMAGES. VENDOR'S TOTAL AGGREGATE LIABILITY ARISING OUT OF THIS AGREEMENT SHALL NOT EXCEED
            THE TOTAL AMOUNTS PAID BY PURCHASER TO VENDOR IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>
          <h2 style={customStyles.documentH2}>10. Term and Termination</h2>
          <p>
            10.1 <strong>Term.</strong> This Agreement shall commence on the Effective Date and continue for a period
            of five (5) years unless earlier terminated.{' '}
            <span style={getHighlightStyle('hl-10-1')} onClick={() => handleRiskClick(riskData[4])}>
              Either party may terminate for convenience upon 30 days written notice.
            </span>
          </p>
        </div>
      </div>

      <div style={customStyles.riskDashboard}>
        <div style={customStyles.panelHeader}>
          <div style={customStyles.headerTitle}>
            <WarningIcon />
            Risk Summary
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' }}>Sorted by Severity</div>
        </div>

        <div style={customStyles.riskStats}>
          <div style={customStyles.statPill}>
            <span style={{ ...customStyles.statCount, color: '#FF453A' }}>3</span>
            <span style={customStyles.statLabel}>Critical</span>
          </div>
          <div style={customStyles.statPill}>
            <span style={{ ...customStyles.statCount, color: '#FF9F0A' }}>11</span>
            <span style={customStyles.statLabel}>Medium</span>
          </div>
          <div style={customStyles.statPill}>
            <span style={{ ...customStyles.statCount, color: '#EBEBF5' }}>14</span>
            <span style={customStyles.statLabel}>Total Risks</span>
          </div>
        </div>

        <div style={customStyles.riskList}>
          {riskData.map((risk) => (
            <RiskItem key={risk.id} risk={risk} isActive={activeRisk && activeRisk.id === risk.id} onClick={handleRiskClick} />
          ))}
          <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(235, 235, 245, 0.3)', fontSize: '11px' }}>
            + 7 additional medium risks identified below
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskSummaryPage;
