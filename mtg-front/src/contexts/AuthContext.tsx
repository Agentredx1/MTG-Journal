// COMMENTED OUT FOR DEVELOPMENT - Using default group ID instead of authentication

import React, { createContext, useContext, ReactNode } from 'react';
import { apiService } from '../services/api';

// Development mode - simplified context without authentication
interface AuthContextType {
  groupInfo: { group_id: number; group_name: string };
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Development mode - using default group info
  const groupInfo = apiService.getDefaultGroupInfo();

  const value: AuthContextType = {
    groupInfo,
    loading: false,
    error: null,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ORIGINAL AUTHENTICATION CODE - COMMENTED OUT FOR DEVELOPMENT
/*
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, AuthStatus } from '../services/api';

interface AuthContextType {
  authStatus: AuthStatus | null;
  loading: boolean;
  error: string | null;
  login: (passkey: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setError(null);
      const response = await apiService.getAuthStatus();
      if (response.success && response.data) {
        setAuthStatus(response.data);
      } else {
        setAuthStatus({ authenticated: false });
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setAuthStatus({ authenticated: false });
      setError(err instanceof Error ? err.message : 'Authentication check failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (passkey: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      const response = await apiService.login(passkey);
      
      if (response.success && response.data) {
        setAuthStatus({
          authenticated: true,
          group_id: response.data.group_id,
          group_name: response.data.group_name,
        });
        return true;
      }
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('Login failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await apiService.logout();
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setAuthStatus({ authenticated: false });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    authStatus,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
*/