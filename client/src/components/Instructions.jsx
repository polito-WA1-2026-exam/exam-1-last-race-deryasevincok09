import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Instructions() {
  const { loggedIn } = useAuth();

  return (
    <div className="card">
      <div className="card-body text-center">
        <h1 className="card-title">Last Race</h1>

        <p>
          Plan a route through the underground network before time runs out.
          Each game starts with 20 coins. During execution, random events may
          increase or decrease your coins.
        </p>

        <p>
          Anonymous visitors can only read the instructions. Registered users
          can play games and appear in the ranking.
        </p>

        {loggedIn ? (
          <Link className="btn btn-primary" to="/game">
            Start game
          </Link>
        ) : (
          <Link className="btn btn-primary" to="/login">
            Login to play
          </Link>
        )}
      </div>
    </div>
  );
}

export default Instructions;