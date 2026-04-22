import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const courtLevels = ['Supreme Court', 'Court of Appeal', 'High Court', 'Crown Court'];
const areasOfLaw = ['Contract', 'Tort', 'Property', 'Criminal', 'Employment', 'Family', 'Administrative', 'Company'];

const CaseLawPage = ({ matterId = null }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [savedCaseIds, setSavedCaseIds] = useState(new Set());
  const [savingCase, setSavingCase] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // Filters
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

  // Load already-saved cases when scoped to a matter so we can show state.
  useEffect(() => {
    if (!matterId) return;
    let cancelled = false;
    fetch(`${API_BASE}/api/advisor/matters/${encodeURIComponent(matterId)}/cases`)
      .then(r => r.ok ? r.json() : { cases: [] })
      .then(data => {
        if (cancelled) return;
        setSavedCaseIds(new Set((data.cases || []).map(c => c.case_id)));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [matterId]);

  const toggleCourt = (court) => {
    setSelectedCourts(prev =>
      prev.includes(court) ? prev.filter(c => c !== court) : [...prev, court]
    );
  };

  const toggleArea = (area) => {
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
    );
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setSelectedCase(null);

    try {
      const params = new URLSearchParams({ q: query });
      // Backend takes a single value per filter, so send the first selection.
      if (selectedCourts.length > 0) params.append('court', selectedCourts[0]);
      if (dateFrom) {
        const fromYear = parseInt(String(dateFrom).slice(0, 4), 10);
        if (!Number.isNaN(fromYear)) params.append('from_year', String(fromYear));
      }
      if (dateTo) {
        const toYear = parseInt(String(dateTo).slice(0, 4), 10);
        if (!Number.isNaN(toYear)) params.append('to_year', String(toYear));
      }
      if (selectedAreas.length > 0) params.append('area', selectedAreas[0]);

      const res = await fetch(`${API_BASE}/api/research/search?${params}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleCaseClick = async (caseItem) => {
    setSaveMessage(null);
    setSelectedCase({ ...caseItem, loading: true });
    try {
      const res = await fetch(
        `${API_BASE}/api/research/case/${encodeURIComponent(caseItem.id)}?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error(`Failed to load case (${res.status})`);
      const data = await res.json();
      setSelectedCase({ ...caseItem, ...data, loading: false });
    } catch (err) {
      setSelectedCase({ ...caseItem, loading: false, error: err.message });
    }
  };

  const handleSaveToMatter = async () => {
    if (!matterId || !selectedCase?.id) return;
    setSavingCase(true);
    setSaveMessage(null);
    try {
      const body = {
        case_id: selectedCase.id,
        case_name: selectedCase.case_name || '',
        citation: selectedCase.citation || '',
        court: selectedCase.court || '',
        date: selectedCase.date || '',
        url: selectedCase.url || '',
        notes: '',
      };
      const res = await fetch(
        `${API_BASE}/api/advisor/matters/${encodeURIComponent(matterId)}/cases`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setSavedCaseIds(prev => new Set(prev).add(selectedCase.id));
      setSaveMessage(data.status === 'already_saved' ? 'Already saved' : 'Saved to matter');
    } catch (err) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSavingCase(false);
    }
  };

  const renderAiSummary = (ai) => {
    if (!ai) {
      return (
        <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.4)', fontStyle: 'italic' }}>
          AI summary not available for this search.
        </div>
      );
    }
    if (ai.error) {
      return (
        <div style={{ fontSize: '12px', color: '#FF453A' }}>
          Summary unavailable: {ai.error}
        </div>
      );
    }
    const fields = [
      ['Key Principle', ai.key_principle],
      ['Ratio Decidendi', ai.ratio_decidendi],
      ['Obiter Dicta', ai.obiter_dicta],
      ['Relevance to Query', ai.relevance_to_query],
      ['Practical Impact', ai.practical_impact],
    ].filter(([, v]) => v && String(v).trim());

    if (fields.length === 0) {
      return (
        <div style={{ fontSize: '12px', color: 'rgba(235,235,245,0.4)', fontStyle: 'italic' }}>
          No summary fields returned.
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {fields.map(([label, value]) => (
          <div key={label}>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '6px' }}>
              {label}
            </div>
            <div style={{
              padding: '10px 14px', borderRadius: '6px',
              backgroundColor: 'rgba(10,132,255,0.05)', borderLeft: '3px solid #0A84FF',
              fontSize: '13px', color: 'rgba(235,235,245,0.8)', lineHeight: 1.5,
            }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        height: '52px', backgroundColor: '#262628', borderBottom: '1px solid #48484A',
        display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px', flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by legal principle, statute, or keywords..."
          style={{
            flex: 1, backgroundColor: 'transparent', border: 'none', outline: 'none',
            color: '#EBEBF5', fontSize: '14px', fontFamily,
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            backgroundColor: '#0A84FF', color: 'white', border: 'none', padding: '6px 20px',
            borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily,
            opacity: loading || !query.trim() ? 0.5 : 1,
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            backgroundColor: 'transparent', border: '1px solid #48484A', color: 'rgba(235,235,245,0.6)',
            padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontFamily,
          }}
        >
          Filters {showFilters ? '−' : '+'}
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Filter Sidebar */}
        {showFilters && (
          <div style={{
            width: '240px', backgroundColor: '#1E1E20', borderRight: '1px solid #38383A',
            padding: '20px', overflowY: 'auto', flexShrink: 0,
          }}>
            {/* Court Level */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '12px' }}>
                Court Level
              </div>
              {courtLevels.map(court => (
                <label
                  key={court}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
                    cursor: 'pointer', fontSize: '12px', color: selectedCourts.includes(court) ? '#EBEBF5' : 'rgba(235,235,245,0.6)',
                  }}
                  onClick={() => toggleCourt(court)}
                >
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '3px',
                    border: selectedCourts.includes(court) ? '1px solid #0A84FF' : '1px solid #48484A',
                    backgroundColor: selectedCourts.includes(court) ? '#0A84FF' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {selectedCourts.includes(court) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  {court}
                </label>
              ))}
              {selectedCourts.length > 1 && (
                <div style={{ marginTop: '6px', fontSize: '10px', color: 'rgba(235,235,245,0.35)' }}>
                  Only the first selection is applied.
                </div>
              )}
            </div>

            {/* Date Range */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '12px' }}>
                Date Range
              </div>
              <input
                type="number"
                placeholder="From year"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #38383A',
                  borderRadius: '4px', padding: '6px 10px', color: '#EBEBF5', fontSize: '12px',
                  outline: 'none', fontFamily, marginBottom: '8px',
                }}
              />
              <input
                type="number"
                placeholder="To year"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #38383A',
                  borderRadius: '4px', padding: '6px 10px', color: '#EBEBF5', fontSize: '12px',
                  outline: 'none', fontFamily,
                }}
              />
            </div>

            {/* Area of Law */}
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '12px' }}>
                Area of Law
              </div>
              {areasOfLaw.map(area => (
                <label
                  key={area}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0',
                    cursor: 'pointer', fontSize: '12px', color: selectedAreas.includes(area) ? '#EBEBF5' : 'rgba(235,235,245,0.6)',
                  }}
                  onClick={() => toggleArea(area)}
                >
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '3px',
                    border: selectedAreas.includes(area) ? '1px solid #0A84FF' : '1px solid #48484A',
                    backgroundColor: selectedAreas.includes(area) ? '#0A84FF' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {selectedAreas.includes(area) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  {area}
                </label>
              ))}
              {selectedAreas.length > 1 && (
                <div style={{ marginTop: '6px', fontSize: '10px', color: 'rgba(235,235,245,0.35)' }}>
                  Only the first selection is applied.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results List */}
        <div style={{
          width: selectedCase ? '400px' : '100%', minWidth: '360px',
          borderRight: selectedCase ? '1px solid #38383A' : 'none',
          overflowY: 'auto', backgroundColor: '#1C1C1E',
        }}>
          {!hasSearched && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.15)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1L1 7l11 6 11-6-11-6z" />
                <path d="M1 17l11 6 11-6" />
                <path d="M1 12l11 6 11-6" />
              </svg>
              <div style={{ marginTop: '16px', fontWeight: 600, color: '#EBEBF5', fontSize: '15px' }}>Case Law Research</div>
              <div style={{ marginTop: '6px', color: 'rgba(235,235,245,0.4)', fontSize: '13px', textAlign: 'center', maxWidth: '400px' }}>
                Search for cases by legal principle, statute, or keywords. Use filters to narrow results by court level, date range, and area of law.
              </div>
            </div>
          )}

          {hasSearched && loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(235,235,245,0.6)', fontSize: '14px' }}>
              Searching case law database...
            </div>
          )}

          {hasSearched && !loading && error && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
              <div style={{ color: '#FF453A', fontSize: '14px', marginBottom: '8px' }}>Search failed</div>
              <div style={{ color: 'rgba(235,235,245,0.4)', fontSize: '12px' }}>{error}</div>
            </div>
          )}

          {hasSearched && !loading && !error && results.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' }}>
              <div style={{ fontWeight: 600, color: '#EBEBF5', fontSize: '14px' }}>No results found</div>
              <div style={{ color: 'rgba(235,235,245,0.4)', fontSize: '12px', marginTop: '6px' }}>
                Try adjusting your search terms or filters.
              </div>
            </div>
          )}

          {results.map((caseItem, index) => {
            const displayName = caseItem.case_name || caseItem.name || 'Untitled case';
            const dateText = caseItem.date || caseItem.year || '';
            return (
              <div
                key={caseItem.id || index}
                onClick={() => handleCaseClick(caseItem)}
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer',
                  backgroundColor: selectedCase && selectedCase.id === caseItem.id ? 'rgba(10,132,255,0.08)' : 'transparent',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => {
                  if (!selectedCase || selectedCase.id !== caseItem.id) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                }}
                onMouseLeave={(e) => {
                  if (!selectedCase || selectedCase.id !== caseItem.id) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ fontWeight: 600, color: '#EBEBF5', fontSize: '13px', marginBottom: '6px' }}>
                  {displayName}
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '11px', color: 'rgba(235,235,245,0.4)' }}>
                  {caseItem.citation && <span style={{ fontFamily: '"SF Mono", monospace' }}>{caseItem.citation}</span>}
                  {caseItem.court && <span>{caseItem.court}</span>}
                  {dateText && <span>{dateText}</span>}
                  {matterId && savedCaseIds.has(caseItem.id) && (
                    <span style={{ color: '#32D74B' }}>Saved</span>
                  )}
                </div>
                {caseItem.snippet && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(235,235,245,0.5)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {caseItem.snippet}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Case Detail Panel */}
        {selectedCase && (
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#1E1E20', padding: '32px' }}>
            <div style={{ maxWidth: '720px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#EBEBF5', marginBottom: '8px' }}>
                    {selectedCase.case_name || selectedCase.name || 'Untitled case'}
                  </h2>
                  <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'rgba(235,235,245,0.5)' }}>
                    {selectedCase.citation && <span style={{ fontFamily: '"SF Mono", monospace' }}>{selectedCase.citation}</span>}
                    {selectedCase.court && <span>{selectedCase.court}</span>}
                    {selectedCase.date && <span>{selectedCase.date}</span>}
                    {selectedCase.url && (
                      <a
                        href={selectedCase.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#0A84FF', textDecoration: 'none' }}
                      >
                        View on Case Law archive →
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {matterId && (
                    <button
                      onClick={handleSaveToMatter}
                      disabled={savingCase || savedCaseIds.has(selectedCase.id)}
                      style={{
                        backgroundColor: savedCaseIds.has(selectedCase.id) ? 'rgba(50,215,75,0.15)' : '#0A84FF',
                        color: savedCaseIds.has(selectedCase.id) ? '#32D74B' : 'white',
                        border: savedCaseIds.has(selectedCase.id) ? '1px solid rgba(50,215,75,0.4)' : 'none',
                        padding: '6px 14px', borderRadius: '6px',
                        fontSize: '12px', fontWeight: 600, fontFamily,
                        cursor: savingCase || savedCaseIds.has(selectedCase.id) ? 'default' : 'pointer',
                        opacity: savingCase ? 0.6 : 1,
                      }}
                    >
                      {savedCaseIds.has(selectedCase.id)
                        ? 'Saved to matter'
                        : (savingCase ? 'Saving...' : '+ Save to matter')}
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedCase(null); setSaveMessage(null); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(235,235,245,0.4)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                  >
                    ×
                  </button>
                </div>
              </div>

              {saveMessage && (
                <div style={{
                  marginBottom: '16px', padding: '8px 12px', borderRadius: '6px',
                  backgroundColor: saveMessage.startsWith('Error') ? 'rgba(255,69,58,0.1)' : 'rgba(50,215,75,0.1)',
                  color: saveMessage.startsWith('Error') ? '#FF453A' : '#32D74B',
                  fontSize: '12px',
                }}>
                  {saveMessage}
                </div>
              )}

              {selectedCase.loading && (
                <div style={{ color: 'rgba(235,235,245,0.5)', fontSize: '13px', padding: '20px 0' }}>
                  Loading judgment and AI summary...
                </div>
              )}

              {selectedCase.error && (
                <div style={{ color: '#FF453A', fontSize: '13px', padding: '20px 0' }}>
                  {selectedCase.error}
                </div>
              )}

              {!selectedCase.loading && !selectedCase.error && (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '10px' }}>
                      AI Summary
                    </div>
                    {renderAiSummary(selectedCase.ai_summary)}
                  </div>

                  {selectedCase.body_excerpt && (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '10px' }}>
                        Judgment Excerpt
                      </div>
                      <div style={{
                        fontSize: '13px', lineHeight: 1.7, color: 'rgba(235,235,245,0.75)',
                        whiteSpace: 'pre-wrap', padding: '16px', borderRadius: '6px',
                        backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #38383A',
                        maxHeight: '420px', overflowY: 'auto',
                      }}>
                        {selectedCase.body_excerpt}
                      </div>
                    </div>
                  )}

                  {!selectedCase.body_excerpt && selectedCase.snippet && (
                    <div style={{ marginBottom: '24px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '10px' }}>
                        Snippet
                      </div>
                      <div style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(235,235,245,0.75)' }}>
                        {selectedCase.snippet}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseLawPage;
