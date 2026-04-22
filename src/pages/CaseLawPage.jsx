import React, { useState } from 'react';

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

  // Filters
  const [selectedCourts, setSelectedCourts] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [showFilters, setShowFilters] = useState(true);

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
      if (selectedCourts.length > 0) params.append('courts', selectedCourts.join(','));
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      if (selectedAreas.length > 0) params.append('areas', selectedAreas.join(','));
      if (matterId) params.append('matter_id', matterId);

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

  const getRelevanceColor = (score) => {
    if (score >= 0.8) return '#32D74B';
    if (score >= 0.5) return '#FF9F0A';
    return 'rgba(235, 235, 245, 0.6)';
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

          {results.map((caseItem, index) => (
            <div
              key={caseItem.id || index}
              onClick={() => setSelectedCase(caseItem)}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{ fontWeight: 600, color: '#EBEBF5', fontSize: '13px', flex: 1, marginRight: '12px' }}>
                  {caseItem.name}
                </div>
                {caseItem.relevance_score !== undefined && (
                  <div style={{
                    fontSize: '11px', fontWeight: 600, fontFamily: '"SF Mono", monospace',
                    color: getRelevanceColor(caseItem.relevance_score),
                    whiteSpace: 'nowrap',
                  }}>
                    {Math.round(caseItem.relevance_score * 100)}%
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'rgba(235,235,245,0.4)' }}>
                {caseItem.citation && <span style={{ fontFamily: '"SF Mono", monospace' }}>{caseItem.citation}</span>}
                {caseItem.court && <span>{caseItem.court}</span>}
                {caseItem.year && <span>{caseItem.year}</span>}
              </div>
              {caseItem.snippet && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(235,235,245,0.5)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {caseItem.snippet}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Case Detail Panel */}
        {selectedCase && (
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#1E1E20', padding: '32px' }}>
            <div style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#EBEBF5', marginBottom: '8px' }}>
                    {selectedCase.name}
                  </h2>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(235,235,245,0.5)' }}>
                    {selectedCase.citation && <span style={{ fontFamily: '"SF Mono", monospace' }}>{selectedCase.citation}</span>}
                    {selectedCase.court && <span>{selectedCase.court}</span>}
                    {selectedCase.year && <span>{selectedCase.year}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  style={{ background: 'none', border: 'none', color: 'rgba(235,235,245,0.4)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}
                >
                  x
                </button>
              </div>

              {selectedCase.relevance_score !== undefined && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '6px 12px', borderRadius: '6px', marginBottom: '24px',
                  backgroundColor: 'rgba(10,132,255,0.08)', border: '1px solid rgba(10,132,255,0.2)',
                }}>
                  <span style={{ fontSize: '11px', color: 'rgba(235,235,245,0.6)' }}>Relevance</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: getRelevanceColor(selectedCase.relevance_score) }}>
                    {Math.round(selectedCase.relevance_score * 100)}%
                  </span>
                </div>
              )}

              {selectedCase.summary && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '10px' }}>
                    Summary
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'rgba(235,235,245,0.8)', whiteSpace: 'pre-wrap' }}>
                    {selectedCase.summary}
                  </div>
                </div>
              )}

              {selectedCase.key_principles && selectedCase.key_principles.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '10px' }}>
                    Key Principles
                  </div>
                  {selectedCase.key_principles.map((principle, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', marginBottom: '8px', borderRadius: '6px',
                      backgroundColor: 'rgba(10,132,255,0.05)', borderLeft: '3px solid #0A84FF',
                      fontSize: '13px', color: 'rgba(235,235,245,0.7)', lineHeight: 1.5,
                    }}>
                      {principle}
                    </div>
                  ))}
                </div>
              )}

              {selectedCase.area_of_law && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235,235,245,0.3)', fontWeight: 600, marginBottom: '10px' }}>
                    Area of Law
                  </div>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: '12px',
                    fontSize: '11px', fontWeight: 500,
                    backgroundColor: 'rgba(50,215,75,0.1)', color: '#32D74B',
                  }}>
                    {selectedCase.area_of_law}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseLawPage;
