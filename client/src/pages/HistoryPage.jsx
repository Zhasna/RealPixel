import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken, isLoggedIn } from '../auth';
import { API_URL } from '../config';

const API = `${API_URL}/api/scan`;

function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  const navigate = useNavigate();

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${getToken()}` } });

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await axios.get(API, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setScans(response.data);
      } catch (err) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this scan from your history? This cannot be undone.')) return;
    setActionError(null);
    try {
      await axios.delete(`${API}/${id}`, authHeaders());
      setScans((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete scan.');
    }
  };

  const startEdit = (e, scan) => {
    e.stopPropagation();
    setEditingId(scan._id);
    setNoteDraft(scan.note || '');
  };

  const saveNote = async (e, id) => {
    e.stopPropagation();
    setActionError(null);
    try {
      const res = await axios.patch(`${API}/${id}`, { note: noteDraft }, authHeaders());
      setScans((prev) => prev.map((s) => (s._id === id ? { ...s, note: res.data.note } : s)));
      setEditingId(null);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update note.');
    }
  };

  if (loading) return <div className="page"><p className="label-mono">Loading...</p></div>;
  if (error) return <div className="page"><p style={{ color: 'var(--danger)' }}>{error}</p></div>;

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <p className="label-mono" style={{ marginBottom: '6px' }}>CASE ARCHIVE</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px' }}>Scan history</h2>
      </div>

      {actionError && (
        <p style={{ color: 'var(--danger)', marginBottom: '14px', fontSize: '13px' }}>{actionError}</p>
      )}

      {scans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No scans yet - analyzed images will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {scans.map((scan) => (
            <div
              key={scan._id}
              onClick={() => navigate('/results', { state: { result: scan } })}
              className="card"
              style={{ cursor: 'pointer', padding: '16px 20px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '14px', marginBottom: '4px' }}>{scan.filename}</p>
                  <p className="label-mono">{new Date(scan.createdAt).toLocaleString()}</p>
                </div>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500,
                  color: scan.verdict === 'manipulated' ? 'var(--danger)' : 'var(--success)'
                }}>
                  {scan.verdict.toUpperCase()}
                </p>
              </div>

              {editingId === scan._id ? (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{ display: 'flex', gap: '8px', marginTop: '12px' }}
                >
                  <input
                    type="text"
                    value={noteDraft}
                    maxLength={200}
                    placeholder="Add a note (max 200 characters)"
                    onChange={(e) => setNoteDraft(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button onClick={(e) => saveNote(e, scan._id)}>Save</button>
                  <button className="secondary" onClick={(e) => { e.stopPropagation(); setEditingId(null); }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', gap: '16px' }}>
                  <p style={{ fontSize: '13px', color: scan.note ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
                    {scan.note || 'No note'}
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="secondary" onClick={(e) => startEdit(e, scan)}>Edit note</button>
                    <button
                      className="secondary"
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      onClick={(e) => handleDelete(e, scan._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;