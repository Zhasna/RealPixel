import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../auth';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

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
      navigate('/results', { state: { result: response.data } });
    } catch (err) {
      setError('Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p className="label-mono" style={{ marginBottom: '10px' }}>MEDIA VERIFICATION</p>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', marginBottom: '10px' }}>RealPixel</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Upload an image to check for signs of AI manipulation
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '20px 0' }}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <p className="label-mono">JPG or PNG, up to 10MB</p>
          <button type="submit" disabled={!file || loading}>
            {loading ? 'Analyzing...' : 'Analyze image'}
          </button>
        </form>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginTop: '16px', textAlign: 'center' }}>{error}</p>}
    </div>
  );
}

export default UploadPage;