import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

const BASE_URL = ENV.API_BASE_URL;

// ─── Storage Keys ───────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@wakeel_access_token',
  REFRESH_TOKEN: '@wakeel_refresh_token',
  USER: '@wakeel_user',
};

// ─── Token Helpers ──────────────────────────────────────────────────

export const getAccessToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

export const saveTokens = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
    [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
  ]);
};

export const clearTokens = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER,
  ]);
};

// ─── Base Fetch Wrapper ─────────────────────────────────────────────

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  authenticated?: boolean;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  const { method = 'GET', body, headers = {}, authenticated = false } = options;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...headers,
  };

  // Attach bearer token for authenticated requests
  if (authenticated) {
    const token = await getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const cleanBaseUrl = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    const targetUrl = `${cleanBaseUrl}${cleanEndpoint}`;
    console.log(`[API] Fetching: ${method} ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      console.log(`[API] Error ${response.status}:`, data);
      return {
        ok: false,
        status: response.status,
        error: data?.detail || `Request failed with status ${response.status}`,
      };
    }

    console.log(`[API] Success ${response.status}`);
    return {
      ok: true,
      status: response.status,
      data: data as T,
    };
  } catch (err: any) {
    console.log('[API] Network Error:', err.message);
    return {
      ok: false,
      status: 0,
      error: err.message || 'Network error. Please check your connection.',
    };
  }
};

// ─── Auto-Refresh Interceptor ───────────────────────────────────────

export const authenticatedRequest = async <T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> => {
  // First attempt
  let result = await apiRequest<T>(endpoint, { ...options, authenticated: true });

  // If 401, try refreshing the token
  if (result.status === 401) {
    const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      const refreshResult = await apiRequest<{ access_token: string }>(
        '/api/v1/auth/refresh',
        {
          method: 'POST',
          body: { refresh_token: refreshToken } as any,
        },
      );

      if (refreshResult.ok && refreshResult.data) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.ACCESS_TOKEN,
          refreshResult.data.access_token,
        );
        // Retry original request with new token
        result = await apiRequest<T>(endpoint, { ...options, authenticated: true });
      } else {
        // Refresh failed — clear everything
        await clearTokens();
      }
    }
  }

  return result;
};
