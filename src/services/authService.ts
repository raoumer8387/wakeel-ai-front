import { apiRequest, authenticatedRequest, saveTokens, clearTokens, STORAGE_KEYS } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Types ──────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: AuthUser;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Auth API Calls ─────────────────────────────────────────────────

/**
 * Google Sign-In — send the id_token from Google to our backend.
 */
export const googleSignIn = async (idToken: string) => {
  const result = await apiRequest<AuthResponse>('/api/v1/auth/google', {
    method: 'POST',
    body: { id_token: idToken } as any,
  });

  if (result.ok && result.data) {
    await saveTokens(result.data.access_token, result.data.refresh_token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
  }

  return result;
};

/**
 * Manual registration with name, email, password, and optional phone.
 */
export const register = async (payload: RegisterPayload) => {
  const result = await apiRequest<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: payload as any,
  });

  if (result.ok && result.data) {
    await saveTokens(result.data.access_token, result.data.refresh_token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
  }

  return result;
};

/**
 * Manual login with email and password.
 */
export const login = async (payload: LoginPayload) => {
  const result = await apiRequest<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: payload as any,
  });

  if (result.ok && result.data) {
    await saveTokens(result.data.access_token, result.data.refresh_token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data.user));
  }

  return result;
};

/**
 * Logout — clear all stored tokens and user data, and hit backend endpoint.
 */
export const logout = async () => {
  // Hit backend to invalidate token (fire and forget, or await)
  try {
    await authenticatedRequest('/api/v1/auth/logout', { method: 'POST' });
  } catch (e) {
    console.log('Backend logout failed, proceeding with local logout', e);
  }
  await clearTokens();
};

/**
 * Get stored user from AsyncStorage (for restoring session on app start).
 */
export const getStoredUser = async (): Promise<AuthUser | null> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  if (raw) {
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
  return null;
};
