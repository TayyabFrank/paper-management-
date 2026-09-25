import { useAuth } from '@/context/auth-context';
import { useDocuVaultTheme } from '@/context/theme-context';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
  <circle cx="24" cy="24" r="23" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="24" cy="18" r="7.5" fill="#64748b"/>
  <path d="M11 40C11 32.8203 16.8203 27 24 27C31.1797 27 37 32.8203 37 40" fill="#64748b"/>
</svg>
`)}`;

// Cross-platform crisp eye icon for show/hide password toggle
function PasswordEyeIcon({ visible, color }: { visible: boolean; color: string }) {
  if (Platform.OS === 'web') {
    if (visible) {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' } as any}
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    }
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ display: 'block' } as any}
      >
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    );
  }

  return <Text style={{ fontSize: 16 }}>{visible ? '👁️' : '🙈'}</Text>;
}

interface EmployeeRegistrationCardProps {
  initialMode?: 'register' | 'login';
  onModeChange?: (mode: 'register' | 'login') => void;
  onLoginSuccess?: (user?: { name: string; email: string; avatar?: string }) => void;
}

export function EmployeeRegistrationCard({
  initialMode = 'register',
  onModeChange,
  onLoginSuccess,
}: EmployeeRegistrationCardProps) {
  const router = useRouter();
  const { isDark, colors } = useDocuVaultTheme();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedModalVisible, setSubmittedModalVisible] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<'fullName' | 'workEmail' | 'password' | null>(null);

  // Sync prop changes
  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  if (prevInitialMode !== initialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- ANIMATIONS (React 19 useState initializers) ---
  // 1. Entrance animation (scale, opacity, translateY)
  const [entranceAnim] = useState(() => new Animated.Value(0));
  // 2. Shake animation on error
  const [shakeAnim] = useState(() => new Animated.Value(0));
  // 3. Tab sliding indicator (0 = login, 1 = register)
  const [tabSlideAnim] = useState(() => new Animated.Value(initialMode === 'register' ? 1 : 0));
  // 4. Form content transition
  const [contentFadeAnim] = useState(() => new Animated.Value(1));
  // 5. Password progress bar width
  const [pwdScoreAnim] = useState(() => new Animated.Value(0));
  // 6. Avatar glowing pulse
  const [avatarPulseAnim] = useState(() => new Animated.Value(1));

  // Run entrance animation on mount
  useEffect(() => {
    Animated.spring(entranceAnim, {
      toValue: 1,
      tension: 65,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, [entranceAnim]);

  // Avatar subtle breathing pulse
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(avatarPulseAnim, {
          toValue: 1.06,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(avatarPulseAnim, {
          toValue: 1.0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [avatarPulseAnim]);

  // Animate tab indicator when mode changes
  useEffect(() => {
    Animated.spring(tabSlideAnim, {
      toValue: mode === 'register' ? 1 : 0,
      tension: 80,
      friction: 10,
      useNativeDriver: false,
    }).start();
  }, [mode, tabSlideAnim]);

  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  };

  const pwdRules = {
    hasMinLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const passwordScore = Object.values(pwdRules).filter(Boolean).length;

  // Animate password score change
  useEffect(() => {
    Animated.timing(pwdScoreAnim, {
      toValue: (passwordScore / 5) * 100,
      duration: 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [passwordScore, pwdScoreAnim]);

  const getScoreColor = (score: number) => {
    if (score <= 1) return '#ef4444';
    if (score <= 3) return '#f59e0b';
    if (score === 4) return '#3b82f6';
    return '#10b981';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 1) return 'Weak Password';
    if (score <= 3) return 'Moderate Password';
    if (score === 4) return 'Good Password';
    return 'Strong Password ✓';
  };

  const switchMode = (newMode: 'register' | 'login') => {
    if (newMode === mode) return;

    // Smooth transition
    Animated.timing(contentFadeAnim, {
      toValue: 0,
      duration: 140,
      useNativeDriver: true,
    }).start(() => {
      setMode(newMode);
      setErrors({});
      if (Platform.OS !== 'web') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });

    if (onModeChange) {
      onModeChange(newMode);
    }
  };


  const handleChoosePhoto = () => {
    setShowPermissionDialog(true);
  };

  const handlePermissionDecision = async (allow: boolean) => {
    setShowPermissionDialog(false);
    if (!allow) return;

    try {
      if (Platform.OS === 'web' && fileInputRef.current) {
        fileInputRef.current.click();
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFaceImage(asset.uri);
        if (errors.faceImage) {
          setErrors((prev) => ({ ...prev, faceImage: '' }));
        }
      }
    } catch (err) {
      console.warn('File picker error:', err);
      if (Platform.OS === 'web' && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFaceImage(uploadEvent.target.result as string);
          if (errors.faceImage) {
            setErrors((prev) => ({ ...prev, faceImage: '' }));
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (mode === 'register') {
      if (!fullName.trim()) {
        newErrors.fullName = 'Full Name is required';
      }
      if (!workEmail.trim()) {
        newErrors.workEmail = 'Work Email is required';
      } else if (!/\S+@\S+\.\S+/.test(workEmail)) {
        newErrors.workEmail = 'Please enter a valid work email';
      }
      if (!password.trim()) {
        newErrors.password = 'Password is required';
      } else if (password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!/[A-Z]/.test(password)) {
        newErrors.password = 'Password must contain at least one uppercase letter (A-Z)';
      } else if (!/[a-z]/.test(password)) {
        newErrors.password = 'Password must contain at least one lowercase letter (a-z)';
      } else if (!/[0-9]/.test(password)) {
        newErrors.password = 'Password must contain at least one number (0-9)';
      } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        newErrors.password = 'Password must contain at least one special character (!@#$%^&*...)';
      }
      if (!faceImage) {
        newErrors.faceImage = 'Profile photo is required. Please upload your photo to register.';
      }
    } else {
      const trimmedEmail = workEmail.trim().toLowerCase();
      if (!trimmedEmail) {
        newErrors.workEmail = 'Work Email is required';
      } else if (trimmedEmail !== 'admin' && !/\S+@\S+\.\S+/.test(trimmedEmail)) {
        newErrors.workEmail = 'Please enter a valid work email';
      }
      if (!password.trim()) {
        newErrors.password = 'Password is required';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      triggerShake();
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const cleanLoginEmail =
          workEmail.trim().toLowerCase() === 'admin'
            ? 'admin@enterprise.com'
            : workEmail.trim();
        const result = await login(cleanLoginEmail, password);
        setIsSubmitting(false);
        if (!result.success) {
          setErrors({ form: result.error || 'Authentication failed' });
          triggerShake();
          return;
        }
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          router.push('/');
        }
      } else {
        const result = await register({
          name: fullName,
          email: workEmail,
          password: password,
          avatar: faceImage || undefined,
        });
        setIsSubmitting(false);
        if (!result.success) {
          setErrors({ form: result.error || 'Registration failed' });
          triggerShake();
          return;
        }
        setSubmittedModalVisible(true);
      }
    } catch {
      setIsSubmitting(false);
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
      triggerShake();
    }
  };

  const handleReset = () => {
    setSubmittedModalVisible(false);
    if (mode === 'register') {
      switchMode('login');
      setPassword('');
      setShowPassword(false);
    } else {
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.push('/');
      }
    }
  };

  const handleSendResetLink = () => {
    if (!forgotEmail.trim()) return;
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setForgotModalVisible(false);
      setForgotEmail('');
    }, 2000);
  };

  // Card theme styling
  const cardThemeStyle = {
    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.92)' : 'rgba(255, 255, 255, 0.94)',
    borderColor: isDark ? 'rgba(56, 189, 248, 0.28)' : 'rgba(215, 225, 238, 0.9)',
    shadowColor: isDark ? '#38bdf8' : '#1e3a8a',
  };
  const labelThemeStyle = { color: isDark ? '#cbd5e1' : '#475569' };
  const inputBaseStyle = {
    backgroundColor: isDark ? 'rgba(22, 32, 51, 0.85)' : '#f8fafc',
    borderColor: isDark ? 'rgba(56, 189, 248, 0.2)' : '#cbd5e1',
    color: isDark ? '#f8fafc' : '#0f172a',
  };
  const placeholderColor = isDark ? '#64748b' : '#94a3b8';
  const primaryBtnStyle = {
    backgroundColor: isDark ? '#2563eb' : '#1b3569',
    shadowColor: isDark ? '#38bdf8' : '#1b3569',
  };
  const linkThemeStyle = { color: isDark ? '#38bdf8' : '#2563eb' };

  // Helper for input focus style
  const getFieldContainerStyle = (fieldName: 'fullName' | 'workEmail' | 'password', isError: boolean) => {
    const isFocused = focusedField === fieldName;
    return [
      styles.input,
      inputBaseStyle,
      isFocused && {
        borderColor: isDark ? '#38bdf8' : '#2563eb',
        shadowColor: isDark ? '#38bdf8' : '#2563eb',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
      },
      isError && styles.inputError,
    ];
  };

  // Tab indicator sliding interpolations
  const tabLeftInterpolate = tabSlideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '50%'],
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        cardThemeStyle,
        {
          opacity: entranceAnim,
          transform: [
            {
              scale: entranceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
            {
              translateY: entranceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [24, 0],
              }),
            },
            { translateX: shakeAnim },
          ],
        },
      ]}
    >
      {/* Hidden file input for web upload */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef as any}
          onChange={handleWebFileChange as any}
          accept="image/*"
          style={{ display: 'none' }}
        />
      )}

      {/* Interactive Sliding Switcher Tabs: Sign In vs Register */}
      <View
        style={[
          styles.modeTabsContainer,
          {
            backgroundColor: isDark ? 'rgba(22, 32, 51, 0.9)' : 'rgba(226, 232, 240, 0.7)',
            borderColor: isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(203, 213, 225, 0.6)',
          },
        ]}
      >
        {/* Animated sliding active pill */}
        <Animated.View
          style={[
            styles.modeTabActivePill,
            {
              left: tabLeftInterpolate,
              backgroundColor: isDark ? '#2563eb' : '#1b3569',
              shadowColor: isDark ? '#38bdf8' : '#1b3569',
            },
          ]}
        />

        {/* Sign In Tab */}
        <TouchableOpacity
          style={styles.modeTab}
          onPress={() => switchMode('login')}
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'login' }}
        >
          <Text
            style={[
              styles.modeTabText,
              {
                color: mode === 'login' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: mode === 'login' ? '700' : '600',
              },
            ]}
          >
            🔐 Sign In
          </Text>
        </TouchableOpacity>

        {/* Register Tab */}
        <TouchableOpacity
          style={styles.modeTab}
          onPress={() => switchMode('register')}
          activeOpacity={0.85}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'register' }}
        >
          <Text
            style={[
              styles.modeTabText,
              {
                color: mode === 'register' ? '#ffffff' : (isDark ? '#94a3b8' : '#64748b'),
                fontWeight: mode === 'register' ? '700' : '600',
              },
            ]}
          >
            📝 Register
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card Header Title */}
      <View style={styles.titleHeaderWrapper}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          {mode === 'register' ? 'Employee Onboarding' : 'Welcome to Workspace'}
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
          {mode === 'register'
            ? 'Complete the form below to create your official account'
            : 'Enter your credentials to access secured documents'}
        </Text>
      </View>


      {/* Animated Form Content */}
      <Animated.View style={{ opacity: contentFadeAnim, width: '100%' }}>
        {mode === 'register' ? (
          /* REGISTRATION FORM */
          <View style={styles.formContent}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, labelThemeStyle]}>
                👤 Full Name <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={getFieldContainerStyle('fullName', !!errors.fullName)}
                placeholder="John Doe"
                placeholderTextColor={placeholderColor}
                value={fullName}
                onFocus={() => setFocusedField('fullName')}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => {
                  setFullName(text);
                  if (errors.fullName) setErrors({ ...errors, fullName: '' });
                }}
                autoCapitalize="words"
              />
              {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
            </View>

            {/* Work Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, labelThemeStyle]}>
                ✉️ Work Email <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={getFieldContainerStyle('workEmail', !!errors.workEmail)}
                placeholder="name@company.com"
                placeholderTextColor={placeholderColor}
                value={workEmail}
                onFocus={() => setFocusedField('workEmail')}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => {
                  setWorkEmail(text);
                  if (errors.workEmail) setErrors({ ...errors, workEmail: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.workEmail ? <Text style={styles.errorText}>{errors.workEmail}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, labelThemeStyle]}>
                🔒 Password <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View
                style={[
                  styles.passwordInputContainer,
                  inputBaseStyle,
                  focusedField === 'password' && {
                    borderColor: isDark ? '#38bdf8' : '#2563eb',
                    shadowColor: isDark ? '#38bdf8' : '#2563eb',
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 3,
                  },
                  errors.password ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: isDark ? '#f8fafc' : '#0f172a' }]}
                  placeholder="Enter strong password"
                  placeholderTextColor={placeholderColor}
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                >
                  <PasswordEyeIcon
                    visible={showPassword}
                    color={
                      showPassword
                        ? (isDark ? '#38bdf8' : '#2563eb')
                        : (isDark ? '#94a3b8' : '#64748b')
                    }
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              {/* Real-time Password Strength Meter */}
              {password.length > 0 && (
                <View
                  style={[
                    styles.pwdStrengthWrapper,
                    {
                      backgroundColor: isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(241, 245, 249, 0.8)',
                      borderColor: isDark ? 'rgba(56, 189, 248, 0.15)' : 'rgba(226, 232, 240, 0.8)',
                    },
                  ]}
                >
                  <View style={styles.pwdProgressBar}>
                    <Animated.View
                      style={[
                        styles.pwdProgressFill,
                        {
                          width: pwdScoreAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                          }),
                          backgroundColor: getScoreColor(passwordScore),
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.pwdStatusRow}>
                    <Text style={[styles.pwdStrengthLabel, { color: getScoreColor(passwordScore) }]}>
                      {getScoreLabel(passwordScore)}
                    </Text>
                    <Text style={[styles.pwdHintText, { color: colors.textSecondary }]}>
                      {passwordScore === 5 ? '✓ All requirements met' : `${passwordScore}/5 met`}
                    </Text>
                  </View>
                  <View style={styles.pwdRulesGrid}>
                    <Text
                      style={[
                        styles.pwdRuleText,
                        { color: pwdRules.hasMinLength ? '#10b981' : (isDark ? '#64748b' : '#94a3b8') },
                      ]}
                    >
                      {pwdRules.hasMinLength ? '✓' : '•'} 8+ chars
                    </Text>
                    <Text
                      style={[
                        styles.pwdRuleText,
                        { color: pwdRules.hasUpper ? '#10b981' : (isDark ? '#64748b' : '#94a3b8') },
                      ]}
                    >
                      {pwdRules.hasUpper ? '✓' : '•'} Upper (A-Z)
                    </Text>
                    <Text
                      style={[
                        styles.pwdRuleText,
                        { color: pwdRules.hasLower ? '#10b981' : (isDark ? '#64748b' : '#94a3b8') },
                      ]}
                    >
                      {pwdRules.hasLower ? '✓' : '•'} Lower (a-z)
                    </Text>
                    <Text
                      style={[
                        styles.pwdRuleText,
                        { color: pwdRules.hasNumber ? '#10b981' : (isDark ? '#64748b' : '#94a3b8') },
                      ]}
                    >
                      {pwdRules.hasNumber ? '✓' : '•'} Number (0-9)
                    </Text>
                    <Text
                      style={[
                        styles.pwdRuleText,
                        { color: pwdRules.hasSpecial ? '#10b981' : (isDark ? '#64748b' : '#94a3b8') },
                      ]}
                    >
                      {pwdRules.hasSpecial ? '✓' : '•'} Special (!@#$)
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Profile Photo Upload */}
            <View style={styles.fieldGroup}>
              <View style={styles.faceLabelRow}>
                <Text style={[styles.label, labelThemeStyle]}>
                  📷 Profile Photo <Text style={styles.requiredMark}>*</Text>
                </Text>
                {faceImage && (
                  <TouchableOpacity onPress={() => setFaceImage(null)}>
                    <Text style={styles.removePhotoText}>🗑️ Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View
                style={[
                  styles.faceUploadBox,
                  inputBaseStyle,
                  errors.faceImage ? styles.inputError : null,
                ]}
              >
                <Animated.View
                  style={[
                    styles.avatarCircle,
                    {
                      backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                      borderColor: faceImage ? '#10b981' : (isDark ? '#38bdf8' : '#2563eb'),
                      borderWidth: 2,
                      transform: [{ scale: faceImage ? 1 : avatarPulseAnim }],
                    },
                  ]}
                >
                  <Image
                    source={faceImage ? { uri: faceImage } : { uri: DEFAULT_AVATAR_SVG }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                </Animated.View>

                <TouchableOpacity
                  style={[
                    styles.uploadButton,
                    {
                      backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                      borderColor: errors.faceImage ? '#ef4444' : (isDark ? '#38bdf8' : '#1b3569'),
                    },
                  ]}
                  onPress={handleChoosePhoto}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.uploadButtonText,
                      { color: errors.faceImage ? '#ef4444' : (isDark ? '#38bdf8' : '#1b3569') },
                    ]}
                  >
                    {faceImage ? '🔄 Change Photo' : '🖼️ Upload Photo *'}
                  </Text>
                </TouchableOpacity>
              </View>
              {errors.faceImage ? <Text style={styles.errorText}>{errors.faceImage}</Text> : null}
            </View>

            {/* Global Form Error Banner */}
            {errors.form ? (
              <View style={styles.formErrorBanner}>
                <Text style={styles.formErrorText}>⚠️ {errors.form}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryButton, primaryBtnStyle]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <View style={styles.submittingRow}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.primaryButtonText}>Submitting Registration...</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>📤 Submit for Approval</Text>
              )}
            </TouchableOpacity>

            {/* Footer toggle */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Already registered?{' '}
              </Text>
              <TouchableOpacity onPress={() => switchMode('login')} activeOpacity={0.7}>
                <Text style={[styles.loginLink, linkThemeStyle]}>🔐 Sign In here</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* SIGN IN TO WORKSPACE FORM */
          <View style={styles.formContent}>
            {/* Work Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, labelThemeStyle]}>✉️ Work Email</Text>
              <TextInput
                style={getFieldContainerStyle('workEmail', !!errors.workEmail)}
                placeholder="name@company.com"
                placeholderTextColor={placeholderColor}
                value={workEmail}
                onFocus={() => setFocusedField('workEmail')}
                onBlur={() => setFocusedField(null)}
                onChangeText={(text) => {
                  setWorkEmail(text);
                  if (errors.workEmail) setErrors({ ...errors, workEmail: '' });
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.workEmail ? <Text style={styles.errorText}>{errors.workEmail}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.passwordHeaderRow}>
                <Text style={[styles.label, labelThemeStyle]}>🔒 Password</Text>
                <TouchableOpacity
                  onPress={() => setForgotModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.forgotPasswordLink, linkThemeStyle]}>
                    Forgot?
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.passwordInputContainer,
                  inputBaseStyle,
                  focusedField === 'password' && {
                    borderColor: isDark ? '#38bdf8' : '#2563eb',
                    shadowColor: isDark ? '#38bdf8' : '#2563eb',
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 3,
                  },
                  errors.password ? styles.inputError : null,
                ]}
              >
                <TextInput
                  style={[
                    styles.passwordInput,
                    { color: isDark ? '#f8fafc' : '#0f172a' },
                  ]}
                  placeholder="••••••••••"
                  placeholderTextColor={placeholderColor}
                  value={password}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                >
                  <PasswordEyeIcon
                    visible={showPassword}
                    color={
                      showPassword
                        ? (isDark ? '#38bdf8' : '#2563eb')
                        : (isDark ? '#94a3b8' : '#64748b')
                    }
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Global Form Error Banner */}
            {errors.form ? (
              <View style={styles.formErrorBanner}>
                <Text style={styles.formErrorText}>⚠️ {errors.form}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.primaryButton, primaryBtnStyle]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              {isSubmitting ? (
                <View style={styles.submittingRow}>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text style={styles.primaryButtonText}>Authenticating...</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>🔑 Sign In to Workspace</Text>
              )}
            </TouchableOpacity>

            {/* Footer: New to the company? Register as Employee */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                New to the company?{' '}
              </Text>
              <TouchableOpacity onPress={() => switchMode('register')} activeOpacity={0.7}>
                <Text style={[styles.loginLink, linkThemeStyle]}>📝 Register here</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Hidden File Input for Web */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef as any}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleWebFileChange}
        />
      )}

      {/* Device Storage Permission Modal (Yes / No) */}
      <Modal
        visible={showPermissionDialog}
        transparent
        animationType="fade"
        onRequestClose={() => handlePermissionDecision(false)}
      >
        <View style={styles.permOverlay}>
          <View
            style={[
              styles.permCard,
              {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#e2e8f0',
              },
            ]}
          >
            <View
              style={[
                styles.permIconBadge,
                {
                  backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                  borderColor: isDark ? '#38bdf8' : '#bfdbfe',
                },
              ]}
            >
              <Text style={{ fontSize: 32 }}>📁</Text>
            </View>

            <Text style={[styles.permHeading, { color: colors.textPrimary }]}>
              Device Storage Access
            </Text>

            <Text style={[styles.permDescription, { color: isDark ? '#cbd5e1' : '#475569' }]}>
              Allow DocuVault to access files on this device so you can browse your file manager and select your profile photo?
            </Text>

            <Text style={[styles.permSecurityNote, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              🔒 Only the photo you choose will be uploaded.
            </Text>

            <View style={styles.permBtnRow}>
              <TouchableOpacity
                style={[
                  styles.permDenyBtn,
                  {
                    backgroundColor: isDark ? '#334155' : '#f1f5f9',
                    borderColor: isDark ? '#475569' : '#cbd5e1',
                  },
                ]}
                onPress={() => handlePermissionDecision(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.permDenyBtnText, { color: isDark ? '#f1f5f9' : '#475569' }]}>
                  ✕ No / Deny
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.permAllowBtn,
                  {
                    backgroundColor: isDark ? '#2563eb' : '#1b3569',
                  },
                ]}
                onPress={() => handlePermissionDecision(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.permAllowBtnText}>✓ Yes / Allow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Submission Confirmation Modal */}
      <Modal
        visible={submittedModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleReset}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#e2e8f0',
                borderWidth: isDark ? 1.5 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.successIconCircle,
                mode === 'register' ? { backgroundColor: '#fef3c7' } : null,
              ]}
            >
              <Text
                style={[
                  styles.checkmarkText,
                  mode === 'register' ? { color: '#d97706' } : null,
                ]}
              >
                {mode === 'register' ? '⏳' : '✓'}
              </Text>
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {mode === 'register' ? 'Approval Request Sent!' : 'Welcome Back!'}
            </Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              {mode === 'register'
                ? `Thank you, ${fullName || 'Employee'}! Your registration request has been submitted and sent to the Administrator for approval.\n\nOnce an admin reviews and approves your account, you will be able to log in with your work email and password.`
                : `Successfully authenticated as ${workEmail}. Redirecting to your workspace...`}
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, primaryBtnStyle]}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>
                {mode === 'register' ? 'Return to Sign In 🔐' : 'Enter Workspace 🚀'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setForgotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#e2e8f0',
                borderWidth: isDark ? 1.5 : 1,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Reset Password</Text>
            <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
              Enter your work email address and we&apos;ll send you instructions to reset your password.
            </Text>
            <TextInput
              style={[
                styles.input,
                inputBaseStyle,
                { width: '100%', marginBottom: 16 },
              ]}
              placeholder="name@company.com"
              placeholderTextColor={placeholderColor}
              value={forgotEmail}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {forgotSent ? (
              <Text style={{ color: '#10b981', fontSize: 13, marginBottom: 12, fontWeight: '600' }}>
                ✓ Reset instructions sent to your email!
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    flex: 1,
                    backgroundColor: isDark ? '#1f293d' : '#e2e8f0',
                  },
                ]}
                onPress={() => setForgotModalVisible(false)}
              >
                <Text style={{ color: isDark ? '#94a3b8' : '#475569', fontWeight: '600', fontSize: 14 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, primaryBtnStyle, { flex: 1 }]}
                onPress={handleSendResetLink}
              >
                <Text style={styles.modalButtonText}>Send Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
  },
  modeTabsContainer: {
    flexDirection: 'row',
    position: 'relative',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    height: 48,
    alignItems: 'center',
  },
  modeTabActivePill: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '50%',
    borderRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  modeTab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  modeTabText: {
    fontSize: 14,
    letterSpacing: -0.2,
  },
  titleHeaderWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },

  formContent: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordLink: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  faceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removePhotoText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  passwordInputContainer: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  eyeButton: {
    padding: 8,
  },
  inputError: {
    borderColor: '#ef4444 !important' as any,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 3,
    fontWeight: '500',
  },
  faceUploadBox: {
    height: 72,
    borderWidth: 1.5,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 50,
    height: 50,
  },
  uploadButton: {
    flex: 1,
    marginLeft: 14,
    height: 44,
    borderWidth: 1.5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  primaryButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  footerText: {
    fontSize: 13.5,
  },
  loginLink: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  successIconCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmarkText: {
    fontSize: 30,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalButton: {
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
  permOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999,
  },
  permCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  permIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 16,
  },
  permHeading: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  permDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 12,
  },
  permSecurityNote: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  permDenyBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permDenyBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  permAllowBtn: {
    flex: 1.25,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1b3569',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  permAllowBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  formErrorBanner: {
    backgroundColor: '#fee2e2',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  formErrorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
  },
  requiredMark: {
    color: '#ef4444',
    fontWeight: '700',
  },
  pwdStrengthWrapper: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  pwdProgressBar: {
    height: 5,
    backgroundColor: '#cbd5e1',
    borderRadius: 3,
    overflow: 'hidden',
  },
  pwdProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  pwdStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  pwdStrengthLabel: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  pwdHintText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  pwdRulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pwdRuleText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
});
