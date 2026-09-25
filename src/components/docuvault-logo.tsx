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
    small: { width: 140, height: 76, radius: 14 },
    medium: { width: 210, height: 114, radius: 18 },
    large: { width: 270, height: 147, radius: 22 },
  }[size];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoCard,
          {
            backgroundColor: '#ffffff',
            borderRadius: dims.radius,
            borderColor: isDark ? 'rgba(56, 189, 248, 0.45)' : 'rgba(226, 232, 240, 0.8)',
            borderWidth: isDark ? 1.5 : 1,
            shadowColor: isDark ? '#38bdf8' : '#0f172a',
            shadowOpacity: isDark ? 0.25 : 0.08,
            shadowRadius: isDark ? 14 : 8,
            elevation: isDark ? 8 : 3,
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
  logoCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  subtitle: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});
