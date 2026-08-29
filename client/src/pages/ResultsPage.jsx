import { useLocation, useNavigate } from 'react-router-dom';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div style={{ padding: '40px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          No scan result found.
        </p>
        <button onClick={() => navigate('/')} style={{ marginTop: '16px' }}>Back to upload</button>
      </div>
    );
  }

  const isFake = result.verdict === 'manipulated';
  const confidence = (result.fakeProbability * 100).toFixed(1);

  return (
    <div style={{ padding: '40px', maxWidth: '700px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '0.5px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
            SCAN / {result._id}
          </p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', margin: 0 }}>Media verification report</h2>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>
          {new Date(result.createdAt).toLocaleString()}
        </p>
      </div>

      <div style={{
        position: 'relative',
        background: 'var(--surface-1)',
        borderRadius: 'var(--radius)',
        padding: '60px 20px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          {result.filename}
        </p>
        <div style={{
          display: 'inline-block',
          border: `3px double ${isFake ? 'var(--danger)' : 'var(--success)'}`,
          color: isFake ? 'var(--danger)' : 'var(--success)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: '16px',
          letterSpacing: '1px',
          padding: '8px 18px',
          transform: 'rotate(-6deg)'
        }}>
          {isFake ? 'MANIPULATION DETECTED' : 'AUTHENTIC'}
        </div>
      </div>

      <div style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius)', padding: '16px 20px', marginBottom: '20px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Fake probability
        </p>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '28px',
          fontWeight: 500,
          color: isFake ? 'var(--danger)' : 'var(--success)'
        }}>
          {confidence}%
        </p>
      </div>

      <button onClick={() => navigate('/')}>Analyze another</button>
    </div>
  );
}

export default ResultsPage;