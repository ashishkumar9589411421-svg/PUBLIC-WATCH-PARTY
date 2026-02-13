import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, AuthState } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'watchparty_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuth = () => {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored) {
          const { user, token } = JSON.parse(stored);
          if (token && user) {
            setState({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            api.setAuthToken(token);
          } else {
            setState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to load auth:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadAuth();
  }, []);

  // Save auth state to localStorage
  const saveAuth = useCallback((user: User | null, token: string | null) => {
    if (user && token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.success) {
        const { user, token } = response.data;
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        saveAuth(user, token);
        api.setAuthToken(token);
        toast.success('Welcome back!', {
          description: `Logged in as ${user.username}`,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error('Login failed', {
        description: error.message || 'Invalid credentials',
      });
      return false;
    }
  }, [saveAuth]);

  const register = useCallback(async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      
      if (response.success) {
        const { user, token } = response.data;
        setState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        saveAuth(user, token);
        api.setAuthToken(token);
        toast.success('Account created!', {
          description: `Welcome, ${user.username}!`,
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error('Registration failed', {
        description: error.message || 'Could not create account',
      });
      return false;
    }
  }, [saveAuth]);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
    saveAuth(null, null);
    api.setAuthToken(null);
    toast.success('Logged out successfully');
  }, [saveAuth]);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    try {
      const response = await api.put('/auth/profile', data);
      
      if (response.success) {
        const updatedUser = response.data.user;
        setState(prev => ({
          ...prev,
          user: updatedUser,
        }));
        saveAuth(updatedUser, state.token);
        toast.success('Profile updated successfully');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error('Failed to update profile', {
        description: error.message,
      });
      return false;
    }
  }, [state.token, saveAuth]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      return true;
    } catch (error: any) {
      toast.error('Failed to change password', {
        description: error.message,
      });
      return false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.success) {
        const updatedUser = response.data.user;
        setState(prev => ({
          ...prev,
          user: updatedUser,
        }));
        saveAuth(updatedUser, state.token);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }, [state.token, saveAuth]);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
