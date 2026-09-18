import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Text,
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
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

export default function HomeScreen() {
  const { isDark, colors } = useDocuVaultTheme();
  const { isLoggedIn, isLoading, user, isAdminMode, setIsAdminMode } = useAuth();
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

  // IF ADMIN MODE IS ACTIVE (or user is an Admin): Render the dedicated Admin Site
  if (isAdminMode || (isLoggedIn && user.role === 'Admin')) {
    return <AdminPortalView onSwitchToEmployeeMode={() => setIsAdminMode(false)} />;
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

        {/* Top Floating Header with Admin Portal Quick Switch */}
        <View style={styles.topUtilityBar}>
          <TouchableOpacity
            style={[styles.adminSwitchBtn, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
            onPress={() => setIsAdminMode(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.adminSwitchText, { color: '#2563eb' }]}>
              🛡️ Admin Site
            </Text>
          </TouchableOpacity>
        </View>

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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        {/* Top Floating Header with Theme Toggle & Admin Shortcut */}
        <View style={styles.topThemeBar}>
          <TouchableOpacity
            style={[styles.adminLoginPreviewBtn, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
            onPress={() => setIsAdminMode(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.adminSwitchText, { color: '#2563eb' }]}>
              🛡️ Admin Site
            </Text>
          </TouchableOpacity>
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
  topUtilityBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
    zIndex: 10,
  },
  adminSwitchBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  adminLoginPreviewBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginRight: 10,
  },
  adminSwitchText: {
    fontSize: 13,
    fontWeight: '700',
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
    justifyContent: 'space-between',
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


