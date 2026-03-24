import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDocument } from '../api/client';

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
  reasoningBox: { backgroundColor: 'rgba(10, 132, 255, 0.15)', borderLeft: '3px solid #0A84FF', padding: '12px 16px', borderRadius: '0 6px 6px 0' },
  modalFooter: { padding: '16px 20px', borderTop: '1px solid #48484A', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'rgba(0,0,0,0.1)' },
  btn: { padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: '1px solid transparent', transition: '0.1s' },
  btnSecondary: { background: 'transparent', borderColor: '#48484A', color: '#EBEBF5' },
  icon: { width: '14px', height: '14px', fill: 'currentColor' },
};

const CloseIcon = () => (
  <svg style={customStyles.icon} viewBox="0 0 24 24">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const AuditDetailModal = ({ event, onClose }) => {
  const [btnSecHover, setBtnSecHover] = useState(false);

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

          <div style={customStyles.metaItem}>
            <span style={customStyles.metaLabel}>Details</span>
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
        </div>
      </div>
    </div>
  );
};

const AuditRecordPage = () => {
  const { documentId } = useParams();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }
    getDocument(documentId).then(doc => {
      if (doc.audit_log && doc.audit_log.length > 0) {
        setEvents(doc.audit_log.map(a => ({
          id: a.id,
          timestamp: new Date(a.timestamp).toLocaleString(),
          user: a.agent_id === 'human' ? 'Lawyer' : `System (${a.agent_id.replace(/_/g, ' ')})`,
          action: a.status === 'success' ? 'Completed' : a.status,
          actionColor: a.status === 'success' ? '#32D74B' : a.status === 'failed' ? '#FF453A' : '#0A84FF',
          clause: a.action,
          summary: `${a.model || 'system'} — ${a.tokens_in + a.tokens_out} tokens, ${a.duration_ms}ms`,
          detail: {
            actor: a.agent_id, timestampFull: a.timestamp,
            clauseIdentity: a.action, actionTaken: a.status,
            actionColor: a.status === 'success' ? '#32D74B' : '#FF453A',
            diffRef: a.agent_id, reasoning: `Model: ${a.model || 'N/A'}, Input tokens: ${a.tokens_in}, Output tokens: ${a.tokens_out}, Duration: ${a.duration_ms}ms`,
          },
        })));
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [documentId]);

  const filteredEvents = events.filter(event => {
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
        {!documentId ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(235, 235, 245, 0.3)', fontSize: '14px', padding: '40px' }}>
            No document selected.
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(235, 235, 245, 0.6)', fontSize: '14px' }}>
            Loading...
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(235, 235, 245, 0.3)', fontSize: '14px', padding: '40px' }}>
            No audit records{searchTerm ? ' matching your search' : ''}.
          </div>
        ) : (
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
        )}
      </div>

      {selectedEvent && (
        <AuditDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default AuditRecordPage;
