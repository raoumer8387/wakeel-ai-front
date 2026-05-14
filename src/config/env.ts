/**
 * Environment configuration.
 * Expo automatically injects EXPO_PUBLIC_* vars from .env at build time.
 */
export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000',
};
