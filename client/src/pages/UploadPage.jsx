import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../auth';
import { API_URL } from '../config';

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const selectFile = (selected) => {
    setError(null);

    if (!selected) {
      setFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(selected.type)) {
      setFile(null);
      setError('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (selected.size > MAX_SIZE) {
      setFile(null);
      setError('That file is larger than 10 MB. Please choose a smaller image.');
      return;
    }
    setFile(selected);
  };

  const handleFileChange = (e) => selectFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    selectFile(e.dataTransfer.files[0]);
  };

  const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = getToken();
      const response = await axios.post('http://localhost:5000/api/scan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      navigate('/results', { state: { result: response.data, file } });
    } catch (err) {
      setError(err.response?.data?.message || 'Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page hero">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p className="label-mono" style={{ marginBottom: '10px' }}>MEDIA VERIFICATION</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', marginBottom: '10px' }}>RealPixel</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Upload an image to check for signs of AI manipulation
        </p>
      </div>

      <form onSubmit={handleSubmit} className="upload-form">
          <div
            className={`drop-zone${dragging ? ' is-dragging' : ''}`}
            role="button"
            tabIndex="0"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
          {!file ? (
            <>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                <path d="M12 16V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
              </svg>
              <strong>Drag &amp; drop an image or click to browse</strong>
              <span className="helper-text">JPG, PNG or WebP · up to 10 MB · works best on a clear photo of a single face</span>
            </>
          ) : (
            <div className="file-preview selected-file">
              <img src={previewUrl} alt="" />
              <div className="file-meta">
                <strong>{file.name}</strong>
                <span className="label-mono">{formatSize(file.size)}</span>
              </div>
              <button type="button" className="text-button" onClick={(e) => { e.stopPropagation(); setFile(null); inputRef.current.value = ''; }}>Remove</button>
            </div>
          )}
          </div>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} hidden />
          <button className="analyze-button" type="submit" disabled={!file || loading}>
            {loading ? 'Analyzing...' : 'Analyze image'}
          </button>
      </form>

      {error && <p style={{ color: 'var(--danger)', marginTop: '16px', textAlign: 'center' }}>{error}</p>}

      <div className="steps">
        {[
          ['upload', 'Upload', 'Choose a clear face photo.'],
          ['analyze', 'Analyze', 'We compare visual signals.'],
          ['report', 'Report', 'Review the probability and evidence.']
        ].map(([icon, title, text]) => (
          <div className="step" key={title}>
            <StepIcon type={icon} />
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <p className="label-mono" style={{ marginBottom: '10px' }}>WHAT WE CHECK</p>
      <div className="check-grid">
        {[
          ['ela', 'Error Level Analysis', 'Looks for inconsistent compression traces.'],
          ['noise', 'Noise patterns', 'Checks texture and frequency irregularities.'],
          ['face', 'Face consistency', 'Measures whether facial details fit together.']
        ].map(([icon, title, text]) => (
          <div className="check-card" key={title}>
            <StepIcon type={icon} />
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIcon({ type }) {
  const paths = {
    upload: <><path d="M12 16V4m0 0L8 8m4-4 4 4" /><path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></>,
    analyze: <><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4M11 8v6m-3-3h6" /></>,
    report: <><path d="M5 19V5h14v14H5Z" /><path d="m8 15 2-3 2 2 3-5" /></>,
    ela: <><path d="M4 5h16v14H4z" /><path d="M7 15h2m2 0h2m2 0h2M7 11h2m2 0h2m2 0h2" /></>,
    noise: <><path d="M4 12h3l2-5 3 10 2-5h6" /></>,
    face: <><circle cx="12" cy="12" r="8" /><path d="M9 10h.01M15 10h.01M9 15c2 1 4 1 6 0" /></>
  };
  return <svg className="step-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{paths[type]}</svg>;
}

export default UploadPage;