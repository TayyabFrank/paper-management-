import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth, StoredAccount } from '@/context/auth-context';
import { DocumentReader, DocumentReaderItem } from '@/components/document-reader';
import { AdminBottomNavbar, AdminTabKey } from './admin-bottom-navbar';
import { AdminDashboardTab } from './admin-dashboard-tab';
import { AdminUsersTab } from './admin-users-tab';
import { AdminDocsTab } from './admin-docs-tab';
import { AdminApprovalsTab } from './admin-approvals-tab';
import { AdminProfileTab } from './admin-profile-tab';

interface AdminPortalViewProps {
  onSwitchToEmployeeMode: () => void;
}

export function AdminPortalView({ onSwitchToEmployeeMode }: AdminPortalViewProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { registeredAccounts, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<StoredAccount | null>(null);
  const [readingDoc, setReadingDoc] = useState<DocumentReaderItem | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const pendingApprovalsCount = registeredAccounts.filter((a) => a.status === 'pending').length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={isDark ? '#0f172a' : '#172554'}
      />

      {/* Tab Body */}
      <View style={styles.body}>
        {activeTab === 'dashboard' && (
          <AdminDashboardTab
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenMenu={() => setShowDrawer(true)}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsersTab
            onViewEmployeeDocs={(emp) => {
              setSelectedEmployee(emp);
              setActiveTab('docs');
            }}
          />
        )}

        {activeTab === 'docs' && (
          <AdminDocsTab
            selectedEmployee={selectedEmployee}
            onBackToUsers={() => setActiveTab('users')}
            onOpenDocument={(doc) => setReadingDoc(doc)}
          />
        )}

        {activeTab === 'approvals' && (
          <AdminApprovalsTab onOpenMenu={() => setShowDrawer(true)} />
        )}

        {activeTab === 'profile' && (
          <AdminProfileTab
            onBack={() => setActiveTab('dashboard')}
            onSwitchToEmployeeMode={onSwitchToEmployeeMode}
          />
        )}
      </View>

      {/* Admin Bottom Navigation Bar matching Screenshot 2 */}
      <AdminBottomNavbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        pendingCount={pendingApprovalsCount}
      />

      {/* Interactive Document Reader Modal */}
      {readingDoc && (
        <DocumentReader
          document={readingDoc}
          onClose={() => setReadingDoc(null)}
        />
      )}

      {/* Hamburger Drawer Menu Modal */}
      {showDrawer && (
        <Modal transparent animationType="fade" visible={showDrawer}>
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={() => setShowDrawer(false)}
          >
            <View
              style={[
                styles.drawerPanel,
                {
                  backgroundColor: isDark ? '#111827' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                },
              ]}
            >
              <Text style={[styles.drawerTitle, { color: isDark ? colors.textPrimary : '#1e3a8a' }]}>
                DocuVault Admin
              </Text>
              <Text style={[styles.drawerSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Enterprise Administration Console
              </Text>

              <View style={[styles.drawerDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setActiveTab('dashboard');
                  setShowDrawer(false);
                }}
              >
                <Text style={[styles.drawerItemText, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  📊 Dashboard Overview
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setActiveTab('users');
                  setShowDrawer(false);
                }}
              >
                <Text style={[styles.drawerItemText, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  👥 Staff Directory
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setActiveTab('approvals');
                  setShowDrawer(false);
                }}
              >
                <Text style={[styles.drawerItemText, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  ⏳ Pending Approvals ({pendingApprovalsCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setActiveTab('profile');
                  setShowDrawer(false);
                }}
              >
                <Text style={[styles.drawerItemText, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  👤 Admin Profile & Settings
                </Text>
              </TouchableOpacity>

              <View style={[styles.drawerDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

              <TouchableOpacity
                style={[styles.drawerActionBtn, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
                onPress={() => {
                  setShowDrawer(false);
                  onSwitchToEmployeeMode();
                }}
              >
                <Text style={[styles.drawerActionBtnText, { color: '#2563eb' }]}>
                  🔄 Switch to Employee Workspace
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerActionBtn, { backgroundColor: '#fee2e2', marginTop: 10 }]}
                onPress={() => {
                  setShowDrawer(false);
                  logout();
                }}
              >
                <Text style={[styles.drawerActionBtnText, { color: '#b91c1c' }]}>
                  🚪 Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  drawerPanel: {
    width: '80%',
    maxWidth: 320,
    height: '100%',
    padding: 24,
    borderLeftWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  drawerSub: {
    fontSize: 13,
    marginTop: 2,
    marginBottom: 16,
  },
  drawerDivider: {
    height: 1,
    marginVertical: 14,
  },
  drawerItem: {
    paddingVertical: 12,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  drawerActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerActionBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
});
