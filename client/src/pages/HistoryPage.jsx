import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
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

  if (loading) return <p style={{ padding: '40px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Loading...</p>;
  if (error) return <p style={{ padding: '40px', color: 'var(--danger)' }}>{error}</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '700px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', marginBottom: '20px' }}>Scan history</h2>

      {scans.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '13px' }}>
          No scans yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {scans.map((scan) => (
            <div
              key={scan._id}
              onClick={() => navigate('/results', { state: { result: scan } })}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--surface-1)',
                borderRadius: 'var(--radius)',
                padding: '14px 18px',
                cursor: 'pointer'
              }}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{scan.filename}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  {new Date(scan.createdAt).toLocaleString()}
                </p>
              </div>
              <p style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
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