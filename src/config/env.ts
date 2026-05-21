import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getLocalhost = () => {
  // Android emulator needs 10.0.2.2, iOS and Web use localhost
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
};

// Priority: .env (local dev) → app.json extra (EAS build) → localhost fallback
const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  getLocalhost();

export const ENV = {
  API_BASE_URL: apiBaseUrl,
  WHISPER_API_URL: process.env.EXPO_PUBLIC_WHISPER_API_URL || '',
};
