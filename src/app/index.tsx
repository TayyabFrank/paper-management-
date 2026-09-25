import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocuVaultLogo } from '@/components/docuvault-logo';
import { EmployeeRegistrationCard } from '@/components/employee-registration-card';
import { DocumentsDashboard } from '@/components/documents-dashboard';
import { HomeDashboardView } from '@/components/home-dashboard-view';
import { NewDocView } from '@/components/new-doc-view';
import { EmployeeProfileView } from '@/components/employee-profile-view';
import { BottomNavbar, TabKey } from '@/components/bottom-navbar';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { AdminPortalView } from '@/components/admin/admin-portal-view';
import { AuthAnimatedBackground } from '@/components/auth-animated-background';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

export default function HomeScreen() {
  const { isDark, colors } = useDocuVaultTheme();
  const { isLoggedIn, isLoading, user, isAdminMode } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  // Loading indicator while checking stored session
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={isDark ? '#38bdf8' : '#1b3569'} />
      </SafeAreaView>
    );
  }

  // IF LOGGED IN AS ADMIN: Render the dedicated Admin Panel
  if (isLoggedIn && (isAdminMode || user.role === 'Admin')) {
    return <AdminPortalView />;
  }

  // IF LOGGED IN: Open Home page directly with fixed bottom navbar throughout application
  if (isLoggedIn) {
    return (
      <SafeAreaView
        style={[styles.workspaceSafeArea, { backgroundColor: colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />

        {/* Tab Content View */}
        <View style={styles.workspaceBody}>
          {activeTab === 'home' && (
            <HomeDashboardView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'docs' && (
            <ScrollView
              contentContainerStyle={styles.dashboardScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <DocumentsDashboard
                onBack={() => setActiveTab('home')}
                onNavigateNewDoc={() => setActiveTab('new-doc')}
                employeeName={user.name}
                employeeEmail={user.email}
                employeeAvatar={user.avatar}
              />
            </ScrollView>
          )}

          {activeTab === 'new-doc' && (
            <NewDocView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'profile' && (
            <EmployeeProfileView onNavigateTab={(tab) => setActiveTab(tab)} />
          )}
        </View>

        {/* Fixed Employee Bottom Navbar matching the user's design */}
        <BottomNavbar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
      </SafeAreaView>
    );
  }

  // IF NOT LOGGED IN: Open Login page instead
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <AuthAnimatedBackground>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          {/* Top Header with Theme Toggle */}
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
              <DocuVaultLogo
                subtitle={authMode === 'login' ? 'Enterprise Document Management System' : undefined}
              />
              <EmployeeRegistrationCard
                initialMode={authMode}
                onModeChange={(newMode) => setAuthMode(newMode)}
                onLoginSuccess={() => {
                  setActiveTab('home');
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </AuthAnimatedBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  workspaceSafeArea: {
    flex: 1,
    position: 'relative',
  },
  workspaceBody: {
    flex: 1,
  },
  dashboardScrollContent: {
    flexGrow: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  topThemeBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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


