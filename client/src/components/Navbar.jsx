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
      padding: '16px 40px',
      borderBottom: '0.5px solid var(--border)'
    }}>
      <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', color: 'var(--text-primary)', textDecoration: 'none' }}>
        RealPixel
      </Link>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
        {loggedIn ? (
          <>
            <span style={{ color: 'var(--text-secondary)' }}>Hi, {user?.name}</span>
            <Link to="/history" style={{ color: 'var(--text-primary)' }}>History</Link>
            <button onClick={handleLogout} style={{ fontSize: '13px' }}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'var(--text-primary)' }}>Log in</Link>
            <Link to="/register" style={{ color: 'var(--text-primary)' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;