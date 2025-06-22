import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EnergeticSignIn from '../components/auth/EnergeticSignIn';
import WaitlistSignup from '../components/auth/WaitlistSignup';
import TokenSignup from '../components/auth/TokenSignup';

interface AuthPageProps {
  onLogin?: (email: string, password: string) => Promise<void>;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated, isAdmin, user } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'waitlist' | 'token-signup'>(() => {
    // Check for token signup
    if (searchParams.get('token')) return 'token-signup';
    // Check for waitlist mode
    if (searchParams.get('mode') === 'waitlist') return 'waitlist';
    // Default to signin
    return 'signin';
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, isAdmin, user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError('');
      
      if (onLogin) {
        await onLogin(email, password);
      } else {
        // Use AuthContext login
        await authLogin(email, password);
        // Redirect is handled in useEffect above
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlistSignup = () => {
    setAuthMode('waitlist');
    // Update URL without token
    navigate('/auth?mode=waitlist', { replace: true });
  };

  const handleSignInClick = () => {
    setAuthMode('signin');
    navigate('/auth', { replace: true });
  };

  const handleWaitlistSuccess = () => {
    // Could show a success message or redirect
    console.log('Successfully joined waitlist');
  };

  // Token signup flow
  if (authMode === 'token-signup') {
    return <TokenSignup />;
  }

  // Waitlist signup flow
  if (authMode === 'waitlist') {
    return (
      <WaitlistSignup 
        onSignInClick={handleSignInClick}
        onSuccess={handleWaitlistSuccess}
      />
    );
  }

  // Default sign in flow
  return (
    <EnergeticSignIn
      onLogin={handleLogin}
      onWaitlistSignup={handleWaitlistSignup}
      loading={loading}
      error={error}
    />
  );
};

export default AuthPage;