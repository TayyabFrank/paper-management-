import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { DocuVaultThemeProvider, useDocuVaultTheme } from '@/context/theme-context';
import { AuthProvider } from '@/context/auth-context';
import { DocumentsProvider } from '@/context/documents-context';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { isDark } = useDocuVaultTheme();

  return (
    <NavigationThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <DocuVaultThemeProvider>
        <DocumentsProvider>
          <RootNavigator />
        </DocumentsProvider>
      </DocuVaultThemeProvider>
    </AuthProvider>
  );
}


