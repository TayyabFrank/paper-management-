import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDocuVaultTheme } from '@/context/theme-context';

export type AdminTabKey = 'dashboard' | 'users' | 'docs' | 'approvals' | 'profile';

interface AdminBottomNavbarProps {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
  pendingCount?: number;
}

// Fallback SVG data-URIs for Native
const DASHBOARD_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="2"></rect>
  <line x1="8" y1="17" x2="8" y2="13"></line>
  <line x1="12" y1="17" x2="12" y2="9"></line>
  <line x1="16" y1="17" x2="16" y2="7"></line>
</svg>
`)}`;

const USERS_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
  <circle cx="9" cy="7" r="4"></circle>
  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
</svg>
`)}`;

const ALL_DOCS_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="16" y1="13" x2="8" y2="13"></line>
  <line x1="16" y1="17" x2="8" y2="17"></line>
  <line x1="10" y1="9" x2="8" y2="9"></line>
</svg>
`)}`;

const APPROVALS_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  <path d="m9 14 2 2 4-4"></path>
</svg>
`)}`;

const PROFILE_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9.5"></circle>
  <circle cx="12" cy="9" r="3.2"></circle>
  <path d="M6.8 18.2C7.8 15.6 9.8 14.5 12 14.5C14.2 14.5 16.2 15.6 17.2 18.2"></path>
</svg>
`)}`;

interface TabConfig {
  key: AdminTabKey;
  label: string;
  emoji: string;
  getIcon: (color: string) => string;
}

const ADMIN_TABS: TabConfig[] = [
  { key: 'dashboard', label: 'Dashboard', emoji: '📊', getIcon: DASHBOARD_ICON_SVG },
  { key: 'users', label: 'Users', emoji: '👥', getIcon: USERS_ICON_SVG },
  { key: 'docs', label: 'All Docs', emoji: '📑', getIcon: ALL_DOCS_ICON_SVG },
  { key: 'approvals', label: 'Approvals', emoji: '⏳', getIcon: APPROVALS_ICON_SVG },
  { key: 'profile', label: 'Profile', emoji: '👤', getIcon: PROFILE_ICON_SVG },
];

/**
 * Crystal-clear SVG vector rendering component for Admin Navbar
 * Renders direct native SVG on Web for maximum clarity, and crisp SVG/Image on Mobile
 */
function AdminNavbarIcon({
  tabKey,
  color,
  fallbackEmoji,
  getIconUri,
}: {
  tabKey: AdminTabKey;
  color: string;
  fallbackEmoji: string;
  getIconUri: (color: string) => string;
}) {
  if (Platform.OS === 'web') {
    if (tabKey === 'dashboard') {
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' } as any}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="8" y1="17" x2="8" y2="13" />
          <line x1="12" y1="17" x2="12" y2="9" />
          <line x1="16" y1="17" x2="16" y2="7" />
        </svg>
      );
    }
    if (tabKey === 'users') {
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' } as any}
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    }
    if (tabKey === 'docs') {
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' } as any}
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      );
    }
    if (tabKey === 'approvals') {
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' } as any}
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="m9 14 2 2 4-4" />
        </svg>
      );
    }
    if (tabKey === 'profile') {
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' } as any}
        >
          <circle cx="12" cy="12" r="9.5" />
          <circle cx="12" cy="9" r="3.2" />
          <path d="M6.8 18.2C7.8 15.6 9.8 14.5 12 14.5C14.2 14.5 16.2 15.6 17.2 18.2" />
        </svg>
      );
    }
  }

  // Native Mobile Rendering
  return <Text style={{ fontSize: 18, lineHeight: 22, textAlign: 'center' }}>{fallbackEmoji}</Text>;
}

export function AdminBottomNavbar({
  activeTab,
  onTabChange,
  pendingCount = 0,
}: AdminBottomNavbarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useDocuVaultTheme();

  // High contrast design tokens ensuring unmistakable visibility
  const barBg = isDark ? '#0f172a' : '#ffffff';
  const borderTopColor = isDark ? 'rgba(255, 255, 255, 0.14)' : '#cbd5e1';
  const activeCapsuleBg = '#2563eb';
  const activeIconColor = '#ffffff';
  const inactiveIconColor = isDark ? '#94a3b8' : '#475569';
  const activeLabelColor = isDark ? '#38bdf8' : '#1d4ed8';
  const inactiveLabelColor = isDark ? '#94a3b8' : '#475569';

  return (
    <View
      style={[
        styles.navbarWrapper,
        {
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 10),
          backgroundColor: barBg,
          borderTopColor: borderTopColor,
        },
        Platform.OS === 'web' && ({
          boxShadow: isDark
            ? '0 -4px 20px rgba(0, 0, 0, 0.45)'
            : '0 -4px 20px rgba(15, 23, 42, 0.08)',
        } as any),
      ]}
      accessibilityRole="tablist"
      accessibilityLabel="Admin Navigation Bar"
    >
      <View style={styles.navRow}>
        {ADMIN_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const iconColor = isActive ? activeIconColor : inactiveIconColor;
          const labelColor = isActive ? activeLabelColor : inactiveLabelColor;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabButton,
                Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
              ]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab`}
            >
              {/* Active capsule pill around the icon */}
              <View
                style={[
                  styles.iconSlot,
                  isActive
                    ? [styles.activeCapsulePill, { backgroundColor: activeCapsuleBg }]
                    : styles.inactiveIconSlot,
                ]}
              >
                <AdminNavbarIcon
                  tabKey={tab.key}
                  color={iconColor}
                  fallbackEmoji={tab.emoji}
                  getIconUri={tab.getIcon}
                />

                {tab.key === 'approvals' && pendingCount > 0 && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgeText}>{pendingCount}</Text>
                  </View>
                )}
              </View>

              {/* Tab label */}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: labelColor,
                    fontWeight: isActive ? '800' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>

              {/* Active indicator dot */}
              <View
                style={[
                  styles.activeDot,
                  { backgroundColor: isActive ? activeLabelColor : 'transparent' },
                ]}
              />
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
    paddingHorizontal: 8,
    borderTopWidth: 1.5,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 999,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: 580,
    alignSelf: 'center',
    width: '100%',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    minHeight: 52,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  activeCapsulePill: {
    width: 52,
    height: 30,
    borderRadius: 15,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 4,
  },
  inactiveIconSlot: {
    width: 52,
    height: 30,
  },
  tabIcon: {
    width: 22,
    height: 22,
  },
  tabLabel: {
    fontSize: 11.5,
    marginTop: 3,
    letterSpacing: -0.1,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});
