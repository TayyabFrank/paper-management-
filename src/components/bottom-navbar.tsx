import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDocuVaultTheme } from '@/context/theme-context';

export type TabKey = 'home' | 'docs' | 'new-doc' | 'profile';

// Home house icon SVG
const HOME_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"></path>
  <path d="M9 21V14C9 13.4477 9.44772 13 10 13H14C14.5523 13 15 13.4477 15 14V21"></path>
</svg>
`)}`;

// Document icon SVG (clean document outline with folded corner and lines)
const DOCUMENT_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="16" y1="13" x2="8" y2="13"></line>
  <line x1="16" y1="17" x2="8" y2="17"></line>
  <line x1="10" y1="9" x2="8" y2="9"></line>
</svg>
`)}`;

// Upload icon SVG (document with upward upload arrow)
const UPLOAD_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="12" y1="18" x2="12" y2="12"></line>
  <polyline points="9 15 12 12 15 15"></polyline>
</svg>
`)}`;

// Profile user in circle SVG
const PROFILE_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="9.5"></circle>
  <circle cx="12" cy="9" r="3.2"></circle>
  <path d="M6.8 18.2C7.8 15.6 9.8 14.5 12 14.5C14.2 14.5 16.2 15.6 17.2 18.2"></path>
</svg>
`)}`;

interface BottomNavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

interface TabItemConfig {
  key: TabKey;
  label: string;
  emoji: string;
  getIcon: (color: string) => string;
}

export function BottomNavbar({ activeTab, onTabChange }: BottomNavbarProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useDocuVaultTheme();

  const activePillBg = isDark ? '#2563eb' : '#1b3569';
  const inactiveColor = isDark ? '#94a3b8' : '#64748b';
  const activeLabelColor = isDark ? '#38bdf8' : '#1b3569';

  const tabs: TabItemConfig[] = [
    { key: 'home', label: 'Home', emoji: '🏠', getIcon: HOME_ICON_SVG },
    { key: 'docs', label: 'Document', emoji: '📄', getIcon: DOCUMENT_ICON_SVG },
    { key: 'new-doc', label: 'Upload', emoji: '📤', getIcon: UPLOAD_ICON_SVG },
    { key: 'profile', label: 'Profile', emoji: '👤', getIcon: PROFILE_ICON_SVG },
  ];

  return (
    <View
      style={[
        styles.navbarContainer,
        {
          backgroundColor: isDark ? '#0c1322' : '#ffffff',
          borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 14 : 8),
        },
      ]}
    >
      <View style={styles.tabBarInner}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const iconColor = isActive ? '#ffffff' : inactiveColor;
          const labelColor = isActive ? activeLabelColor : inactiveColor;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.75}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`${tab.label} tab`}
            >
              {/* Active pill capsule around the vector icon */}
              <View
                style={[
                  styles.iconSlot,
                  isActive
                    ? [styles.activeCapsulePill, { backgroundColor: activePillBg }]
                    : styles.inactiveIconSlot,
                ]}
              >
                <Image
                  source={{ uri: tab.getIcon(iconColor) }}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>

              {/* Tab label with compulsory icon + title */}
              <Text
                style={[
                  styles.tabLabel,
                  { color: labelColor },
                  isActive && styles.activeTabLabel,
                ]}
                numberOfLines={1}
              >
                <Text style={styles.tabEmoji}>{tab.emoji}</Text> {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 12,
    zIndex: 999,
  },
  tabBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: 52,
  },
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCapsulePill: {
    width: 64,
    height: 32,
    borderRadius: 16,
    shadowColor: '#1b3569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveIconSlot: {
    width: 64,
    height: 32,
  },
  icon: {
    width: 22,
    height: 22,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: -0.1,
  },
  activeTabLabel: {
    fontWeight: '700',
  },
  tabEmoji: {
    fontSize: 11,
  },
});
