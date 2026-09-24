import { Platform } from 'react-native';
import Constants from 'expo-constants';

// In development, detect local address based on platform or Expo host IP
const getDefaultBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }

  // Detect developer machine IP from Expo bundler hostUri if running on physical device
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000`;
    }
  }

  if (Platform.OS === 'android') {
    // 10.10.36.79 is this computer's LAN IP reachable by physical phones on the same network
    return 'http://10.10.36.79:5000';
  }
  // iOS simulator or default fallback
  return 'http://localhost:5000';
};

export const API_CONFIG = {
  BASE_URL: getDefaultBaseUrl(),
  TIMEOUT_MS: 4000,
};
