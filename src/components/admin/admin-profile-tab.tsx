import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

interface AdminProfileTabProps {
  onBack: () => void;
  onSwitchToEmployeeMode?: () => void;
}

// Crisp cross-platform eye icon to show/hide password
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
  return <Text style={{ fontSize: 16 }}>{visible ? '👁️' : '👁️‍🗨️'}</Text>;
}


const DEFAULT_ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

const PRESET_ADMIN_AVATARS = [
  {
    id: 'avatar-1',
    label: 'Executive',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-2',
    label: 'Director',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-3',
    label: 'VP Ops',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'avatar-4',
    label: 'Lead Arch',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
];

const BACK_ARROW_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="19" y1="12" x2="5" y2="12"></line>
  <polyline points="12 19 5 12 12 5"></polyline>
</svg>
`)}`;

const KEY_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" stroke-width="1">
  <path d="M21 2l-2 2m-1.5 1.5L16 7l-1.5-1.5-3 3 1.5 1.5-1.5 1.5-1.5-1.5-3.5 3.5a6 6 0 1 1-2.5-2.5l7-7 1.5 1.5 1.5-1.5-1.5-1.5 2-2 4 4z"/>
</svg>
`)}`;

const PALETTE_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="#3b82f6">
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
</svg>
`)}`;

// Geometric poly crystal background SVG matching Screenshot 2
const POLY_BG_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260" preserveAspectRatio="none">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#c4b5fd" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#fbcfe8" stop-opacity="0.75"/>
    </linearGradient>
  </defs>
  <rect width="600" height="260" fill="url(#grad)"/>
  <polygon points="0,0 120,60 60,180 0,140" fill="#a78bfa" opacity="0.25"/>
  <polygon points="120,60 260,30 200,160 60,180" fill="#c084fc" opacity="0.3"/>
  <polygon points="260,30 420,50 360,170 200,160" fill="#e879f9" opacity="0.2"/>
  <polygon points="420,50 600,0 520,150 360,170" fill="#818cf8" opacity="0.3"/>
  <polygon points="60,180 200,160 160,260 0,260" fill="#7dd3fc" opacity="0.3"/>
  <polygon points="200,160 360,170 320,260 160,260" fill="#a78bfa" opacity="0.2"/>
  <polygon points="360,170 520,150 480,260 320,260" fill="#c084fc" opacity="0.25"/>
  <polygon points="520,150 600,140 600,260 480,260" fill="#f472b6" opacity="0.2"/>
</svg>
`)}`;

export function AdminProfileTab({ onBack }: AdminProfileTabProps) {
  const { isDark, toggleTheme, colors } = useDocuVaultTheme();
  const { user, logout, updateUser } = useAuth();

  const adminName = user.name || 'System Administrator';
  const adminEmail = user.email || 'admin@enterprise.com';
  const adminAvatar = user.avatar || DEFAULT_ADMIN_AVATAR;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editAvatar, setEditAvatar] = useState(adminAvatar);
  const [editName, setEditName] = useState(adminName);
  const [editEmail, setEditEmail] = useState(adminEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenEdit = () => {
    setEditAvatar(user.avatar || DEFAULT_ADMIN_AVATAR);
    setEditName(user.name || adminName);
    setEditEmail(user.email || adminEmail);
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEditError(null);
    setEditModalVisible(true);
  };

  const handlePickAvatar = async () => {
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
        setEditAvatar(result.assets[0].uri);
        if (editError) setEditError(null);
      }
    } catch (err) {
      console.warn('Avatar picker error:', err);
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
          setEditAvatar(uploadEvent.target.result as string);
          if (editError) setEditError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEdit = async () => {
    setEditError(null);
    const cleanEmail = editEmail.trim().toLowerCase();
    const cleanName = editName.trim();

    if (!cleanEmail) {
      setEditError('Admin email cannot be empty.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
      setEditError('Please enter a valid work email (e.g. name@company.com).');
      return;
    }
    if (!cleanName) {
      setEditError('Admin name cannot be empty.');
      return;
    }

    // Password validation if entered
    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setEditError('Passwords do not match. Please verify your new password.');
        return;
      }
      if (newPassword.length < 8) {
        setEditError('New password must be at least 8 characters long.');
        return;
      }
      if (!/[A-Z]/.test(newPassword)) {
        setEditError('New password must contain at least one uppercase letter (A-Z).');
        return;
      }
      if (!/[a-z]/.test(newPassword)) {
        setEditError('New password must contain at least one lowercase letter (a-z).');
        return;
      }
      if (!/[0-9]/.test(newPassword)) {
        setEditError('New password must contain at least one number (0-9).');
        return;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        setEditError('New password must contain at least one special character (!@#$%^&*...).');
        return;
      }
    }

    setIsSaving(true);
    const result = await updateUser(
      {
        name: cleanName,
        email: cleanEmail,
        avatar: editAvatar,
      },
      newPassword.trim() ? newPassword.trim() : undefined
    );
    setIsSaving(false);

    if (!result.success) {
      setEditError(result.error || 'Failed to update admin profile.');
      return;
    }

    setEditModalVisible(false);
    setFeedbackToast('✓ Admin profile, photo & credentials updated successfully!');
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#f5f3ff' }]}>
      {/* Hidden file input for web avatar upload */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef as any}
          onChange={handleWebFileChange as any}
          accept="image/*"
          style={{ display: 'none' }}
        />
      )}

      {/* Top Header with Back Arrow */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Image
            source={{ uri: BACK_ARROW_SVG(isDark ? '#f8fafc' : '#0f172a') }}
            style={{ width: 22, height: 22 }}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
          Admin Profile
        </Text>
      </View>

      {/* Floating Success Feedback Toast */}
      {feedbackToast && (
        <View style={styles.feedbackToast}>
          <Text style={styles.feedbackToastText}>{feedbackToast}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Geometric Polygon Crystal Banner */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: POLY_BG_SVG }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>

        {/* Elevated Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          {/* Overlapping Avatar Circle with Camera Quick Edit Badge */}
          <TouchableOpacity
            style={[
              styles.avatarOverlapCircle,
              {
                backgroundColor: isDark ? '#1e293b' : '#e0e7ff',
                borderColor: isDark ? '#38bdf8' : '#ffffff',
              },
            ]}
            onPress={handleOpenEdit}
            activeOpacity={0.85}
          >
            <Image
              source={{ uri: adminAvatar }}
              style={styles.avatarImg}
              resizeMode="cover"
            />
            <View style={styles.avatarBadgeOverlay}>
              <Text style={{ fontSize: 13 }}>📷</Text>
            </View>
          </TouchableOpacity>

          {/* Section 1: Admin Name */}
          <View style={styles.cardField}>
            <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Admin Name
              </Text>
              <TouchableOpacity
                style={[styles.editPill, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
                onPress={handleOpenEdit}
                activeOpacity={0.7}
              >
                <Text style={[styles.editPillText, { color: isDark ? '#38bdf8' : '#2563eb' }]}>
                  ✏️ Edit
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.fieldValueName, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {adminName}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

          {/* Section 2: Admin Email (with direct Edit button) */}
          <View style={styles.cardField}>
            <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Admin Email
              </Text>
              <TouchableOpacity
                style={[styles.editPill, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
                onPress={handleOpenEdit}
                activeOpacity={0.7}
              >
                <Text style={[styles.editPillText, { color: isDark ? '#38bdf8' : '#2563eb' }]}>
                  ✏️ Edit Email
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.fieldValueEmail, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {adminEmail}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

          {/* Section 3: Password */}
          <View style={styles.cardRowField}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Image source={{ uri: KEY_ICON_SVG }} style={{ width: 22, height: 22 }} resizeMode="contain" />
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  Password
                </Text>
                <Text style={[styles.passwordAsterisks, { color: isDark ? '#94a3b8' : '#334155' }]}>
                  ••••••••
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.editPill, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
              onPress={handleOpenEdit}
              activeOpacity={0.7}
            >
              <Text style={[styles.editPillText, { color: isDark ? '#38bdf8' : '#2563eb' }]}>
                ✏️ Change
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

          {/* Enterprise Badges Row */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                  borderColor: isDark ? '#3b82f6' : '#bfdbfe',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: isDark ? '#60a5fa' : '#1d4ed8' }]}>
                🛡️ Master Admin
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : '#ecfdf5',
                  borderColor: isDark ? '#22c55e' : '#86efac',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: isDark ? '#4ade80' : '#15803d' }]}>
                🪪 {user.employeeId || 'ADM-001'}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDark ? 'rgba(234, 179, 8, 0.15)' : '#fefce8',
                  borderColor: isDark ? '#eab308' : '#fde047',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: isDark ? '#facc15' : '#a16207' }]}>
                🔐 256-Bit TLS
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

          {/* Section 4: Enable Dark Mode */}
          <View style={styles.cardRowField}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Image source={{ uri: PALETTE_ICON_SVG }} style={{ width: 22, height: 22 }} resizeMode="contain" />
              </View>
              <Text style={[styles.rowLabel, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                Enable Dark Mode
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
              thumbColor={isDark ? '#ffffff' : '#f8fafc'}
            />
          </View>

          {/* Edit Profile & Credentials Action Button */}
          <TouchableOpacity
            style={[
              styles.editProfileBtn,
              {
                backgroundColor: isDark ? '#1e293b' : '#f0f9ff',
                borderColor: isDark ? '#38bdf8' : '#bfdbfe',
              },
            ]}
            onPress={handleOpenEdit}
            activeOpacity={0.8}
          >
            <Text style={[styles.editProfileBtnText, { color: isDark ? '#38bdf8' : '#0284c7' }]}>
              ✏️ Edit Admin Profile (Photo, Name, Email, Password)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View style={styles.bottomActionsCol}>
          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutBtnText}>🚪 Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Admin Profile & Credentials Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
              },
            ]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                ✏️ Update Admin Profile
              </Text>
              <Text style={[styles.modalSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Update your admin avatar, full name, login email, or account password.
              </Text>

              {editError && (
                <View style={styles.modalErrorBanner}>
                  <Text style={styles.modalErrorText}>⚠️ {editError}</Text>
                </View>
              )}

              {/* 1. Admin Profile Photo Section */}
              <View style={styles.avatarPickerSection}>
                <Text style={[styles.modalInputLabel, { color: colors.textPrimary }]}>
                  📷 Profile Photo
                </Text>
                <View style={styles.avatarRow}>
                  <TouchableOpacity
                    style={[styles.avatarPreviewWrapper, { borderColor: isDark ? '#38bdf8' : '#2563eb' }]}
                    onPress={handlePickAvatar}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: editAvatar }}
                      style={styles.avatarPreviewImg}
                      resizeMode="cover"
                    />
                    <View style={styles.avatarPreviewBadge}>
                      <Text style={{ fontSize: 11 }}>📷</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={{ flex: 1, gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.uploadPhotoBtn, { backgroundColor: isDark ? '#0f172a' : '#eff6ff', borderColor: isDark ? '#38bdf8' : '#bfdbfe' }]}
                      onPress={handlePickAvatar}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.uploadPhotoBtnText, { color: isDark ? '#38bdf8' : '#1d4ed8' }]}>
                        📁 Upload Custom Photo
                      </Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 11, color: isDark ? '#94a3b8' : '#64748b' }}>
                      PNG, JPG or WebP image supported.
                    </Text>
                  </View>
                </View>

                {/* Preset Avatars Row */}
                <Text style={[styles.presetSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  Or pick an executive avatar:
                </Text>
                <View style={styles.presetsRow}>
                  {PRESET_ADMIN_AVATARS.map((preset) => {
                    const isSelected = editAvatar === preset.url;
                    return (
                      <TouchableOpacity
                        key={preset.id}
                        style={[
                          styles.presetAvatarBtn,
                          isSelected && {
                            borderColor: '#3b82f6',
                            borderWidth: 2.5,
                            transform: [{ scale: 1.05 }],
                          },
                        ]}
                        onPress={() => setEditAvatar(preset.url)}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={{ uri: preset.url }}
                          style={styles.presetAvatarImg}
                          resizeMode="cover"
                        />
                        {isSelected && (
                          <View style={styles.presetCheckmark}>
                            <Text style={{ fontSize: 10, color: '#ffffff', fontWeight: 'bold' }}>✓</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* 2. Admin Name */}
              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalInputLabel, { color: colors.textPrimary }]}>
                  👤 Full Name *
                </Text>
                <TextInput
                  style={[
                    styles.modalTextInput,
                    {
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      color: colors.textPrimary,
                    },
                  ]}
                  value={editName}
                  onChangeText={(text) => {
                    setEditName(text);
                    if (editError) setEditError(null);
                  }}
                  placeholder="System Administrator"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                />
              </View>

              {/* 3. Admin Work Email */}
              <View style={styles.modalInputGroup}>
                <Text style={[styles.modalInputLabel, { color: colors.textPrimary }]}>
                  ✉️ Admin Work Email *
                </Text>
                <TextInput
                  style={[
                    styles.modalTextInput,
                    {
                      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                      borderColor: isDark ? '#334155' : '#cbd5e1',
                      color: colors.textPrimary,
                    },
                  ]}
                  value={editEmail}
                  onChangeText={(text) => {
                    setEditEmail(text);
                    if (editError) setEditError(null);
                  }}
                  placeholder="admin@enterprise.com"
                  placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* 4. Change Password (Optional) */}
              <View
                style={[
                  styles.passwordCardSection,
                  {
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                  },
                ]}
              >
                <View style={styles.modalPwdHeaderRow}>
                  <Text style={[styles.modalInputLabel, { color: colors.textPrimary, marginBottom: 0 }]}>
                    🔒 Change Password (Optional)
                  </Text>
                  <Text style={{ fontSize: 12, color: isDark ? '#94a3b8' : '#64748b' }}>
                    Leave blank to keep current
                  </Text>
                </View>

                {/* New Password */}
                <View style={{ marginTop: 10 }}>
                  <Text style={[styles.innerInputLabel, { color: isDark ? '#cbd5e1' : '#475569', marginBottom: 6 }]}>
                    New Password
                  </Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={[
                        styles.modalTextInput,
                        styles.passwordInputInner,
                        {
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                          color: colors.textPrimary,
                        },
                      ]}
                      value={newPassword}
                      onChangeText={(text) => {
                        setNewPassword(text);
                        if (editError) setEditError(null);
                      }}
                      placeholder="At least 8 chars (Aa1@)"
                      placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowPassword(!showPassword)}
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
                </View>

                {/* Confirm Password */}
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.innerInputLabel, { color: isDark ? '#cbd5e1' : '#475569', marginBottom: 6 }]}>
                    Confirm New Password
                  </Text>
                  <View style={styles.passwordInputWrapper}>
                    <TextInput
                      style={[
                        styles.modalTextInput,
                        styles.passwordInputInner,
                        {
                          backgroundColor: isDark ? '#1e293b' : '#ffffff',
                          borderColor: isDark ? '#334155' : '#cbd5e1',
                          color: colors.textPrimary,
                        },
                      ]}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (editError) setEditError(null);
                      }}
                      placeholder="Repeat new password"
                      placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity
                      style={styles.eyeBtn}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                      accessibilityRole="button"
                    >
                      <PasswordEyeIcon
                        visible={showConfirmPassword}
                        color={showConfirmPassword ? (isDark ? '#38bdf8' : '#2563eb') : (isDark ? '#94a3b8' : '#64748b')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Modal Actions */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { backgroundColor: isDark ? '#334155' : '#f1f5f9' }]}
                  onPress={() => setEditModalVisible(false)}
                  disabled={isSaving}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalCancelText, { color: isDark ? '#e2e8f0' : '#475569' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleSaveEdit}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    zIndex: 10,
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  bannerContainer: {
    width: '100%',
    height: 140,
    overflow: 'hidden',
  },
  profileCard: {
    marginHorizontal: 20,
    marginTop: -50,
    borderRadius: 24,
    borderWidth: 1,
    paddingTop: 65,
    paddingBottom: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    position: 'relative',
    alignItems: 'center',
  },
  avatarOverlapCircle: {
    position: 'absolute',
    top: -48,
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2563eb',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  cardField: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  editPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  editPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  fieldValueName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  fieldValueEmail: {
    fontSize: 17,
    fontWeight: '600',
  },
  cardRowField: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  passwordAsterisks: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 4,
  },
  editProfileBtn: {
    marginTop: 16,
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomActionsCol: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  signOutBtn: {
    backgroundColor: '#fee2e2',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutBtnText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: '700',
  },
  feedbackToast: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#15803d',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  feedbackToastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalErrorBanner: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  modalErrorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
  },
  avatarPickerSection: {
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  avatarPreviewWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    position: 'relative',
  },
  avatarPreviewImg: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  avatarPreviewBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#2563eb',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadPhotoBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  uploadPhotoBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  presetSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  presetAvatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  presetAvatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  presetCheckmark: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#3b82f6',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  modalTextInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  passwordCardSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  modalPwdHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pwdLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  innerInputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSaveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  passwordInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInputInner: {
    paddingRight: 42,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
});
