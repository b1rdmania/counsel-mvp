import React, { useState, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const significanceColors = {
  high: '#FF453A',
  medium: '#FF9F0A',
  low: '#32D74B',
};

const TimelinePage = ({ matterId = null }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ date: '', description: '', source: '', significance: 'medium' });
  const fileInputRef = useRef(null);
  const timelineRef = useRef(null);

  // If a matterId is supplied, load that matter's events on mount
  useEffect(() => {
    if (!matterId) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/timeline/events?matter_id=${encodeURIComponent(matterId)}`)
      .then(r => r.ok ? r.json() : { events: [] })
      .then(data => {
        if (cancelled) return;
        const loaded = (data.events || []).map((e, i) => ({ ...e, id: e.id || `evt-${i}-${Date.now()}` }));
        setEvents(loaded.sort((a, b) => new Date(a.date) - new Date(b.date)));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [matterId]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (matterId) formData.append('matter_id', matterId);

      const url = matterId
        ? `${API_BASE}/api/timeline/extract?matter_id=${encodeURIComponent(matterId)}`
        : `${API_BASE}/api/timeline/extract`;
      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Extraction failed');
      const data = await res.json();
      const extracted = (data.events || []).map((e, i) => ({ ...e, id: e.id || `evt-${i}-${Date.now()}` }));
      setEvents(prev => [...prev, ...extracted].sort((a, b) => new Date(a.date) - new Date(b.date)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = () => {
    if (!newEvent.date || !newEvent.description) return;
    const evt = { ...newEvent, id: `manual-${Date.now()}` };
    setEvents(prev => [...prev, evt].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setNewEvent({ date: '', description: '', source: '', significance: 'medium' });
    setShowAddForm(false);
  };

  const removeEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleExport = () => {
    const csv = [
      'Date,Description,Source,Significance',
      ...events.map(e => `"${e.date}","${e.description}","${e.source || ''}","${e.significance || 'medium'}"`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'timeline-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputStyle = {
    backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #38383A', borderRadius: '6px',
    padding: '8px 12px', color: '#EBEBF5', fontSize: '13px', outline: 'none', fontFamily, width: '100%',
  };

  const selectStyle = {
    ...inputStyle, cursor: 'pointer', appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='%23EBEBF5'%3E%3Cpath d='M7 10l5 5 5-5H7z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        height: '52px', backgroundColor: '#262628', borderBottom: '1px solid #48484A',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#EBEBF5' }}>Timeline Builder</span>
          <span style={{ fontSize: '12px', color: 'rgba(235,235,245,0.4)' }}>
            {events.length} event{events.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: 'transparent', border: '1px solid #48484A', color: '#EBEBF5',
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily,
            }}
          >
            + Add Event
          </button>
          <button
            onClick={handleExport}
            disabled={events.length === 0}
            style={{
              backgroundColor: events.length > 0 ? '#0A84FF' : '#48484A', color: 'white', border: 'none',
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: events.length > 0 ? 'pointer' : 'default', fontFamily,
            }}
          >
            Export Timeline
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Upload / Controls Sidebar */}
        <div style={{
          width: '280px', minWidth: '280px', backgroundColor: '#1E1E20',
          borderRight: '1px solid #38383A', padding: '20px', overflowY: 'auto', flexShrink: 0,
        }}>
          {/* Upload Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '12px' }}>
              Extract from Document
            </div>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #48484A', borderRadius: '8px', padding: '20px',
                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: selectedFile ? 'rgba(10,132,255,0.05)' : 'rgba(255,255,255,0.02)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0A84FF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#48484A'; }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              {selectedFile ? (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#32D74B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#EBEBF5' }}>{selectedFile.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(235,235,245,0.4)' }}>Click to change</div>
                </>
              ) : (
                <>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(235,235,245,0.5)' }}>Drop document here</div>
                  <div style={{ fontSize: '11px', color: 'rgba(235,235,245,0.3)' }}>PDF, DOCX, or TXT</div>
                </>
              )}
            </div>
            <button
              onClick={handleExtract}
              disabled={!selectedFile || loading}
              style={{
                width: '100%', marginTop: '12px',
                backgroundColor: selectedFile && !loading ? '#0A84FF' : '#48484A', color: 'white', border: 'none',
                padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                cursor: selectedFile && !loading ? 'pointer' : 'default', fontFamily,
              }}
            >
              {loading ? 'Extracting Events...' : 'Extract Timeline'}
            </button>
            {error && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#FF453A' }}>{error}</div>
            )}
          </div>

          {/* Add Event Form */}
          {showAddForm && (
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid #38383A' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '12px' }}>
                Add Event Manually
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  placeholder="Event description..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  style={inputStyle}
                />
                <input
                  placeholder="Source document (optional)"
                  value={newEvent.source}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, source: e.target.value }))}
                  style={inputStyle}
                />
                <select
                  value={newEvent.significance}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, significance: e.target.value }))}
                  style={selectStyle}
                >
                  <option value="high">High Significance</option>
                  <option value="medium">Medium Significance</option>
                  <option value="low">Low Significance</option>
                </select>
                <button
                  onClick={addEvent}
                  disabled={!newEvent.date || !newEvent.description}
                  style={{
                    backgroundColor: newEvent.date && newEvent.description ? '#32D74B' : '#48484A',
                    color: 'white', border: 'none', padding: '8px', borderRadius: '6px',
                    fontSize: '12px', fontWeight: 600, cursor: newEvent.date && newEvent.description ? 'pointer' : 'default', fontFamily,
                  }}
                >
                  Add Event
                </button>
              </div>
            </div>
          )}

          {/* Event List */}
          <div>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '12px' }}>
              Events
            </div>
            {events.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.2)', textAlign: 'center', padding: '16px' }}>
                No events yet
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    padding: '10px 12px', marginBottom: '6px', borderRadius: '6px',
                    backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid #38383A',
                    borderLeft: `3px solid ${significanceColors[evt.significance] || significanceColors.medium}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '11px', fontFamily: '"SF Mono", monospace', color: 'rgba(235,235,245,0.4)' }}>
                      {evt.date}
                    </div>
                    <span
                      onClick={() => removeEvent(evt.id)}
                      style={{ cursor: 'pointer', color: 'rgba(235,235,245,0.2)', fontSize: '12px', lineHeight: 1 }}
                    >
                      x
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#EBEBF5', marginTop: '4px', lineHeight: 1.4 }}>
                    {evt.description}
                  </div>
                  {evt.source && (
                    <div style={{ fontSize: '10px', color: 'rgba(235,235,245,0.3)', marginTop: '4px' }}>
                      Source: {evt.source}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Visual Timeline */}
        <div ref={timelineRef} style={{ flex: 1, overflowX: 'auto', overflowY: 'auto', backgroundColor: '#1C1C1E', padding: '40px 32px' }}>
          {events.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.15)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <div style={{ marginTop: '16px', fontWeight: 600, color: '#EBEBF5', fontSize: '15px' }}>Timeline Builder</div>
              <div style={{ marginTop: '6px', color: 'rgba(235,235,245,0.4)', fontSize: '13px', textAlign: 'center', maxWidth: '400px' }}>
                Upload a document to automatically extract dates and events, or add events manually to build a chronological timeline.
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', minHeight: '200px' }}>
              {/* Horizontal timeline line */}
              <div style={{
                position: 'absolute', top: '50%', left: '0', right: '0',
                height: '2px', backgroundColor: '#38383A', transform: 'translateY(-1px)',
              }} />

              {/* Timeline events */}
              <div style={{
                display: 'flex', gap: '0', minWidth: events.length * 220 + 'px',
                position: 'relative',
              }}>
                {events.map((evt, i) => {
                  const isAbove = i % 2 === 0;
                  const color = significanceColors[evt.significance] || significanceColors.medium;

                  return (
                    <div
                      key={evt.id}
                      style={{
                        width: '200px', minWidth: '200px', position: 'relative',
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        paddingTop: isAbove ? '0' : '52%',
                        paddingBottom: isAbove ? '52%' : '0',
                      }}
                    >
                      {/* Event card */}
                      <div style={{
                        backgroundColor: '#262628', border: `1px solid ${color}40`,
                        borderRadius: '8px', padding: '12px', width: '180px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}>
                        <div style={{ fontSize: '11px', fontFamily: '"SF Mono", monospace', color, marginBottom: '6px' }}>
                          {evt.date}
                        </div>
                        <div style={{ fontSize: '12px', color: '#EBEBF5', lineHeight: 1.4, marginBottom: '6px' }}>
                          {evt.description}
                        </div>
                        {evt.source && (
                          <div style={{ fontSize: '10px', color: 'rgba(235,235,245,0.3)' }}>
                            {evt.source}
                          </div>
                        )}
                        <div style={{
                          display: 'inline-block', marginTop: '6px',
                          padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600,
                          backgroundColor: `${color}15`, color,
                        }}>
                          {evt.significance || 'medium'}
                        </div>
                      </div>

                      {/* Connector line */}
                      <div style={{
                        width: '2px', height: '20px', backgroundColor: color,
                      }} />

                      {/* Dot on timeline */}
                      <div style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        backgroundColor: color, border: '2px solid #1C1C1E',
                        boxShadow: `0 0 8px ${color}80`,
                        position: 'absolute',
                        top: '50%', transform: 'translate(-50%, -50%)', left: '50%',
                      }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
