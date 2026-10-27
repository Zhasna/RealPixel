import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { saveSession } from '../auth';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const nextErrors = {};
    if (!email.includes('@')) nextErrors.email = 'Enter a valid email address.';
    if (!password) nextErrors.password = 'Enter your password.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      saveSession(response.data.token, response.data.user);
      navigate('/');
    } catch {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: '28px' }}><p className="label-mono" style={{ marginBottom: '8px' }}>WELCOME BACK</p><h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px' }}>Log in</h2></div>
      <div className="auth-layout">
        <div className="card">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field"><label htmlFor="login-email">Email</label><input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />{fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}</div>
            <div className="field"><label htmlFor="login-password">Password</label><div className="password-wrap"><input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" className="secondary" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div>{fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}</div>
            <button type="submit" className="form-submit">Log in</button>
            <p className="form-link">No account? <Link to="/register">Register</Link></p>
          </form>
        </div>
        <Benefits title="Your evidence, in one place." />
      </div>
      {error && <p style={{ color: 'var(--danger)', marginTop: '14px', textAlign: 'center', fontSize: '13px' }}>{error}</p>}
    </div>
  );
}

function Benefits({ title }) {
  const benefits = [
    ['history', 'Saved scan history', 'Keep every result in one place.'],
    ['download', 'Downloadable reports', 'Take a clear report with you.'],
    ['trend', 'Track results over time', 'Compare findings across scans.']
  ];
  return <div className="card benefits-card"><p className="label-mono" style={{ marginBottom: '10px' }}>CASE TOOLKIT</p><h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '18px' }}>{title}</h2><div className="benefit-list">{benefits.map(([icon, benefit, description]) => <div className="benefit" key={benefit}><BenefitIcon type={icon} /><div><strong>{benefit}</strong><p>{description}</p></div></div>)}</div></div>;
}

function BenefitIcon({ type }) {
  const paths = {
    history: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2M4 7V3m0 0h4" /></>,
    download: <><path d="M12 4v10m0 0-4-4m4 4 4-4M5 19h14" /></>,
    trend: <><path d="m4 16 5-5 4 3 7-8" /><path d="M16 6h4v4" /></>
  };
  return <svg className="benefit-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{paths[type]}</svg>;
}

export default LoginPage;
