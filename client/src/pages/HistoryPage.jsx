import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken, isLoggedIn } from '../auth';

function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/scan', {
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

  if (loading) return <div className="page"><p className="label-mono">Loading...</p></div>;
  if (error) return <div className="page"><p style={{ color: 'var(--danger)' }}>{error}</p></div>;

  return (
    <div className="page">
      <div style={{ marginBottom: '28px' }}>
        <p className="label-mono" style={{ marginBottom: '6px' }}>CASE ARCHIVE</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px' }}>Scan history</h2>
      </div>

      {scans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No scans yet — analyzed images will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {scans.map((scan) => (
            <div
              key={scan._id}
              onClick={() => navigate('/results', { state: { result: scan } })}
              className="card"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '16px 20px',
                transition: 'border-color 0.15s ease',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div>
                <p style={{ fontSize: '14px', marginBottom: '4px' }}>{scan.filename}</p>
                <p className="label-mono">{new Date(scan.createdAt).toLocaleString()}</p>
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 500,
                color: scan.verdict === 'manipulated' ? 'var(--danger)' : 'var(--success)'
              }}>
                {scan.verdict.toUpperCase()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;