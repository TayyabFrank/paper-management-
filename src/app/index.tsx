import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocuVaultLogo } from '@/components/docuvault-logo';
import { EmployeeRegistrationCard } from '@/components/employee-registration-card';
import { DocumentsDashboard } from '@/components/documents-dashboard';

export default function HomeScreen() {
  const [screen, setScreen] = useState<'register' | 'login' | 'dashboard'>('register');
  const [employeeProfile, setEmployeeProfile] = useState<{
    name: string;
    email: string;
    avatar?: string;
  }>({
    name: 'Liam Thompson',
    email: 'l.thompson@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  });

  if (screen === 'dashboard') {
    return (
      <SafeAreaView style={styles.dashboardSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <ScrollView
          contentContainerStyle={styles.dashboardScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <DocumentsDashboard
            onBack={() => setScreen('login')}
            employeeName={employeeProfile.name}
            employeeEmail={employeeProfile.email}
            employeeAvatar={employeeProfile.avatar}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f7fb" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.innerContainer}>
            <DocuVaultLogo
              subtitle={screen === 'login' ? 'Enterprise Document Management System' : undefined}
            />
            <EmployeeRegistrationCard
              initialMode={screen}
              onModeChange={(newMode) => setScreen(newMode)}
              onLoginSuccess={(user) => {
                if (user) {
                  setEmployeeProfile((prev) => ({
                    ...prev,
                    name: user.name || prev.name,
                    email: user.email || prev.email,
                    avatar: user.avatar || prev.avatar,
                  }));
                }
                setScreen('dashboard');
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
    backgroundColor: '#f4f7fb',
  },
  dashboardSafeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  dashboardScrollContent: {
    flexGrow: 1,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
});
