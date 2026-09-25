import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Text,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth, StoredAccount } from '@/context/auth-context';
import { useDocuments } from '@/context/documents-context';
import { DocumentReader, DocumentReaderItem } from '@/components/document-reader';
import { APP_LOGO } from '@/components/docuvault-logo';
import { AdminBottomNavbar, AdminTabKey } from './admin-bottom-navbar';
import { AdminDashboardTab } from './admin-dashboard-tab';
import { AdminUsersTab } from './admin-users-tab';
import { AdminDocsTab } from './admin-docs-tab';
import { AdminApprovalsTab } from './admin-approvals-tab';
import { AdminProfileTab } from './admin-profile-tab';

// Vector Logos for Admin Side Navbar
const DASHBOARD_LOGO_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="3"></rect>
  <line x1="8" y1="17" x2="8" y2="12"></line>
  <line x1="12" y1="17" x2="12" y2="8"></line>
  <line x1="16" y1="17" x2="16" y2="6"></line>
</svg>
`)}`;

const USERS_LOGO_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
  <circle cx="9" cy="7" r="4"></circle>
  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
</svg>
`)}`;

const ALL_DOCS_LOGO_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="16" y1="13" x2="8" y2="13"></line>
  <line x1="16" y1="17" x2="8" y2="17"></line>
  <line x1="10" y1="9" x2="8" y2="9"></line>
</svg>
`)}`;

const APPROVALS_LOGO_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  <path d="m9 14 2 2 4-4"></path>
</svg>
`)}`;

const PROFILE_LOGO_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9.5"></circle>
  <circle cx="12" cy="9" r="3.2"></circle>
  <path d="M6.8 18.2C7.8 15.6 9.8 14.5 12 14.5C14.2 14.5 16.2 15.6 17.2 18.2"></path>
</svg>
`)}`;

const CLOSE_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
`)}`;

interface SideNavTabItem {
  key: AdminTabKey;
  label: string;
  sublabel: string;
  emoji: string;
  color: string;
  bgLight: string;
  bgDark: string;
  getIcon: (color: string) => string;
}

const SIDE_NAV_ITEMS: SideNavTabItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    sublabel: 'Overview & Analytics',
    emoji: '📊',
    color: '#2563eb',
    bgLight: '#eff6ff',
    bgDark: '#1e3a8a',
    getIcon: DASHBOARD_LOGO_SVG,
  },
  {
    key: 'users',
    label: 'Users',
    sublabel: 'Staff Directory',
    emoji: '👥',
    color: '#0284c7',
    bgLight: '#e0f2fe',
    bgDark: '#0369a1',
    getIcon: USERS_LOGO_SVG,
  },
  {
    key: 'docs',
    label: 'All Docs',
    sublabel: 'Repository Vault',
    emoji: '📑',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    bgDark: '#4c1d95',
    getIcon: ALL_DOCS_LOGO_SVG,
  },
  {
    key: 'approvals',
    label: 'Approvals',
    sublabel: 'Pending Requests',
    emoji: '⏳',
    color: '#d97706',
    bgLight: '#fef3c7',
    bgDark: '#78350f',
    getIcon: APPROVALS_LOGO_SVG,
  },
  {
    key: 'profile',
    label: 'Profile',
    sublabel: 'Settings & Security',
    emoji: '👤',
    color: '#059669',
    bgLight: '#d1fae5',
    bgDark: '#064e3b',
    getIcon: PROFILE_LOGO_SVG,
  },
];

interface AdminPortalViewProps {
  onSwitchToEmployeeMode?: () => void;
}

