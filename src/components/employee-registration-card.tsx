import { useAuth } from '@/context/auth-context';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useResponsive } from '@/hooks/use-responsive';
import { FadeInView, ScalePressable, PulseView } from '@/components/ui/animated-components';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
          strokeWidth="2.2"
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
        strokeWidth="2.2"
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
  const { isSmallPhone, isTablet, isDesktop, width } = useResponsive();
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'camera' | 'upload' | null>(null);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user');
  const [capturedPhotoDraft, setCapturedPhotoDraft] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturingNative, setIsCapturingNative] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedModalVisible, setSubmittedModalVisible] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Active focus tracking for crisp input borders
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [prevInitialMode, setPrevInitialMode] = useState(initialMode);
  if (prevInitialMode !== initialMode) {
    setPrevInitialMode(initialMode);
    setMode(initialMode);
  }

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraFileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

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
    return '#10b981';
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

  const startWebCamera = async (facing: 'user' | 'environment' = 'user') => {
    if (Platform.OS !== 'web') return;
    setCameraError(null);
    setCapturedPhotoDraft(null);
    stopCameraStream();

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live camera preview is not supported on this browser. You can use the file/camera picker below.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('getUserMedia error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser or choose Upload Photo.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please connect a webcam or choose Upload Photo.');
      } else {
        setCameraError('Unable to open camera: ' + (err.message || 'Check browser permissions.'));
      }
    }
  };

  const handleOpenCamera = async () => {
    if (errors.faceImage) {
      setErrors((prev) => ({ ...prev, faceImage: '' }));
    }

    if (Platform.OS === 'web') {
      setCameraModalVisible(true);
      setCapturedPhotoDraft(null);
      setCameraError(null);
      setTimeout(() => {
        startWebCamera(cameraFacing);
      }, 100);
      return;
    }

    // Native iOS / Android camera
    try {
      setIsCapturingNative(true);
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        alert('Camera permission is required to capture your profile photo.');
        setIsCapturingNative(false);
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });

      setIsCapturingNative(false);
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setFaceImage(uri);
        setImageSource('camera');
      }
    } catch (err) {
      setIsCapturingNative(false);
      console.error('Camera error:', err);
    }
  };

  const handleCaptureWebSnapshot = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (cameraFacing === 'user') {
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, w, h);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedPhotoDraft(dataUrl);
      stopCameraStream();
    } catch (err) {
      console.error('Snapshot capture error:', err);
    }
  };

  const handleConfirmWebSnapshot = () => {
    if (capturedPhotoDraft) {
      setFaceImage(capturedPhotoDraft);
      setImageSource('camera');
      if (errors.faceImage) {
        setErrors((prev) => ({ ...prev, faceImage: '' }));
      }
      closeCameraModal();
    }
  };

  const handleRetakeWebSnapshot = () => {
    setCapturedPhotoDraft(null);
    startWebCamera(cameraFacing);
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(nextFacing);
    startWebCamera(nextFacing);
  };

  const closeCameraModal = () => {
    stopCameraStream();
    setCameraModalVisible(false);
    setCapturedPhotoDraft(null);
    setCameraError(null);
  };

  const handleFallbackCameraInput = () => {
    closeCameraModal();
    if (Platform.OS === 'web' && cameraFileInputRef.current) {
      cameraFileInputRef.current.click();
    }
  };

  const handleUploadPhoto = async () => {
    if (errors.faceImage) {
      setErrors((prev) => ({ ...prev, faceImage: '' }));
    }

    if (Platform.OS === 'web') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    // Native iOS / Android photo gallery
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setShowPermissionDialog(true);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const uri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setFaceImage(uri);
        setImageSource('upload');
      }
    } catch {
      setShowPermissionDialog(true);
    }
  };

  const handleRemovePhoto = () => {
    setFaceImage(null);
    setImageSource(null);
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
        setImageSource('upload');
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
          setImageSource('upload');
          if (errors.faceImage) {
            setErrors((prev) => ({ ...prev, faceImage: '' }));
          }
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleWebCameraFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFaceImage(uploadEvent.target.result as string);
          setImageSource('camera');
          if (errors.faceImage) {
            setErrors((prev) => ({ ...prev, faceImage: '' }));
          }
        }
      };
      reader.readAsDataURL(file);
      e.target.value = '';
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

      // 4. Compulsory Profile Photo / Image (Camera or Upload)
      if (!faceImage) {
        newErrors.faceImage = 'Profile photo is required. Please capture via Camera or upload a photo to register.';
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
        const cleanLoginEmail = workEmail.trim().toLowerCase() === 'admin' ? 'tayyab@admin.com' : workEmail.trim();
        const result = await login(cleanLoginEmail, password);
        setIsSubmitting(false);
        if (!result.success) {
          setErrors({ form: result.error || 'Authentication failed. Check your email & password.' });
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

  // High-Contrast Theme Styles
  const cardThemeStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? 'rgba(56, 189, 248, 0.28)' : '#cbd5e1',
    shadowColor: isDark ? '#38bdf8' : '#0f172a',
  };

  const labelThemeStyle = {
    color: isDark ? '#f8fafc' : '#0f172a',
  };

  const getInputStyle = (fieldName: string, isError: boolean) => {
    const isFocused = focusedField === fieldName;
    if (isError) {
      return {
        backgroundColor: isDark ? '#1a1016' : '#fff5f5',
        borderColor: '#ef4444',
        borderWidth: 2,
        color: isDark ? '#ffffff' : '#0f172a',
      };
    }
    if (isFocused) {
      return {
        backgroundColor: isDark ? '#162033' : '#ffffff',
        borderColor: isDark ? '#38bdf8' : '#2563eb',
        borderWidth: 2,
        color: isDark ? '#ffffff' : '#0f172a',
      };
    }
    return {
      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
      borderColor: isDark ? '#334155' : '#cbd5e1',
      borderWidth: 1.5,
      color: isDark ? '#ffffff' : '#0f172a',
    };
  };

  const placeholderColor = isDark ? '#64748b' : '#94a3b8';
  const primaryBtnStyle = {
    backgroundColor: isDark ? '#2563eb' : '#1b3569',
    shadowColor: isDark ? '#38bdf8' : '#1b3569',
  };
  const linkThemeStyle = { color: isDark ? '#38bdf8' : '#2563eb' };

  return (
    <View
      style={[
        styles.cardContainer,
        cardThemeStyle,
        {
          paddingHorizontal: isSmallPhone ? 16 : isTablet || isDesktop ? 32 : 26,
          paddingTop: isSmallPhone ? 20 : isTablet || isDesktop ? 30 : 26,
          paddingBottom: isSmallPhone ? 24 : isTablet || isDesktop ? 34 : 30,
          borderRadius: isSmallPhone ? 20 : 28,
        },
      ]}
    >
      {/* Hidden file inputs for web upload and fallback camera */}
      {Platform.OS === 'web' && (
        <>
          <input
            type="file"
            ref={fileInputRef as any}
            onChange={handleWebFileChange as any}
            accept="image/*"
            style={{ display: 'none' }}
          />
          <input
            type="file"
            ref={cameraFileInputRef as any}
            onChange={handleWebCameraFileChange as any}
            accept="image/*"
            capture="user"
            style={{ display: 'none' }}
          />
        </>
      )}

      {/* Interactive Switcher Tabs: Sign In vs Register (Equally Balanced 50/50 Control) */}
      <View
        style={[
          styles.modeTabsContainer,
          {
            backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
            borderColor: isDark ? '#334155' : '#cbd5e1',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.modeTab,
            mode === 'login' && [
              styles.modeTabActive,
              {
                backgroundColor: isDark ? '#2563eb' : '#1b3569',
                shadowColor: isDark ? '#38bdf8' : '#1b3569',
              },
            ],
          ]}
          onPress={() => switchMode('login')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityLabel="Sign In Tab"
        >
          <Text
            style={[
              styles.modeTabText,
              mode === 'login' && styles.modeTabTextActive,
              { color: mode === 'login' ? '#ffffff' : (isDark ? '#94a3b8' : '#475569') },
            ]}
          >
            🔐 Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeTab,
            mode === 'register' && [
              styles.modeTabActive,
              {
                backgroundColor: isDark ? '#2563eb' : '#1b3569',
                shadowColor: isDark ? '#38bdf8' : '#1b3569',
              },
            ],
          ]}
          onPress={() => switchMode('register')}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityLabel="Register Tab"
        >
          <Text
            style={[
              styles.modeTabText,
              mode === 'register' && styles.modeTabTextActive,
              { color: mode === 'register' ? '#ffffff' : (isDark ? '#94a3b8' : '#475569') },
            ]}
          >
            📝 Register
          </Text>
        </TouchableOpacity>
      </View>

      {/* Card Header Title and Subtitle */}
      <View style={styles.cardHeaderBox}>
        <Text
          style={[
            styles.cardTitle,
            {
              color: isDark ? '#ffffff' : '#0f172a',
              fontSize: isSmallPhone ? 19 : isTablet || isDesktop ? 23 : 21,
            },
          ]}
        >
          {mode === 'register' ? 'Employee Registration' : 'Sign In to Workspace'}
        </Text>
        <Text
          style={[
            styles.cardSubtitle,
            { color: isDark ? '#94a3b8' : '#64748b' },
          ]}
        >
          {mode === 'register'
            ? 'Complete your profile for verified workplace access'
            : 'Access enterprise documents, forms, and workflows'}
        </Text>
      </View>

      {mode === 'register' ? (
        /* ================= REGISTRATION FORM ================= */
        <FadeInView key="register-mode" delay={0} duration={240}>
          <View style={[styles.formContent, { gap: isSmallPhone ? 14 : 18 }]}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, labelThemeStyle]}>
                👤 Full Name <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  getInputStyle('fullName', !!errors.fullName),
                ]}
                placeholder="e.g. John Doe"
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
              {errors.fullName ? <Text style={styles.errorText}>⚠️ {errors.fullName}</Text> : null}
            </View>

            {/* Work Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, labelThemeStyle]}>
                ✉️ Work Email <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  getInputStyle('workEmail', !!errors.workEmail),
                ]}
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
              {errors.workEmail ? <Text style={styles.errorText}>⚠️ {errors.workEmail}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, labelThemeStyle]}>
                🔒 Password <Text style={styles.requiredMark}>*</Text>
              </Text>
              <View
                style={[
                  styles.passwordInputContainer,
                  getInputStyle('password', !!errors.password),
                ]}
              >
                <TextInput
                  style={[
                    styles.passwordInput,
                    { color: isDark ? '#ffffff' : '#0f172a' },
                  ]}
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
                  style={[
                    styles.eyeButton,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                >
                  <PasswordEyeIcon
                    visible={showPassword}
                    color={showPassword ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b')}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>⚠️ {errors.password}</Text> : null}

              {/* Real-time Password Strength Meter */}
              {password.length > 0 && (
                <View
                  style={[
                    styles.pwdStrengthWrapper,
                    {
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                      borderColor: isDark ? '#334155' : '#e2e8f0',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.pwdProgressBar,
                      { backgroundColor: isDark ? '#334155' : '#e2e8f0' },
                    ]}
                  >
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
                    <Text
                      style={[
                        styles.pwdHintText,
                        { color: isDark ? '#cbd5e1' : '#475569' },
                      ]}
                    >
                      {passwordScore === 5 ? '✓ All requirements met' : `${passwordScore}/5 met`}
                    </Text>
                  </View>
                  <View style={styles.pwdRulesGrid}>
                    <View
                      style={[
                        styles.ruleBadge,
                        pwdRules.hasMinLength
                          ? { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', borderColor: '#10b981' }
                          : { backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pwdRuleText,
                          { color: pwdRules.hasMinLength ? '#10b981' : (isDark ? '#94a3b8' : '#64748b') },
                        ]}
                      >
                        {pwdRules.hasMinLength ? '✓' : '•'} 8+ chars
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.ruleBadge,
                        pwdRules.hasUpper
                          ? { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', borderColor: '#10b981' }
                          : { backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pwdRuleText,
                          { color: pwdRules.hasUpper ? '#10b981' : (isDark ? '#94a3b8' : '#64748b') },
                        ]}
                      >
                        {pwdRules.hasUpper ? '✓' : '•'} Uppercase
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.ruleBadge,
                        pwdRules.hasLower
                          ? { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', borderColor: '#10b981' }
                          : { backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pwdRuleText,
                          { color: pwdRules.hasLower ? '#10b981' : (isDark ? '#94a3b8' : '#64748b') },
                        ]}
                      >
                        {pwdRules.hasLower ? '✓' : '•'} Lowercase
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.ruleBadge,
                        pwdRules.hasNumber
                          ? { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', borderColor: '#10b981' }
                          : { backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pwdRuleText,
                          { color: pwdRules.hasNumber ? '#10b981' : (isDark ? '#94a3b8' : '#64748b') },
                        ]}
                      >
                        {pwdRules.hasNumber ? '✓' : '•'} Number
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.ruleBadge,
                        pwdRules.hasSpecial
                          ? { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7', borderColor: '#10b981' }
                          : { backgroundColor: isDark ? '#0f172a' : '#f1f5f9', borderColor: isDark ? '#334155' : '#cbd5e1' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.pwdRuleText,
                          { color: pwdRules.hasSpecial ? '#10b981' : (isDark ? '#94a3b8' : '#64748b') },
                        ]}
                      >
                        {pwdRules.hasSpecial ? '✓' : '•'} Symbol
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Profile Photo: High-Visibility Section */}
            <View style={styles.fieldGroup}>
              <View style={styles.faceLabelRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.label, labelThemeStyle]}>
                    👤 Profile Photo <Text style={styles.requiredMark}>*</Text>
                  </Text>
                </View>

                <View
                  style={[
                    styles.mandatoryBadge,
                    {
                      backgroundColor: faceImage
                        ? (isDark ? 'rgba(16, 185, 129, 0.15)' : '#dcfce7')
                        : (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2'),
                      borderColor: faceImage ? '#10b981' : '#ef4444',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.mandatoryBadgeText,
                      { color: faceImage ? (isDark ? '#34d399' : '#15803d') : (isDark ? '#f87171' : '#b91c1c') },
                    ]}
                  >
                    {faceImage ? '✓ Verified Photo' : 'Mandatory *'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.photoSectionCard,
                  {
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: errors.faceImage ? '#ef4444' : (isDark ? '#334155' : '#cbd5e1'),
                    borderWidth: errors.faceImage ? 2 : 1.5,
                  },
                  isSmallPhone && {
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingVertical: 16,
                    gap: 14,
                  },
                ]}
              >
                {/* Avatar Preview */}
                <View
                  style={[
                    styles.avatarCircle,
                    {
                      backgroundColor: isDark ? '#0f172a' : '#cbd5e1',
                      borderColor: faceImage ? '#10b981' : (isDark ? '#38bdf8' : '#2563eb'),
                      borderWidth: faceImage ? 2.5 : 1,
                    },
                  ]}
                >
                  <Image
                    source={faceImage ? { uri: faceImage } : { uri: DEFAULT_AVATAR_SVG }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                  {faceImage && (
                    <View style={styles.avatarVerifiedDot}>
                      <Text style={{ fontSize: 9, color: '#ffffff', fontWeight: '900' }}>✓</Text>
                    </View>
                  )}
                </View>

                {/* Photo Controls Area */}
                <View style={[styles.photoControlsContainer, isSmallPhone && { width: '100%', alignItems: 'center' }]}>
                  {faceImage ? (
                    <View style={{ gap: 8, width: '100%' }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                        }}
                      >
                        <Text style={[styles.photoStatusText, { color: isDark ? '#38bdf8' : '#1b3569' }]}>
                          {imageSource === 'camera' ? '📸 Captured via Camera' : '📁 Uploaded from Device'}
                        </Text>
                        <TouchableOpacity onPress={handleRemovePhoto} activeOpacity={0.7}>
                          <Text style={styles.removePhotoText}>🗑️ Remove</Text>
                        </TouchableOpacity>
                      </View>
                      <View
                        style={[
                          styles.photoActionButtonsRow,
                          isSmallPhone && { flexDirection: 'column', width: '100%', gap: 8 },
                        ]}
                      >
                        <TouchableOpacity
                          style={[
                            styles.photoMiniBtn,
                            {
                              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#eff6ff',
                              borderColor: isDark ? '#38bdf8' : '#2563eb',
                            },
                            isSmallPhone && { width: '100%', height: 40 },
                          ]}
                          onPress={handleOpenCamera}
                          disabled={isCapturingNative}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.photoMiniBtnText, { color: isDark ? '#38bdf8' : '#1d4ed8' }]}>
                            📸 Retake Camera
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.photoMiniBtn,
                            {
                              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                              borderColor: isDark ? '#64748b' : '#94a3b8',
                            },
                            isSmallPhone && { width: '100%', height: 40 },
                          ]}
                          onPress={handleUploadPhoto}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.photoMiniBtnText, { color: isDark ? '#f8fafc' : '#334155' }]}>
                            📁 Change File
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={{ gap: 8, width: '100%' }}>
                      <Text
                        style={[
                          styles.photoChoiceHint,
                          {
                            color: isDark ? '#f1f5f9' : '#1e293b',
                            textAlign: isSmallPhone ? 'center' : 'left',
                          },
                        ]}
                      >
                        Choose an option to attach your photo <Text style={styles.requiredMark}>*</Text>
                      </Text>
                      <View
                        style={[
                          styles.photoActionButtonsRow,
                          isSmallPhone && { flexDirection: 'column', width: '100%', gap: 8 },
                        ]}
                      >
                        {/* Option 1: Open Camera */}
                        <TouchableOpacity
                          style={[
                            styles.photoOptionBtn,
                            {
                              backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#eff6ff',
                              borderColor: isDark ? '#38bdf8' : '#2563eb',
                            },
                            isSmallPhone && { width: '100%', flex: undefined, height: 42 },
                          ]}
                          onPress={handleOpenCamera}
                          disabled={isCapturingNative}
                          activeOpacity={0.8}
                        >
                          {isCapturingNative ? (
                            <ActivityIndicator size="small" color={isDark ? '#38bdf8' : '#1b3569'} />
                          ) : (
                            <Text
                              style={[
                                styles.photoOptionBtnText,
                                { color: isDark ? '#38bdf8' : '#1d4ed8' },
                              ]}
                            >
                              📸 Open Camera
                            </Text>
                          )}
                        </TouchableOpacity>

                        {/* Option 2: Upload Photo */}
                        <TouchableOpacity
                          style={[
                            styles.photoOptionBtn,
                            {
                              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#ffffff',
                              borderColor: isDark ? '#64748b' : '#94a3b8',
                            },
                            isSmallPhone && { width: '100%', flex: undefined, height: 42 },
                          ]}
                          onPress={handleUploadPhoto}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.photoOptionBtnText,
                              { color: isDark ? '#f8fafc' : '#334155' },
                            ]}
                          >
                            📁 Upload Photo
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {errors.faceImage ? (
                <Text style={styles.errorText}>⚠️ {errors.faceImage}</Text>
              ) : (
                <Text
                  style={[
                    styles.photoHelperNote,
                    { color: isDark ? '#94a3b8' : '#64748b' },
                  ]}
                >
                  🔒 Your portrait photo is required for enterprise security verification.
                </Text>
              )}
            </View>

            {/* Global Form Error Banner */}
            {errors.form ? (
              <FadeInView delay={0} scale>
                <View style={styles.formErrorBanner}>
                  <Text style={styles.formErrorText}>⚠️ {errors.form}</Text>
                </View>
              </FadeInView>
            ) : null}

            {/* Submit Button */}
            <ScalePressable
              style={[styles.primaryButton, primaryBtnStyle]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>🚀 Submit Registration for Approval</Text>
              )}
            </ScalePressable>

            {/* Footer toggle */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Already registered?{' '}
              </Text>
              <TouchableOpacity onPress={() => switchMode('login')} activeOpacity={0.7}>
                <Text style={[styles.loginLink, linkThemeStyle]}>Sign In Here →</Text>
              </TouchableOpacity>
            </View>

            {/* Security Guarantee Strip */}
            <View
              style={[
                styles.trustBadgeRow,
                { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' },
              ]}
            >
              <Text style={[styles.trustBadgeItem, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                🔒 256-Bit SSL
              </Text>
              <Text style={[styles.trustBadgeDot, { color: isDark ? '#475569' : '#cbd5e1' }]}>•</Text>
              <Text style={[styles.trustBadgeItem, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                🛡️ ISO 27001
              </Text>
              <Text style={[styles.trustBadgeDot, { color: isDark ? '#475569' : '#cbd5e1' }]}>•</Text>
              <Text style={[styles.trustBadgeItem, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                ⚡ Zero-Trust
              </Text>
            </View>
          </View>
        </FadeInView>
      ) : (
        /* ================= SIGN IN TO WORKSPACE FORM ================= */
        <FadeInView key="login-mode" delay={0} duration={240}>
          <View style={[styles.formContent, { gap: isSmallPhone ? 16 : 20 }]}>
            {/* Work Email */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, labelThemeStyle]}>
                ✉️ Work Email <Text style={styles.requiredMark}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  getInputStyle('workEmail', !!errors.workEmail),
                ]}
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
              {errors.workEmail ? <Text style={styles.errorText}>⚠️ {errors.workEmail}</Text> : null}
            </View>

            {/* Password with Prominent Forgot Password Trigger */}
            <View style={styles.fieldGroup}>
              <View style={styles.passwordHeaderRow}>
                <Text style={[styles.label, labelThemeStyle]}>
                  🔒 Password <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => setForgotModalVisible(true)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={[styles.forgotPasswordLink, { color: isDark ? '#38bdf8' : '#2563eb' }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.passwordInputContainer,
                  getInputStyle('password', !!errors.password),
                ]}
              >
                <TextInput
                  style={[
                    styles.passwordInput,
                    { color: isDark ? '#ffffff' : '#0f172a' },
                  ]}
                  placeholder="Enter your password"
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
                  style={[
                    styles.eyeButton,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    },
                  ]}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                >
                  <PasswordEyeIcon
                    visible={showPassword}
                    color={showPassword ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b')}
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>⚠️ {errors.password}</Text> : null}
            </View>

            {/* Global Form Error Banner */}
            {errors.form ? (
              <FadeInView delay={0} scale>
                <View style={styles.formErrorBanner}>
                  <Text style={styles.formErrorText}>⚠️ {errors.form}</Text>
                </View>
              </FadeInView>
            ) : null}

            {/* Login Button */}
            <ScalePressable
              style={[styles.primaryButton, primaryBtnStyle]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>🔑 Sign In to Workspace</Text>
              )}
            </ScalePressable>

            {/* Footer: New to the company? Register as Employee */}
            <View style={styles.footerRow}>
              <Text style={[styles.footerText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                New to DocuVault?{' '}
              </Text>
              <TouchableOpacity onPress={() => switchMode('register')} activeOpacity={0.7}>
                <Text style={[styles.loginLink, linkThemeStyle]}>Register as Employee →</Text>
              </TouchableOpacity>
            </View>

            {/* Security Guarantee Strip */}
            <View
              style={[
                styles.trustBadgeRow,
                { borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' },
              ]}
            >
              <Text style={[styles.trustBadgeItem, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                🔒 256-Bit SSL
              </Text>
              <Text style={[styles.trustBadgeDot, { color: isDark ? '#475569' : '#cbd5e1' }]}>•</Text>
              <Text style={[styles.trustBadgeItem, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                🛡️ ISO 27001
              </Text>
              <Text style={[styles.trustBadgeDot, { color: isDark ? '#475569' : '#cbd5e1' }]}>•</Text>
              <Text style={[styles.trustBadgeItem, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                ⚡ Zero-Trust
              </Text>
            </View>
          </View>
        </FadeInView>
      )}

      {/* Live Web Camera Viewfinder Modal */}
      <Modal
        visible={cameraModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCameraModal}
      >
        <View style={styles.permOverlay}>
          <View
            style={[
              styles.cameraModalCard,
              {
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                maxWidth: isDesktop ? 540 : isTablet ? 480 : Math.min(width - 32, 440),
                padding: isSmallPhone ? 16 : 22,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.cameraModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View
                  style={[
                    styles.modalIconBadge,
                    { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff' },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>📸</Text>
                </View>
                <View>
                  <Text style={[styles.cameraModalTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                    {capturedPhotoDraft ? 'Review Photo' : 'Capture Live Photo'}
                  </Text>
                  <Text style={[styles.cameraModalSubtitle, { color: isDark ? '#cbd5e1' : '#64748b' }]}>
                    {capturedPhotoDraft ? 'Look good? Confirm or retake' : 'Center your face in the camera frame'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={closeCameraModal}
                style={[
                  styles.cameraCloseBtn,
                  { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' },
                ]}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 16, fontWeight: '800', color: isDark ? '#f8fafc' : '#475569' }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Viewfinder or Snapshot Preview */}
            <View style={styles.viewfinderContainer}>
              {cameraError ? (
                <View style={styles.cameraErrorBox}>
                  <Text style={{ fontSize: 40, marginBottom: 8 }}>⚠️</Text>
                  <Text style={styles.cameraErrorHeading}>Camera Unavailable</Text>
                  <Text style={[styles.cameraErrorText, { color: isDark ? '#cbd5e1' : '#64748b' }]}>
                    {cameraError}
                  </Text>
                  <TouchableOpacity
                    style={[styles.cameraFallbackBtn, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }]}
                    onPress={handleFallbackCameraInput}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cameraFallbackBtnText}>📱 Open Device File Picker</Text>
                  </TouchableOpacity>
                </View>
              ) : capturedPhotoDraft ? (
                <Image
                  source={{ uri: capturedPhotoDraft }}
                  style={styles.capturedPreviewImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.videoWrapper}>
                  {Platform.OS === 'web' && (
                    <video
                      ref={videoRef as any}
                      autoPlay
                      playsInline
                      muted
                      style={
                        {
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transform: cameraFacing === 'user' ? 'scaleX(-1)' : 'none',
                        } as any
                      }
                    />
                  )}
                  {/* Face Guide Target Oval */}
                  <View style={styles.faceGuideOval} pointerEvents="none" />
                </View>
              )}
            </View>

            {/* Bottom Controls */}
            {!cameraError && (
              <View style={styles.cameraControlsRow}>
                {capturedPhotoDraft ? (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.cameraRetakeBtn,
                        {
                          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                        },
                      ]}
                      onPress={handleRetakeWebSnapshot}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.cameraRetakeBtnText, { color: isDark ? '#f8fafc' : '#334155' }]}>
                        🔄 Retake
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.cameraConfirmBtn,
                        {
                          backgroundColor: '#10b981',
                        },
                      ]}
                      onPress={handleConfirmWebSnapshot}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cameraConfirmBtnText}>✓ Use This Photo</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.cameraSecondaryBtn,
                        {
                          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                        },
                      ]}
                      onPress={handleFlipCamera}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#cbd5e1' : '#475569' }}>
                        🔄 Flip
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.cameraShutterBtn,
                        {
                          backgroundColor: isDark ? '#2563eb' : '#1b3569',
                        },
                      ]}
                      onPress={handleCaptureWebSnapshot}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cameraShutterBtnText}>📸 Capture Photo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.cameraSecondaryBtn,
                        {
                          backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                        },
                      ]}
                      onPress={handleFallbackCameraInput}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isDark ? '#cbd5e1' : '#475569' }}>
                        📁 File
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Device Storage Permission Modal */}
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
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#334155' : '#cbd5e1',
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

            <Text style={[styles.permHeading, { color: isDark ? '#ffffff' : '#0f172a' }]}>
              Device Storage Access
            </Text>

            <Text style={[styles.permDescription, { color: isDark ? '#cbd5e1' : '#475569' }]}>
              Allow DocuVault to access files on this device so you can select your official profile photo?
            </Text>

            <Text style={[styles.permSecurityNote, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              🔒 Only the photo you select will be uploaded.
            </Text>

            <View style={styles.permBtnRow}>
              <TouchableOpacity
                style={[
                  styles.permDenyBtn,
                  {
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                  },
                ]}
                onPress={() => handlePermissionDecision(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.permDenyBtnText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
                  ✕ Deny
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
                  ✓ Allow Access
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
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#cbd5e1',
                borderWidth: 1.5,
              },
            ]}
          >
            <PulseView minScale={0.9} maxScale={1.1}>
              <View
                style={[
                  styles.successIconCircle,
                  { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : '#dcfce7' },
                ]}
              >
                <Text
                  style={[
                    styles.checkmarkText,
                    { color: '#10b981' },
                  ]}
                >
                  ✓
                </Text>
              </View>
            </PulseView>
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
              {mode === 'register' ? 'Registration Submitted!' : 'Welcome Back!'}
            </Text>
            <Text style={[styles.modalBody, { color: isDark ? '#cbd5e1' : '#475569' }]}>
              {mode === 'register'
                ? `Welcome, ${fullName || 'Employee'}! Your account registration has been submitted and is currently pending administrator approval.\n\nOnce the administrator approves your request in the Personnel Portal, you will be able to log in with your credentials.`
                : `Successfully authenticated as ${workEmail}. Redirecting to your workspace...`}
            </Text>

            <ScalePressable
              style={[styles.modalButton, primaryBtnStyle]}
              onPress={handleReset}
            >
              <Text style={styles.modalButtonText}>
                {mode === 'register' ? 'Back to Sign In 🔐' : 'Enter Workspace 🚀'}
              </Text>
            </ScalePressable>
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
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.3)' : '#cbd5e1',
                borderWidth: 1.5,
              },
            ]}
          >
            <View
              style={[
                styles.modalIconBadge,
                {
                  backgroundColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff',
                  marginBottom: 12,
                },
              ]}
            >
              <Text style={{ fontSize: 26 }}>🔑</Text>
            </View>

            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#0f172a' }]}>
              Reset Your Password
            </Text>
            <Text style={[styles.modalBody, { color: isDark ? '#cbd5e1' : '#64748b' }]}>
              Enter your registered work email and we&apos;ll send you instructions to reset your account password.
            </Text>
            <TextInput
              style={[
                styles.input,
                getInputStyle('forgotEmail', false),
                { width: '100%', marginBottom: 16 },
              ]}
              placeholder="name@company.com"
              placeholderTextColor={placeholderColor}
              value={forgotEmail}
              onFocus={() => setFocusedField('forgotEmail')}
              onBlur={() => setFocusedField(null)}
              onChangeText={setForgotEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {forgotSent ? (
              <Text style={{ color: '#10b981', fontSize: 13, marginBottom: 14, fontWeight: '700' }}>
                ✓ Reset instructions sent to your email!
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    flex: 1,
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    borderWidth: 1,
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                  },
                ]}
                onPress={() => setForgotModalVisible(false)}
              >
                <Text style={{ color: isDark ? '#cbd5e1' : '#475569', fontWeight: '700', fontSize: 14 }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, primaryBtnStyle, { flex: 1.3 }]}
                onPress={handleSendResetLink}
              >
                <Text style={styles.modalButtonText}>Send Reset Link</Text>
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
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 26,
    elevation: 8,
  },
  modeTabsContainer: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1.5,
    marginBottom: 22,
    alignItems: 'center',
  },
  modeTab: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  modeTabText: {
    fontSize: 14.5,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  modeTabTextActive: {
    fontWeight: '800',
  },
  cardHeaderBox: {
    alignItems: 'center',
    marginBottom: 22,
  },
  cardTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
  },
  formContent: {
    width: '100%',
  },
  fieldGroup: {
    gap: 7,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPasswordLink: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  faceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removePhotoText: {
    fontSize: 12.5,
    color: '#ef4444',
    fontWeight: '700',
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
  },
  passwordInputContainer: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    fontWeight: '500',
  },
  eyeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12.5,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 2,
  },
  mandatoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  mandatoryBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  photoSectionCard: {
    minHeight: 80,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 14,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarVerifiedDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  photoControlsContainer: {
    flex: 1,
  },
  photoStatusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  photoChoiceHint: {
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 17,
  },
  photoActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  photoOptionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  photoOptionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  photoMiniBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoMiniBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  photoHelperNote: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 8,
    gap: 8,
  },
  trustBadgeItem: {
    fontSize: 11.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  trustBadgeDot: {
    fontSize: 10,
  },
  formErrorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  formErrorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '700',
  },
  requiredMark: {
    color: '#ef4444',
    fontWeight: '800',
  },
  pwdStrengthWrapper: {
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  pwdProgressBar: {
    height: 5,
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
    fontWeight: '800',
  },
  pwdHintText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  pwdRulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  ruleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  pwdRuleText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cameraModalCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 28,
    elevation: 16,
  },
  cameraModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cameraModalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  cameraCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderContainer: {
    width: '100%',
    height: 290,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGuideOval: {
    position: 'absolute',
    width: 160,
    height: 210,
    borderRadius: 80,
    borderWidth: 2.5,
    borderColor: 'rgba(56, 189, 248, 0.7)',
    borderStyle: 'dashed',
  },
  capturedPreviewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  cameraErrorBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraErrorHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ef4444',
    marginBottom: 6,
  },
  cameraErrorText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  cameraFallbackBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  cameraFallbackBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  cameraControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  cameraShutterBtn: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraShutterBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '800',
  },
  cameraSecondaryBtn: {
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraRetakeBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraRetakeBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  cameraConfirmBtn: {
    flex: 1.4,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraConfirmBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
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
    maxWidth: 400,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 14,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmarkText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalButton: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
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
    maxWidth: 400,
    borderRadius: 24,
    padding: 26,
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
    letterSpacing: -0.2,
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
    marginBottom: 22,
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
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permDenyBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  permAllowBtn: {
    flex: 1.3,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  permAllowBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
