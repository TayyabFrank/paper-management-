import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Animated, Easing, Dimensions, Platform } from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';

export function AuthAnimatedBackground() {
  const { isDark } = useDocuVaultTheme();

  // Floating animation values using useState lazy initializers
  const [floatAnim1] = useState(() => new Animated.Value(0));
  const [floatAnim2] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Loop for Orb 1 (top-right floating motion)
    const loop1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Loop for Orb 2 (bottom-left floating motion)
    const loop2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Breathing pulse for radial intensity
    const loopPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 4500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop1.start();
    loop2.start();
    loopPulse.start();

    return () => {
      loop1.stop();
      loop2.stop();
      loopPulse.stop();
    };
  }, [floatAnim1, floatAnim2, pulseAnim]);

  // Interpolations for Orb 1
  const transX1 = floatAnim1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 35, -20],
  });
  const transY1 = floatAnim1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -40, 25],
  });
  const scale1 = floatAnim1.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 0.95],
  });

  // Interpolations for Orb 2
  const transX2 = floatAnim2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, -30, 25],
  });
  const transY2 = floatAnim2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 35, -20],
  });
  const scale2 = floatAnim2.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.9, 1.12],
  });

  const orbOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.65, 0.9, 0.65],
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Orb 1: Electric Sapphire / Neon Cyan */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.28)' : 'rgba(37, 99, 235, 0.16)',
            opacity: orbOpacity,
            transform: [
              { translateX: transX1 },
              { translateY: transY1 },
              { scale: scale1 },
            ],
          },
        ]}
      />

      {/* Orb 2: Deep Indigo / Violet Neon */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.24)' : 'rgba(124, 58, 237, 0.14)',
            opacity: orbOpacity,
            transform: [
              { translateX: transX2 },
              { translateY: transY2 },
              { scale: scale2 },
            ],
          },
        ]}
      />

      {/* Orb 3: Emerald Security Beacon / Subtle Teal */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb3,
          {
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(5, 150, 105, 0.11)',
            opacity: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.4, 0.75],
            }),
            transform: [
              { scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.08] }) },
            ],
          },
        ]}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    borderRadius: 999,
    ...(Platform.OS === 'web'
      ? {
          filter: 'blur(70px)',
          WebkitFilter: 'blur(70px)',
          willChange: 'transform, opacity',
        }
      : {
          shadowColor: '#38bdf8',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 50,
          elevation: 10,
        }),
  },
  orb1: {
    top: -60,
    right: -40,
    width: Math.min(width * 0.75, 340),
    height: Math.min(width * 0.75, 340),
  },
  orb2: {
    bottom: 60,
    left: -50,
    width: Math.min(width * 0.7, 320),
    height: Math.min(width * 0.7, 320),
  },
  orb3: {
    top: '40%',
    right: '15%',
    width: 220,
    height: 220,
  },
});
