import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../auth';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const file = location.state?.file;
  const [showDetails, setShowDetails] = useState(false);
  const imageUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
  }, [imageUrl]);

  if (!result) {
    return <div className="page"><p style={{ color: 'var(--text-muted)' }}>No scan result found.</p><button onClick={() => navigate('/')} style={{ marginTop: '16px' }}>Back to upload</button></div>;
  }

  const isFake = result.verdict === 'manipulated';
  const score = Math.min(100, Math.max(0, Number(result.fakeProbability || 0) * 100));
  const confidence = score.toFixed(1);
  const verdictColor = isFake ? 'var(--danger)' : 'var(--success)';
  const scanId = result._id ? String(result._id).slice(0, 8) : null;

  return (
    <div className="page">
      <div className="report-header">
        <div><p className="label-mono" style={{ marginBottom: '4px' }}>{scanId ? `SCAN / ${scanId}` : 'MEDIA REPORT'}</p><h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px' }}>Media verification report</h2></div>
        <p className="label-mono timestamp">{new Date(result.createdAt).toLocaleString()}</p>
      </div>

      <div className="report-grid">
        <div className="card report-image-card">
          <p className="label-mono filename" style={{ marginBottom: '12px' }}>{result.filename}</p>
          <div className="report-visual">
          {imageUrl ? <img src={imageUrl} alt={`Uploaded ${result.filename}`} /> : <span className="label-mono">Preview unavailable</span>}
          <div className="stamp" style={{ color: verdictColor }}>{isFake ? 'MANIPULATION DETECTED' : 'AUTHENTIC'}</div>
          </div>
        </div>
        <div className="card report-score-card">
          <p className="section-label" style={{ marginBottom: '6px' }}>Manipulation score</p>
          <p className="score-number" style={{ color: verdictColor }}>{confidence}%</p>
          <div className="score-meter" aria-label={`Manipulation score ${confidence}%`}>
            <div className="score-zones"><span /><span /><span /></div>
            <div className="score-marker" style={{ left: `${score}%` }} />
            <div className="score-labels"><span>Likely real</span><span>Uncertain</span><span>Likely manipulated</span></div>
            <div className="score-thresholds"><span style={{ left: '35%' }}>35</span><span style={{ left: '60%' }}>60</span></div>
          </div>
          <p className="summary">{isFake ? 'This image shows signals commonly associated with manipulation.' : 'This image shows fewer signals commonly associated with manipulation.'}</p>
        </div>
      </div>

      <div className="evidence-grid" style={{ marginBottom: '20px' }}>
        <div className="card"><p className="section-label" style={{ marginBottom: '12px' }}>Original image</p>{imageUrl ? <img src={imageUrl} alt="Original uploaded image" /> : <p className="helper-text">Preview unavailable</p>}</div>
        <div className="card"><p className="section-label" style={{ marginBottom: '12px' }}>ELA map</p>{result.elaHeatmap ? <img className="pixelated" src={`data:image/png;base64,${result.elaHeatmap}`} alt="ELA heatmap" /> : <p className="helper-text">ELA map unavailable</p>}<p className="caption" style={{ marginTop: '10px' }}>Brighter areas indicate inconsistent compression history.</p></div>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>ELA is a supporting forensic signal, not a standalone verdict.</p>

      <button className="secondary evidence-toggle" onClick={() => setShowDetails(!showDetails)} aria-expanded={showDetails}>
        <span>{showDetails ? 'Hide forensic evidence' : 'Show forensic evidence'}</span>
        <svg className={`chevron${showDetails ? ' open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </button>
      <div className={`evidence-content${showDetails ? ' open' : ''}`}><div>
        <div className="card" style={{ margin: '20px 0' }}>
          <div className="forensic-grid">
            {result.gradcamHeatmap && <div className="forensic-panel"><p className="section-label" style={{ marginBottom: '12px' }}>What the model looked at (Grad-CAM)</p><img src={`data:image/png;base64,${result.gradcamHeatmap}`} alt="Grad-CAM overlay" style={{ width: '100%', borderRadius: 'var(--radius)', display: 'block' }} /><p className="caption" style={{ marginTop: '10px' }}>Warmer regions show where the classifier focused most.</p></div>}
            <div className="forensic-panel"><p className="section-label" style={{ marginBottom: '14px' }}>Signal breakdown</p><Signal label="CNN classifier (primary)" value={score} color={verdictColor} />{typeof result.fftScore === 'number' && <Signal label="Frequency domain anomaly" value={result.fftScore * 100} color="var(--accent)" />}<p className="caption" style={{ marginTop: '12px' }}>Only the CNN classifier determines the verdict. Other signals are supporting context.</p></div>
          </div>
        </div>
      </div></div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
        <button className="secondary" onClick={() => navigate('/')}>Analyze another</button>
        {isLoggedIn() && <button className="secondary" onClick={() => navigate('/history')}>View history</button>}
      </div>
    </div>
  );
}

function Signal({ label, value, color }) {
  return <div style={{ marginBottom: '14px' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}><span>{label}</span><span style={{ fontFamily: 'var(--font-mono)', color }}>{value.toFixed(1)}%</span></div><div style={{ height: '4px', background: 'var(--surface-2)', borderRadius: '2px', overflow: 'hidden' }}><div style={{ height: '100%', width: `${value}%`, background: color }} /></div></div>;
}

export default ResultsPage;
