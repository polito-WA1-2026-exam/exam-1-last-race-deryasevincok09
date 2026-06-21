import { useEffect, useRef, useState } from 'react';
import { startGame } from '../API';
import NetworkMap from './NetworkMap';

function PlanningPhase() {
  const [planningData, setPlanningData] = useState(null);
  const [selectedSegments, setSelectedSegments] = useState([]);
  const [routeStations, setRouteStations] = useState([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [errorMessage, setErrorMessage] = useState('');

  const gameStartedRef = useRef(false);

  useEffect(() => {
    if (gameStartedRef.current) {
      return;
    }

    gameStartedRef.current = true;

    startGame()
      .then(data => {
        setPlanningData(data);
        setRouteStations([data.startStation]);
      })
      .catch(() => {
        setErrorMessage('Cannot start a new game.');
      });
  }, []);

  useEffect(() => {
    if (!planningData) {
      return;
    }

    if (timeLeft <= 0) {
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(oldTime => oldTime - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [planningData, timeLeft]);

  function selectSegment(segment) {
    setErrorMessage('');

    if (timeLeft <= 0) {
      setErrorMessage('Time is over. The route cannot be changed anymore.');
      return;
    }

    const alreadySelected = selectedSegments.some(
      selectedSegment => selectedSegment.id === segment.id
    );

    if (alreadySelected) {
      setErrorMessage('This segment has already been selected.');
      return;
    }

    const currentStation = routeStations[routeStations.length - 1];

    const segmentStartsFromCurrent =
      segment.station1Id === currentStation.id ||
      segment.station2Id === currentStation.id;

    if (!segmentStartsFromCurrent) {
      setErrorMessage(
        `The selected segment must start from the current station: ${currentStation.name}.`
      );
      return;
    }

    const nextStation =
      segment.station1Id === currentStation.id
        ? { id: segment.station2Id, name: segment.station2Name }
        : { id: segment.station1Id, name: segment.station1Name };

    setSelectedSegments(oldSegments => [...oldSegments, segment]);
    setRouteStations(oldStations => [...oldStations, nextStation]);
  }

  function undoLastSegment() {
    setErrorMessage('');

    if (selectedSegments.length === 0) {
      return;
    }

    setSelectedSegments(oldSegments => oldSegments.slice(0, -1));
    setRouteStations(oldStations => oldStations.slice(0, -1));
  }

  function clearRoute() {
    if (!planningData) {
      return;
    }

    setErrorMessage('');
    setSelectedSegments([]);
    setRouteStations([planningData.startStation]);
  }

  if (errorMessage && !planningData) {
    return (
      <div className="alert alert-danger">
        {errorMessage}
      </div>
    );
  }

  if (!planningData) {
    return <p>Loading planning phase...</p>;
  }

  const currentStation = routeStations[routeStations.length - 1];
  const reachedDestination =
    currentStation.id === planningData.destinationStation.id;

  const planningMap = {
    stations: planningData.stations
  };

  return (
    <div>
      <h1>Planning Phase</h1>

      <div className="alert alert-info">
        <strong>Time left:</strong> {timeLeft} seconds
      </div>

      <div className="row mb-4">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h4>Start station</h4>
              <p className="fs-4">{planningData.startStation.name}</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div className="card-body">
              <h4>Destination station</h4>
              <p className="fs-4">{planningData.destinationStation.name}</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card">
            <div className="card-body">
              <h4>Current station</h4>
              <p className="fs-4">{currentStation.name}</p>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="alert alert-danger">
          {errorMessage}
        </div>
      )}

      {reachedDestination && (
        <div className="alert alert-success">
          Destination reached in the planned route. In the next step, this route
          will be submitted to the server for validation and execution.
        </div>
      )}

      {timeLeft === 0 && (
        <div className="alert alert-warning">
          Time is over. The current route is now fixed.
        </div>
      )}

      <div className="mb-4">
        <NetworkMap network={planningMap} showLines={false} />
      </div>

      <div className="row">
        <div className="col-7">
          <div className="card">
            <div className="card-body">
              <h2>Available segments</h2>

              <p>
                Select the segments in sequence. The next segment must start
                from your current station.
              </p>

              <div className="list-group">
                {planningData.segments.map(segment => {
                  const alreadySelected = selectedSegments.some(
                    selectedSegment => selectedSegment.id === segment.id
                  );

                  const canBeSelected =
                    !alreadySelected &&
                    timeLeft > 0 &&
                    (
                      segment.station1Id === currentStation.id ||
                      segment.station2Id === currentStation.id
                    );

                  return (
                    <button
                      key={segment.id}
                      className="list-group-item list-group-item-action"
                      disabled={!canBeSelected}
                      onClick={() => selectSegment(segment)}
                    >
                      {segment.station1Name} — {segment.station2Name}

                      {alreadySelected && (
                        <span className="badge bg-secondary ms-2">
                          selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="col-5">
          <div className="card">
            <div className="card-body">
              <h2>Built route</h2>

              <ol className="list-group list-group-numbered mb-3">
                {routeStations.map((station, index) => (
                  <li key={`${station.id}-${index}`} className="list-group-item">
                    {station.name}
                  </li>
                ))}
              </ol>

              <p>
                <strong>Selected segments:</strong> {selectedSegments.length}
              </p>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary"
                  onClick={undoLastSegment}
                  disabled={selectedSegments.length === 0 || timeLeft === 0}
                >
                  Undo last
                </button>

                <button
                  className="btn btn-outline-danger"
                  onClick={clearRoute}
                  disabled={selectedSegments.length === 0 || timeLeft === 0}
                >
                  Clear route
                </button>
              </div>

              <button
                className="btn btn-primary mt-3"
                disabled
              >
                Submit route - next step
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlanningPhase;