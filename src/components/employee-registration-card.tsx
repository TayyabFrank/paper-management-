import { useAuth } from '@/context/auth-context';
import { useDocuVaultTheme } from '@/context/theme-context';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
      // Eye Open (password visible)
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
    // Eye Slashed / Closed (password hidden)
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

  // Native iOS / Android fallback
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

  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  if (prevInitialMode !== initialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pwdRules = {
    hasMinLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  const passwordScore = Object.values(pwdRules).filter(Boolean).length;

  const getScoreColor = (score: number) => {
    if (score <= 1) return '#ef4444';
    if (score <= 3) return '#f59e0b';
    if (score === 4) return '#3b82f6';
    return '#16a34a';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 1) return 'Weak Password';
    if (score <= 3) return 'Moderate Password';
    if (score === 4) return 'Good Password';
    return 'Strong Password ✓';
  };

  const switchMode = (newMode: 'register' | 'login') => {
    setMode(newMode);
    setErrors({});
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleChoosePhoto = () => {
    setShowPermissionDialog(true);
  };

  const handlePermissionDecision = async (allow: boolean) => {
    setShowPermissionDialog(false);
    if (!allow) {
      return;
    }

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
      // 1. Compulsory Full Name
      if (!fullName.trim()) {
        newErrors.fullName = 'Full Name is required';
      }

      // 2. Compulsory Work Email
      if (!workEmail.trim()) {
        newErrors.workEmail = 'Work Email is required';
      } else if (!/\S+@\S+\.\S+/.test(workEmail)) {
        newErrors.workEmail = 'Please enter a valid work email';
      }

      // 3. Compulsory Strong Password
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

      // 4. Compulsory Profile Photo / Image
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
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const cleanLoginEmail = workEmail.trim().toLowerCase() === 'admin' ? 'admin@enterprise.com' : workEmail.trim();
        const result = await login(cleanLoginEmail, password);
        setIsSubmitting(false);
        if (!result.success) {
          setErrors({ form: result.error || 'Authentication failed' });
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
          return;
        }
        setSubmittedModalVisible(true);
      }
    } catch {
      setIsSubmitting(false);
      setErrors({ form: 'An unexpected error occurred. Please try again.' });
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

  // Dynamic theme styles
  const cardThemeStyle = {
    backgroundColor: isDark ? '#111827' : '#ebf1f8',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.09)' : '#d7e1ee',
    shadowColor: isDark ? '#000000' : '#1e3a8a',
  };
  const labelThemeStyle = { color: isDark ? '#94a3b8' : '#556882' };
  const inputThemeStyle = {
    backgroundColor: isDark ? '#162033' : '#f1f5fa',
    borderColor: isDark ? '#27354f' : '#c6d4e4',
    color: isDark ? '#f8fafc' : '#1e293b',
  };
  const placeholderColor = isDark ? '#64748b' : '#94a3b8';
  const primaryBtnStyle = {
    backgroundColor: isDark ? '#2563eb' : '#1b3569',
    shadowColor: isDark ? '#38bdf8' : '#1b3569',
  };
  const linkThemeStyle = { color: isDark ? '#38bdf8' : '#1e40af' };

  return (
    <View style={[styles.cardContainer, cardThemeStyle]}>
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

      {/* Interactive Switcher Tabs: Sign In vs Register */}
      <View style={[styles.modeTabsContainer, { backgroundColor: isDark ? '#162033' : '#dbe5f1' }]}>
        <TouchableOpacity
          style={[
            styles.modeTab,
            mode === 'login' && [styles.modeTabActive, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }],
          ]}
          onPress={() => switchMode('login')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'login' }}
        >
          <Text
            style={[
              styles.modeTabText,
              mode === 'login' && styles.modeTabTextActive,
              { color: mode === 'login' ? '#ffffff' : (isDark ? '#94a3b8' : '#556882') },
            ]}
          >
            🔐 Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            mode === 'register' && [styles.modeTabActive, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }],
          ]}
          onPress={() => switchMode('register')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected: mode === 'register' }}
        >
          <Text
            style={[
              styles.modeTabText,
              mode === 'register' && styles.modeTabTextActive,
              { color: mode === 'register' ? '#ffffff' : (isDark ? '#94a3b8' : '#556882') },
            ]}
          >
            📝 Register
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card Header Title */}
      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
        {mode === 'register' ? '📝 Employee Registration' : '🔐 Sign In to Workspace'}
      </Text>

      {mode === 'register' ? (
        /* REGISTRATION FORM */
        <View style={styles.formContent}>
          {/* Full Name */}
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, labelThemeStyle]}>
              👤 Full Name <Text style={styles.requiredMark}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, inputThemeStyle, errors.fullName ? styles.inputError : null]}
              placeholder="John Doe"
              placeholderTextColor={placeholderColor}
              value={fullName}
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
              style={[styles.input, inputThemeStyle, errors.workEmail ? styles.inputError : null]}
              placeholder="name@company.com"
              placeholderTextColor={placeholderColor}
              value={workEmail}
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
              🔒 Password <Text style={styles.requiredMark}></Text>
            </Text>
            <View style={[styles.passwordInputContainer, inputThemeStyle, errors.password ? styles.inputError : null]}>
              <TextInput
                style={[styles.passwordInput, { color: isDark ? '#f8fafc' : '#1e293b' }]}
                placeholder="Enter strong password"
                placeholderTextColor={placeholderColor}
                value={password}
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
                  color={showPassword ? (isDark ? '#38bdf8' : '#1b3569') : (isDark ? '#94a3b8' : '#64748b')}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Real-time Password Strength Meter in Register Mode */}
            {password.length > 0 && (
              <View style={styles.pwdStrengthWrapper}>
                <View style={styles.pwdProgressBar}>
                  <View
                    style={[
                      styles.pwdProgressFill,
                      {
                        width: `${(passwordScore / 5) * 100}%`,
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
                  <Text style={[styles.pwdRuleText, { color: pwdRules.hasMinLength ? '#16a34a' : (isDark ? '#94a3b8' : '#64748b') }]}>
                    {pwdRules.hasMinLength ? '✓' : '•'} 8+ characters
                  </Text>
                  <Text style={[styles.pwdRuleText, { color: pwdRules.hasUpper ? '#16a34a' : (isDark ? '#94a3b8' : '#64748b') }]}>
                    {pwdRules.hasUpper ? '✓' : '•'} Uppercase (A-Z)
                  </Text>
                  <Text style={[styles.pwdRuleText, { color: pwdRules.hasLower ? '#16a34a' : (isDark ? '#94a3b8' : '#64748b') }]}>
                    {pwdRules.hasLower ? '✓' : '•'} Lowercase (a-z)
                  </Text>
                  <Text style={[styles.pwdRuleText, { color: pwdRules.hasNumber ? '#16a34a' : (isDark ? '#94a3b8' : '#64748b') }]}>
                    {pwdRules.hasNumber ? '✓' : '•'} Number (0-9)
                  </Text>
                  <Text style={[styles.pwdRuleText, { color: pwdRules.hasSpecial ? '#16a34a' : (isDark ? '#94a3b8' : '#64748b') }]}>
                    {pwdRules.hasSpecial ? '✓' : '•'} Symbol (!@#$%...)
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Face Image */}
          <View style={styles.fieldGroup}>
            <View style={styles.faceLabelRow}>
              <Text style={[styles.label, labelThemeStyle]}>
                📷 Profile Photo <Text style={styles.requiredMark}></Text>
              </Text>
              {faceImage && (
                <TouchableOpacity onPress={() => setFaceImage(null)}>
                  <Text style={styles.removePhotoText}>🗑️ Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={[styles.faceUploadBox, inputThemeStyle, errors.faceImage ? styles.inputError : null]}>
              <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#28364e' : '#cbd5e1' }]}>
                <Image
                  source={faceImage ? { uri: faceImage } : { uri: DEFAULT_AVATAR_SVG }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  {
                    backgroundColor: isDark ? '#1e293b' : '#f1f5fa',
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
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>📤 Submit Registration for Approval</Text>
            )}
          </TouchableOpacity>

          {/* Footer toggle */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Already registered? </Text>
            <TouchableOpacity onPress={() => switchMode('login')} activeOpacity={0.7}>
              <Text style={[styles.loginLink, linkThemeStyle]}>🔐 Login</Text>
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
              style={[styles.input, inputThemeStyle, errors.workEmail ? styles.inputError : null]}
              placeholder="name@company.com"
              placeholderTextColor={placeholderColor}
              value={workEmail}
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
            <Text style={[styles.label, labelThemeStyle]}>🔒 Password</Text>

            <View style={[styles.passwordInputContainer, inputThemeStyle]}>
              <TextInput
                style={[styles.passwordInput, { color: isDark ? '#f8fafc' : '#1e293b' }, errors.password ? styles.inputError : null]}
                placeholder="••••••••••"
                placeholderTextColor={placeholderColor}
                value={password}
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
                  color={showPassword ? (isDark ? '#38bdf8' : '#1b3569') : (isDark ? '#94a3b8' : '#64748b')}
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
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>🔑 Login</Text>
            )}
          </TouchableOpacity>

          {/* Footer: New to the company? Register as Employee */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>New to the company? </Text>
            <TouchableOpacity onPress={() => switchMode('register')} activeOpacity={0.7}>
              <Text style={[styles.loginLink, linkThemeStyle]}>📝 Register as Employee</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
                borderColor: isDark ? '#334155' : '#e2e8f0',
              },
            ]}
          >
            {/* Icon Header */}
            <View
              style={[
                styles.permIconBadge,
                {
                  backgroundColor: isDark ? '#0f172a' : '#eff6ff',
                  borderColor: isDark ? '#3b82f6' : '#bfdbfe',
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

            {/* Yes / No Action Buttons */}
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
                <Text style={styles.permAllowBtnText}>
                  ✓ Yes / Allow
                </Text>
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
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <View style={[styles.successIconCircle, mode === 'register' ? { backgroundColor: '#fef3c7' } : null]}>
              <Text style={[styles.checkmarkText, mode === 'register' ? { color: '#d97706' } : null]}>
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
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderWidth: isDark ? 1 : 0,
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
                inputThemeStyle,
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
              <Text style={{ color: '#16a34a', fontSize: 13, marginBottom: 12, fontWeight: '500' }}>
                Reset instructions sent to your email!
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
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    backgroundColor: '#ebf1f8',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: '#d7e1ee',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  modeTabsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  modeTabTextActive: {
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a2333',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  formContent: {
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#556882',
    letterSpacing: -0.1,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordLink: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
  },
  faceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removePhotoText: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  input: {
    height: 48,
    backgroundColor: '#f1f5fa',
    borderWidth: 1.5,
    borderColor: '#c6d4e4',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1e293b',
  },
  passwordInputContainer: {
    height: 48,
    backgroundColor: '#f1f5fa',
    borderWidth: 1.5,
    borderColor: '#c6d4e4',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 14,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1e293b',
  },
  eyeButton: {
    padding: 6,
  },
  eyeIcon: {
    width: 20,
    height: 20,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#dc2626',
    marginTop: 2,
  },
  faceUploadBox: {
    height: 64,
    backgroundColor: '#f1f5fa',
    borderWidth: 1.5,
    borderColor: '#c6d4e4',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  uploadButton: {
    flex: 1,
    marginLeft: 14,
    height: 42,
    backgroundColor: '#f1f5fa',
    borderWidth: 1.5,
    borderColor: '#1b3569',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1b3569',
    letterSpacing: -0.1,
  },
  primaryButton: {
    height: 48,
    backgroundColor: '#1b3569',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#1b3569',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  footerText: {
    fontSize: 14,
    color: '#64748b',
  },
  loginLink: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 26,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmarkText: {
    fontSize: 28,
    color: '#16a34a',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1b3569',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  permOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    zIndex: 9999,
  },
  permCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
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
    borderRadius: 14,
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
    borderRadius: 14,
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
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
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
    marginTop: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  pwdProgressBar: {
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  pwdProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  pwdStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  pwdStrengthLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  pwdHintText: {
    fontSize: 11,
    fontWeight: '500',
  },
  pwdRulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pwdRuleText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
