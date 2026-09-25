import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, Animated, Easing } from 'react-native';
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

  // Subtle floating animation using React 19 useState initializers
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [pulseBadge] = useState(() => new Animated.Value(1));

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -4,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 4,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseBadge, {
          toValue: 1.05,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseBadge, {
          toValue: 0.96,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    float.start();
    pulse.start();

    return () => {
      float.stop();
      pulse.stop();
    };
  }, [floatAnim, pulseBadge]);

  const dims = {
    small: { width: 140, height: 76, radius: 16 },
    medium: { width: 210, height: 114, radius: 20 },
    large: { width: 270, height: 147, radius: 24 },
  }[size];

  return (
    <View style={styles.container}>
      {/* Top Security Pill Badge */}
      <Animated.View
        style={[
          styles.badgePill,
          {
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : 'rgba(37, 99, 235, 0.08)',
            borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : 'rgba(37, 99, 235, 0.2)',
            transform: [{ scale: pulseBadge }],
          },
        ]}
      >
        <View style={styles.pulseDot} />
        <Text
          style={[
            styles.badgeText,
            { color: isDark ? '#38bdf8' : '#1e40af' },
          ]}
        >
          ENTERPRISE CLOUD • 256-BIT ENCRYPTION
        </Text>
      </Animated.View>

      {/* Floating Logo Card */}
      <Animated.View
        style={[
          styles.logoCard,
          {
            backgroundColor: '#ffffff',
            borderRadius: dims.radius,
            borderColor: isDark ? 'rgba(56, 189, 248, 0.5)' : 'rgba(226, 232, 240, 0.9)',
            borderWidth: isDark ? 1.5 : 1,
            shadowColor: isDark ? '#38bdf8' : '#0f172a',
            shadowOpacity: isDark ? 0.35 : 0.12,
            shadowRadius: isDark ? 20 : 12,
            elevation: isDark ? 10 : 5,
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <Image
          source={APP_LOGO}
          style={{ width: dims.width, height: dims.height }}
          resizeMode="contain"
        />
      </Animated.View>

      {showSubtitle && subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
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
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  logoCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  subtitle: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: -0.1,
  },
});
