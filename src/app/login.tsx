import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { DocuVaultLogo } from '@/components/docuvault-logo';
import { EmployeeRegistrationCard } from '@/components/employee-registration-card';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { AuthAmbientBackground } from '@/components/auth-ambient-background';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useResponsive } from '@/hooks/use-responsive';
import { FadeInView } from '@/components/ui/animated-components';

export default function LoginScreen() {
  const router = useRouter();
  const { isDark, colors } = useDocuVaultTheme();
  const { isLoggedIn, isLoading } = useAuth();
  const { isSmallPhone, isTablet, isDesktop } = useResponsive();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace('/');
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || isLoggedIn) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}
      >
        <ActivityIndicator size="large" color={isDark ? '#38bdf8' : '#1b3569'} />
      </SafeAreaView>
    );
  }

  const loginMaxWidth = isDesktop ? 480 : isTablet ? 450 : 410;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />

      {/* Modern Ambient Glow & Mesh Background */}
      <AuthAmbientBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {/* Top Header Bar */}
        <View style={[styles.topThemeBar, { paddingHorizontal: isSmallPhone ? 14 : 24 }]}>
          <View style={styles.brandBadge}>
            <View style={[styles.brandPulseDot, { backgroundColor: '#10b981' }]} />
            <Text style={[styles.brandBadgeText, { color: isDark ? '#94a3b8' : '#475569' }]}>
              DOCUVAULT CLOUD ACCESS
            </Text>
          </View>
          <ThemeToggleButton />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: isSmallPhone ? 12 : isTablet ? 24 : 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <FadeInView
            delay={0}
            scale
            style={[styles.innerContainer, { maxWidth: loginMaxWidth }]}
          >
            <DocuVaultLogo
              size={isSmallPhone ? 'small' : 'medium'}
              subtitle="Enterprise Document Management & Workflow Vault"
            />
            <EmployeeRegistrationCard
              initialMode="login"
              onModeChange={(mode) => {
                if (mode === 'register') {
                  router.push('/register');
                }
              }}
              onLoginSuccess={() => {
                router.replace('/');
              }}
            />
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    position: 'relative',
  },
  keyboardContainer: {
    flex: 1,
  },
  topThemeBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
    zIndex: 10,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  innerContainer: {
    width: '100%',
    alignItems: 'center',
  },
});
