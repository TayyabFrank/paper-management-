import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';

const SUN_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"></circle>
  <line x1="12" y1="1" x2="12" y2="3"></line>
  <line x1="12" y1="21" x2="12" y2="23"></line>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
  <line x1="1" y1="12" x2="3" y2="12"></line>
  <line x1="21" y1="12" x2="23" y2="12"></line>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
</svg>
`)}`;

const MOON_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
</svg>
`)}`;

interface ThemeToggleButtonProps {
  compact?: boolean;
  showLabel?: boolean;
}

export function ThemeToggleButton({ compact = false, showLabel = true }: ThemeToggleButtonProps) {
  const { isDark, toggleTheme } = useDocuVaultTheme();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.75}
      style={[
        styles.pillContainer,
        {
          backgroundColor: isDark ? '#1a2337' : '#ffffff',
          borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : '#e2e8f0',
          shadowColor: isDark ? '#38bdf8' : '#0f172a',
        },
        compact && styles.compactPill,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
    >
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.16)' : '#fef3c7',
          },
        ]}
      >
        <Image
          source={{ uri: isDark ? MOON_ICON_SVG : SUN_ICON_SVG }}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      {showLabel && (
        <Text
          style={[
            styles.labelText,
            {
              color: isDark ? '#e2e8f0' : '#334155',
            },
          ]}
        >
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>
      )}

      {/* Mini indicator dot */}
      <View
        style={[
          styles.modeDot,
          {
            backgroundColor: isDark ? '#38bdf8' : '#f59e0b',
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1.2,
    gap: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  compactPill: {
    paddingVertical: 5,
    paddingHorizontal: 8,
    gap: 6,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 16,
    height: 16,
  },
  labelText: {
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
