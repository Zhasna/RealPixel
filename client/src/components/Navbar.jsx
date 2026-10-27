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
    <nav className="site-nav">
      <div className="container nav-inner">
        <Link to="/" className="brand">RealPixel</Link>

      <div className="nav-links">
        {loggedIn ? (
          <>
            <span className="nav-greeting">Hi, {user?.name}</span>
            <Link to="/history">
              History
            </Link>
            <button className="secondary" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <Link to="/login">
              Log in
            </Link>
            <button onClick={() => navigate('/register')}>Register</button>
          </>
        )}
      </div>
      </div>
    </nav>
  );
}

export default Navbar;