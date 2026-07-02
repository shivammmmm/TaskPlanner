import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { User } from '../types/entities';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isLoadingPublicSettings: boolean;
  authError: { type: string; message: string } | null;
  appPublicSettings: any;
  authChecked: boolean;
  logout: (shouldRedirect?: boolean) => void;
  navigateToLogin: () => void;
  checkUserAuth: () => Promise<void>;
  checkAppState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState<boolean>(false);
  const [authError, setAuthError] = useState<{ type: string; message: string } | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [appPublicSettings, setAppPublicSettings] = useState<any>({ id: 'local-app', public_settings: {} });
  const authCheckRunning = useRef(false);

  const checkAppState = async () => {
    // Local app has no complex remote initialization block, just verify user
    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      
      const token = localStorage.getItem('tp_token');
      if (token) {
        await checkUserAuth();
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAuthChecked(true);
      }
    } catch (error: any) {
      console.error('App state verification failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'Failed to verify local app state'
      });
    } finally {
      setIsLoadingPublicSettings(false);
    }
  };

  const checkUserAuth = async () => {
    // Prevent multiple simultaneous auth checks
    if (authCheckRunning.current) return;
    authCheckRunning.current = true;
    try {
      setIsLoadingAuth(true);
      const currentUser = await authService.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setAuthError(null);
    } catch (error: any) {
      console.error('User auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      // Clear the stored token if backend returned 401/403
      const status = error.response?.status || error.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('tp_token');
        localStorage.removeItem('tp_current_user');
        setAuthError({
          type: 'auth_required',
          message: 'Session expired. Please log in again.'
        });
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
      authCheckRunning.current = false;
    }
  };

  useEffect(() => {
    checkAppState();
  }, []);

  const logout = (shouldRedirect = true) => {
    authService.logout(shouldRedirect);
    setUser(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
