import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as authApi from '@/app/api/auth';

interface User {
  username: string;
  email: string;
  totalPoints: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(false);

  const loginFn = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const resp = await authApi.login(username, password);
      localStorage.setItem('token', resp.token);
      localStorage.setItem('user', JSON.stringify({ username: resp.username, email: resp.email, totalPoints: resp.totalPoints }));
      setToken(resp.token);
      setUser({ username: resp.username, email: resp.email, totalPoints: resp.totalPoints });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signupFn = useCallback(async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const resp = await authApi.signup(username, email, password);
      localStorage.setItem('token', resp.token);
      localStorage.setItem('user', JSON.stringify({ username: resp.username, email: resp.email, totalPoints: resp.totalPoints }));
      setToken(resp.token);
      setUser({ username: resp.username, email: resp.email, totalPoints: resp.totalPoints });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const resp = await authApi.getMe();
      localStorage.setItem('user', JSON.stringify({ username: resp.username, email: resp.email, totalPoints: resp.totalPoints }));
      setUser({ username: resp.username, email: resp.email, totalPoints: resp.totalPoints });
    } catch {
      // If refresh fails, keep current user state
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login: loginFn, signup: signupFn, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}