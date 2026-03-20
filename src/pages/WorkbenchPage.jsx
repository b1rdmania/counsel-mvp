import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WorkbenchPage = () => {
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      isAI: true,
      name: 'Stella Counsel',
      timestamp: 'Just now',
      badge: 'INSIGHT',
      text: "The original language creates a strict liability standard. I have added a \"knowledge qualifier\" and limited the scope to \"valid\" rights to align with Section 4.2 of the firm's standard Master Services Agreement.",
      borderLeft: true,
    },
    {
      id: 2,
      isAI: false,
      initials: 'AM',
      name: 'A. Mercer (Partner)',
      timestamp: '12 minutes ago',
      text: "The knowledge qualifier is essential here. TechCorp has a history of broad IP claims; we cannot accept uncapped liability for unknown third-party patents.",
      borderLeft: false,
    },
  ]);
  const [declineClicked, setDeclineClicked] = useState(false);
  const [applyClicked, setApplyClicked] = useState(false);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      isAI: false,
      initials: 'YOU',
      name: 'You',
      timestamp: 'Just now',
      text: commentText,
      borderLeft: false,
    };
    setComments(prev => [...prev, newComment]);
    setCommentText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey) {
      handleAddComment();
    }
  };

  const handleDecline = () => {
    setDeclineClicked(true);
    setTimeout(() => setDeclineClicked(false), 1500);
  };

  const handleApply = () => {
    setApplyClicked(true);
    setTimeout(() => setApplyClicked(false), 1500);
  };

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
      {/* Comparison Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1E1E20', overflow: 'hidden' }}>
        {/* Comparison Header */}
        <div style={{
          height: '48px', borderBottom: '1px solid #48484A', display: 'flex', alignItems: 'center',
          padding: '0 24px', backgroundColor: '#262628', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 600 }}>Clause 8.1(c) Redline</span>
            <span style={{ background: 'rgba(255, 69, 58, 0.1)', color: '#FF453A', padding: '2px 8px', borderRadius: '12px', fontSize: '11px' }}>
              Critical Flag
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => navigate('/risks')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid #38383A',
                padding: '4px 10px',
                color: 'rgba(235, 235, 245, 0.6)',
                fontSize: 12,
                fontWeight: 500,
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              View Risk Summary
            </button>
          </div>
        </div>

        {/* Comparison Body */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', backgroundColor: '#48484A', overflow: 'hidden' }}>
          {/* Original Document Pane */}
          <div className="clause-pane" style={{ backgroundColor: '#1E1E20', overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235, 235, 245, 0.3)', marginBottom: '8px' }}>
              Original Document
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#EBEBF5' }}>
              (c) any claim that the Services or Deliverables infringe upon the intellectual property rights of any third party,{' '}
              <span style={{ backgroundColor: 'rgba(255, 69, 58, 0.1)', color: '#FF453A', textDecoration: 'line-through', padding: '2px 0' }}>
                regardless of whether such infringement was reasonably foreseeable or known to Vendor.
              </span>
            </div>
          </div>

          {/* AI Suggested Revision Pane */}
          <div className="clause-pane" style={{ backgroundColor: 'rgba(10, 132, 255, 0.02)', overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'rgba(235, 235, 245, 0.3)', marginBottom: '8px' }}>
              AI Suggested Revision
            </div>
            <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#EBEBF5' }}>
              (c) any claim that the Services or Deliverables infringe upon the{' '}
              <span style={{ backgroundColor: 'rgba(50, 215, 75, 0.1)', color: '#32D74B', textDecoration: 'none', padding: '2px 0', borderBottom: '1px solid #32D74B' }}>
                valid
              </span>{' '}
              intellectual property rights of any third party,{' '}
              <span style={{ backgroundColor: 'rgba(50, 215, 75, 0.1)', color: '#32D74B', textDecoration: 'none', padding: '2px 0', borderBottom: '1px solid #32D74B' }}>
                provided that such infringement was within the actual knowledge of Vendor as of the Effective Date.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comment Panel */}
      <div style={{ width: '340px', backgroundColor: '#262628', borderLeft: '1px solid #48484A', display: 'flex', flexDirection: 'column' }}>
        {/* Panel Header */}
        <div style={{
          height: '48px', display: 'flex', alignItems: 'center', padding: '0 16px',
          backgroundColor: '#2D2D2F', borderBottom: '1px solid #48484A',
          fontSize: '12px', fontWeight: 600, color: '#EBEBF5', gap: '8px',
        }}>
          <svg style={{ width: '14px', height: '14px', fill: 'currentColor' }} viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Collaboration &amp; Reasoning
        </div>

        {/* Comment List */}
        <div className="comment-list" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{
              backgroundColor: 'rgba(0,0,0,0.2)',
              border: `1px solid #38383A`,
              borderLeft: comment.borderLeft ? '2px solid #0A84FF' : '1px solid #38383A',
              borderRadius: '8px',
              padding: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: comment.isAI ? 'rgba(10, 132, 255, 0.15)' : '#48484A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 600,
                  color: comment.isAI ? '#0A84FF' : 'rgba(235, 235, 245, 0.6)',
                  flexShrink: 0,
                }}>
                  {comment.isAI ? 'AI' : (comment.initials || comment.name.slice(0, 2).toUpperCase())}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#EBEBF5' }}>{comment.name}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(235, 235, 245, 0.3)' }}>{comment.timestamp}</div>
                </div>
                {comment.badge && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', padding: '2px 6px',
                    backgroundColor: 'rgba(10, 132, 255, 0.15)', color: '#0A84FF',
                    borderRadius: '4px', fontSize: '10px', fontWeight: 600, marginLeft: 'auto',
                  }}>
                    {comment.badge}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(235, 235, 245, 0.6)', lineHeight: '1.4' }}>
                {comment.text}
              </div>
            </div>
          ))}
        </div>

        {/* Comment Input Area */}
        <div style={{ padding: '16px', borderTop: '1px solid #48484A' }}>
          <textarea
            className="comment-field"
            placeholder="Add a comment or internal note..."
            rows={3}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: '100%', backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid #38383A',
              borderRadius: '6px', padding: '8px 12px', color: '#EBEBF5', fontSize: '13px',
              resize: 'none', outline: 'none',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            }}
          />
          {commentText.trim() && (
            <button onClick={handleAddComment} style={{
              marginTop: '8px', width: '100%', padding: '6px',
              backgroundColor: '#0A84FF', color: 'white', border: 'none',
              borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            }}>
              Post Comment
            </button>
          )}
        </div>

        {/* Action Footer */}
        <div style={{
          height: '64px', padding: '0 16px', display: 'flex', alignItems: 'center',
          gap: '12px', borderTop: '1px solid #48484A', backgroundColor: '#262628',
        }}>
          <button onClick={handleDecline} style={{
            flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', border: '1px solid #48484A',
            backgroundColor: declineClicked ? 'rgba(255,69,58,0.1)' : 'transparent',
            color: declineClicked ? '#FF453A' : '#EBEBF5', transition: 'all 0.2s',
          }}>
            {declineClicked ? 'Declined' : 'Decline'}
          </button>
          <button onClick={handleApply} style={{
            flex: 1, padding: '10px', borderRadius: '6px', fontSize: '13px', fontWeight: 600,
            cursor: 'pointer', border: '1px solid transparent',
            backgroundColor: applyClicked ? '#32D74B' : '#0A84FF',
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
