import { apiRequest, authenticatedRequest, saveTokens, clearTokens, STORAGE_KEYS, getAccessToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

// ─── Types ──────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cnic: string | null;
  avatar_url: string | null;
  address: string | null;
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
  cnic?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  phone?: string;
  cnic?: string;
  avatar_url?: string;
  address?: string;
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
 * Update user profile details (name, phone, cnic, avatar_url).
 */
export const updateProfile = async (payload: ProfileUpdatePayload) => {
  const result = await authenticatedRequest<AuthUser>('/api/v1/auth/profile', {
    method: 'PUT',
    body: payload as any,
  });

  if (result.ok && result.data) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.data));
  }

  return result;
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

/**
 * Upload custom avatar image file to backend.
 */
export const uploadAvatarFile = async (uri: string) => {
  const formData = new FormData();
  
  const filename = uri.split('/').pop() || 'avatar.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : `image/jpeg`;
  
  formData.append('file', {
    uri,
    name: filename,
    type,
  } as any);
  
  const token = await getAccessToken();
  
  const cleanBaseUrl = ENV.API_BASE_URL.endsWith('/') ? ENV.API_BASE_URL.slice(0, -1) : ENV.API_BASE_URL;
  const targetUrl = `${cleanBaseUrl}/api/v1/auth/upload-avatar`;
  console.log(`[API] Uploading image to: ${targetUrl}`);

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    body: formData,
  });
  
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    console.log(`[API] Upload Error ${response.status}:`, data);
    return {
      ok: false,
      status: response.status,
      error: data?.detail || `Upload failed with status ${response.status}`,
    };
  }
  
  console.log(`[API] Upload Success ${response.status}`);
  if (data) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data));
  }
  
  return {
    ok: true,
    status: response.status,
    data: data as AuthUser,
  };
};
