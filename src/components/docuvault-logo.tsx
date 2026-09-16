import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';

// Crisp SVG data URI for the DocuVault vault/building emblem
const VAULT_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
  <!-- Top pediment / dome -->
  <path d="M11 10C11 7.23858 13.2386 5 16 5C18.7614 5 21 7.23858 21 10V26H11V10Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Center archway -->
  <path d="M14 26V19C14 17.8954 14.8954 17 16 17C17.1046 17 18 17.8954 18 19V26" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Side wings / columns -->
  <path d="M7 13.5V26M25 13.5V26" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <path d="M7 13.5C7 13.5 10 11.5 16 11.5C22 11.5 25 13.5 25 13.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
  <!-- Foundation bar -->
  <path d="M5 26H27" stroke="white" stroke-width="2" stroke-linecap="round"/>
</svg>
`)}`;

interface DocuVaultLogoProps {
  subtitle?: string;
}

export function DocuVaultLogo({ subtitle }: DocuVaultLogoProps) {
  const { isDark, colors } = useDocuVaultTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconBadge,
          {
            backgroundColor: isDark ? '#1e3a8a' : '#1b3569',
            shadowColor: isDark ? '#38bdf8' : '#1b3569',
            borderColor: isDark ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
            borderWidth: isDark ? 1.5 : 0,
          },
        ]}
      >
        <Image
          source={{ uri: VAULT_ICON_SVG }}
          style={styles.iconImage}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>DocuVault</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 14,
  },
  iconImage: {
    width: 32,
    height: 32,
  },
  brandTitle: {
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.4,
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'sans-serif',
    }),
  },
  subtitle: {
    fontSize: 14.5,
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});

