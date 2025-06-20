import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { athleticTheme } from './theme/athleticTheme';
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

function App() {
  return (
    <ThemeProvider theme={athleticTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
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
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;