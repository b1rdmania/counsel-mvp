import React, { useState } from 'react';

const customStyles = {
  filterBar: {
    height: '40px', backgroundColor: '#262628', borderBottom: '1px solid #48484A',
    display: 'flex', alignItems: 'center', padding: '0 16px', gap: '16px', flexShrink: 0,
  },
  searchInput: {
    backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #38383A', color: '#EBEBF5',
    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', width: '240px', outline: 'none',
  },
  dataTableWrapper: { flex: 1, overflowY: 'auto', backgroundColor: '#1E1E20' },
  dataTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  dataTableTh: {
    position: 'sticky', top: 0, backgroundColor: '#262628', color: 'rgba(235, 235, 245, 0.6)',
    fontSize: '11px', fontWeight: 500, textTransform: 'capitalize', padding: '8px 12px',
    borderBottom: '1px solid #48484A', zIndex: 10,
  },
  dataTableTd: {
    padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)',
    color: '#EBEBF5', fontSize: '12px', cursor: 'pointer',
  },
  tdMono: { fontFamily: '"SF Mono", "Menlo", "Consolas", monospace', fontSize: '11px', color: 'rgba(235, 235, 245, 0.6)' },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)',
  },
  modalContainer: {
    width: '800px', backgroundColor: '#262628', border: '1px solid #48484A', borderRadius: '12px',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.5)', display: 'flex', flexDirection: 'column',
    maxHeight: '80vh', overflow: 'hidden',
  },
  modalHeader: { padding: '16px 20px', borderBottom: '1px solid #48484A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: '14px', fontWeight: 600, color: '#EBEBF5' },
  closeBtn: { color: 'rgba(235, 235, 245, 0.6)', cursor: 'pointer', background: 'none', border: 'none' },
  modalBody: { padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' },
  metadataGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
    backgroundColor: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid #38383A',
  },
  metaItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  metaLabel: { fontSize: '10px', textTransform: 'uppercase', color: 'rgba(235, 235, 245, 0.3)', fontWeight: 600, letterSpacing: '0.5px' },
  metaValue: { fontSize: '13px', color: '#EBEBF5' },
  diffPane: { backgroundColor: '#000', borderRadius: '6px', overflow: 'hidden', border: '1px solid #38383A' },
  diffHeader: { backgroundColor: '#38383A', padding: '6px 12px', fontSize: '11px', fontWeight: 600, color: 'rgba(235, 235, 245, 0.6)', display: 'flex', justifyContent: 'space-between' },
  diffContent: { padding: '16px', fontFamily: '"SF Mono", "Menlo", "Consolas", monospace', fontSize: '12px', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: '#EBEBF5' },
  diffRemoved: { backgroundColor: 'rgba(255, 69, 58, 0.15)', color: '#FF8A84', textDecoration: 'line-through', padding: '0 4px', borderRadius: '2px' },
  diffAdded: { backgroundColor: 'rgba(50, 215, 75, 0.15)', color: '#32D74B', padding: '0 4px', borderRadius: '2px' },
  reasoningBox: { backgroundColor: 'rgba(10, 132, 255, 0.15)', borderLeft: '3px solid #0A84FF', padding: '12px 16px', borderRadius: '0 6px 6px 0' },
  modalFooter: { padding: '16px 20px', borderTop: '1px solid #48484A', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'rgba(0,0,0,0.1)' },
  btn: { padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1px solid transparent', transition: '0.1s' },
  btnSecondary: { background: 'transparent', borderColor: '#48484A', color: '#EBEBF5' },
  btnDanger: { background: 'transparent', borderColor: '#FF453A', color: '#FF453A' },
  icon: { width: '14px', height: '14px', fill: 'currentColor' },
};

const auditEvents = [
  {
    id: 1, timestamp: 'Oct 24, 2023 · 14:15:22', user: 'A. Mercer (Partner)',
    action: 'Accepted Edit', actionColor: '#32D74B', clause: 'Sec 8.1(c) IP Indemnity',
    summary: "Removed strict liability language and added 'valid' qualifier.",
    detail: {
      actor: 'A. Mercer (Partner)', timestampFull: 'October 24, 2023 at 14:15:22 GMT-4',
      clauseIdentity: 'Section 8.1(c) — Intellectual Property Indemnification',
      actionTaken: 'Accepted AI Revision', actionColor: '#32D74B', diffRef: 'SEC 8.1(c)',
      reasoning: 'Client policy forbids uncapped strict liability on IP. The addition of "valid" ensures we aren\'t liable for frivolous or expired patent claims. Removed foreseeable clause to align with market standard SaaS terms.',
    },
  },
  {
    id: 2, timestamp: 'Oct 24, 2023 · 14:12:05', user: 'A. Mercer (Partner)',
    action: 'Rejected Edit', actionColor: '#FF9F0A', clause: 'Sec 8.2 Purchaser Cap',
    summary: 'Maintained existing liability cap for purchaser designs.',
    detail: {
      actor: 'A. Mercer (Partner)', timestampFull: 'October 24, 2023 at 14:12:05 GMT-4',
      clauseIdentity: 'Section 8.2 — Purchaser Liability Cap',
      actionTaken: 'Rejected AI Revision', actionColor: '#FF9F0A', diffRef: 'SEC 8.2',
      reasoning: 'Existing liability cap for purchaser is within acceptable bounds. No change warranted.',
    },
  },
  {
    id: 3, timestamp: 'Oct 24, 2023 · 14:10:11', user: 'System (Counsel)',
    action: 'Flagged', actionColor: '#0A84FF', clause: 'Sec 8.1(c) IP Indemnity',
    summary: 'High severity risk: Uncapped liability detected.',
    detail: {
      actor: 'System (Counsel)', timestampFull: 'October 24, 2023 at 14:10:11 GMT-4',
      clauseIdentity: 'Section 8.1(c) — Intellectual Property Indemnification',
      actionTaken: 'Flagged', actionColor: '#0A84FF', diffRef: 'SEC 8.1(c)',
      reasoning: 'Automated analysis detected uncapped strict liability language. High severity risk flagged for partner review.',
    },
  },
];

const CloseIcon = () => (
  <svg style={customStyles.icon} viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const RevertIcon = () => (
  <svg style={{ width: '12px', height: '12px', fill: 'currentColor' }} viewBox="0 0 24 24">
    <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
  </svg>
);

const AuditDetailModal = ({ event, onClose }) => {
  const [btnSecHover, setBtnSecHover] = useState(false);
  const [btnDangerHover, setBtnDangerHover] = useState(false);

  if (!event) return null;
  const d = event.detail;

  return (
    <div style={customStyles.modalOverlay} onClick={onClose}>
      <div style={customStyles.modalContainer} onClick={e => e.stopPropagation()}>
        <div style={customStyles.modalHeader}>
          <div style={customStyles.modalTitle}>Audit Event Details</div>
          <button style={customStyles.closeBtn} onClick={onClose}><CloseIcon /></button>
        </div>

        <div style={customStyles.modalBody}>
          <div style={customStyles.metadataGrid}>
            <div style={customStyles.metaItem}>
              <span style={customStyles.metaLabel}>Actor</span>
              <span style={customStyles.metaValue}>{d.actor}</span>
            </div>
            <div style={customStyles.metaItem}>
              <span style={customStyles.metaLabel}>Timestamp</span>
              <span style={customStyles.metaValue}>{d.timestampFull}</span>
            </div>
            <div style={customStyles.metaItem}>
              <span style={customStyles.metaLabel}>Clause Identity</span>
              <span style={customStyles.metaValue}>{d.clauseIdentity}</span>
            </div>
            <div style={customStyles.metaItem}>
              <span style={customStyles.metaLabel}>Action Taken</span>
              <span style={{ ...customStyles.metaValue, color: d.actionColor, fontWeight: 600 }}>{d.actionTaken}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={customStyles.metaLabel}>Text Comparison</span>
            <div style={customStyles.diffPane}>
              <div style={customStyles.diffHeader}>
                <span>UNIFIED DIFF VIEW</span>
                <span>{d.diffRef}</span>
              </div>
              <div style={customStyles.diffContent}>
                {event.id === 1 ? (
                  <>
                    {'(c) any claim that the Services or Deliverables infringe upon the '}
                    <span style={customStyles.diffAdded}>valid</span>
                    {' intellectual property rights of any third party, '}
                    <span style={customStyles.diffRemoved}>
                      regardless of whether such infringement was reasonably foreseeable or known to Vendor.
                    </span>
                  </>
                ) : event.id === 2 ? (
                  <>
                    {'The total aggregate liability of Purchaser under this Agreement shall not exceed '}
                    <span style={customStyles.diffRemoved}>the greater of $10,000,000 or two times the fees paid.</span>
                    <span style={customStyles.diffAdded}>the fees paid in the twelve months prior to the claim.</span>
                  </>
                ) : (
                  <>
                    {'(c) any claim that the Services or Deliverables infringe upon the intellectual property rights of any third party, '}
                    <span style={{ color: '#FF453A', padding: '0 4px' }}>
                      [FLAGGED: uncapped strict liability — no "valid" qualifier, no foreseeability limitation]
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={customStyles.metaItem}>
            <span style={customStyles.metaLabel}>Reasoning & Internal Notes</span>
            <div style={customStyles.reasoningBox}>
              <span style={customStyles.metaValue}>{d.reasoning}</span>
            </div>
          </div>
        </div>

        <div style={customStyles.modalFooter}>
          <button
            style={{ ...customStyles.btn, ...customStyles.btnSecondary, ...(btnSecHover ? { background: 'rgba(255, 255, 255, 0.05)' } : {}) }}
            onMouseEnter={() => setBtnSecHover(true)}
            onMouseLeave={() => setBtnSecHover(false)}
            onClick={onClose}
          >
            Close
          </button>
          <button
            style={{ ...customStyles.btn, ...customStyles.btnDanger, ...(btnDangerHover ? { background: 'rgba(255, 69, 58, 0.1)' } : {}) }}
            onMouseEnter={() => setBtnDangerHover(true)}
            onMouseLeave={() => setBtnDangerHover(false)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RevertIcon />
              Revert Decision
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const AuditRecordPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);

  const filteredEvents = auditEvents.filter(event => {
    const term = searchTerm.toLowerCase();
    return (
      event.timestamp.toLowerCase().includes(term) ||
      event.user.toLowerCase().includes(term) ||
      event.action.toLowerCase().includes(term) ||
      event.clause.toLowerCase().includes(term) ||
      event.summary.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={customStyles.filterBar}>
        <input
          type="text"
          style={customStyles.searchInput}
          placeholder="Search audit history..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={customStyles.dataTableWrapper}>
        <table style={customStyles.dataTable}>
          <thead>
            <tr>
              <th style={{ ...customStyles.dataTableTh, width: '180px' }}>Timestamp</th>
              <th style={{ ...customStyles.dataTableTh, width: '180px' }}>User</th>
              <th style={{ ...customStyles.dataTableTh, width: '120px' }}>Action</th>
              <th style={{ ...customStyles.dataTableTh, width: '200px' }}>Target Clause</th>
              <th style={customStyles.dataTableTh}>Summary of Change</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(event => (
              <tr
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                onMouseEnter={() => setHoveredRow(event.id)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ ...customStyles.dataTableTd, ...customStyles.tdMono, ...(hoveredRow === event.id ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}) }}>
                  {event.timestamp}
                </td>
                <td style={{ ...customStyles.dataTableTd, ...(hoveredRow === event.id ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}) }}>
                  {event.user}
                </td>
                <td style={{ ...customStyles.dataTableTd, ...(hoveredRow === event.id ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}) }}>
                  <span style={{ color: event.actionColor }}>{event.action}</span>
                </td>
                <td style={{ ...customStyles.dataTableTd, ...(hoveredRow === event.id ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}) }}>
                  {event.clause}
                </td>
                <td style={{ ...customStyles.dataTableTd, ...(hoveredRow === event.id ? { backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}) }}>
                  {event.summary}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedEvent && (
        <AuditDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default AuditRecordPage;
