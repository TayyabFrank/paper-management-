import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';

const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
  <circle cx="24" cy="24" r="23" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="24" cy="18" r="7.5" fill="#64748b"/>
  <path d="M11 40C11 32.8203 16.8203 27 24 27C31.1797 27 37 32.8203 37 40" fill="#64748b"/>
</svg>
`)}`;

// Eye icons for password toggle
const EYE_OPEN_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
  <circle cx="12" cy="12" r="3"/>
</svg>
`)}`;

const EYE_OFF_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
  <line x1="1" y1="1" x2="23" y2="23"/>
</svg>
`)}`;

const DEMO_FACES = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
];

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
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [password, setPassword] = useState('');
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedModalVisible, setSubmittedModalVisible] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const switchMode = (newMode: 'register' | 'login') => {
    setMode(newMode);
    setErrors({});
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const handleChoosePhoto = () => {
    if (Platform.OS === 'web') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      } else {
        const random = DEMO_FACES[Math.floor(Math.random() * DEMO_FACES.length)];
        setFaceImage(random);
      }
    } else {
      const random = DEMO_FACES[Math.floor(Math.random() * DEMO_FACES.length)];
      setFaceImage(random);
    }
  };

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFaceImage(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    const newErrors: { [key: string]: string } = {};

    if (mode === 'register') {
      if (!fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!workEmail.trim()) {
        newErrors.workEmail = 'Work Email is required';
      } else if (!/\S+@\S+\.\S+/.test(workEmail)) {
        newErrors.workEmail = 'Please enter a valid work email';
      }
      if (!password.trim()) newErrors.password = 'Password is required';
      else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    } else {
      if (!workEmail.trim()) {
        newErrors.workEmail = 'Work Email is required';
      } else if (!/\S+@\S+\.\S+/.test(workEmail)) {
        newErrors.workEmail = 'Please enter a valid work email';
      }
      if (!password.trim()) newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      if (mode === 'login') {
        if (onLoginSuccess) {
          onLoginSuccess({
            name: workEmail ? workEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) : 'Liam Thompson',
            email: workEmail || 'l.thompson@enterprise.com',
            avatar: faceImage || undefined,
          });
        } else {
          router.push('/dashboard');
        }
      } else {
        setSubmittedModalVisible(true);
      }
    }, 700);
  };

  const handleReset = () => {
    setSubmittedModalVisible(false);
    if (mode === 'register') {
      setFullName('');
      setWorkEmail('');
      setPassword('');
      setFaceImage(null);
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

  return (
    <View style={styles.cardContainer}>
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

      {/* Card Header Title */}
      <Text style={styles.cardTitle}>
        {mode === 'register' ? 'Employee Registration' : 'Sign In to Workspace'}
      </Text>

      {mode === 'register' ? (
        /* REGISTRATION FORM */
        <View style={styles.formContent}>
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName ? styles.inputError : null]}
              placeholder="John Doe"
              placeholderTextColor="#94a3b8"
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
            <Text style={styles.label}>Work Email</Text>
            <TextInput
              style={[styles.input, errors.workEmail ? styles.inputError : null]}
              placeholder="name@company.com"
              placeholderTextColor="#94a3b8"
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
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                placeholder="Enter password"
                placeholderTextColor="#94a3b8"
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
              >
                <Image
                  source={{ uri: showPassword ? EYE_OFF_SVG : EYE_OPEN_SVG }}
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Face Image */}
          <View style={styles.fieldGroup}>
            <View style={styles.faceLabelRow}>
              <Text style={styles.label}>Face Image</Text>
              {faceImage && (
                <TouchableOpacity onPress={() => setFaceImage(null)}>
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.faceUploadBox}>
              <View style={styles.avatarCircle}>
                <Image
                  source={faceImage ? { uri: faceImage } : { uri: DEFAULT_AVATAR_SVG }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              </View>

              <TouchableOpacity
                style={styles.uploadButton}
                onPress={handleChoosePhoto}
                activeOpacity={0.8}
              >
                <Text style={styles.uploadButtonText}>
                  {faceImage ? 'Change Photo' : 'Upload Photo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Submit for Admin Approval</Text>
            )}
          </TouchableOpacity>

          {/* Footer toggle */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already registered? </Text>
            <TouchableOpacity onPress={() => switchMode('login')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* SIGN IN TO WORKSPACE FORM (EXACT SCREENSHOT DESIGN) */
        <View style={styles.formContent}>
          {/* Work Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Work Email</Text>
            <TextInput
              style={[styles.input, errors.workEmail ? styles.inputError : null]}
              placeholder="m.chen@company.com"
              placeholderTextColor="#94a3b8"
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

          {/* Password with Forgot Password? link */}
          <View style={styles.fieldGroup}>
            <View style={styles.passwordHeaderRow}>
              <Text style={styles.label}>Password</Text>
              <TouchableOpacity
                onPress={() => setForgotModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordInputContainer}>
              <TextInput
                style={[styles.passwordInput, errors.password ? styles.inputError : null]}
                placeholder="••••••••••"
                placeholderTextColor="#94a3b8"
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
              >
                <Image
                  source={{ uri: showPassword ? EYE_OFF_SVG : EYE_OPEN_SVG }}
                  style={styles.eyeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Footer: New to the company? Register as Employee */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>New to the company? </Text>
            <TouchableOpacity onPress={() => switchMode('register')} activeOpacity={0.7}>
              <Text style={styles.loginLink}>Register as Employee</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Submission Confirmation Modal */}
      <Modal
        visible={submittedModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleReset}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.successIconCircle}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <Text style={styles.modalTitle}>
              {mode === 'register' ? 'Registration Submitted!' : 'Welcome Back!'}
            </Text>
            <Text style={styles.modalBody}>
              {mode === 'register'
                ? `Your application for ${fullName || 'Employee'} (${workEmail}) has been sent for administrator approval. You will receive an email once approved.`
                : `Successfully authenticated as ${workEmail || 'm.chen@company.com'}. Redirecting to your workspace...`}
            </Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.modalButtonText}>Continue</Text>
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
          <View style={styles.modalDialog}>
            <Text style={styles.modalTitle}>Reset Password</Text>
            <Text style={styles.modalBody}>
              Enter your work email address and we'll send you instructions to reset your password.
            </Text>
            <TextInput
              style={[styles.input, { width: '100%', marginBottom: 16 }]}
              placeholder="name@company.com"
              placeholderTextColor="#94a3b8"
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
                style={[styles.modalButton, { flex: 1, backgroundColor: '#e2e8f0' }]}
                onPress={() => setForgotModalVisible(false)}
              >
                <Text style={{ color: '#475569', fontWeight: '600', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { flex: 1 }]}
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
  cardTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1a2333',
    textAlign: 'center',
    marginBottom: 22,
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
});
