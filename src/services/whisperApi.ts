import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';
import { getAccessToken, STORAGE_KEYS, apiRequest, clearTokens } from './api';

/**
 * Transcribe an audio file using the backend's voice API.
 * The backend handles files via Gemini models which support multiple audio formats natively (m4a, wav, mp3, ogg, etc.)
 * and works flawlessly with Urdu and English.
 */
export const transcribeAudioFile = async (uri: string): Promise<string> => {
  const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
  
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  } as any);

  const cleanBaseUrl = ENV.API_BASE_URL.endsWith('/') ? ENV.API_BASE_URL.slice(0, -1) : ENV.API_BASE_URL;
  const targetUrl = `${cleanBaseUrl}/api/v1/voice/transcribe`;

  console.log(`[API] Uploading audio to transcription endpoint: ${targetUrl}`);

  const performUpload = async (token: string | null): Promise<Response> => {
    const headers: any = {
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return await fetch(targetUrl, {
      method: 'POST',
      body: formData,
      headers,
    });
  };

  let token = await getAccessToken();
  let response = await performUpload(token);

  // Auto-refresh token if we got a 401 Unauthorized
  if (response.status === 401) {
    console.log('[API] Transcription 401: Attempting token refresh...');
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
        const newAccessToken = refreshResult.data.access_token;
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
        
        // Retry the transcription with the new token
        console.log('[API] Token refreshed. Retrying transcription...');
        response = await performUpload(newAccessToken);
      } else {
        await clearTokens();
      }
    }
  }

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    console.error('Transcription failed (not JSON):', responseText);
    throw new Error('Server returned non-JSON response: ' + responseText.substring(0, 50));
  }
  
  if (response.ok && data.text) {
    return data.text;
  } else {
    console.error('Transcription failed:', data);
    throw new Error(data.detail || data.error || 'Failed to transcribe audio.');
  }
};
