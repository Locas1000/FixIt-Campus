import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTickets from './pages/MyTickets';
import Triage from './pages/Triage';
import Settings from './pages/Settings';
import { useAuth } from './context/AuthContext';


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ─── NEW: ROLE-BASED ROUTE GUARD ───
const RoleGuard = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;

    // If the user's role isn't in the allowed array, bounce them to My Tickets
    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/my-tickets" replace />;
    }

    // Return children (or null if the parent shell is handling the UI)
    return children ? children : null;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* The Dashboard route acts as the main authenticated wrapper */}
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/my-tickets" replace />} />
                <Route path="my-tickets" element={<MyTickets />} />
                <Route path="settings" element={<Settings />} />

                {/* ── RESTRICTED ROUTES ── */}
                <Route
                    path="triage"
                    element={
                        <RoleGuard allowedRoles={['Dispatcher', 'Admin']}>
                            <Triage />
                        </RoleGuard>
                    }
                />

                <Route
                    path="dashboard"
                    element={
                        <RoleGuard allowedRoles={['Dispatcher', 'Admin']}>
                            <span style={{ display: 'none' }} />
                        </RoleGuard>
                    }
                />
            </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;