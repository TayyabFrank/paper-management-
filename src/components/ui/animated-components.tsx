import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  scale?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Universal Fade + Slide/Scale entrance animation.
 * Highly performant and works seamlessly across Web, iOS, and Android.
 */
export function FadeInView({
  children,
  delay = 0,
  duration = 450,
  distance = 18,
  direction = 'up',
  scale = false,
  style,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(distance)).current;
  const scaleAnim = useRef(new Animated.Value(scale ? 0.94 : 1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(translate, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: Platform.OS !== 'web',
        }),
        scale
          ? Animated.timing(scaleAnim, {
              toValue: 1,
              duration,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: Platform.OS !== 'web',
            })
          : Animated.delay(0),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, duration, scale]);

  const getTransform = () => {
    const transforms: any[] = [];
    if (scale) {
      transforms.push({ scale: scaleAnim });
    }
    if (direction === 'up') {
      transforms.push({ translateY: translate });
    } else if (direction === 'down') {
      transforms.push({
        translateY: translate.interpolate({
          inputRange: [-distance, 0],
          outputRange: [-distance, 0],
        }),
      });
    } else if (direction === 'left') {
      transforms.push({ translateX: translate });
    } else if (direction === 'right') {
      transforms.push({
        translateX: translate.interpolate({
          inputRange: [-distance, 0],
          outputRange: [-distance, 0],
        }),
      });
    }
    return transforms;
  };

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: getTransform(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

interface ScalePressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeScale?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: any;
}

/**
 * High-polish button/card with tactile scale-spring feedback on touch/click.
 */
export function ScalePressable({
  children,
  onPress,
  style,
  activeScale = 0.97,
  disabled = false,
  accessibilityLabel,
  accessibilityRole = 'button',
}: ScalePressableProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: activeScale,
      useNativeDriver: Platform.OS !== 'web',
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: Platform.OS !== 'web',
      speed: 30,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      style={[
        Platform.OS === 'web' && (!disabled ? { cursor: 'pointer' } : { cursor: 'default' }),
      ] as any}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

/**
 * Gently pulsing badge or indicator dot.
 */
export function PulseView({
  children,
  style,
  minScale = 0.95,
  maxScale = 1.05,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  minScale?: number;
  maxScale?: number;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: maxScale,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(pulse, {
          toValue: minScale,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [maxScale, minScale]);

  return (
    <Animated.View style={[style, { transform: [{ scale: pulse }] }]}>
      {children}
    </Animated.View>
  );
}
