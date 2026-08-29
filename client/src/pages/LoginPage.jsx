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
    <div style={{ padding: '40px', maxWidth: '400px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)' }}>Log in</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Log in</button>
      </form>
      {error && <p style={{ color: 'var(--danger)', marginTop: '12px' }}>{error}</p>}
      <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
        No account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
      </p>
    </div>
  );
}

export default LoginPage;