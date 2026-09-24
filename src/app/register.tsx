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

export default function RegisterScreen() {
  const router = useRouter();
  const { isDark, colors } = useDocuVaultTheme();

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
        <View style={styles.topThemeBar}>
          <ThemeToggleButton />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={true}
        >
          <View style={styles.innerContainer}>
            <DocuVaultLogo subtitle="Create your enterprise account" />
            <EmployeeRegistrationCard
              initialMode="register"
              onModeChange={(mode) => {
                if (mode === 'login') {
                  router.push('/login');
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
