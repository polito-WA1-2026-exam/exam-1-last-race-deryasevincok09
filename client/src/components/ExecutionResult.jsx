import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';

function ExecutionResult() {
    const location = useLocation();
    const result = location.state?.result;

    const [visibleSteps, setVisibleSteps] = useState(0);

    if (!result) {
        return <Navigate to="/" replace />;
    }

    const shownSteps = result.steps.slice(0, visibleSteps);
    const allStepsShown = visibleSteps >= result.steps.length;

    if (!result.valid) {
        return (
            <div className="card">
                <div className="card-body text-center">
                    <h1>Invalid Route</h1>

                    <div className="alert alert-danger">
                        {result.reason}
                    </div>

                    <p>
                        The route was invalid or incomplete, so the execution phase was skipped.
                    </p>

                    <h2 className="text-dark">Final score: {result.storedScore} coins</h2>
                    <div className="mt-4">
                        <Link className="btn btn-primary me-2" to="/game">
                            Start new game
                        </Link>

                        <Link className="btn btn-outline-secondary" to="/ranking">
                            View ranking
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <h1>Execution Phase</h1>

            <div className="alert alert-info">
                The submitted route is valid. Events are revealed one step at a time.
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h2>Route</h2>

                    <ol className="list-group list-group-numbered">
                        {result.routeStations.map((station, index) => (
                            <li key={`${station.id}-${index}`} className="list-group-item">
                                {station.name}
                            </li>
                        ))}
                    </ol>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h2>Journey events</h2>

                    {shownSteps.length === 0 && (
                        <p>No step revealed yet.</p>
                    )}

                    {shownSteps.map((step, index) => (
                        <div key={`${step.segmentId}-${index}`} className="border rounded p-3 mb-3">
                            <h4>
                                Step {index + 1}: {step.fromStationName} → {step.toStationName}
                            </h4>

                            <p>
                                <strong>Line:</strong> {step.lineName}
                            </p>

                            <p>
                                <strong>Event:</strong> {step.eventDescription}
                            </p>

                            <p>
                                <strong>Effect:</strong> {step.eventEffect > 0 ? '+' : ''}
                                {step.eventEffect} coins
                            </p>

                            <p>
                                <strong>Coins after this step:</strong> {step.coinsAfterStep}
                            </p>
                        </div>
                    ))}

                    {!allStepsShown ? (
                        <button
                            className="btn btn-primary"
                            onClick={() => setVisibleSteps(oldValue => oldValue + 1)}
                        >
                            Reveal next step
                        </button>
                    ) : (
                        <div className="alert alert-success">
                            Journey completed.
                        </div>
                    )}
                </div>
            </div>

            {allStepsShown && (
                <div className="card">
                    <div className="card-body text-center">
                        <h2>Final result</h2>

                        <p>
                            Final coins before score normalization: {result.finalCoins}
                        </p>

                        <h3 className="text-dark">Stored score: {result.storedScore} coins</h3>
                        <div className="mt-4">
                            <Link className="btn btn-primary me-2" to="/game">
                                Start new game
                            </Link>

                            <Link className="btn btn-outline-secondary" to="/ranking">
                                View ranking
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ExecutionResult;