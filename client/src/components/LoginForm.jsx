import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginForm() {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('alice@example.com');
  const [password, setPassword] = useState('password');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    try {
      await handleLogin(username, password);
      navigate('/');
    } catch {
      setErrorMessage('Wrong username or password.');
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-5">
        <div className="card">
          <div className="card-body">
            <h1 className="card-title">Login</h1>

            {errorMessage && (
              <div className="alert alert-danger">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  className="form-control"
                  value={username}
                  onChange={event => setUsername(event.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                />
              </div>

              <button className="btn btn-primary" type="submit">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;