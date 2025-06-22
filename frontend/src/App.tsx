import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { athleticTheme } from './theme/athleticTheme';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import AdminPage from './pages/AdminPage';
import AuthPage from './pages/AuthPage';
import AthleticDashboard from './components/dashboard/AthleticDashboard';
import Setup from './components/setup/Setup';
import Planning from './components/planning/Planning';
import Timeline from './components/timeline/Timeline';
import ScenarioTest from './components/scenario/ScenarioTest';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
}

function RootRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Check if we're on the marketing domain
  const isMarketingSite = window.location.hostname === 'moneyclip.money';
  
  // If on marketing site, always show landing page
  if (isMarketingSite) {
    return <LandingPage />;
  }
  
  // If on app domain, handle authentication
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  // If authenticated, redirect to dashboard
  // If not authenticated, show landing page
  return isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />;
}

function App() {
  return (
    <ThemeProvider theme={athleticTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/about" element={<AboutPage />} />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Authentication routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/signup" element={<AuthPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <AthleticDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/setup" 
                element={
                  <ProtectedRoute>
                    <Setup />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/planning" 
                element={
                  <ProtectedRoute>
                    <Planning />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/timeline" 
                element={
                  <ProtectedRoute>
                    <Timeline />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/scenario" 
                element={
                  <ProtectedRoute>
                    <ScenarioTest />
                  </ProtectedRoute>
                } 
              />
              
              {/* Index.html redirect */}
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              
              {/* Root route - landing page for unauthenticated, dashboard for authenticated */}
              <Route path="/" element={<RootRoute />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;