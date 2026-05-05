import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google'; // 1. Import the Provider
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext'; // 2. To check if user is logged in

// 3. Define your Client ID (Preferably via .env)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
/**
 * A simple Protected Route wrapper to keep the "Linear"
 * philosophy of clear, functional boundaries.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null; // Or a sleek minimalist spinner
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    // 4. Wrap everything in the Google Provider
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          {/* Redirect root to login for now */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 5. Secure the Dashboard using the ProtectedRoute pattern */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="text-center mt-5 text-body">
                  <h2 className="fw-semibold">Welcome to FixIt Campus!</h2>
                  <p className="text-muted">You have successfully logged in.</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect back to login or 404 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;