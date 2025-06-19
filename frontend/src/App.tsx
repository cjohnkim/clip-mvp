import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Dashboard from './components/dashboard/Dashboard';
import Setup from './components/setup/Setup';
import Planning from './components/planning/Planning';
import Timeline from './components/timeline/Timeline';
import ScenarioTest from './components/scenario/ScenarioTest';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
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
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;