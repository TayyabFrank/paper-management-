import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDocuVaultTheme } from '@/context/theme-context';

export type AdminTabKey = 'dashboard' | 'users' | 'docs' | 'approvals' | 'profile';

interface AdminBottomNavbarProps {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
  pendingCount?: number;
}

// Crisp Vector SVGs for Admin Bottom Bar
const DASHBOARD_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
  <path d="M7 16V14"></path>
  <path d="M12 16V10"></path>
  <path d="M17 16V7"></path>
  <path d="M7 14L12 10L17 7"></path>
</svg>
`)}`;

const USERS_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
  <circle cx="9" cy="7" r="4"></circle>
  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
</svg>
`)}`;

const ALL_DOCS_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="16" y1="13" x2="8" y2="13"></line>
  <line x1="16" y1="17" x2="8" y2="17"></line>
  <line x1="10" y1="9" x2="8" y2="9"></line>
</svg>
`)}`;

const APPROVALS_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  <path d="m9 14 2 2 4-4"></path>
</svg>
`)}`;

const PROFILE_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <circle cx="12" cy="10" r="3"></circle>
  <path d="M7 18.5C8.2 16.5 9.9 15.5 12 15.5C14.1 15.5 15.8 16.5 17 18.5"></path>
</svg>
`)}`;

interface TabConfig {
  key: AdminTabKey;
  label: string;
  getIcon: (color: string) => string;
}

const ADMIN_TABS: TabConfig[] = [
  { key: 'dashboard', label: 'Dashboard', getIcon: DASHBOARD_ICON_SVG },
  { key: 'users', label: 'Users', getIcon: USERS_ICON_SVG },
  { key: 'docs', label: 'All Docs', getIcon: ALL_DOCS_ICON_SVG },
  { key: 'approvals', label: 'Approvals', getIcon: APPROVALS_ICON_SVG },
  { key: 'profile', label: 'Profile', getIcon: PROFILE_ICON_SVG },
];

export function AdminBottomNavbar({
  activeTab,
  onTabChange,
  pendingCount = 0,
}: AdminBottomNavbarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useDocuVaultTheme();

  return (
    <View
      style={[
        styles.navbarWrapper,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          backgroundColor: isDark ? '#0b1120' : '#17223b',
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.06)',
        },
      ]}
    >
      <View style={styles.navRow}>
        {ADMIN_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const iconColor = isActive ? '#ffffff' : '#818cf8';
          const textColor = isActive ? '#ffffff' : '#94a3b8';

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                isActive && styles.activeTabHighlight,
              ]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Image
                  source={{ uri: tab.getIcon(iconColor) }}
                  style={styles.tabIcon}
                  resizeMode="contain"
                />

                {tab.key === 'approvals' && pendingCount > 0 && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: textColor,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbarWrapper: {
    width: '100%',
    paddingTop: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeTabHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  tabIcon: {
    width: 22,
    height: 22,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  badgePill: {
    position: 'absolute',
    top: -3,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
  },
});
