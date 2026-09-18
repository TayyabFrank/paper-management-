import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';

interface AdminApprovalsTabProps {
  onOpenMenu?: () => void;
}

const LOGO_BADGE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="6" fill="#1e3a8a"/>
  <path d="M7 6H15L18 9V18C18 18.5523 17.5523 19 17 19H7C6.44772 19 6 18.5523 6 18V7C6 6.44772 6.44772 6 7 6Z" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M14 6V10H18" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
</svg>
`)}`;

const HAMBURGER_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <line x1="3" y1="6" x2="21" y2="6"></line>
  <line x1="3" y1="12" x2="21" y2="12"></line>
  <line x1="3" y1="18" x2="21" y2="18"></line>
</svg>
`)}`;

export function AdminApprovalsTab({ onOpenMenu }: AdminApprovalsTabProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { registeredAccounts, approveAccount, rejectAccount } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const pendingStaff = registeredAccounts.filter((a) => a.status === 'pending');

  const handleApprove = async (email: string, name: string) => {
    await approveAccount(email);
    setToastMessage(`✓ ${name} has been approved and added to the Staff Directory!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReject = async (email: string, name: string) => {
    await rejectAccount(email);
    setToastMessage(`✓ Registration for ${name} has been rejected.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      {/* Top Header Banner matching Screenshot 4 */}
      <View style={[styles.topHeaderBar, { backgroundColor: isDark ? '#0f172a' : '#172554' }]}>
        <View style={styles.topHeaderContent}>
          <View style={styles.brandRow}>
            <Image
              source={{ uri: LOGO_BADGE_SVG }}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
            <Text style={styles.brandTitle}>DocuVault</Text>
          </View>

          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={onOpenMenu}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: HAMBURGER_SVG('#ffffff') }}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toastBox}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Subtitle matching Screenshot 4 */}
        <View style={styles.titleSection}>
          <Text style={[styles.pageTitle, { color: isDark ? colors.textPrimary : '#1e3a8a' }]}>
            Pending Approvals
          </Text>
          <Text style={[styles.pageSubtitle, { color: isDark ? '#94a3b8' : '#475569' }]}>
            Review new employee registrations.
          </Text>
        </View>

        {/* Pending Requests Container Card */}
        {pendingStaff.length === 0 ? (
          <View
            style={[
              styles.allCaughtUpCard,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <Text style={{ fontSize: 36, marginBottom: 12 }}>🎉</Text>
            <Text style={[styles.allCaughtUpTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              All Caught Up!
            </Text>
            <Text style={[styles.allCaughtUpSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              There are no pending employee registration requests waiting for review.
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.approvalsCard,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            {pendingStaff.map((person, idx) => {
              const isLast = idx === pendingStaff.length - 1;

              return (
                <View key={person.email}>
                  <View style={styles.requestItem}>
                    {/* Top Row: Avatar and User Name + Email */}
                    <View style={styles.personHeader}>
                      <Image
                        source={{
                          uri:
                            person.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                        }}
                        style={styles.personAvatar}
                      />
                      <View style={styles.personInfoCol}>
                        <Text
                          style={[
                            styles.personName,
                            { color: isDark ? colors.textPrimary : '#0f172a' },
                          ]}
                          numberOfLines={1}
                        >
                          {person.name}
                        </Text>
                        <Text
                          style={[
                            styles.personEmail,
                            { color: isDark ? '#94a3b8' : '#475569' },
                          ]}
                          numberOfLines={1}
                        >
                          {person.email}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons matching Screenshot 4: Reject & Approve */}
                    <View style={styles.actionBtnRow}>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleReject(person.email, person.name)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => handleApprove(person.email, person.name)}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.approveBtnText}>Approve</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {!isLast && (
                    <View
                      style={[
                        styles.divider,
                        { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9' },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeaderBar: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  topHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hamburgerBtn: {
    padding: 6,
    borderRadius: 8,
  },
  toastBox: {
    position: 'absolute',
    top: 60,
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  titleSection: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  approvalsCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  requestItem: {
    paddingVertical: 8,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  personAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  personInfoCol: {
    flex: 1,
  },
  personName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  personEmail: {
    fontSize: 14.5,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  rejectBtnText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '700',
  },
  approveBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 15.5,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  allCaughtUpCard: {
    padding: 36,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allCaughtUpTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  allCaughtUpSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
});
