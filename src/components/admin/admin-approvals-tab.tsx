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
      {/* Top Header Banner matching Admin Luxury Spec */}
      <View
        style={[
          styles.topHeaderBar,
          { backgroundColor: isDark ? '#0b1120' : '#172554' },
          Platform.OS === 'web' && ({
            background: isDark
              ? 'linear-gradient(135deg, #090e1a 0%, #0f172a 100%)'
              : 'linear-gradient(135deg, #172554 0%, #1e3a8a 100%)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
          } as any),
        ]}
      >
        <View style={styles.topHeaderContent}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadgeContainer}>
              <Image source={{ uri: LOGO_BADGE_SVG }} style={{ width: 26, height: 26 }} resizeMode="contain" />
            </View>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.brandTitle}>DocuVault</Text>
                <View style={[styles.adminTagPill, isDark && { borderColor: '#38bdf8' }]}>
                  <Text style={styles.adminTagText}>🛡️ ADMIN</Text>
                </View>
              </View>
              <Text style={styles.brandSub}>Personnel Verification Portal</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.hamburgerBtn,
              Platform.OS === 'web' && ({ cursor: 'pointer' } as any),
            ]}
            onPress={onOpenMenu}
            activeOpacity={0.7}
          >
            {Platform.OS === 'web' ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            ) : (
              <View style={{ width: 20, height: 14, justifyContent: 'space-between' }}>
                <View style={{ width: 20, height: 2.2, backgroundColor: '#ffffff', borderRadius: 2 }} />
                <View style={{ width: 20, height: 2.2, backgroundColor: '#ffffff', borderRadius: 2 }} />
                <View style={{ width: 20, height: 2.2, backgroundColor: '#ffffff', borderRadius: 2 }} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Notification */}
      {toastMessage && (
        <View
          style={[
            styles.toastBox,
            Platform.OS === 'web' && ({
              boxShadow: '0 8px 24px rgba(21, 128, 61, 0.45)',
            } as any),
          ]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Subtitle with Pending Count Badge */}
        <View style={styles.titleSection}>
          <View style={styles.titleBadgeRow}>
            <View>
              <Text style={[styles.pageTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                Pending Approvals
              </Text>
              <Text style={[styles.pageSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Review new employee registrations and authorization requests.
              </Text>
            </View>
            {pendingStaff.length > 0 && (
              <View style={[styles.pendingPillBadge, { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.18)' : '#fef3c7', borderColor: isDark ? '#d97706' : '#fde68a' }]}>
                <Text style={[styles.pendingPillText, { color: isDark ? '#fbbf24' : '#b45309' }]}>
                  ⏳ {pendingStaff.length} Awaiting Review
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Pending Requests Container */}
        {pendingStaff.length === 0 ? (
          <View
            style={[
              styles.allCaughtUpCard,
              {
                backgroundColor: isDark ? 'rgba(17, 24, 39, 0.75)' : '#ffffff',
                borderColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e2e8f0',
              },
              Platform.OS === 'web' && ({
                backdropFilter: 'blur(10px)',
                boxShadow: isDark
                  ? '0 6px 20px rgba(0, 0, 0, 0.3)'
                  : '0 6px 18px rgba(15, 23, 42, 0.05)',
              } as any),
            ]}
          >
            <View style={styles.trophyIconBox}>
              <Text style={{ fontSize: 38 }}>🎉</Text>
            </View>
            <Text style={[styles.allCaughtUpTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              All Caught Up!
            </Text>
            <Text style={[styles.allCaughtUpSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              There are no pending employee registration requests waiting for review. All submitted staff profiles are verified.
            </Text>
          </View>
        ) : (
          <View style={styles.cardsList}>
            {pendingStaff.map((person) => {
              return (
                <View
                  key={person.email}
                  style={[
                    styles.pendingRequestCard,
                    {
                      backgroundColor: isDark ? 'rgba(17, 24, 39, 0.75)' : '#ffffff',
                      borderColor: isDark ? 'rgba(245, 158, 11, 0.3)' : '#fde68a',
                      borderLeftColor: '#f59e0b',
                      borderLeftWidth: 4,
                    },
                    Platform.OS === 'web' && ({
                      backdropFilter: 'blur(10px)',
                      boxShadow: isDark
                        ? '0 6px 24px rgba(0, 0, 0, 0.35)'
                        : '0 6px 20px rgba(245, 158, 11, 0.08)',
                    } as any),
                  ]}
                >
                  {/* Top Row: Avatar and User Info */}
                  <View style={styles.personHeader}>
                    <View style={styles.pendingAvatarWrapper}>
                      <Image
                        source={{
                          uri:
                            person.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                        }}
                        style={styles.personAvatar}
                      />
                      <View style={styles.pendingDot} />
                    </View>
                    <View style={styles.personInfoCol}>
                      <View style={styles.nameRow}>
                        <Text
                          style={[
                            styles.personName,
                            { color: isDark ? colors.textPrimary : '#0f172a' },
                          ]}
                          numberOfLines={1}
                        >
                          {person.name}
                        </Text>
                        <View style={[styles.pendingTagPill, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7' }]}>
                          <Text style={[styles.pendingTagText, { color: isDark ? '#fbbf24' : '#b45309' }]}>
                            Pending
                          </Text>
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.personEmail,
                          { color: isDark ? '#94a3b8' : '#64748b' },
                        ]}
                        numberOfLines={1}
                      >
                        {person.email}
                      </Text>
                      <View style={[styles.deptPill, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                        <Text style={[styles.deptPillText, { color: isDark ? '#93c5fd' : '#1e40af' }]}>
                          💼 Department: {person.department || 'Operations'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons: Reject & Approve */}
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={[
                        styles.rejectBtn,
                        Platform.OS === 'web' && ({
                          cursor: 'pointer',
                          transition: 'all 0.18s ease',
                        } as any),
                      ]}
                      onPress={() => handleReject(person.email, person.name)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.rejectBtnText}>✕ Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.approveBtn,
                        Platform.OS === 'web' && ({
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                          cursor: 'pointer',
                          transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        } as any),
                      ]}
                      onPress={() => handleApprove(person.email, person.name)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.approveBtnText}>✓ Approve Access</Text>
                    </TouchableOpacity>
                  </View>
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
  adminTagPill: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  adminTagText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  logoBadgeContainer: {
    padding: 3,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  pendingPillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  pendingPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  trophyIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardsList: {
    gap: 16,
  },
  pendingRequestCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  pendingAvatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  pendingDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f59e0b',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  pendingTagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pendingTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
  deptPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  deptPillText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '800',
  },
  approveBtn: {
    flex: 1.3,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  approveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  allCaughtUpCard: {
    padding: 36,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allCaughtUpTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  allCaughtUpSub: {
    fontSize: 14.5,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 340,
  },
});
