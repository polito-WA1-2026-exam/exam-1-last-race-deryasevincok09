import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Navigation from './components/Navigation';
import Instructions from './components/Instructions';
import LoginForm from './components/LoginForm';
import Ranking from './components/Ranking';
import GameSetup from './components/GameSetup';
import PlanningPhase from './components/PlanningPhase';
import ExecutionResult from './components/ExecutionResult.jsx';

function ProtectedRoute({ children }) {
  const { loggedIn, checkingAuth } = useAuth();

  if (checkingAuth) {
    return <p>Loading...</p>;
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <>
      <Navigation />

      <main className="container">
        <Routes>
          <Route path="/" element={<Instructions />} />

          <Route path="/login" element={<LoginForm />} />

          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GameSetup />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game/planning"
            element={
              <ProtectedRoute>
                <PlanningPhase />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ranking"
            element={
              <ProtectedRoute>
                <Ranking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/game/result"
            element={
              <ProtectedRoute>
                <ExecutionResult />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;