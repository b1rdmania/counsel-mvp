import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDocument } from '../api/client';

const statusToProgress = {
  queued: 5,
  parsing: 25,
  analysing: 50,
  redlining: 75,
  summarising: 90,
  review_pending: 100,
  completed: 100,
  failed: 0,
};

const statusLabels = {
  queued: 'Queued...',
  parsing: 'Extracting Clauses...',
  analysing: 'Analysing Risk...',
  redlining: 'Generating Redlines...',
  summarising: 'Writing Summary...',
  review_pending: 'Complete — Ready for Review',
  completed: 'Complete',
  failed: 'Pipeline Failed',
};

const ProcessingPage = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [progress, setProgress] = useState(0);
  const [clausesFound, setClausesFound] = useState(0);
  const [criticalRisks, setCriticalRisks] = useState(0);
  const [statusLabel, setStatusLabel] = useState('Waiting...');
  const [docData, setDocData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [auditEntries, setAuditEntries] = useState([]);

  // Live polling mode
  useEffect(() => {
    if (!documentId) return;

    const poll = async () => {
      try {
        const doc = await getDocument(documentId);
        setDocData(doc);
        const p = statusToProgress[doc.status] || 0;
        setProgress(p);
        setStatusLabel(statusLabels[doc.status] || doc.status);
        setClausesFound(doc.total_clauses || 0);
        setCriticalRisks(doc.high_risk || 0);

        // Build audit feed entries from real audit log
        if (doc.audit_log && doc.audit_log.length > 0) {
          setAuditEntries(doc.audit_log.map(a => ({
            id: a.id,
            time: new Date(a.timestamp).toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 }),
            domain: a.agent_id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            entity: `${a.action} (${a.duration_ms}ms, ${a.tokens_in + a.tokens_out} tokens)`,
            conf: a.status === 'success' ? '100%' : '--',
            confColor: a.status === 'success' ? '#32D74B' : '#FF453A',
            status: a.status === 'success' ? 'Complete' : a.status === 'failed' ? 'Failed' : 'Processing',
            statusColor: a.status === 'success' ? '#32D74B' : a.status === 'failed' ? '#FF453A' : '#0A84FF',
            dotClass: a.status === 'success' ? 'safe' : a.status === 'failed' ? 'high' : 'proc',
          })));
        }

        if (doc.status === 'failed') {
          setFailed(true);
          return;
        }

        if (doc.status === 'review_pending' || doc.status === 'completed') {
          setTimeout(() => navigate(`/workbench/${documentId}`), 1200);
          return;
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [documentId, navigate]);

  // No documentId — show empty state
  if (!documentId) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E20' }}>
        <div style={{ textAlign: 'center', color: 'rgba(235, 235, 245, 0.6)', fontSize: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>&#128196;</div>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: '#EBEBF5' }}>No document selected</div>
          <div style={{ fontSize: '13px' }}>Upload a document from the intake page to begin processing.</div>
        </div>
      </div>
    );
  }

  const deviations = docData ? (docData.medium_risk || 0) : 0;

  const tableRows = auditEntries;

  const getDotStyle = (dotClass) => {
    const base = { width: 6, height: 6, borderRadius: '50%', display: 'inline-block' };
    if (dotClass === 'high') return { ...base, backgroundColor: '#FF453A', boxShadow: '0 0 4px #FF453A' };
    if (dotClass === 'medium') return { ...base, backgroundColor: '#FF9F0A' };
    if (dotClass === 'safe') return { ...base, backgroundColor: '#32D74B' };
    if (dotClass === 'proc') return { ...base, backgroundColor: '#0A84FF' };
    return base;
  };

  const thStyle = { textAlign: 'left', padding: '10px 20px', fontSize: 11, color: 'rgba(235, 235, 245, 0.3)', textTransform: 'uppercase', borderBottom: '1px solid #48484A', position: 'sticky', top: 0, background: '#1E1E20', zIndex: 5 };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: 320, backgroundColor: '#262628', borderRight: '1px solid #48484A', display: 'flex', flexDirection: 'column', padding: 24, gap: 40 }}>
        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235, 235, 245, 0.6)' }}>Neural Mapping</span>
            <span style={{ fontSize: 32, fontWeight: 200, color: '#EBEBF5', fontVariantNumeric: 'tabular-nums' }}>
              {progress}<span style={{ fontSize: 14, opacity: 0.5 }}>%</span>
            </span>
          </div>
          <div style={{ height: 4, background: '#333', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: failed ? '#FF453A' : '#0A84FF', borderRadius: 2, transition: 'width 0.5s ease' }} />
          </div>
          <div style={{ marginTop: 12, fontSize: 11, color: failed ? '#FF453A' : 'rgba(235, 235, 245, 0.3)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{statusLabel}</span>
            <span>{progress >= 100 ? 'Done' : failed ? 'Error' : `Est. ${Math.max(0, Math.round((100 - progress) * 0.5))}s remaining`}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #38383A', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235, 235, 245, 0.3)' }}>Clauses Found</span>
            <span style={{ fontSize: 24, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{clausesFound}</span>
            <span style={{ fontSize: 10, color: '#32D74B', display: 'flex', alignItems: 'center', gap: 2 }}>Live</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #38383A', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235, 235, 245, 0.3)' }}>Critical Risks</span>
            <span style={{ fontSize: 24, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: '#FF453A' }}>{criticalRisks}</span>
            <span style={{ fontSize: 10, color: '#FF453A', display: 'flex', alignItems: 'center', gap: 2 }}>Live</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #38383A', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235, 235, 245, 0.3)' }}>Deviations</span>
            <span style={{ fontSize: 24, fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: '#FF9F0A' }}>{deviations}</span>
            <span style={{ fontSize: 10, color: '#FF9F0A', display: 'flex', alignItems: 'center', gap: 2 }}>Live update</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #38383A', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235, 235, 245, 0.3)' }}>Knowledge Match</span>
            <span style={{ fontSize: 24, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>--</span>
            <span style={{ fontSize: 10, color: 'rgba(235, 235, 245, 0.3)', display: 'flex', alignItems: 'center', gap: 2 }}>Global Policy</span>
          </div>
        </div>

        {/* Active Context */}
        <div style={{ marginTop: 'auto', padding: 16, background: 'rgba(10, 132, 255, 0.05)', borderRadius: 8, border: '1px dashed #0A84FF' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#0A84FF', marginBottom: 8 }}>Active Context</div>
          <div style={{ fontSize: 12, lineHeight: 1.4, color: 'rgba(235, 235, 245, 0.6)' }}>
            Processing <strong>{docData?.filename || 'document'}</strong> through 4-agent pipeline...
          </div>
        </div>
      </aside>

      {/* Main Feed */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1E1E20' }}>
        <div style={{ height: 48, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #48484A', backgroundColor: '#262628' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: failed ? '#FF453A' : '#0A84FF' }}>
            <div style={{ width: 8, height: 8, backgroundColor: failed ? '#FF453A' : '#0A84FF', borderRadius: '50%', boxShadow: `0 0 8px ${failed ? '#FF453A' : '#0A84FF'}` }} />
            <span>{`Pipeline — ${statusLabel}`}</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tableRows.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, width: 100 }}>Time</th>
                  <th style={{ ...thStyle, width: 180 }}>Domain</th>
                  <th style={thStyle}>Entity / Clause Analysis</th>
                  <th style={{ ...thStyle, width: 100 }}>Conf.</th>
                  <th style={{ ...thStyle, width: 160 }}>System Tag</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.id} style={{ backgroundColor: row.rowBg || 'transparent' }}>
                    <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: '"SF Mono", "Menlo", "Consolas", monospace', color: 'rgba(235, 235, 245, 0.3)', fontSize: 11, verticalAlign: 'middle' }}>
                      {row.time}
                    </td>
                    <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' }}>
                      <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 12, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #38383A', fontSize: 11, color: 'rgba(235, 235, 245, 0.6)' }}>
                        {row.domain}
                      </span>
                    </td>
                    <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', color: 'rgba(235, 235, 245, 0.6)', verticalAlign: 'middle' }}>
                      {row.entity}
                    </td>
                    <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', fontFamily: '"SF Mono", "Menlo", "Consolas", monospace', color: row.confColor, fontSize: 11, verticalAlign: 'middle' }}>
                      {row.conf}
                    </td>
                    <td style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', verticalAlign: 'middle' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 500, color: row.statusColor }}>
                        <div style={getDotStyle(row.dotClass)} />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(235, 235, 245, 0.3)', fontSize: '13px' }}>
              Waiting for pipeline events...
            </div>
          )}
        </div>

        <footer style={{ height: 32, backgroundColor: '#262628', borderTop: '1px solid #48484A', padding: '0 20px', display: 'flex', alignItems: 'center', fontSize: 11, color: 'rgba(235, 235, 245, 0.3)', gap: 16 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
            </svg>
            Claude API: Connected
          </span>
          <span>|</span>
          <span>{`Pipeline: ${statusLabel}`}</span>
          <span>|</span>
          <span style={{ color: '#0A84FF' }}>Zero Data Retention</span>
        </footer>
      </main>
    </div>
  );
};

export default ProcessingPage;
