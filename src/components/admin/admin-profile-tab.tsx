import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Switch,
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
  const { user, logout } = useAuth();

  const adminName = user.role === 'Admin' ? user.name || 'Alex Smith' : 'Alex Smith';
  const adminEmail = user.role === 'Admin' ? user.email || 'a.smith@enterprise.com' : 'a.smith@enterprise.com';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#f5f3ff' }]}>
      {/* Top Header with Back Arrow matching Screenshot 2 */}
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Geometric Polygon Crystal Banner */}
        <View style={styles.bannerContainer}>
          {Platform.OS === 'web' ? (
            <img
              src={POLY_BG_SVG}
              alt="Geometric"
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
});
