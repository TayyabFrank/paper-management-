import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth, StoredAccount } from '@/context/auth-context';
import { useDocuments } from '@/context/documents-context';
import { DocumentReader, DocumentReaderItem } from '@/components/document-reader';
import { AdminBottomNavbar, AdminTabKey } from './admin-bottom-navbar';
import { AdminDashboardTab } from './admin-dashboard-tab';
import { AdminUsersTab } from './admin-users-tab';
import { AdminDocsTab } from './admin-docs-tab';
import { AdminApprovalsTab } from './admin-approvals-tab';
import { AdminProfileTab } from './admin-profile-tab';

interface AdminPortalViewProps {
  onSwitchToEmployeeMode?: () => void;
}

export function AdminPortalView({ onSwitchToEmployeeMode }: AdminPortalViewProps = {}) {
  const { isDark, colors } = useDocuVaultTheme();
  const { registeredAccounts, logout, user, syncWithBackend } = useAuth();
  const { refreshDocuments } = useDocuments();
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<StoredAccount | null>(null);
  const [readingDoc, setReadingDoc] = useState<DocumentReaderItem | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  useEffect(() => {
    refreshDocuments();
    syncWithBackend();
  }, [activeTab]);

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
            onNavigateTab={(tab) => {
              if (tab === 'docs') {
                setSelectedEmployee(null);
              }
              setActiveTab(tab);
            }}
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
            onSelectEmployee={(emp) => setSelectedEmployee(emp)}
            onBackToUsers={() => {
              setSelectedEmployee(null);
              setActiveTab('users');
            }}
            onOpenDocument={(doc) => setReadingDoc(doc)}
          />
        )}

        {activeTab === 'approvals' && (
          <AdminApprovalsTab onOpenMenu={() => setShowDrawer(true)} />
        )}

        {activeTab === 'profile' && (
          <AdminProfileTab
            onBack={() => setActiveTab('dashboard')}
          />
        )}
      </View>

      {/* Admin Bottom Navigation Bar matching Screenshot 2 */}
      <AdminBottomNavbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'docs') {
            setSelectedEmployee(null);
          }
          setActiveTab(tab);
        }}
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

              {/* Admin User Card in Drawer */}
              <TouchableOpacity
                style={[
                  styles.drawerUserCard,
                  {
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                  },
                ]}
                onPress={() => {
                  setActiveTab('profile');
                  setShowDrawer(false);
                }}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri:
                      user.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                  }}
                  style={styles.drawerUserAvatar}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.drawerUserName, { color: colors.textPrimary }]} numberOfLines={1}>
                    {user.name || 'System Administrator'}
                  </Text>
                  <Text style={[styles.drawerUserEmail, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={1}>
                    {user.email || 'admin@enterprise.com'}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: isDark ? '#38bdf8' : '#2563eb' }}>✏️</Text>
              </TouchableOpacity>

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
                style={[styles.drawerActionBtn, { backgroundColor: '#fee2e2' }]}
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
  drawerUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 6,
  },
  drawerUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  drawerUserName: {
    fontSize: 14,
    fontWeight: '700',
  },
  drawerUserEmail: {
    fontSize: 12,
    marginTop: 1,
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
