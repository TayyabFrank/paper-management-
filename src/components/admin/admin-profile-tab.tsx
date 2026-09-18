import React, { useState } from 'react';
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
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

interface AdminProfileTabProps {
  onBack: () => void;
  onSwitchToEmployeeMode?: () => void;
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

export function AdminProfileTab({ onBack, onSwitchToEmployeeMode }: AdminProfileTabProps) {
  const { isDark, toggleTheme, colors } = useDocuVaultTheme();
  const { user, logout, updateUser } = useAuth();

  const adminName = user.role === 'Admin' ? user.name || 'Alex Smith' : 'Alex Smith';
  const adminEmail = user.role === 'Admin' ? user.email || 'admin@enterprise.com' : 'admin@enterprise.com';

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(adminName);
  const [editEmail, setEditEmail] = useState(adminEmail);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const handleOpenEdit = () => {
    setEditName(user.name || adminName);
    setEditEmail(user.email || adminEmail);
    setNewPassword('');
    setShowPassword(false);
    setEditError(null);
    setEditModalVisible(true);
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

    setIsSaving(true);
    const result = await updateUser(
      { name: cleanName, email: cleanEmail },
      newPassword.trim() ? newPassword.trim() : undefined
    );
    setIsSaving(false);

    if (!result.success) {
      setEditError(result.error || 'Failed to update admin profile.');
      return;
    }

    setEditModalVisible(false);
    setFeedbackToast('✓ Admin email & profile updated successfully!');
    setTimeout(() => {
      setFeedbackToast(null);
    }, 3500);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#f5f3ff' }]}>
      {/* Top Header with Back Arrow matching Screenshot 2 */}
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
          {/* Overlapping Avatar Circle */}
          <View
            style={[
              styles.avatarOverlapCircle,
              { backgroundColor: isDark ? '#1e293b' : '#e0e7ff' },
            ]}
          >
            <View style={styles.silhouetteHead} />
            <View style={styles.silhouetteBody} />
          </View>

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

          {/* Section 2: Admin Email (with direct Edit button) */}
          <View style={styles.cardField}>
            <View style={styles.fieldLabelRow}>
              <Text style={[styles.fieldLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Admin Email
              </Text>
              <TouchableOpacity
                style={[styles.editEmailPill, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
                onPress={handleOpenEdit}
                activeOpacity={0.7}
              >
                <Text style={[styles.editEmailPillText, { color: isDark ? '#38bdf8' : '#2563eb' }]}>
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
                  ********
                </Text>
              </View>
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

          {/* Edit Profile & Email Action Button */}
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
              ✏️ Update Admin Profile & Email
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
            <Text style={styles.signOutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Admin Profile & Email Modal */}
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
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              ✏️ Update Admin Details
            </Text>
            <Text style={[styles.modalSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              You can update your admin login email, display name, and password.
            </Text>

            {editError && (
              <View style={styles.modalErrorBanner}>
                <Text style={styles.modalErrorText}>⚠️ {editError}</Text>
              </View>
            )}

            {/* Admin Work Email */}
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

            {/* Admin Name */}
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
                placeholder="Alex Smith"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              />
            </View>

            {/* Change Password (Optional) */}
            <View style={styles.modalInputGroup}>
              <View style={styles.modalPwdHeaderRow}>
                <Text style={[styles.modalInputLabel, { color: colors.textPrimary }]}>
                  🔒 New Password (Optional)
                </Text>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ fontSize: 13, color: isDark ? '#38bdf8' : '#2563eb', fontWeight: '600' }}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={[
                  styles.modalTextInput,
                  {
                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#cbd5e1',
                    color: colors.textPrimary,
                  },
                ]}
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (editError) setEditError(null);
                }}
                placeholder="Leave blank to keep existing"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
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
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
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
  editEmailPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  editEmailPillText: {
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
    maxWidth: 480,
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
  modalPwdHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
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
});
