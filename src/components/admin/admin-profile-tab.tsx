import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
  Image,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

interface AdminProfileTabProps {
  onBack: () => void;
  onSwitchToEmployeeMode: () => void;
}

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

const CAMERA_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
  <circle cx="12" cy="13" r="4"/>
</svg>
`)}`;

const PENCIL_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
</svg>
`)}`;

// Geometric poly crystal background SVG matching Screenshot 2
const POLY_BG_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260" preserveAspectRatio="none">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#c4b5fd" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#fbcfe8" stop-opacity="0.8"/>
    </linearGradient>
  </defs>
  <rect width="600" height="260" fill="url(#grad)"/>
  <polygon points="0,0 120,60 60,180 0,140" fill="#a78bfa" opacity="0.3"/>
  <polygon points="120,60 260,30 200,160 60,180" fill="#c084fc" opacity="0.35"/>
  <polygon points="260,30 420,50 360,170 200,160" fill="#e879f9" opacity="0.25"/>
  <polygon points="420,50 600,0 520,150 360,170" fill="#818cf8" opacity="0.35"/>
  <polygon points="60,180 200,160 160,260 0,260" fill="#7dd3fc" opacity="0.35"/>
  <polygon points="200,160 360,170 320,260 160,260" fill="#a78bfa" opacity="0.25"/>
  <polygon points="360,170 520,150 480,260 320,260" fill="#c084fc" opacity="0.3"/>
  <polygon points="520,150 600,140 600,260 480,260" fill="#f472b6" opacity="0.25"/>
</svg>
`)}`;

const EXECUTIVE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

