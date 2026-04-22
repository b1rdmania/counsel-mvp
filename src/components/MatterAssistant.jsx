import React, { useState, useEffect, useRef } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

/**
 * MatterAssistant — collapsible right-hand panel that chats with the
 * matter-assistant backend endpoint. Sees full matter context so the user
 * never has to retype what the product already knows.
 */
const MatterAssistant = ({ matterId, tabContext = '' }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [contextStats, setContextStats] = useState({ events: 0, cases: 0, letters: 0 });
  const scrollRef = useRef(null);

  // Refresh the context chip whenever we open or the matter changes.
  useEffect(() => {
    if (!matterId || collapsed) return;
    let cancelled = false;

    const loadCount = (url, key) =>
      fetch(url)
        .then(r => (r.ok ? r.json() : null))
        .then(data => {
          if (cancelled || !data) return;
          const count = Array.isArray(data[key]) ? data[key].length : 0;
          setContextStats(prev => ({ ...prev, [key]: count }));
        })
        .catch(() => {});

    loadCount(`${API_BASE}/api/timeline/events?matter_id=${encodeURIComponent(matterId)}`, 'events');
    loadCount(`${API_BASE}/api/advisor/matters/${encodeURIComponent(matterId)}/cases`, 'cases');
    loadCount(`${API_BASE}/api/drafting/letters?matter_id=${encodeURIComponent(matterId)}`, 'letters');

    return () => { cancelled = true; };
  }, [matterId, collapsed, messages.length]);

  // Auto-scroll to newest message
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !matterId) return;

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/advisor/matter-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matter_id: matterId,
          message: text,
          tab_context: tabContext || '',
        }),
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response || '(no response)',
          timestamp: data.timestamp || new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (collapsed) {
    return (
      <div style={{
        width: '40px', backgroundColor: '#262628',
        borderLeft: '1px solid #38383A',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: '12px', flexShrink: 0,
      }}>
        <button
          onClick={() => setCollapsed(false)}
          title="Open matter assistant"
          style={{
            width: '32px', height: '32px', border: '1px solid #38383A',
            borderRadius: '6px', backgroundColor: '#1E1E20',
            color: '#0A84FF', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
        <div style={{
          marginTop: '12px', fontSize: '10px', color: 'rgba(235,235,245,0.35)',
          writingMode: 'vertical-rl', transform: 'rotate(180deg)',
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          Assistant
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '320px', minWidth: '320px', backgroundColor: '#262628',
      borderLeft: '1px solid #38383A',
      display: 'flex', flexDirection: 'column', flexShrink: 0, fontFamily,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #38383A',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#EBEBF5' }}>
            Matter Assistant
          </div>
          <div style={{ fontSize: '10px', color: 'rgba(235,235,245,0.4)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {tabContext ? `Viewing · ${tabContext}` : 'Ready'}
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse"
          style={{
            background: 'transparent', border: 'none', color: 'rgba(235,235,245,0.5)',
            cursor: 'pointer', fontSize: '16px', padding: '2px 6px',
          }}
        >
          ›
        </button>
      </div>

      {/* Context chip */}
      <div style={{
        padding: '8px 16px', fontSize: '11px', color: 'rgba(235,235,245,0.55)',
        backgroundColor: 'rgba(10,132,255,0.06)', borderBottom: '1px solid #38383A',
        flexShrink: 0,
      }}>
        Knows: {contextStats.events} timeline event{contextStats.events === 1 ? '' : 's'}
        {' · '}{contextStats.cases} saved case{contextStats.cases === 1 ? '' : 's'}
        {' · '}{contextStats.letters} letter{contextStats.letters === 1 ? '' : 's'}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}
      >
        {messages.length === 0 && (
          <div style={{
            color: 'rgba(235,235,245,0.4)', fontSize: '12px', lineHeight: 1.6,
            padding: '8px 0',
          }}>
            Ask about strategy, the chronology, the saved cases, or draft
            something inline. I already have the full matter context.
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '88%',
              padding: '8px 12px', borderRadius: '10px',
              backgroundColor: m.role === 'user' ? '#0A84FF' : '#1E1E20',
              color: m.role === 'user' ? 'white' : 'rgba(235,235,245,0.9)',
              border: m.role === 'user' ? 'none' : '1px solid #38383A',
              fontSize: '12.5px', lineHeight: 1.55, whiteSpace: 'pre-wrap',
            }}
          >
            {m.content}
          </div>
        ))}

        {sending && (
          <div style={{
            alignSelf: 'flex-start', fontSize: '11px',
            color: 'rgba(235,235,245,0.45)', fontStyle: 'italic',
            padding: '4px 2px',
          }}>
            Assistant is thinking...
          </div>
        )}

        {error && (
          <div style={{
            alignSelf: 'stretch', fontSize: '11px', color: '#FF453A',
            padding: '6px 10px', borderRadius: '6px',
            backgroundColor: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px', borderTop: '1px solid #38383A',
        display: 'flex', gap: '8px', flexShrink: 0,
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about this matter..."
          rows={2}
          style={{
            flex: 1, backgroundColor: '#1E1E20', border: '1px solid #38383A',
            borderRadius: '6px', padding: '8px 10px',
            color: '#EBEBF5', fontSize: '12.5px', fontFamily,
            resize: 'none', outline: 'none', lineHeight: 1.4,
          }}
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          style={{
            backgroundColor: input.trim() && !sending ? '#0A84FF' : '#48484A',
            color: 'white', border: 'none',
            padding: '0 14px', borderRadius: '6px',
            fontSize: '12px', fontWeight: 600, fontFamily,
            cursor: input.trim() && !sending ? 'pointer' : 'default',
            alignSelf: 'stretch',
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MatterAssistant;
