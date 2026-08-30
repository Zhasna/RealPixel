import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { saveSession } from '../auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      saveSession(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="page" style={{ maxWidth: '380px' }}>
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <p className="label-mono" style={{ marginBottom: '8px' }}>WELCOME BACK</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px' }}>Log in</h2>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" style={{ marginTop: '6px' }}>Log in</button>
        </form>
      </div>

      {error && <p style={{ color: 'var(--danger)', marginTop: '14px', textAlign: 'center', fontSize: '13px' }}>{error}</p>}

      <p style={{ marginTop: '18px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default LoginPage;