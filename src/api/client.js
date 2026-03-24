const API_BASE = import.meta.env.VITE_API_URL || '';

export async function uploadDocument(file, analysisType = 'general', posture = 'balanced') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('analysis_type', analysisType);
  formData.append('posture', posture);

  const res = await fetch(`${API_BASE}/api/documents`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Upload failed');
  }

  return res.json();
}

export async function getDocument(docId) {
  const res = await fetch(`${API_BASE}/api/documents/${docId}`);
  if (!res.ok) {
    throw new Error('Failed to fetch document');
  }
  return res.json();
}

export async function submitReview(docId, redlineId, decision, modifiedText = null) {
  const res = await fetch(`${API_BASE}/api/documents/${docId}/reviews/${redlineId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision, modified_text: modifiedText }),
  });

  if (!res.ok) {
    throw new Error('Failed to submit review');
  }

  return res.json();
}
