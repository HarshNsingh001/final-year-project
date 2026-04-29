import { ReactNode, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Splash } from './pages/Splash';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { useAuthStore } from './store/useAuthStore';
import './services/bleSimulator'; // Initialize background sync and available actions
import { AnimatePresence } from 'motion/react';
import { AppContainer } from './components/AppLayout';
import { tryAutoReconnect } from './services/healthConnect';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function ProtectedAppRoutes() {
  const location = useLocation();

  // Auto-reconnect Health Connect when app starts or resumes from being killed
  useEffect(() => {
    tryAutoReconnect();

    // Also reconnect when app resumes from background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        tryAutoReconnect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  return (
    <ProtectedRoute>
      <AppContainer>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </AppContainer>
    </ProtectedRoute>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const [hasSeenSplash, setHasSeenSplash] = useState(false);

  if (!hasSeenSplash) {
    return (
      <Splash 
        onComplete={() => setHasSeenSplash(true)} 
      />
    );
  }

  // Only animate the top level when transitioning between public routes and the main app shell
  const topLevelKey = location.pathname === '/login' || location.pathname === '/splash' 
    ? location.pathname 
    : 'app-shell';

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={topLevelKey}>
        <Route path="/splash" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<ProtectedAppRoutes />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