export function AdminPortalView({ onSwitchToEmployeeMode }: AdminPortalViewProps = {}) {
  const { isDark, colors } = useDocuVaultTheme();
  const { registeredAccounts, logout, user, syncWithBackend } = useAuth();
  const { refreshDocuments } = useDocuments();
  const [activeTab, setActiveTab] = useState<AdminTabKey>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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
            onNavigateTab={(tab, category) => {
              if (tab === 'docs') {
                setSelectedEmployee(null);
                if (category) {
                  setSelectedCategory(category);
                }
              }
              setActiveTab(tab);
            }}
            onOpenMenu={() => setShowDrawer(true)}
            onOpenDocument={(doc) => setReadingDoc(doc)}
          />
        )}

        {activeTab === 'users' && (
          <AdminUsersTab
            onViewEmployeeDocs={(emp) => {
              setSelectedEmployee(emp);
              setSelectedCategory('all');
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
            initialCategory={selectedCategory}
            onCategoryChange={(cat) => setSelectedCategory(cat)}
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

      {/* Hamburger Side Navbar / Drawer Menu Modal */}
      {showDrawer && (
        <Modal transparent animationType="fade" visible={showDrawer}>
          <TouchableOpacity
            style={styles.drawerOverlay}
            activeOpacity={1}
            onPress={() => setShowDrawer(false)}
          >
            <TouchableOpacity
              style={[
                styles.drawerPanel,
                {
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                },
              ]}
              activeOpacity={1}
              onPress={(e) => e?.stopPropagation?.()}
            >
              {/* Drawer Top Header with Brand and Close Button */}
              <View style={styles.drawerTopBar}>
                <View style={styles.drawerBrandRow}>
                  <Image
                    source={APP_LOGO}
                    style={styles.drawerAppLogo}
                    resizeMode="contain"
                  />
                  <View>
                    <Text style={[styles.drawerTitle, { color: isDark ? colors.textPrimary : '#1e3a8a' }]}>
                      DocuVault
                    </Text>
                    <View style={[styles.drawerRolePill, { backgroundColor: isDark ? '#1e3a8a' : '#dbeafe' }]}>
                      <Text style={[styles.drawerRoleText, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>
                        ADMIN CONSOLE
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.drawerCloseBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                  onPress={() => setShowDrawer(false)}
                  activeOpacity={0.7}
                >
                  {Platform.OS === 'web' ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isDark ? '#94a3b8' : '#475569'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ display: 'block' } as any}
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <Text style={{ fontSize: 16, fontWeight: '700', color: isDark ? '#94a3b8' : '#475569' }}>✕</Text>
                  )}
                </TouchableOpacity>
              </View>

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
                <View style={[styles.drawerRoleBadge, { backgroundColor: isDark ? '#064e3b' : '#d1fae5' }]}>
                  <Text style={[styles.drawerRoleBadgeText, { color: isDark ? '#6ee7b7' : '#047857' }]}>
                    Active
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={[styles.drawerDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

              {/* Navigation Heading */}
              <Text style={[styles.drawerSectionLabel, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                NAVIGATION MENU
              </Text>

              {/* 5 Distinct Navigation Items with Logos/Icons */}
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.drawerNavList}
                showsVerticalScrollIndicator={false}
              >
                {SIDE_NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.key;
                  const iconColor = isActive ? (isDark ? '#ffffff' : item.color) : (isDark ? '#cbd5e1' : item.color);
                  const isApprovals = item.key === 'approvals';

                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.sideNavItemCard,
                        {
                          backgroundColor: isActive
                            ? isDark
                              ? 'rgba(37, 99, 235, 0.22)'
                              : '#eff6ff'
                            : isDark
                            ? 'rgba(30, 41, 59, 0.35)'
                            : '#ffffff',
                          borderColor: isActive
                            ? isDark
                              ? '#3b82f6'
                              : '#bfdbfe'
                            : isDark
                            ? 'rgba(255,255,255,0.06)'
                            : '#f1f5f9',
                        },
                      ]}
                      onPress={() => {
                        if (item.key === 'docs') {
                          setSelectedEmployee(null);
                          setSelectedCategory('all');
                        }
                        setActiveTab(item.key);
                        setShowDrawer(false);
                      }}
                      activeOpacity={0.75}
                    >
                      {/* Logo / Icon Box */}
                      <View
                        style={[
                          styles.sideNavLogoBox,
                          {
                            backgroundColor: isActive
                              ? isDark
                                ? '#2563eb'
                                : item.bgLight
                              : isDark
                              ? item.bgDark
                              : item.bgLight,
                            borderColor: isActive ? (isDark ? '#60a5fa' : item.color) : 'transparent',
                            borderWidth: isActive ? 1 : 0,
                          },
                        ]}
                      >
                        {Platform.OS === 'web' ? (
                          item.key === 'dashboard' ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                              <rect x="3" y="3" width="18" height="18" rx="3" />
                              <line x1="8" y1="17" x2="8" y2="12" />
                              <line x1="12" y1="17" x2="12" y2="8" />
                              <line x1="16" y1="17" x2="16" y2="6" />
                            </svg>
                          ) : item.key === 'users' ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          ) : item.key === 'docs' ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="16" y1="13" x2="8" y2="13" />
                              <line x1="16" y1="17" x2="8" y2="17" />
                              <line x1="10" y1="9" x2="8" y2="9" />
                            </svg>
                          ) : item.key === 'approvals' ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                              <path d="m9 14 2 2 4-4" />
                            </svg>
                          ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                              <circle cx="12" cy="12" r="9.5" />
                              <circle cx="12" cy="9" r="3.2" />
                              <path d="M6.8 18.2C7.8 15.6 9.8 14.5 12 14.5C14.2 14.5 16.2 15.6 17.2 18.2" />
                            </svg>
                          )
                        ) : (
                          <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
                        )}
                      </View>

                      {/* Content */}
                      <View style={styles.sideNavContent}>
                        <Text
                          style={[
                            styles.sideNavTitle,
                            {
                              color: isActive
                                ? isDark
                                  ? '#93c5fd'
                                  : '#1d4ed8'
                                : isDark
                                ? colors.textPrimary
                                : '#0f172a',
                              fontWeight: isActive ? '800' : '700',
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={[
                            styles.sideNavSubtitle,
                            { color: isDark ? '#94a3b8' : '#64748b' },
                          ]}
                          numberOfLines={1}
                        >
                          {item.sublabel}
                        </Text>
                      </View>

                      {/* Right Indicator: Badge or Arrow */}
                      <View style={styles.sideNavRight}>
                        {isApprovals && pendingApprovalsCount > 0 ? (
                          <View style={styles.sideNavBadge}>
                            <Text style={styles.sideNavBadgeText}>
                              {pendingApprovalsCount}
                            </Text>
                          </View>
                        ) : null}
                        <Text
                          style={[
                            styles.sideNavChevron,
                            {
                              color: isActive
                                ? isDark
                                  ? '#60a5fa'
                                  : '#2563eb'
                                : isDark
                                ? '#475569'
                                : '#cbd5e1',
                            },
                          ]}
                        >
                          ›
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={[styles.drawerDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

              {/* Sign Out Button */}
              <TouchableOpacity
                style={[
                  styles.drawerActionBtn,
                  {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2',
                    borderColor: isDark ? '#b91c1c' : '#fecaca',
                  },
                ]}
                onPress={() => {
                  setShowDrawer(false);
                  logout();
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 16, marginRight: 8 }}>🚪</Text>
                <Text style={[styles.drawerActionBtnText, { color: isDark ? '#f87171' : '#b91c1c' }]}>
                  Sign Out of Console
                </Text>
              </TouchableOpacity>

              <Text style={[styles.drawerFooterText, { color: isDark ? '#475569' : '#94a3b8' }]}>
                DocuVault Enterprise • v2.4
              </Text>
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  drawerPanel: {
    width: '84%',
    maxWidth: 340,
    height: '100%',
    padding: 22,
    borderLeftWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 10,
  },
  drawerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  drawerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerAppLogo: {
    width: 44,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  drawerRolePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  drawerRoleText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 4,
  },
  drawerUserAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#cbd5e1',
  },
  drawerUserName: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  drawerUserEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  drawerRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  drawerRoleBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  drawerDivider: {
    height: 1,
    marginVertical: 14,
  },
  drawerSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  drawerNavList: {
    gap: 8,
    paddingBottom: 10,
  },
  sideNavItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  sideNavLogoBox: {
    width: 40,
    height: 40,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sideNavLogoIcon: {
    width: 22,
    height: 22,
  },
  sideNavContent: {
    flex: 1,
  },
  sideNavTitle: {
    fontSize: 15,
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  sideNavSubtitle: {
    fontSize: 11.5,
  },
  sideNavRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sideNavBadge: {
    backgroundColor: '#d97706',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sideNavBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  sideNavChevron: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 2,
  },
  drawerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  drawerActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  drawerFooterText: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
