import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getDocument, submitReview } from '../api/client';

const WorkbenchPage = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();

  const [redlines, setRedlines] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [declineClicked, setDeclineClicked] = useState(false);
  const [applyClicked, setApplyClicked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    getDocument(documentId).then(doc => {
      if (doc.redlines && doc.redlines.length > 0) {
        setRedlines(doc.redlines);
        // Generate AI comment from the first redline's explanation
        const first = doc.redlines[0];
        setComments([{
          id: 1, isAI: true, name: 'Stella Counsel', timestamp: 'Just now',
          badge: 'INSIGHT', text: first.explanation, borderLeft: true,
        }]);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [documentId]);

  const currentRedline = redlines[currentIndex] || null;

  // No document or no redlines — show empty state
  if (!documentId || (!loading && redlines.length === 0)) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E20' }}>
        <div style={{ textAlign: 'center', color: 'rgba(235, 235, 245, 0.6)', fontSize: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>&#128221;</div>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: '#EBEBF5' }}>No redlines available</div>
          <div style={{ fontSize: '13px' }}>
            {!documentId ? 'No document selected.' : 'No redline suggestions were generated for this document.'}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1E1E20' }}>
        <div style={{ color: 'rgba(235, 235, 245, 0.6)', fontSize: '14px' }}>Loading...</div>
      </div>
    );
  }

  const originalText = currentRedline.original_text;
  const suggestedText = currentRedline.suggested_text;
  const clauseLabel = `${currentRedline.section} Redline`;
  const priorityLabel = currentRedline.priority.charAt(0).toUpperCase() + currentRedline.priority.slice(1);
  const priorityColor = currentRedline.priority === 'critical' ? '#FF453A' : currentRedline.priority === 'important' ? '#FF9F0A' : '#0A84FF';

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), isAI: false, initials: 'YOU', name: 'You', timestamp: 'Just now', text: commentText, borderLeft: false }]);
    setCommentText('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && e.metaKey) handleAddComment(); };

  const handleDecline = async () => {
    setDeclineClicked(true);
    if (currentRedline) {
      try { await submitReview(documentId, currentRedline.id, 'declined'); } catch (e) { console.error(e); }
    }
    setTimeout(() => {
      setDeclineClicked(false);
      if (currentIndex < redlines.length - 1) {
        setCurrentIndex(i => i + 1);
        const next = redlines[currentIndex + 1];
        if (next) setComments([{ id: Date.now(), isAI: true, name: 'Stella Counsel', timestamp: 'Just now', badge: 'INSIGHT', text: next.explanation, borderLeft: true }]);
      }
    }, 1000);
  };

  const handleApply = async () => {
    setApplyClicked(true);
    if (currentRedline) {
      try { await submitReview(documentId, currentRedline.id, 'accepted'); } catch (e) { console.error(e); }
    }
    setTimeout(() => {
      setApplyClicked(false);
      if (currentIndex < redlines.length - 1) {
        setCurrentIndex(i => i + 1);
        const next = redlines[currentIndex + 1];
        if (next) setComments([{ id: Date.now(), isAI: true, name: 'Stella Counsel', timestamp: 'Just now', badge: 'INSIGHT', text: next.explanation, borderLeft: true }]);
      }
    }, 1000);
  };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Comparison Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1E1E20', overflow: 'hidden' }}>
        {/* Comparison Header */}
        <div style={{ height: '48px', borderBottom: '1px solid #48484A', display: 'flex', alignItems: 'center', padding: '0 24px', backgroundColor: '#262628', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 600 }}>{clauseLabel}</span>
            <span style={{ background: `${priorityColor}1a`, color: priorityColor, padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>
              {priorityLabel} Flag
            </span>
            {redlines.length > 1 && (
              <span style={{ fontSize: '11px', color: 'rgba(235, 235, 245, 0.3)' }}>
                {currentIndex + 1} of {redlines.length}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate(`/scanner/risks/${documentId}`)}
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid #38383A', padding: '4px 10px', color: 'rgba(235, 235, 245, 0.6)', fontSize: 12, fontWeight: 500, borderRadius: 4, cursor: 'pointer' }}
            >
              View Risk Summary
            </button>
          </div>
        </div>

        {/* Comparison Body */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: '#48484A', overflow: 'hidden' }}>
          <div style={{ backgroundColor: '#1E1E20', overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235, 235, 245, 0.3)', marginBottom: '8px' }}>Original Document</div>
            <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#EBEBF5', whiteSpace: 'pre-wrap' }}>{originalText}</div>
          </div>
          <div style={{ backgroundColor: 'rgba(10, 132, 255, 0.02)', overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235, 235, 245, 0.3)', marginBottom: '8px' }}>AI Suggested Revision</div>
            <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#EBEBF5', whiteSpace: 'pre-wrap' }}>{suggestedText}</div>
          </div>
        </div>
      </div>

      {/* Comment Panel */}
      <div style={{ width: '340px', backgroundColor: '#262628', borderLeft: '1px solid #48484A', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: '48px', display: 'flex', alignItems: 'center', padding: '0 16px', backgroundColor: '#2D2D2F', borderBottom: '1px solid #48484A', fontSize: '12px', fontWeight: 600, color: '#EBEBF5', gap: '8px' }}>
          <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Collaboration &amp; Reasoning
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.length > 0 ? comments.map((comment) => (
            <div key={comment.id} style={{
              backgroundColor: 'rgba(0,0,0,0.2)', border: '1px solid #38383A',
              borderLeft: comment.borderLeft ? '2px solid #0A84FF' : '1px solid #38383A',
              borderRadius: '8px', padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: comment.isAI ? 'rgba(10, 132, 255, 0.15)' : '#48484A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 600, color: comment.isAI ? '#0A84FF' : 'rgba(235, 235, 245, 0.6)', flexShrink: 0,
                }}>
                  {comment.isAI ? 'AI' : (comment.initials || comment.name.slice(0, 2).toUpperCase())}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#EBEBF5' }}>{comment.name}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(235, 235, 245, 0.3)' }}>{comment.timestamp}</div>
                </div>
                {comment.badge && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 6px', backgroundColor: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF', borderRadius: '4px', fontSize: '10px', fontWeight: 600, marginLeft: 'auto' }}>
                    {comment.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(235, 235, 245, 0.6)', lineHeight: '1.4' }}>{comment.text}</div>
            </div>
          )) : (
            <div style={{ color: 'rgba(235, 235, 245, 0.3)', fontSize: '13px', textAlign: 'center', marginTop: '24px' }}>
              No comments yet.
            </div>
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #48484A' }}>
          <textarea
            placeholder="Add a comment or internal note..."
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid #38383A', borderRadius: '6px', padding: '8px 12px', color: '#EBEBF5', fontSize: '13px', resize: 'none', outline: 'none', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}
          />
          {commentText.trim() && (
            <button onClick={handleAddComment} style={{ marginTop: '8px', width: '100%', padding: '6px', backgroundColor: '#0A84FF', color: 'white', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              Post Comment
            </button>
          )}
        </div>

        <div style={{ height: '64px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #48484A', backgroundColor: '#262628' }}>
          <button onClick={handleDecline} style={{
            flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            border: '1px solid #48484A', backgroundColor: declineClicked ? 'rgba(255,69,58,0.1)' : 'transparent',
            color: declineClicked ? '#FF453A' : '#EBEBF5', transition: 'all 0.2s',
          }}>
            {declineClicked ? 'Declined' : 'Decline'}
          </button>
          <button onClick={handleApply} style={{
            flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            border: '1px solid transparent', backgroundColor: applyClicked ? '#32D74B' : '#0A84FF',
            color: 'white', transition: 'all 0.2s',
          }}>
            {applyClicked ? 'Applied ✓' : 'Apply Redline'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkbenchPage;
