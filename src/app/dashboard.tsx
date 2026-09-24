import React from 'react';
import {
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { DocumentsDashboard } from '@/components/documents-dashboard';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

export default function DashboardScreen() {
  const router = useRouter();
  const { isDark, colors } = useDocuVaultTheme();
  const { user } = useAuth();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DocumentsDashboard
          onBack={() => router.push('/')}
          employeeName={user.name}
          employeeEmail={user.email}
          employeeAvatar={user.avatar}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

