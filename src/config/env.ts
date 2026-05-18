import { Platform } from 'react-native';

console.log('[ENV DEBUG] EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL);

const getLocalhost = () => {
  // Android emulator needs 10.0.2.2, iOS and Web use localhost
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
};

export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || getLocalhost(),
};
