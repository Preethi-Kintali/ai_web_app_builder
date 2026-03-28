import { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import BuilderPage from './pages/BuilderPage.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicViewPage from './pages/PublicViewPage.jsx';
import { useNavigationLock } from './hooks/useNavigationLock.js';

function App() {
  const { user, loading } = useContext(AuthContext);

  // Lock navigation arrows globally
  useNavigationLock(true);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" /> : <LandingPage />}
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/view/:projectId" element={<PublicViewPage />} />

      {/* Protected: Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Navbar />
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Protected: Builder */}
      <Route
        path="/builder/:projectId"
        element={
          <ProtectedRoute>
            <Navbar />
            <BuilderPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
