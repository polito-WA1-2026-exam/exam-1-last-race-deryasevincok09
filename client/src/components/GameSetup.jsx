import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNetwork } from '../API';
import NetworkMap from './NetworkMap';

function GameSetup() {
  const navigate = useNavigate();

  const [network, setNetwork] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getNetwork()
      .then(network => {
        setNetwork(network);
      })
      .catch(() => {
        setErrorMessage('Cannot load the underground network.');
      });
  }, []);

  return (
    <div>
      <h1>Game Setup</h1>

      <p>
        Study the underground network before starting the game.
        During the planning phase, connections will be hidden and you will have
        to build a valid route before time runs out.
      </p>

      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}

      <NetworkMap network={network} showLines={true} />

      <div className="mt-4">
        <button
          className="btn btn-primary"
          onClick={() => navigate('/game/planning')}
          disabled={!network}
        >
          Continue to planning
        </button>
      </div>
    </div>
  );
}

export default GameSetup;