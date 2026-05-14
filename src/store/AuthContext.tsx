import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  AuthResponse,
  RegisterPayload,
  LoginPayload,
  googleSignIn,
  register as registerApi,
  login as loginApi,
  logout as logoutApi,
  getStoredUser,
} from '../services/authService';
import { getAccessToken } from '../services/api';

// ─── Context Types ──────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<{ ok: boolean; error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ ok: boolean; error?: string }>;
  signInWithGoogle: (idToken: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const storedUser = await getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          }
        }
      } catch {
        // Ignore — no session to restore
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const handleAuthResponse = (result: { ok: boolean; data?: AuthResponse; error?: string }) => {
    if (result.ok && result.data) {
      setUser(result.data.user);
      return { ok: true };
    }
    return { ok: false, error: result.error || 'Something went wrong' };
  };

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await loginApi(payload);
    return handleAuthResponse(result);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await registerApi(payload);
    return handleAuthResponse(result);
  }, []);

  const signInWithGoogle = useCallback(async (idToken: string) => {
    const result = await googleSignIn(idToken);
    return handleAuthResponse(result);
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ───────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
