import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Watchlist from './pages/Watchlist';
import Resources from './pages/Resources';
import StarryBackground from './components/StarryBackground';
import GlobalChat from './components/GlobalChat';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  if (!currentUser) return <Navigate to="/login" />;
  return children;
};

// Validated: access router context by moving content to a child component or using hook inside Router
function AppContent() {
  const location = useLocation();

  // Scroll to top on route change
  React.useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen text-white font-sans antialiased relative z-0 flex flex-col">
      <StarryBackground />
      <Navbar />
      {/* key={location.pathname} forces a full remount. z-index ensures it sits above partial backgrounds */}
      <div key={location.pathname} className="flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/watchlist" element={
            <ProtectedRoute>
              <Watchlist />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
      <GlobalChat />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
