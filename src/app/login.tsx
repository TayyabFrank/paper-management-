import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { DocuVaultLogo } from '@/components/docuvault-logo';
import { EmployeeRegistrationCard } from '@/components/employee-registration-card';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { useDocuVaultTheme } from '@/context/theme-context';

import { useResponsive } from '@/hooks/use-responsive';

export default function LoginScreen() {
  const router = useRouter();
  const { isDark, colors } = useDocuVaultTheme();
  const { isSmallPhone, isTablet, isDesktop } = useResponsive();

  const loginMaxWidth = isDesktop ? 500 : isTablet ? 460 : 420;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <View style={[styles.topThemeBar, { paddingHorizontal: isSmallPhone ? 12 : 20 }]}>
          <ThemeToggleButton />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: isSmallPhone ? 10 : isTablet ? 24 : 16 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <View style={[styles.innerContainer, { maxWidth: loginMaxWidth }]}>
            <DocuVaultLogo
              size={isSmallPhone ? 'small' : 'medium'}
              subtitle="Enterprise Document Management System"
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
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  topThemeBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
});

