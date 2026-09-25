import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions } from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AuthAnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AuthAnimatedBackground({ children }: AuthAnimatedBackgroundProps) {
  const { isDark } = useDocuVaultTheme();

  // Floating animation values declared with useState initializer (React 19 compliant)
  const [floatAnim1] = useState(() => new Animated.Value(0));
  const [floatAnim2] = useState(() => new Animated.Value(0));
  const [pulseScale] = useState(() => new Animated.Value(1));

  useEffect(() => {
    // Smooth looping float for Orb 1 (Top Left)
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Smooth looping float for Orb 2 (Bottom Right)
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 9000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    // Smooth subtle pulsing
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.12,
          duration: 5500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1.0,
          duration: 5500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    anim1.start();
    anim2.start();
    pulse.start();

    return () => {
      anim1.stop();
      anim2.stop();
      pulse.stop();
    };
  }, [floatAnim1, floatAnim2, pulseScale]);

  // Interpolations for Orb 1
  const orb1TranslateX = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-30, 40],
  });
  const orb1TranslateY = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 50],
  });

  // Interpolations for Orb 2
  const orb2TranslateX = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -50],
  });
  const orb2TranslateY = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [30, -35],
  });

  return (
    <View style={styles.container}>
      {/* Background Ambient Orbs */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Orb 1: Primary Cyan/Sky Glow */}
        <Animated.View
          style={[
            styles.orb,
            styles.orb1,
            {
              backgroundColor: isDark
                ? 'rgba(56, 189, 248, 0.16)'
                : 'rgba(37, 99, 235, 0.11)',
              transform: [
                { translateX: orb1TranslateX },
                { translateY: orb1TranslateY },
                { scale: pulseScale },
              ],
            },
          ]}
        />

        {/* Orb 2: Purple/Indigo Accent Glow */}
        <Animated.View
          style={[
            styles.orb,
            styles.orb2,
            {
              backgroundColor: isDark
                ? 'rgba(147, 51, 234, 0.14)'
                : 'rgba(99, 102, 241, 0.10)',
              transform: [
                { translateX: orb2TranslateX },
                { translateY: orb2TranslateY },
              ],
            },
          ]}
        />

        {/* Orb 3: Center Emerald / Amber Ambient Glow */}
        <Animated.View
          style={[
            styles.orb,
            styles.orb3,
            {
              backgroundColor: isDark
                ? 'rgba(16, 185, 129, 0.08)'
                : 'rgba(14, 165, 233, 0.07)',
              transform: [{ scale: pulseScale }],
            },
          ]}
        />

        {/* Subtle decorative grid/vignette overlay */}
        <View
          style={[
            styles.overlayVignette,
            {
              backgroundColor: isDark
                ? 'rgba(10, 15, 29, 0.25)'
                : 'rgba(255, 255, 255, 0.05)',
            },
          ]}
        />
      </View>

      {/* Children content rendered on top */}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orb1: {
    width: Math.min(SCREEN_WIDTH * 0.9, 440),
    height: Math.min(SCREEN_WIDTH * 0.9, 440),
    top: -60,
    left: -60,
    shadowColor: '#38bdf8',
    shadowOpacity: 0.5,
    shadowRadius: 70,
    elevation: 0,
  },
  orb2: {
    width: Math.min(SCREEN_WIDTH * 0.85, 400),
    height: Math.min(SCREEN_WIDTH * 0.85, 400),
    bottom: -80,
    right: -60,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.45,
    shadowRadius: 80,
    elevation: 0,
  },
  orb3: {
    width: 260,
    height: 260,
    top: '35%',
    alignSelf: 'center',
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.3,
    shadowRadius: 60,
    elevation: 0,
  },
  overlayVignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
