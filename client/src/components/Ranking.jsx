import { useEffect, useState } from 'react';
import { getRanking } from '../API';

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    getRanking()
      .then(ranking => {
        setRanking(ranking);
      })
      .catch(() => {
        setErrorMessage('Cannot load ranking.');
      });
  }, []);

  return (
    <div>
      <h1>General Ranking</h1>

      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Position</th>
            <th>User</th>
            <th>Best score</th>
          </tr>
        </thead>

        <tbody>
          {ranking.map((row, index) => (
            <tr key={row.username}>
              <td>{index + 1}</td>
              <td>{row.name}</td>
              <td>{row.bestScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ranking;