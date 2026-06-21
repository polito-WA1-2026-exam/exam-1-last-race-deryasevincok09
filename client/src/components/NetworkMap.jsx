function NetworkMap({ network, showLines = true }) {
  if (!network) {
    return <p>Loading network...</p>;
  }

  return (
    <div>
      <h2>Underground Network</h2>

      <div className="row">
        <div className="col-4">
          <div className="card mb-3">
            <div className="card-body">
              <h4>Stations</h4>

              <ul className="list-group">
                {network.stations.map(station => (
                  <li
                    key={station.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    {station.name}

                    {station.interchange && (
                      <span className="badge bg-warning text-dark">
                        interchange
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-8">
          {showLines && (
            <div className="card mb-3">
              <div className="card-body">
                <h4>Lines</h4>

                {network.lines.map(line => (
                  <div key={line.id} className="mb-3">
                    <h5>
                      <span
                        className="badge me-2"
                        style={{ backgroundColor: line.color }}
                      >
                        &nbsp;
                      </span>
                      {line.name}
                    </h5>

                    <ul className="list-group">
                      {network.segments
                        .filter(segment => segment.lineId === line.id)
                        .map(segment => (
                          <li key={segment.id} className="list-group-item">
                            {segment.station1Name} — {segment.station2Name}
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!showLines && (
            <div className="alert alert-info">
              In this phase, line connections are hidden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NetworkMap;