import { useAuth } from '@/context/auth-context';
import { useDocuments } from '@/context/documents-context';
import { useDocuVaultTheme } from '@/context/theme-context';
import React, { useState, useRef } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { TabKey } from './bottom-navbar';
import { ThemeToggleButton } from './theme-toggle-button';

interface EmployeeProfileViewProps {
  onNavigateTab?: (tab: TabKey) => void;
}

export function EmployeeProfileView({ onNavigateTab }: EmployeeProfileViewProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { user, logout, updateUser } = useAuth();
  const { documents } = useDocuments();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editName, setEditName] = useState(user.name);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenEdit = () => {
    setEditAvatar(user.avatar);
    setEditName(user.name);
    setNewPassword('');
    setConfirmPassword('');
    setShowNewPassword(false);
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
    const cleanName = editName.trim();
    if (!cleanName) {
      setEditError('Full name is required.');
      return;
    }

    if (!editAvatar) {
      setEditError('Profile photo is required.');
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
        avatar: editAvatar,
      },
      newPassword.trim() ? newPassword.trim() : undefined
    );
    setIsSaving(false);

    if (!result.success) {
      setEditError(result.error || 'Failed to update profile.');
      return;
    }

    setEditModalVisible(false);
    setFeedbackToast('✓ Profile updated successfully' + (newPassword.trim() ? ' with new password!' : '!'));
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: isDark ? colors.background : '#f1f5f9' }]}
      showsVerticalScrollIndicator={false}
    >
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

      <View style={styles.maxWidthWrapper}>
        {/* Header with Title, Status & Theme Toggle */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>👤 Employee Profile</Text>
            <View style={styles.liveStatusRow}>
              <View style={styles.liveGreenDot} />
              <Text style={[styles.liveStatusText, { color: isDark ? '#4ade80' : '#16a34a' }]}>
                Verified & Synchronized
              </Text>
            </View>
          </View>
          <ThemeToggleButton compact showLabel={false} />
        </View>

        {/* Feedback Toast */}
        {feedbackToast && (
          <View style={[styles.toast, { backgroundColor: isDark ? '#1e293b' : '#1e3a8a' }]}>
            <Text style={styles.toastText}>{feedbackToast}</Text>
          </View>
        )}

        {/* Hero Profile Identity Card */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0',
              shadowColor: isDark ? '#000000' : '#0f172a',
            },
          ]}
        >
          {/* Top Decorative Header Strip */}
          <View
            style={[
              styles.cardTopBanner,
              { backgroundColor: isDark ? '#1e293b' : '#1b3569' },
            ]}
          >
            <Text style={styles.bannerTag}>DOCUVAULT ENTERPRISE SECURITY CLEARANCE</Text>
          </View>

          {/* Centered Avatar with Ring & Verified Badge */}
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatarRing,
                {
                  borderColor: isDark ? '#3b82f6' : '#2563eb',
                  backgroundColor: isDark ? '#0f172a' : '#ffffff',
                },
              ]}
            >
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatar}
                resizeMode="cover"
              />
            </View>
            <View style={styles.verifiedCheckBadge}>
              <Text style={styles.verifiedCheckText}>✓</Text>
            </View>
          </View>

          {/* User Full Name and Email */}
          <Text style={[styles.userName, { color: colors.textPrimary }]}>
            {user.name}
          </Text>
          <Text style={[styles.userEmail, { color: isDark ? '#94a3b8' : '#475569' }]}>
            {user.email}
          </Text>

          {/* Eye-Catching Badges Row */}
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDark ? 'rgba(34, 197, 94, 0.18)' : '#ecfdf5',
                  borderColor: isDark ? '#22c55e' : '#86efac',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: isDark ? '#4ade80' : '#15803d' }]}>
                🛡️ Verified Employee
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDark ? 'rgba(59, 130, 246, 0.18)' : '#eff6ff',
                  borderColor: isDark ? '#3b82f6' : '#bfdbfe',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: isDark ? '#60a5fa' : '#1d4ed8' }]}>
                🪪 {user.employeeId}
              </Text>
            </View>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: isDark ? 'rgba(234, 179, 8, 0.18)' : '#fefce8',
                  borderColor: isDark ? '#eab308' : '#fde047',
                },
              ]}
            >
              <Text style={[styles.badgeText, { color: isDark ? '#facc15' : '#a16207' }]}>
                ⚡ Tier-1
              </Text>
            </View>
          </View>

          {/* Edit Profile Information Trigger Button */}
          <TouchableOpacity
            style={[
              styles.editProfileBtn,
              {
                backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                borderColor: isDark ? '#334155' : '#cbd5e1',
              },
            ]}
            onPress={handleOpenEdit}
            activeOpacity={0.75}
          >
            <Text style={[styles.editProfileBtnText, { color: isDark ? '#38bdf8' : '#1b3569' }]}>
              ✏️ Edit Profile Details
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Workspace Metrics Counters */}
        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
              },
            ]}
          >
            <Text style={styles.metricEmoji}>📑</Text>
            <Text style={[styles.metricNumber, { color: isDark ? '#38bdf8' : '#1e40af' }]}>
              {documents.length}
            </Text>
            <Text style={[styles.metricLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
              Uploaded Docs
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
              },
            ]}
          >
            <Text style={styles.metricEmoji}>🛡️</Text>
            <Text style={[styles.metricNumber, { color: isDark ? '#4ade80' : '#15803d' }]}>
              100%
            </Text>
            <Text style={[styles.metricLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
              Verified SHA
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
              },
            ]}
          >
            <Text style={styles.metricEmoji}>⚡</Text>
            <Text style={[styles.metricNumber, { color: isDark ? '#facc15' : '#b45309' }]}>
              VIP
            </Text>
            <Text style={[styles.metricLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
              Access Level
            </Text>
          </View>
        </View>

        {/* Enterprise Assignment Section */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          🏢 Enterprise Assignment & Role
        </Text>
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
            },
          ]}
        >
          {/* Row 1: Role */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIconBox, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
              <Text style={{ fontSize: 18 }}>💼</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Designated Role / Job Title
              </Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {user.role}
              </Text>
            </View>
          </View>

          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#1f293d' : '#f1f5f9' }]} />

          {/* Row 2: Department */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIconBox, { backgroundColor: isDark ? '#1e293b' : '#f5f3ff' }]}>
              <Text style={{ fontSize: 18 }}>🏢</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Division & Department
              </Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                {user.department}
              </Text>
            </View>
          </View>

          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#1f293d' : '#f1f5f9' }]} />

          {/* Row 3: Organization */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIconBox, { backgroundColor: isDark ? '#1e293b' : '#f0fdf4' }]}>
              <Text style={{ fontSize: 18 }}>🌐</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Enterprise Workspace
              </Text>
              <Text style={[styles.detailValue, { color: colors.textPrimary }]}>
                DocuVault Global Solutions (HQ)
              </Text>
            </View>
          </View>

          <View style={[styles.dividerLine, { backgroundColor: isDark ? '#1f293d' : '#f1f5f9' }]} />

          {/* Row 4: Security Token */}
          <View style={styles.detailRow}>
            <View style={[styles.detailIconBox, { backgroundColor: isDark ? '#1e293b' : '#ecfdf5' }]}>
              <Text style={{ fontSize: 18 }}>🔐</Text>
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Security Token & Encryption
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <View style={[styles.smallStatusDot, { backgroundColor: '#22c55e' }]} />
                <Text style={[styles.detailValue, { color: isDark ? '#4ade80' : '#15803d', fontWeight: '800' }]}>
                  Active (SHA-256 Validated)
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Workspace Navigation Actions */}
        {onNavigateTab && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              ⚡ Quick Workspace Access
            </Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={[
                  styles.quickActionTile,
                  {
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  },
                ]}
                onPress={() => onNavigateTab('docs')}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIconCircle, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                  <Text style={{ fontSize: 20 }}>📂</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quickActionTitle, { color: colors.textPrimary }]}>
                    My Documents
                  </Text>
                  <Text style={[styles.quickActionSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    {documents.length} files available to read
                  </Text>
                </View>
                <Text style={[styles.quickActionArrow, { color: isDark ? '#60a5fa' : '#2563eb' }]}>→</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.quickActionTile,
                  {
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  },
                ]}
                onPress={() => onNavigateTab('new-doc')}
                activeOpacity={0.8}
              >
                <View style={[styles.quickActionIconCircle, { backgroundColor: isDark ? '#1e293b' : '#ecfdf5' }]}>
                  <Text style={{ fontSize: 20 }}>📤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.quickActionTitle, { color: colors.textPrimary }]}>
                    Upload Document
                  </Text>
                  <Text style={[styles.quickActionSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    Direct device file picker
                  </Text>
                </View>
                <Text style={[styles.quickActionArrow, { color: isDark ? '#4ade80' : '#16a34a' }]}>→</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Appearance & Interface Theme Card */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          🎨 Appearance & Display Contrast
        </Text>
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e2e8f0',
            },
          ]}
        >
          <View style={styles.themeRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.detailValue, { color: colors.textPrimary, fontSize: 16 }]}>
                  Interface Mode
                </Text>
                <View
                  style={[
                    styles.modeIndicatorBadge,
                    {
                      backgroundColor: isDark ? '#1e293b' : '#fef3c7',
                      borderColor: isDark ? '#3b82f6' : '#f59e0b',
                    },
                  ]}
                >
                  <Text style={[styles.modeIndicatorText, { color: isDark ? '#60a5fa' : '#b45309' }]}>
                    {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.detailLabel, { color: isDark ? '#94a3b8' : '#64748b', marginTop: 4 }]}>
                Switch between high-contrast Dark & Light mode for optimal day/night visibility.
              </Text>
            </View>
            <ThemeToggleButton />
          </View>
        </View>

        {/* High-Contrast Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            {
              backgroundColor: isDark ? '#450a0a' : '#fef2f2',
              borderColor: isDark ? '#ef4444' : '#f87171',
            },
          ]}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.logoutBtnText, { color: isDark ? '#fca5a5' : '#b91c1c' }]}>
            🚪 Logout from Workspace
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal (Photo, Name, and Password Only) */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.editModalCard,
                {
                  backgroundColor: isDark ? '#111827' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                },
              ]}
            >
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  ✏️ Edit Profile
                </Text>
                <Text style={[styles.modalSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  Update your profile photo, full name, or account password.
                </Text>

                {/* Inline Error Banner */}
                {editError && (
                  <View style={styles.editErrorBox}>
                    <Text style={styles.editErrorText}>⚠️ {editError}</Text>
                  </View>
                )}

                {/* 1. Update Profile Photo */}
                <View style={styles.avatarEditContainer}>
                  <TouchableOpacity
                    style={[
                      styles.avatarEditRing,
                      { borderColor: isDark ? '#38bdf8' : '#2563eb' },
                    ]}
                    onPress={handlePickAvatar}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: editAvatar || user.avatar }}
                      style={styles.avatarEditImg}
                      resizeMode="cover"
                    />
                    <View style={styles.avatarEditBadge}>
                      <Text style={{ fontSize: 13 }}>📷</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.changePhotoBtn,
                      {
                        backgroundColor: isDark ? '#1e293b' : '#eff6ff',
                        borderColor: isDark ? '#38bdf8' : '#bfdbfe',
                      },
                    ]}
                    onPress={handlePickAvatar}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.changePhotoBtnText, { color: isDark ? '#38bdf8' : '#1d4ed8' }]}>
                      📷 Change Photo
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Change Full Name */}
                <View style={styles.inputBlock}>
                  <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>👤 Full Name</Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                        color: colors.textPrimary,
                      },
                    ]}
                    value={editName}
                    onChangeText={(val) => {
                      setEditName(val);
                      if (editError) setEditError(null);
                    }}
                    placeholder="Your Full Name"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                  />
                </View>

                {/* 3. Update Password Section */}
                <View
                  style={[
                    styles.passwordCardSection,
                    {
                      backgroundColor: isDark ? '#0b1329' : '#f8fafc',
                      borderColor: isDark ? '#1e293b' : '#e2e8f0',
                    },
                  ]}
                >
                  <View style={styles.passwordHeaderRow}>
                    <Text style={[styles.passwordSectionTitle, { color: colors.textPrimary }]}>
                      🔒 Change Password
                    </Text>
                    <Text style={[styles.optionalBadge, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      (Optional)
                    </Text>
                  </View>
                  <Text style={[styles.passwordHelperText, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                    Leave blank if you wish to keep your current password.
                  </Text>

                  {/* New Password */}
                  <View style={[styles.inputBlock, { marginTop: 10 }]}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>New Password</Text>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        style={[
                          styles.textInput,
                          styles.passwordInput,
                          {
                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                            borderColor: isDark ? '#334155' : '#cbd5e1',
                            color: colors.textPrimary,
                          },
                        ]}
                        value={newPassword}
                        onChangeText={(val) => {
                          setNewPassword(val);
                          if (editError) setEditError(null);
                        }}
                        placeholder="At least 8 chars (Aa1@)"
                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                      >
                        <Text style={{ fontSize: 16 }}>{showNewPassword ? '🙈' : '👁️'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm New Password */}
                  <View style={styles.inputBlock}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Confirm New Password</Text>
                    <View style={styles.passwordInputWrapper}>
                      <TextInput
                        style={[
                          styles.textInput,
                          styles.passwordInput,
                          {
                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                            borderColor: isDark ? '#334155' : '#cbd5e1',
                            color: colors.textPrimary,
                          },
                        ]}
                        value={confirmPassword}
                        onChangeText={(val) => {
                          setConfirmPassword(val);
                          if (editError) setEditError(null);
                        }}
                        placeholder="Confirm new password"
                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <Text style={{ fontSize: 16 }}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancelBtn,
                      {
                        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                        borderColor: isDark ? '#334155' : '#cbd5e1',
                      },
                    ]}
                    onPress={() => setEditModalVisible(false)}
                    activeOpacity={0.7}
                    disabled={isSaving}
                  >
                    <Text style={[styles.modalCancelBtnText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalSaveBtn,
                      { backgroundColor: isDark ? '#2563eb' : '#1b3569' },
                    ]}
                    onPress={handleSaveEdit}
                    activeOpacity={0.85}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text style={styles.modalSaveBtnText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Logout Confirmation Dialog */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalDialog,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0',
              },
            ]}
          >
            <View style={styles.logoutIconBadge}>
              <Text style={{ fontSize: 32 }}>🚪</Text>
            </View>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              Sign Out of DocuVault?
            </Text>
            <Text style={[styles.modalBody, { color: isDark ? '#cbd5e1' : '#475569' }]}>
              You will be safely signed out from your employee workspace. Your documents and settings remain securely preserved.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                  },
                ]}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelBtnText, { color: isDark ? '#94a3b8' : '#475569' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutBtn}
                onPress={() => {
                  setLogoutModalVisible(false);
                  logout();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmLogoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 95,
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  liveGreenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  liveStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toast: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    paddingBottom: 22,
  },
  cardTopBanner: {
    width: '100%',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTag: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  avatarContainer: {
    position: 'relative',
    marginTop: 18,
    marginBottom: 12,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#22c55e',
    borderWidth: 2.5,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheckText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 14,
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  editProfileBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  metricEmoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  infoCard: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 14,
  },
  detailIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14.5,
    fontWeight: '800',
    marginTop: 2,
  },
  smallStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dividerLine: {
    height: 1,
    width: '100%',
  },
  quickActionsRow: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 20,
  },
  quickActionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  quickActionIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  quickActionSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  quickActionArrow: {
    fontSize: 18,
    fontWeight: '800',
    paddingRight: 4,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  modeIndicatorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  modeIndicatorText: {
    fontSize: 11,
    fontWeight: '800',
  },
  logoutBtn: {
    borderWidth: 1.8,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 10,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 9999,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 370,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  logoutIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmLogoutBtn: {
    flex: 1.2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmLogoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  editModalCard: {
    width: '100%',
    maxWidth: 390,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1.5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  modalSub: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputBlock: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontWeight: '600',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flex: 1.3,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  avatarEditContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarEditRing: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 2.5,
    position: 'relative',
    overflow: 'visible',
    marginBottom: 8,
  },
  avatarEditImg: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
  },
  avatarEditBadge: {
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
  },
  changePhotoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  changePhotoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  editErrorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  editErrorText: {
    color: '#dc2626',
    fontSize: 12.5,
    fontWeight: '600',
  },
  passwordCardSection: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  passwordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordSectionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  optionalBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  passwordHelperText: {
    fontSize: 11.5,
    marginTop: 2,
  },
  passwordInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 42,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
});
