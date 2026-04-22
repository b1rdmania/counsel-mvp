import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const templateOptions = [
  { id: 'lba', label: 'Letter Before Action', description: 'Pre-action protocol correspondence' },
  { id: 'response', label: 'Response to Claim', description: 'Formal response to claim or demand' },
  { id: 'part36', label: 'Part 36 Offer', description: 'Settlement offer under CPR Part 36' },
  { id: 'wp', label: 'Without Prejudice', description: 'Privileged negotiation correspondence' },
  { id: 'general', label: 'General Correspondence', description: 'Standard legal correspondence' },
];

const LetterDraftingPage = ({ matterId = null }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [client, setClient] = useState('');
  const [matterRef, setMatterRef] = useState('');
  const [reLine, setReLine] = useState('');
  const [context, setContext] = useState('');
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

  // Pre-fill the letter from the matter when scoped to one. We only fill blank
  // fields so the lawyer can edit before generating.
  useEffect(() => {
    if (!matterId) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/advisor/matters/${matterId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data) return;

        setMatterRef(prev => prev || data.title || matterId);

        const parties = Array.isArray(data.parties) ? data.parties : [];
        const lowerParties = parties.map(p => String(p).toLowerCase());

        const clientIdx = lowerParties.findIndex(p =>
          p.includes('client') || p.includes('claimant') || p.includes('applicant')
        );
        const opposingIdx = lowerParties.findIndex(p =>
          p.includes('defendant') || p.includes('respondent') || p.includes('opposing')
        );

        // Fall back to heuristics: first party as client, second as recipient.
        const clientGuess = clientIdx >= 0 ? parties[clientIdx] : parties[0];
        const recipientGuess = opposingIdx >= 0
          ? parties[opposingIdx]
          : (clientIdx >= 0 ? parties.find((_, i) => i !== clientIdx) : parties[1]);

        if (clientGuess) setClient(prev => prev || clientGuess);
        if (recipientGuess) setRecipient(prev => prev || recipientGuess);

        const issues = Array.isArray(data.issues) ? data.issues : [];
        const ctxParts = [];
        if (data.summary) ctxParts.push(data.summary);
        if (issues.length > 0) {
          ctxParts.push('Key issues:\n' + issues.map(i => `- ${i}`).join('\n'));
        }
        const ctxText = ctxParts.join('\n\n');
        if (ctxText) setContext(prev => prev || ctxText);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [matterId]);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/drafting/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          recipient,
          client,
          matter_reference: matterRef,
          re_line: reLine,
          context,
          matter_id: matterId || undefined,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setGeneratedDraft(data.draft || data.content || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleExportDocx = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/drafting/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: generatedDraft, format: 'docx' }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${matterRef || 'letter'}-draft.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: download as text
      const blob = new Blob([generatedDraft], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${matterRef || 'letter'}-draft.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleExportPdf = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/drafting/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: generatedDraft, format: 'pdf' }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${matterRef || 'letter'}-draft.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: print dialog
      const printWin = window.open('', '_blank');
      printWin.document.write(`<pre style="font-family: serif; font-size: 14px; line-height: 1.6; padding: 40px; max-width: 800px; margin: 0 auto;">${generatedDraft}</pre>`);
      printWin.document.close();
      printWin.print();
    }
  };

  const inputStyle = {
    backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #38383A', borderRadius: '6px',
    padding: '8px 12px', color: '#EBEBF5', fontSize: '13px', outline: 'none', fontFamily, width: '100%',
  };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Left panel - Form */}
      <div style={{
        width: '380px', minWidth: '380px', backgroundColor: '#1E1E20',
        borderRight: '1px solid #38383A', display: 'flex', flexDirection: 'column',
        overflowY: 'auto', flexShrink: 0,
      }}>
        {/* Header */}
        <div style={{
          height: '52px', display: 'flex', alignItems: 'center', padding: '0 20px',
          borderBottom: '1px solid #38383A', flexShrink: 0,
        }}>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#EBEBF5' }}>Letter Drafting</span>
        </div>

        <div style={{ padding: '20px', flex: 1 }}>
          {/* Template Selector */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '10px' }}>
              Template
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {templateOptions.map((tmpl) => {
                const isActive = selectedTemplate === tmpl.id;
                const isHovered = hoveredTemplate === tmpl.id;

                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id)}
                    onMouseEnter={() => setHoveredTemplate(tmpl.id)}
                    onMouseLeave={() => setHoveredTemplate(null)}
                    style={{
                      padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
                      backgroundColor: isActive ? 'rgba(10,132,255,0.1)' : (isHovered ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.15)'),
                      border: isActive ? '1px solid rgba(10,132,255,0.3)' : '1px solid #38383A',
                      transition: 'all 0.1s',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, color: isActive ? '#0A84FF' : '#EBEBF5' }}>
                      {tmpl.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(235,235,245,0.4)', marginTop: '2px' }}>
                      {tmpl.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '6px' }}>
                Recipient
              </label>
              <input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Name / firm of recipient..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '6px' }}>
                Client
              </label>
              <input
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Client name..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '6px' }}>
                Matter Reference
              </label>
              <input
                value={matterRef}
                onChange={(e) => setMatterRef(e.target.value)}
                placeholder="e.g. SC/2026/0412"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '6px' }}>
                Re: Line
              </label>
              <input
                value={reLine}
                onChange={(e) => setReLine(e.target.value)}
                placeholder="Subject line for the letter..."
                style={inputStyle}
              />
            </div>
          </div>

          {/* Context Panel */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '6px' }}>
              Context / Instructions
            </div>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Provide any additional context, reference cases from Research, issues from Advisor, or contract clauses from Scanner..."
              rows={5}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
            />
            <div style={{ marginTop: '8px', fontSize: '10px', color: 'rgba(235,235,245,0.2)' }}>
              Tip: Reference specific cases, contract clauses, or strategic advice to include in the letter.
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!selectedTemplate || generating}
            style={{
              width: '100%',
              backgroundColor: selectedTemplate && !generating ? '#0A84FF' : '#48484A',
              color: 'white', border: 'none', padding: '12px',
              borderRadius: '6px', fontSize: '14px', fontWeight: 600,
              cursor: selectedTemplate && !generating ? 'pointer' : 'default', fontFamily,
            }}
          >
            {generating ? 'Generating Draft...' : 'Generate Draft'}
          </button>
          {error && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#FF453A' }}>{error}</div>
          )}
        </div>
      </div>

      {/* Right panel - Draft Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1C1C1E' }}>
        {/* Editor Header */}
        <div style={{
          height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', borderBottom: '1px solid #38383A', backgroundColor: '#262628', flexShrink: 0,
        }}>
          <span style={{ fontSize: '13px', color: 'rgba(235,235,245,0.6)' }}>
            {generatedDraft ? 'Draft Preview' : 'Draft will appear here'}
          </span>
          {generatedDraft && (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleExportDocx}
                style={{
                  backgroundColor: 'transparent', border: '1px solid #48484A', color: '#EBEBF5',
                  padding: '5px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontFamily,
                }}
              >
                Export DOCX
              </button>
              <button
                onClick={handleExportPdf}
                style={{
                  backgroundColor: 'transparent', border: '1px solid #48484A', color: '#EBEBF5',
                  padding: '5px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontFamily,
                }}
              >
                Export PDF
              </button>
            </div>
          )}
        </div>

        {/* Editor Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {!generatedDraft ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.15)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
              <div style={{ marginTop: '16px', fontWeight: 600, color: '#EBEBF5', fontSize: '15px' }}>Letter Drafting</div>
              <div style={{ marginTop: '6px', color: 'rgba(235,235,245,0.4)', fontSize: '13px', textAlign: 'center', maxWidth: '400px' }}>
                Select a template, fill in the details, and click "Generate Draft" to create an AI-drafted letter.
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>
              {/* Paper-like container */}
              <div style={{
                backgroundColor: '#262628', border: '1px solid #38383A', borderRadius: '8px',
                padding: '40px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                minHeight: '600px',
              }}>
                <textarea
                  value={generatedDraft}
                  onChange={(e) => setGeneratedDraft(e.target.value)}
                  style={{
                    width: '100%', minHeight: '500px', backgroundColor: 'transparent',
                    border: 'none', outline: 'none', color: '#EBEBF5',
                    fontSize: '14px', lineHeight: 1.8, resize: 'vertical', fontFamily,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterDraftingPage;
