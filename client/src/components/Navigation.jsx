import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { loggedIn, user, handleLogout } = useAuth();
  const navigate = useNavigate();

  async function doLogout() {
    await handleLogout();
    navigate('/');
  }

  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark mb-4">
      <div className="container">
        <Link className="navbar-brand" to="/">Last Race</Link>

        <div className="navbar-nav me-auto">
          <Link className="nav-link" to="/">Instructions</Link>
          {loggedIn && <Link className="nav-link" to="/game">Game</Link>}
          {loggedIn && <Link className="nav-link" to="/ranking">Ranking</Link>}
        </div>

        <div className="d-flex align-items-center gap-3">
          {loggedIn ? (
            <>
              <span className="text-light">Hi, {user.name}</span>
              <button className="btn btn-outline-light btn-sm" onClick={doLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link className="btn btn-outline-light btn-sm" to="/login">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;