export function AdminProfileTab({ onBack, onSwitchToEmployeeMode }: AdminProfileTabProps) {
  const { isDark, toggleTheme, colors } = useDocuVaultTheme();
  const { user, updateUser, logout, registeredAccounts } = useAuth();

  // Find admin account
  const adminAccount =
    registeredAccounts.find((a) => a.role === 'Admin') ||
    (user.role === 'Admin' ? user : null);

  const adminName = adminAccount?.name || user.name || 'Alex Smith';
  const adminEmail = adminAccount?.email || user.email || 'a.smith@enterprise.com';
  const adminAvatar = adminAccount?.avatar || user.avatar || '';

  // Modal edit state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(adminName);
  const [editEmail, setEditEmail] = useState(adminEmail);
  const [editAvatar, setEditAvatar] = useState(adminAvatar);
  const [editPassword, setEditPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenEditModal = () => {
    setEditName(adminName);
    setEditEmail(adminEmail);
    setEditAvatar(adminAvatar);
    setEditPassword('');
    setConfirmPassword('');
    setErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    setErrorMsg(null);

    const cleanName = editName.trim();
    const cleanEmail = editEmail.trim().toLowerCase();

    if (!cleanName) {
      setErrorMsg('Admin Name cannot be empty.');
      return;
    }

    if (!cleanEmail || !/\S+@\S+\.\S+/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    if (editPassword) {
      if (editPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (editPassword !== confirmPassword) {
        setErrorMsg('Password confirmation does not match.');
        return;
      }
    }

    const res = await updateUser(
      {
        name: cleanName,
        email: cleanEmail,
        avatar: editAvatar,
        role: 'Admin',
      },
      editPassword || undefined
    );

    if (res.success) {
      setIsEditModalOpen(false);
      setToastMessage('✓ Admin profile updated successfully!');
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#f5f3ff' }]}>
      {/* Top Header matching Screenshot 2 */}
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          {Platform.OS === 'web' ? (
            <img
              src={BACK_ARROW_SVG(isDark ? '#f8fafc' : '#0f172a')}
              alt="Back"
              style={{ width: 22, height: 22, display: 'block' }}
            />
          ) : (
            <Text style={{ fontSize: 20 }}>←</Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
          Admin Profile
        </Text>
      </View>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastBox}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Geometric Polygon Crystal Banner matching Screenshot 2 */}
        <View style={styles.bannerContainer}>
          {Platform.OS === 'web' ? (
            <img
              src={POLY_BG_SVG}
              alt="Geometric Banner"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <View style={{ flex: 1, backgroundColor: '#c4b5fd' }} />
          )}
        </View>

        {/* Elevated Profile Card matching Screenshot 2 */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          {/* Overlapping Avatar Circle with Camera badge */}
          <TouchableOpacity
            style={[
              styles.avatarOverlapCircle,
              { backgroundColor: isDark ? '#1e293b' : '#e0e7ff' },
            ]}
            onPress={handleOpenEditModal}
            activeOpacity={0.85}
          >
            {adminAvatar ? (
              <Image source={{ uri: adminAvatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.silhouetteWrapper}>
                <View style={styles.silhouetteHead} />
                <View style={styles.silhouetteBody} />
              </View>
            )}

            <View style={styles.cameraBadge}>
              {Platform.OS === 'web' ? (
                <img src={CAMERA_ICON_SVG} alt="Edit" style={{ width: 14, height: 14 }} />
              ) : (
                <Text style={{ fontSize: 10, color: '#ffffff' }}>📷</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Edit Profile Action Chip */}
          <TouchableOpacity
            style={[styles.editChip, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
            onPress={handleOpenEditModal}
            activeOpacity={0.8}
          >
            {Platform.OS === 'web' ? (
              <img src={PENCIL_ICON_SVG} alt="Edit" style={{ width: 14, height: 14, marginRight: 6 }} />
            ) : null}
            <Text style={styles.editChipText}>Edit Profile</Text>
          </TouchableOpacity>

          {/* Section 1: Admin Name */}
          <View style={styles.cardField}>
            <Text style={[styles.fieldLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Admin Name
            </Text>
            <Text style={[styles.fieldValueName, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {adminName}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

          {/* Section 2: Admin Email */}
          <View style={styles.cardField}>
            <Text style={[styles.fieldLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Admin Email
            </Text>
            <Text style={[styles.fieldValueEmail, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {adminEmail}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

          {/* Section 3: Password */}
          <View style={styles.cardRowField}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                {Platform.OS === 'web' ? (
                  <img src={KEY_ICON_SVG} alt="Key" style={{ width: 22, height: 22 }} />
                ) : (
                  <Text style={{ fontSize: 18 }}>🔑</Text>
                )}
              </View>
              <View>
                <Text style={[styles.rowLabel, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  Password
                </Text>
                <Text style={[styles.passwordAsterisks, { color: isDark ? '#94a3b8' : '#334155' }]}>
                  ********
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.changePasswordPill, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
              onPress={handleOpenEditModal}
              activeOpacity={0.8}
            >
              <Text style={styles.changePasswordPillText}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' }]} />

          {/* Section 4: Enable Dark Mode */}
          <View style={styles.cardRowField}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                {Platform.OS === 'web' ? (
                  <img src={PALETTE_ICON_SVG} alt="Palette" style={{ width: 22, height: 22 }} />
                ) : (
                  <Text style={{ fontSize: 18 }}>🎨</Text>
                )}
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
        </View>

        {/* Quick Workspace Switcher & Sign Out */}
        <View style={styles.bottomActionsCol}>
          <TouchableOpacity
            style={[styles.switchModeBtn, { backgroundColor: isDark ? '#1e293b' : '#ede9fe' }]}
            onPress={onSwitchToEmployeeMode}
            activeOpacity={0.8}
          >
            <Text style={[styles.switchModeBtnText, { color: isDark ? '#c084fc' : '#6d28d9' }]}>
              👥 Switch to Employee Workspace
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signOutBtn}
            onPress={logout}
            activeOpacity={0.8}
          >
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profile Edit Modal */}
      {isEditModalOpen && (
        <Modal transparent animationType="slide" visible={isEditModalOpen}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? '#111827' : '#ffffff',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                Edit Admin Profile
              </Text>
              <Text style={[styles.modalSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Update your administrative credentials, email, avatar, or password.
              </Text>

              {errorMsg && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
                {/* Choose Avatar Presets */}
                <Text style={[styles.inputGroupLabel, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                  Choose Profile Picture
                </Text>
                <View style={styles.avatarPresetsRow}>
                  {EXECUTIVE_AVATARS.map((avUrl, i) => {
                    const isSelected = editAvatar === avUrl;
                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.presetAvatarBox,
                          isSelected && styles.presetAvatarBoxSelected,
                        ]}
                        onPress={() => setEditAvatar(avUrl)}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: avUrl }} style={styles.presetAvatarImg} />
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Avatar URL Input */}
                <View style={styles.formField}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
                    Or Custom Photo URL
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        color: isDark ? colors.textPrimary : '#0f172a',
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                      },
                    ]}
                    placeholder="https://..."
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    value={editAvatar}
                    onChangeText={setEditAvatar}
                  />
                </View>

                {/* Admin Name Input */}
                <View style={styles.formField}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
                    Full Name
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        color: isDark ? colors.textPrimary : '#0f172a',
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                      },
                    ]}
                    placeholder="Admin Name"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    value={editName}
                    onChangeText={setEditName}
                  />
                </View>

                {/* Admin Email Input */}
                <View style={styles.formField}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
                    Admin Email Address
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        color: isDark ? colors.textPrimary : '#0f172a',
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                      },
                    ]}
                    placeholder="admin@enterprise.com"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Change Divider */}
                <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#e2e8f0', marginVertical: 14 }]} />
                <Text style={[styles.inputGroupLabel, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                  Change Password (Optional)
                </Text>

                {/* New Password */}
                <View style={styles.formField}>
                  <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
                    New Password
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      {
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        color: isDark ? colors.textPrimary : '#0f172a',
                        borderColor: isDark ? '#334155' : '#e2e8f0',
                      },
                    ]}
                    placeholder="Leave blank to keep current"
                    placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                    value={editPassword}
                    onChangeText={setEditPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>

                {/* Confirm Password */}
                {editPassword.length > 0 && (
                  <View style={styles.formField}>
                    <Text style={[styles.inputLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
                      Confirm New Password
                    </Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        {
                          backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                          color: isDark ? colors.textPrimary : '#0f172a',
                          borderColor: isDark ? '#334155' : '#e2e8f0',
                        },
                      ]}
                      placeholder="Re-enter new password"
                      placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                    />
                  </View>
                )}

                {editPassword.length > 0 && (
                  <TouchableOpacity
                    style={styles.togglePasswordRow}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={[styles.togglePasswordText, { color: '#2563eb' }]}>
                      {showPassword ? 'Hide Password' : 'Show Password'}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              {/* Modal Buttons */}
              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={[styles.cancelModalBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                  onPress={() => setIsEditModalOpen(false)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cancelModalBtnText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveModalBtn}
                  onPress={handleSaveProfile}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveModalBtnText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
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
  toastBox: {
    position: 'absolute',
    top: 56,
    left: 20,
    right: 20,
    backgroundColor: '#15803d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 99,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
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
    paddingBottom: 24,
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
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  silhouetteWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 48,
  },
  silhouetteHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    marginBottom: 4,
  },
  silhouetteBody: {
    width: 60,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
  },
  cameraBadge: {
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
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  editChipText: {
    color: '#2563eb',
    fontSize: 12.5,
    fontWeight: '700',
  },
  cardField: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
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
  changePasswordPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changePasswordPillText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    width: '100%',
    height: 1,
    marginVertical: 4,
  },
  bottomActionsCol: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  switchModeBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchModeBtnText: {
    fontSize: 15,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 13.5,
    lineHeight: 19,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '600',
  },
  inputGroupLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  avatarPresetsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  presetAvatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  presetAvatarBoxSelected: {
    borderColor: '#2563eb',
    transform: [{ scale: 1.08 }],
  },
  presetAvatarImg: {
    width: '100%',
    height: '100%',
  },
  formField: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 5,
  },
  textInput: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14.5,
  },
  togglePasswordRow: {
    paddingVertical: 4,
    marginBottom: 10,
  },
  togglePasswordText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  cancelModalBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveModalBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveModalBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
