import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ImageSourcePropType, Animated, Easing, Platform } from 'react-native';
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

  // Pulse & Glow Animation
  const [pulseAnim] = useState(() => new Animated.Value(0));
  const [scaleAnim] = useState(() => new Animated.Value(0.92));
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Entrance fade & spring scale
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous subtle breathing pulse
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim, scaleAnim, fadeAnim]);

  const haloScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });

  const haloOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.35, 0.7, 0.35],
  });

  const dims = {
    small: { width: 140, height: 76, radius: 14 },
    medium: { width: 210, height: 114, radius: 20 },
    large: { width: 270, height: 147, radius: 24 },
  }[size];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.cardAnchor}>
        {/* Animated Glowing Ambient Halo */}
        <Animated.View
          style={[
            styles.haloGlow,
            {
              width: dims.width + 36,
              height: dims.height + 36,
              borderRadius: dims.radius + 14,
              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(37, 99, 235, 0.22)',
              opacity: haloOpacity,
              transform: [{ scale: haloScale }],
            },
            Platform.OS === 'web' && ({
              filter: 'blur(16px)',
            } as any),
          ]}
        />

        <View
          style={[
            styles.logoCard,
            {
              backgroundColor: '#ffffff',
              borderRadius: dims.radius,
              borderColor: isDark ? 'rgba(56, 189, 248, 0.5)' : 'rgba(226, 232, 240, 0.9)',
              borderWidth: isDark ? 2 : 1,
              shadowColor: isDark ? '#38bdf8' : '#1e3a8a',
              shadowOpacity: isDark ? 0.35 : 0.12,
              shadowRadius: isDark ? 20 : 12,
              elevation: isDark ? 10 : 5,
            },
            Platform.OS === 'web' && ({
              boxShadow: isDark
                ? '0 10px 30px rgba(56, 189, 248, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.5)'
                : '0 10px 24px rgba(30, 58, 138, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            } as any),
          ]}
        >
          <Image
            source={APP_LOGO}
            style={{ width: dims.width, height: dims.height }}
            resizeMode="contain"
          />
        </View>
      </View>

      {showSubtitle && subtitle ? (
        <View style={styles.subtitleWrapper}>
          <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    marginTop: 8,
  },
  cardAnchor: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloGlow: {
    position: 'absolute',
  },
  logoCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  subtitleWrapper: {
    marginTop: 12,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
