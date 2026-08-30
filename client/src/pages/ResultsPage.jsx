import { useLocation, useNavigate } from 'react-router-dom';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div className="page">
        <p style={{ color: 'var(--text-muted)' }}>No scan result found.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '16px' }}>Back to upload</button>
      </div>
    );
  }

  const isFake = result.verdict === 'manipulated';
  const confidence = (result.fakeProbability * 100).toFixed(1);
  const verdictColor = isFake ? 'var(--danger)' : 'var(--success)';

  return (
    <div className="page">
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '16px',
        marginBottom: '24px'
      }}>
        <div>
          <p className="label-mono" style={{ marginBottom: '4px' }}>SCAN / {result._id}</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px' }}>Media verification report</h2>
        </div>
        <p className="label-mono">{new Date(result.createdAt).toLocaleString()}</p>
      </div>

      <div className="card" style={{ textAlign: 'center', padding: '56px 20px', marginBottom: '16px' }}>
        <p className="label-mono" style={{ marginBottom: '20px' }}>{result.filename}</p>
        <div style={{
          display: 'inline-block',
          border: `3px double ${verdictColor}`,
          color: verdictColor,
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: '16px',
          letterSpacing: '1px',
          padding: '10px 20px',
          transform: 'rotate(-6deg)'
        }}>
          {isFake ? 'MANIPULATION DETECTED' : 'AUTHENTIC'}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <p className="label-mono" style={{ marginBottom: '6px' }}>Fake probability</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '32px', fontWeight: 500, color: verdictColor }}>
          {confidence}%
        </p>
      </div>

      <button className="secondary" onClick={() => navigate('/')}>Analyze another</button>
    </div>
  );
}

export default ResultsPage;