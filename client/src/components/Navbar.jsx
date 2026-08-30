import { Link, useNavigate } from 'react-router-dom';
import { isLoggedIn, getUser, clearSession } from '../auth';

function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '18px 32px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)'
    }}>
      <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '19px', color: 'var(--text-primary)', fontWeight: 500 }}>
        RealPixel
      </Link>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {loggedIn ? (
          <>
            <span className="label-mono">Hi, {user?.name}</span>
            <Link to="/history" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>
              History
            </Link>
            <button className="secondary" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-primary)' }}>
              Log in
            </Link>
            <button onClick={() => navigate('/register')}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;