import React from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';

export const APP_LOGO: ImageSourcePropType = require('@/logo/logo.png');

interface DocuVaultLogoProps {
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  showSubtitle?: boolean;
}

export function DocuVaultLogo({
  subtitle,
  size = 'medium',
  showSubtitle = true,
}: DocuVaultLogoProps) {
  const { isDark, colors } = useDocuVaultTheme();

  const dims = {
    small: { width: 140, height: 74, radius: 16, cardPadding: 8 },
    medium: { width: 220, height: 116, radius: 20, cardPadding: 12 },
    large: { width: 280, height: 148, radius: 24, cardPadding: 16 },
  }[size];

  return (
    <View style={styles.container}>
      {/* Top Security Status Pill */}
      <View
        style={[
          styles.badgePill,
          {
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(37, 99, 235, 0.08)',
            borderColor: isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(37, 99, 235, 0.22)',
          },
        ]}
      >
        <View
          style={[
            styles.statusDot,
            {
              backgroundColor: '#10b981',
              shadowColor: '#10b981',
            },
          ]}
        />
        <Text
          style={[
            styles.badgePillText,
            { color: isDark ? '#38bdf8' : '#1e40af' },
          ]}
        >
          DOCUVAULT ENTERPRISE • SECURE GATEWAY
        </Text>
      </View>

      {/* High-Gloss Logo Container */}
      <View
        style={[
          styles.logoCard,
          {
            backgroundColor: '#ffffff',
            borderRadius: dims.radius,
            paddingHorizontal: dims.cardPadding + 6,
            paddingVertical: dims.cardPadding,
            borderColor: isDark ? 'rgba(56, 189, 248, 0.5)' : '#cbd5e1',
            borderWidth: isDark ? 1.5 : 1,
            shadowColor: isDark ? '#38bdf8' : '#0f172a',
            shadowOpacity: isDark ? 0.3 : 0.1,
            shadowRadius: isDark ? 18 : 12,
            elevation: isDark ? 10 : 4,
          },
        ]}
      >
        <Image
          source={APP_LOGO}
          style={{ width: dims.width, height: dims.height }}
          resizeMode="contain"
        />
      </View>

      {showSubtitle && subtitle ? (
        <Text
          style={[
            styles.subtitle,
            {
              color: isDark ? '#cbd5e1' : '#334155',
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 6,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  badgePillText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  logoCard: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 6 },
  },
  subtitle: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
