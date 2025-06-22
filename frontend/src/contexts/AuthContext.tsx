import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: number;
  email: string;
  first_name?: string;
  is_admin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip auth check on marketing site
    if (window.location.hostname === 'moneyclip.money') {
      setIsLoading(false);
      return;
    }
    
    // Check for stored token on app start
    const storedToken = localStorage.getItem('money_clip_token');
    if (storedToken) {
      setToken(storedToken);
      authService.setAuthToken(storedToken);
      
      // Verify token and get user profile
      authService.getProfile()
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('money_clip_token');
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      const { user: userData, access_token } = response.data;
      
      setUser(userData);
      setToken(access_token);
      authService.setAuthToken(access_token);
      localStorage.setItem('money_clip_token', access_token);
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string, firstName?: string) => {
    try {
      const response = await authService.signup(email, password, firstName);
      const { user: userData, access_token } = response.data;
      
      setUser(userData);
      setToken(access_token);
      authService.setAuthToken(access_token);
      localStorage.setItem('money_clip_token', access_token);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    authService.setAuthToken(null);
    localStorage.removeItem('money_clip_token');
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: !!user?.is_admin || (user?.email === 'admin@moneyclip.money' || user?.email === 'cjohnkim@gmail.com'),
    isLoading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}