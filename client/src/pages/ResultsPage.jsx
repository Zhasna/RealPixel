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

      {result.elaHeatmap && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <p className="label-mono" style={{ marginBottom: '12px' }}>Error Level Analysis</p>
          <img
            src={`data:image/png;base64,${result.elaHeatmap}`}
            alt="ELA heatmap"
            style={{ width: '100%', borderRadius: 'var(--radius)', display: 'block' }}
          />
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '10px' }}>
            Brighter regions indicate inconsistent compression history — a supporting forensic signal, not a standalone verdict.
          </p>
        </div>
      )}

      <div className="card" style={{ marginBottom: '20px' }}>
        <p className="label-mono" style={{ marginBottom: '14px' }}>Signal breakdown</p>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
            <span>CNN classifier (primary)</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: verdictColor }}>{confidence}%</span>
          </div>
          <div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${confidence}%`, background: verdictColor }} />
          </div>
        </div>

        {typeof result.fftScore === 'number' && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span>Frequency domain anomaly</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                {(result.fftScore * 100).toFixed(1)}%
              </span>
            </div>
            <div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${result.fftScore * 100}%`, background: 'var(--accent)' }} />
            </div>
          </div>
        )}

        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Only the CNN classifier determines the verdict. Other signals are shown as supporting context.
        </p>
      </div>

      <button className="secondary" onClick={() => navigate('/')}>Analyze another</button>
    </div>
  );
}

export default ResultsPage;