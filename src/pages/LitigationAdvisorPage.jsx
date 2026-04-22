import React, { useState, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const emptyMatter = {
  id: null,
  title: '',
  summary: '',
  parties: [],
  keyIssues: [],
  strengths: [],
  weaknesses: [],
  opportunities: [],
  gameTheory: null,
};

const LitigationAdvisorPage = () => {
  const [matters, setMatters] = useState([]);
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [editingMatter, setEditingMatter] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [newParty, setNewParty] = useState('');
  const [newIssue, setNewIssue] = useState('');
  const chatEndRef = useRef(null);

  // Load matters from API
  useEffect(() => {
    fetch(`${API_BASE}/api/advisor/matters`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => setMatters(data.matters || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const selectMatter = (matter) => {
    setSelectedMatter(matter);
    setEditingMatter({ ...matter });
    setChatMessages([]);
    setIsCreating(false);
  };

  const startNewMatter = () => {
    const newMatter = { ...emptyMatter, id: `new-${Date.now()}`, title: 'New Matter' };
    setIsCreating(true);
    setSelectedMatter(newMatter);
    setEditingMatter({ ...newMatter });
    setChatMessages([]);
  };

  const updateField = (field, value) => {
    setEditingMatter(prev => ({ ...prev, [field]: value }));
  };

  const addParty = () => {
    if (!newParty.trim()) return;
    setEditingMatter(prev => ({ ...prev, parties: [...prev.parties, newParty.trim()] }));
    setNewParty('');
  };

  const removeParty = (index) => {
    setEditingMatter(prev => ({ ...prev, parties: prev.parties.filter((_, i) => i !== index) }));
  };

  const addIssue = () => {
    if (!newIssue.trim()) return;
    setEditingMatter(prev => ({ ...prev, keyIssues: [...prev.keyIssues, newIssue.trim()] }));
    setNewIssue('');
  };

  const removeIssue = (index) => {
    setEditingMatter(prev => ({ ...prev, keyIssues: prev.keyIssues.filter((_, i) => i !== index) }));
  };

  const handleAnalyze = async () => {
    if (!editingMatter) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`${API_BASE}/api/advisor/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMatter),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setEditingMatter(prev => ({
        ...prev,
        strengths: data.strengths || prev.strengths,
        weaknesses: data.weaknesses || prev.weaknesses,
        opportunities: data.opportunities || prev.opportunities,
        gameTheory: data.game_theory || prev.gameTheory,
      }));
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'system', text: `Analysis error: ${err.message}` }]);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !editingMatter) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/advisor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matter_id: editingMatter.id, message: userMsg }),
      });
      if (!res.ok) throw new Error('Chat failed');
      const data = await res.json();
      setChatMessages(prev => [...prev, { role: 'assistant', text: data.response || 'No response received.' }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'system', text: `Error: ${err.message}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #38383A', borderRadius: '6px',
    padding: '8px 12px', color: '#EBEBF5', fontSize: '13px', outline: 'none', fontFamily, width: '100%',
  };

  const pillStyle = (color) => ({
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500,
    backgroundColor: `${color}15`, color, marginRight: '6px', marginBottom: '6px',
  });

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Matter List Sidebar */}
      <div style={{
        width: '260px', minWidth: '260px', backgroundColor: '#262628',
        borderRight: '1px solid #48484A', display: 'flex', flexDirection: 'column', flexShrink: 0,
      }}>
        <div style={{
          height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', borderBottom: '1px solid #38383A', flexShrink: 0,
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#EBEBF5' }}>Matters</span>
          <button
            onClick={startNewMatter}
            style={{
              backgroundColor: '#0A84FF', color: 'white', border: 'none', padding: '4px 12px',
              borderRadius: '4px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily,
            }}
          >
            + New Matter
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {matters.length === 0 && !isCreating && (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'rgba(235,235,245,0.3)', fontSize: '12px' }}>
              No matters yet. Create one to get started.
            </div>
          )}
          {matters.map((matter, i) => (
            <div
              key={matter.id || i}
              onClick={() => selectMatter(matter)}
              style={{
                padding: '12px', borderRadius: '6px', marginBottom: '4px', cursor: 'pointer',
                backgroundColor: selectedMatter?.id === matter.id ? 'rgba(10,132,255,0.1)' : 'transparent',
                border: selectedMatter?.id === matter.id ? '1px solid rgba(10,132,255,0.3)' : '1px solid transparent',
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => {
                if (selectedMatter?.id !== matter.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                if (selectedMatter?.id !== matter.id) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '12px', color: '#EBEBF5', marginBottom: '4px' }}>
                {matter.title || 'Untitled Matter'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(235,235,245,0.4)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {matter.summary || 'No summary'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {!editingMatter ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1C1C1E' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.15)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <div style={{ marginTop: '16px', fontWeight: 600, color: '#EBEBF5', fontSize: '15px' }}>Litigation Advisor</div>
            <div style={{ marginTop: '6px', color: 'rgba(235,235,245,0.4)', fontSize: '13px', maxWidth: '400px' }}>
              Select an existing matter or create a new one to begin strategic analysis.
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Matter Editor */}
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#1C1C1E', padding: '24px 32px' }}>
            {/* Header bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <input
                value={editingMatter.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Matter title..."
                style={{
                  ...inputStyle, fontSize: '18px', fontWeight: 600, backgroundColor: 'transparent',
                  border: 'none', borderBottom: '1px solid #38383A', borderRadius: 0, padding: '4px 0',
                  width: 'auto', flex: 1, maxWidth: '500px',
                }}
              />
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                style={{
                  backgroundColor: analyzing ? '#48484A' : '#0A84FF', color: 'white', border: 'none',
                  padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
                  cursor: analyzing ? 'not-allowed' : 'pointer', fontFamily,
                }}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Strategy'}
              </button>
            </div>

            {/* Case Summary */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '8px' }}>
                Case Summary
              </div>
              <textarea
                value={editingMatter.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="Describe the case details, background, and key facts..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            {/* Parties Involved */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '8px' }}>
                Parties Involved
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '8px' }}>
                {editingMatter.parties.map((party, i) => (
                  <span key={i} style={pillStyle('#0A84FF')}>
                    {party}
                    <span onClick={() => removeParty(i)} style={{ cursor: 'pointer', opacity: 0.6 }}>x</span>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={newParty}
                  onChange={(e) => setNewParty(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addParty()}
                  placeholder="Add party name..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addParty} style={{ backgroundColor: 'transparent', border: '1px solid #48484A', color: '#EBEBF5', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily, whiteSpace: 'nowrap' }}>
                  Add
                </button>
              </div>
            </div>

            {/* Key Issues */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '8px' }}>
                Key Issues
              </div>
              {editingMatter.keyIssues.map((issue, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px',
                  marginBottom: '6px', borderRadius: '6px', backgroundColor: 'rgba(0,0,0,0.15)',
                  border: '1px solid #38383A',
                }}>
                  <span style={{ flex: 1, fontSize: '13px', color: '#EBEBF5' }}>{issue}</span>
                  <span onClick={() => removeIssue(i)} style={{ cursor: 'pointer', color: 'rgba(235,235,245,0.3)', fontSize: '14px' }}>x</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={newIssue}
                  onChange={(e) => setNewIssue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addIssue()}
                  placeholder="Add key issue..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={addIssue} style={{ backgroundColor: 'transparent', border: '1px solid #48484A', color: '#EBEBF5', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily, whiteSpace: 'nowrap' }}>
                  Add
                </button>
              </div>
            </div>

            {/* Strategy Panel - SWO */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Strengths', items: editingMatter.strengths, color: '#32D74B' },
                { label: 'Weaknesses', items: editingMatter.weaknesses, color: '#FF453A' },
                { label: 'Opportunities', items: editingMatter.opportunities, color: '#0A84FF' },
              ].map(({ label, items, color }) => (
                <div key={label} style={{
                  backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid #38383A',
                  borderRadius: '8px', padding: '16px', minHeight: '140px',
                }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color, fontWeight: 600, marginBottom: '12px' }}>
                    {label}
                  </div>
                  {items && items.length > 0 ? items.map((item, i) => (
                    <div key={i} style={{
                      padding: '6px 10px', marginBottom: '6px', borderRadius: '4px',
                      backgroundColor: `${color}10`, fontSize: '12px', color: 'rgba(235,235,245,0.7)', lineHeight: 1.4,
                    }}>
                      {item}
                    </div>
                  )) : (
                    <div style={{ fontSize: '11px', color: 'rgba(235,235,245,0.2)', fontStyle: 'italic' }}>
                      Run analysis to populate
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Game Theory Section */}
            <div style={{
              backgroundColor: 'rgba(0,0,0,0.15)', border: '1px solid #38383A',
              borderRadius: '8px', padding: '20px', marginBottom: '28px',
            }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#FF9F0A', fontWeight: 600, marginBottom: '16px' }}>
                Game Theory Analysis
              </div>
              {editingMatter.gameTheory ? (
                <div>
                  {/* Nash Equilibrium */}
                  {editingMatter.gameTheory.nash_equilibrium && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#EBEBF5', marginBottom: '6px' }}>Nash Equilibrium</div>
                      <div style={{ fontSize: '13px', color: 'rgba(235,235,245,0.7)', lineHeight: 1.5 }}>
                        {editingMatter.gameTheory.nash_equilibrium}
                      </div>
                    </div>
                  )}
                  {/* Settlement Range */}
                  {editingMatter.gameTheory.settlement_range && (
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#EBEBF5', marginBottom: '10px' }}>Settlement Range</div>
                      <div style={{ position: 'relative', height: '40px', backgroundColor: '#1C1C1E', borderRadius: '6px', overflow: 'hidden', border: '1px solid #38383A' }}>
                        <div style={{
                          position: 'absolute',
                          left: `${editingMatter.gameTheory.settlement_range.low_pct || 20}%`,
                          right: `${100 - (editingMatter.gameTheory.settlement_range.high_pct || 80)}%`,
                          top: 0, bottom: 0,
                          backgroundColor: 'rgba(255,159,10,0.2)', borderLeft: '2px solid #FF9F0A', borderRight: '2px solid #FF9F0A',
                        }} />
                        {editingMatter.gameTheory.settlement_range.optimal_pct && (
                          <div style={{
                            position: 'absolute',
                            left: `${editingMatter.gameTheory.settlement_range.optimal_pct}%`,
                            top: 0, bottom: 0, width: '2px', backgroundColor: '#32D74B',
                          }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', color: 'rgba(235,235,245,0.4)' }}>
                        <span>{editingMatter.gameTheory.settlement_range.low_label || 'Low'}</span>
                        <span style={{ color: '#32D74B' }}>{editingMatter.gameTheory.settlement_range.optimal_label || 'Optimal'}</span>
                        <span>{editingMatter.gameTheory.settlement_range.high_label || 'High'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '20px', color: 'rgba(235,235,245,0.2)',
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <div style={{ marginTop: '8px', fontSize: '12px' }}>
                    Click "Analyze Strategy" to generate game theory analysis
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div style={{
            width: '320px', minWidth: '320px', backgroundColor: '#262628',
            borderLeft: '1px solid #48484A', display: 'flex', flexDirection: 'column', flexShrink: 0,
          }}>
            <div style={{
              height: '48px', display: 'flex', alignItems: 'center', padding: '0 16px',
              backgroundColor: '#2D2D2F', borderBottom: '1px solid #48484A',
              fontSize: '12px', fontWeight: 600, color: '#EBEBF5', gap: '8px',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              AI Strategy Chat
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px 12px', color: 'rgba(235,235,245,0.2)', fontSize: '12px' }}>
                  Ask questions about this case to receive AI strategic advice.
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 14px', borderRadius: '8px',
                    backgroundColor: msg.role === 'user' ? 'rgba(10,132,255,0.1)' : msg.role === 'system' ? 'rgba(255,69,58,0.08)' : 'rgba(0,0,0,0.2)',
                    border: msg.role === 'assistant' ? '1px solid #38383A' : '1px solid transparent',
                    borderLeft: msg.role === 'assistant' ? '2px solid #0A84FF' : undefined,
                  }}
                >
                  <div style={{ fontSize: '10px', color: msg.role === 'user' ? '#0A84FF' : msg.role === 'system' ? '#FF453A' : 'rgba(235,235,245,0.4)', fontWeight: 600, marginBottom: '4px' }}>
                    {msg.role === 'user' ? 'You' : msg.role === 'system' ? 'System' : 'Bird Legal'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.7)', lineHeight: 1.5 }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #38383A' }}>
                  <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.4)' }}>Thinking...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: '12px', borderTop: '1px solid #48484A' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask about case strategy..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                  style={{
                    backgroundColor: '#0A84FF', color: 'white', border: 'none',
                    padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
                    cursor: 'pointer', fontFamily,
                    opacity: chatLoading || !chatInput.trim() ? 0.5 : 1,
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LitigationAdvisorPage;
