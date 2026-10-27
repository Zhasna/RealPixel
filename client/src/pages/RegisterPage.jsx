import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { saveSession } from '../auth';

function RegisterPage() {
  const [name, setName] = useState('');
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
    if (name.trim().length < 2) nextErrors.name = 'Enter at least 2 characters.';
    if (!email.includes('@')) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', { name, email, password });
      saveSession(response.data.token, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <p className="label-mono" style={{ marginBottom: '8px' }}>NEW CASE FILE</p>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px' }}>Create account</h2>
      </div>
      <div className="auth-layout">
        <div className="card">
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <div className="field"><label htmlFor="name">Name</label><input id="name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />{fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}</div>
            <div className="field"><label htmlFor="register-email">Email</label><input id="register-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />{fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}</div>
            <div className="field"><label htmlFor="register-password">Password</label><div className="password-wrap"><input id="register-password" type={showPassword ? 'text' : 'password'} placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="button" className="secondary" onClick={() => setShowPassword(!showPassword)}>{showPassword ? 'Hide' : 'Show'}</button></div>{fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}</div>
            <button type="submit" className="form-submit">Register</button>
            <p className="form-link">Already have an account? <Link to="/login">Log in</Link></p>
          </form>
        </div>
        <Benefits title="Keep your results close." />
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
  return <div className="card benefits-card"><p className="label-mono" style={{ marginBottom: '10px' }}>YOUR CASE FILE</p><h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '22px', marginBottom: '18px' }}>{title}</h2><div className="benefit-list">{benefits.map(([icon, benefit, description]) => <div className="benefit" key={benefit}><BenefitIcon type={icon} /><div><strong>{benefit}</strong><p>{description}</p></div></div>)}</div></div>;
}

function BenefitIcon({ type }) {
  const paths = {
    history: <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2M4 7V3m0 0h4" /></>,
    download: <><path d="M12 4v10m0 0-4-4m4 4 4-4M5 19h14" /></>,
    trend: <><path d="m4 16 5-5 4 3 7-8" /><path d="M16 6h4v4" /></>
  };
  return <svg className="benefit-svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{paths[type]}</svg>;
}

export default RegisterPage;
