import { Platform } from 'react-native';

// In development, detect local address based on platform
const getDefaultBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return 'http://localhost:5000';
  }
  if (Platform.OS === 'android') {
    // 10.0.2.2 is the Android emulator's alias to host loopback interface
    return 'http://10.0.2.2:5000';
  }
  // iOS simulator or default fallback
  return 'http://localhost:5000';
};

export const API_CONFIG = {
  // Change this to your computer's local Wi-Fi IP (e.g. 'http://192.168.1.100:5000') if testing on a real physical phone!
  BASE_URL: getDefaultBaseUrl(),
  TIMEOUT_MS: 7000,
};
