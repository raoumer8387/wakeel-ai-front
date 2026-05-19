import { Platform } from 'react-native';
import { ENV } from '../config/env';
import { getAccessToken } from './api';

export const transcribeAudioFile = async (uri: string): Promise<string> => {
  const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
  
  const formData = new FormData();
  formData.append('file', {
    uri: fileUri,
    name: 'audio.m4a',
    type: 'audio/m4a',
  } as any);

  // Use the WHISPER_API_URL from environment variables
  const targetUrl = ENV.WHISPER_API_URL;

  if (!targetUrl) {
    throw new Error('WHISPER_API_URL is not defined in your environment variables.');
  }
  
  const token = await getAccessToken();
  
  const headers: any = {
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  
  // Only append bearer token if it's our own backend (you can remove this if using OpenAI directly)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(targetUrl, {
    method: 'POST',
    body: formData,
    headers,
  });

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
    throw new Error(data.error || 'Failed to transcribe audio.');
  }
};
