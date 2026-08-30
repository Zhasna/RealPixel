import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { saveSession } from '../auth';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      saveSession(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="page" style={{ maxWidth: '380px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <p className="label-mono" style={{ marginBottom: '8px' }}>NEW CASE FILE</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px' }}>Create account</h2>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" style={{ marginTop: '6px' }}>Register</button>
        </form>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginTop: '14px', textAlign: 'center', fontSize: '13px' }}>{error}</p>}

      <p style={{ marginTop: '18px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}

export default RegisterPage;