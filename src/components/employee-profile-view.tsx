import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { ThemeToggleButton } from './theme-toggle-button';

export function EmployeeProfileView() {
  const { isDark, colors } = useDocuVaultTheme();
  const { user, logout } = useAuth();
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.maxWidthWrapper}>
        {/* Header with Title and Theme Toggle */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>👤 Employee Profile</Text>
          <ThemeToggleButton compact showLabel={false} />
        </View>

        {/* Profile Identity Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            },
          ]}
        >
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
            resizeMode="cover"
          />

          <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.pillBadge, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.16)' : '#eff6ff' }]}>
              <Text style={[styles.pillBadgeText, { color: isDark ? '#4ade80' : '#2563eb' }]}>
                🛡️ Verified Employee
              </Text>
            </View>
            <View style={[styles.pillBadge, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <Text style={[styles.pillBadgeText, { color: isDark ? '#38bdf8' : '#475569' }]}>
                🪪 {user.employeeId}
              </Text>
            </View>
          </View>
        </View>

        {/* Work & Security Details */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>🏢 Enterprise Assignment</Text>
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            },
          ]}
        >
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>💼 Role / Title</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user.role}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>🏢 Department</Text>
            <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{user.department}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>🔐 Security Token</Text>
            <Text style={[styles.infoValue, { color: isDark ? '#4ade80' : '#16a34a' }]}>
              🟢 Active (SHA-256)
            </Text>
          </View>
        </View>

        {/* Preferences & Settings */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>🎨 Appearance</Text>
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            },
          ]}
        >
          <View style={styles.themeRow}>
            <View>
              <Text style={[styles.infoValue, { color: colors.textPrimary }]}>🎨 Interface Theme</Text>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                🌓 Switch between Light & Dark modes
              </Text>
            </View>
            <ThemeToggleButton />
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>🚪 Logout from Workspace</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Dialog */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>🚪 Sign Out?</Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              ⚠️ You will be redirected to the employee login page. You can log back in at any time.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' },
                ]}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: isDark ? '#94a3b8' : '#475569' }]}>
                  ❌ Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                onPress={() => {
                  setLogoutModalVisible(false);
                  logout();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmLogoutText}>🚪 Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 95,
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  userName: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  userEmail: {
    fontSize: 13.5,
    marginTop: 2,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 13.5,
  },
  infoValue: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutBtn: {
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#fca5a5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logoutBtnText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmLogoutBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmLogoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
