import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';

export function AuthAmbientBackground() {
  const { isDark } = useDocuVaultTheme();

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Top Left Ambient Radial Glow */}
      <View
        style={[
          styles.glowOrb,
          styles.topOrb,
          {
            backgroundColor: isDark ? 'rgba(37, 99, 235, 0.18)' : 'rgba(59, 130, 246, 0.12)',
            shadowColor: isDark ? '#38bdf8' : '#2563eb',
          },
        ]}
      />

      {/* Bottom Right Ambient Radial Glow */}
      <View
        style={[
          styles.glowOrb,
          styles.bottomOrb,
          {
            backgroundColor: isDark ? 'rgba(124, 58, 237, 0.16)' : 'rgba(147, 51, 234, 0.09)',
            shadowColor: isDark ? '#818cf8' : '#6366f1',
          },
        ]}
      />

      {/* Center Soft Glow Behind Card */}
      <View
        style={[
          styles.centerGlow,
          {
            backgroundColor: isDark ? 'rgba(56, 189, 248, 0.06)' : 'rgba(219, 234, 254, 0.45)',
          },
        ]}
      />

      {/* Subtle Tech Grid / Mesh Overlay for Web */}
      {Platform.OS === 'web' && (
        <View
          style={[
            styles.meshGridWeb,
            {
              opacity: isDark ? 0.08 : 0.04,
              backgroundImage: isDark
                ? 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)'
                : 'radial-gradient(rgba(15, 23, 42, 0.6) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            } as any,
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  glowOrb: {
    position: 'absolute',
    borderRadius: 9999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
    elevation: 0,
  },
  topOrb: {
    top: -80,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
  },
  bottomOrb: {
    bottom: -100,
    right: -80,
    width: 340,
    height: 340,
    borderRadius: 170,
  },
  centerGlow: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    right: '15%',
    height: '40%',
    borderRadius: 999,
    transform: [{ scaleX: 1.2 }],
  },
  meshGridWeb: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
