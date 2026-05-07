import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyTickets from './pages/MyTickets'; // Import the new placeholders
import Triage from './pages/Triage';
import Settings from './pages/Settings';
import { useAuth } from './context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* The Dashboard route now acts as a wrapper.
            Notice the lack of a closing slash on the parent <Route>
            and the nested <Route> elements inside it.
          */}

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
                <Route path="triage" element={<Triage />} />
                <Route path="settings" element={<Settings />} />

                {/* Update this line to return null instead of the placeholder text */}
                <Route path="dashboard" element={null} />
            </Route>


          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;