import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
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
      const response = await axios.post('http://localhost:5000/api/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/results', { state: { result: response.data } });
    } catch (err) {
      setError('Scan failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };   

  return (
    <div style={{ padding: '40px', maxWidth: '600px' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px' }}>RealPixel</h1>
      <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
        Upload an image to check for signs of manipulation
      </p>

      <form onSubmit={handleSubmit}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button type="submit" disabled={!file || loading} style={{ marginLeft: '12px' }}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>

      {error && <p style={{ color: 'var(--danger)', marginTop: '16px' }}>{error}</p>}
    </div>
  );
}

export default UploadPage;