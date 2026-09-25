import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Modal,
  RefreshControl,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth, StoredAccount } from '@/context/auth-context';
import { useDocuments } from '@/context/documents-context';

interface AdminUsersTabProps {
  onViewEmployeeDocs: (employee: StoredAccount) => void;
}

export function AdminUsersTab({ onViewEmployeeDocs }: AdminUsersTabProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { registeredAccounts, removeAccount, syncWithBackend } = useAuth();
  const { documents, refreshDocuments } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [employeeToRemove, setEmployeeToRemove] = useState<StoredAccount | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    refreshDocuments();
    syncWithBackend();
  }, [refreshDocuments, syncWithBackend]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshDocuments(), syncWithBackend()]);
    setRefreshing(false);
  };

  // Active staff only (excluding pending approvals and admins)
  const activeStaff = registeredAccounts.filter(
    (a) => a.role?.toLowerCase() !== 'admin' && a.status !== 'pending' && a.status !== 'rejected'
  );

  // Dynamic department list for quick filtering
  const departments = ['All', ...Array.from(new Set(activeStaff.map((a) => a.department || 'Operations')))];

  const filteredStaff = activeStaff.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.department || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'All' || (a.department || 'Operations') === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleConfirmRemove = async () => {
    if (employeeToRemove) {
      await removeAccount(employeeToRemove.email);
      setEmployeeToRemove(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? '#38bdf8' : '#2563eb'}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={[styles.mainTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                Staff Directory
              </Text>
              <Text style={[styles.subTitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {activeStaff.length} Verified Personnel • Encrypted Credentials
              </Text>
            </View>
            <View style={[styles.liveStaffPill, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : '#a7f3d0' }]}>
              <View style={styles.liveStaffDot} />
              <Text style={[styles.liveStaffText, { color: isDark ? '#6ee7b7' : '#059669' }]}>LIVE DIRECTORY</Text>
            </View>
          </View>
        </View>

        {/* Search Bar with Glassmorphic Border */}
        <View
          style={[
            styles.searchBarWrapper,
            {
              backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : '#ffffff',
              borderColor: isDark ? 'rgba(56, 189, 248, 0.2)' : '#e2e8f0',
            },
            Platform.OS === 'web' && ({
              backdropFilter: 'blur(12px)',
              boxShadow: isDark
                ? '0 4px 20px rgba(0, 0, 0, 0.25)'
                : '0 4px 16px rgba(15, 23, 42, 0.05)',
            } as any),
          ]}
        >
          <View style={styles.searchIconBox}>
            {Platform.OS === 'web' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#38bdf8' : '#2563eb'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            ) : (
              <Text style={{ fontSize: 14 }}>🔍</Text>
            )}
          </View>
          <TextInput
            style={[styles.searchInput, { color: isDark ? colors.textPrimary : '#0f172a' }]}
            placeholder="Search by Name, Email, or Department..."
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={() => setSearchQuery('')}
              activeOpacity={0.7}
            >
              <Text style={[styles.clearSearchText, { color: isDark ? '#94a3b8' : '#64748b' }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Department Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deptFilterRow}
        >
          {departments.map((dept) => {
            const isSelected = selectedDept === dept;
            const count = dept === 'All' ? activeStaff.length : activeStaff.filter((a) => (a.department || 'Operations') === dept).length;
            return (
              <TouchableOpacity
                key={dept}
                style={[
                  styles.deptPill,
                  {
                    backgroundColor: isSelected
                      ? isDark
                        ? '#2563eb'
                        : '#1e40af'
                      : isDark
                      ? 'rgba(30, 41, 59, 0.6)'
                      : '#ffffff',
                    borderColor: isSelected
                      ? isDark
                        ? '#60a5fa'
                        : '#1d4ed8'
                      : isDark
                      ? 'rgba(255, 255, 255, 0.08)'
                      : '#e2e8f0',
                  },
                  Platform.OS === 'web' && ({
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  } as any),
                ]}
                onPress={() => setSelectedDept(dept)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.deptPillText,
                    {
                      color: isSelected ? '#ffffff' : isDark ? '#cbd5e1' : '#475569',
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {dept} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Staff List Cards */}
        {filteredStaff.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <Text style={{ fontSize: 32, marginBottom: 10 }}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              No Employees Found
            </Text>
            <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              No staff members match &quot;{searchQuery}&quot; in {selectedDept}.
            </Text>
            {(searchQuery.length > 0 || selectedDept !== 'All') && (
              <TouchableOpacity
                style={[styles.resetFilterBtn, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedDept('All');
                }}
              >
                <Text style={[styles.resetFilterText, { color: isDark ? '#38bdf8' : '#2563eb' }]}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredStaff.map((employee) => {
            const employeeEmailClean = (employee.email || '').trim().toLowerCase();
            const employeeNameClean = (employee.name || '').trim().toLowerCase();

            const empUploadedDocs = documents.filter((d) => {
              const docEmailClean = (d.employeeEmail || '').trim().toLowerCase();
              const docNameClean = (d.employeeName || '').trim().toLowerCase();
              return (
                (docEmailClean && docEmailClean === employeeEmailClean) ||
                (docNameClean && employeeNameClean && docNameClean === employeeNameClean)
              );
            });

            const docCount = empUploadedDocs.length > 0 ? empUploadedDocs.length : (employee.documentsCount ?? 0);

            return (
              <View
                key={employee.email}
                style={[
                  styles.employeeCard,
                  {
                    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.75)' : '#ffffff',
                    borderColor: isDark ? 'rgba(56, 189, 248, 0.15)' : '#e2e8f0',
                  },
                  Platform.OS === 'web' && ({
                    backdropFilter: 'blur(10px)',
                    boxShadow: isDark
                      ? '0 6px 20px rgba(0, 0, 0, 0.35)'
                      : '0 6px 18px rgba(15, 23, 42, 0.06)',
                    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  } as any),
                ]}
              >
                {/* Top Row: Avatar with Glow Ring, Info, Active Pill */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.avatarWrapper}>
                    <Image
                      source={{
                        uri:
                          employee.avatar ||
                          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                      }}
                      style={styles.avatarImg}
                    />
                    <View style={styles.onlineStatusDot} />
                  </View>

                  <View style={styles.infoCol}>
                    <View style={styles.nameBadgeRow}>
                      <Text
                        style={[styles.employeeName, { color: isDark ? colors.textPrimary : '#0f172a' }]}
                        numberOfLines={1}
                      >
                        {employee.name}
                      </Text>
                      <View style={[styles.activePill, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : '#ecfdf5' }]}>
                        <Text style={[styles.activePillText, { color: isDark ? '#6ee7b7' : '#059669' }]}>Verified</Text>
                      </View>
                    </View>

                    <Text style={[styles.employeeEmail, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                      {employee.email}
                    </Text>

                    {/* Department Tag & Document Count */}
                    <View style={styles.tagRow}>
                      <View
                        style={[
                          styles.deptTag,
                          { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#eff6ff', borderColor: isDark ? '#334155' : '#bfdbfe' },
                        ]}
                      >
                        <Text style={[styles.deptTagText, { color: isDark ? '#93c5fd' : '#1e40af' }]}>
                          💼 {employee.department || 'Operations'}
                        </Text>
                      </View>

                      <View style={[styles.docCountRow, { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.08)' : '#f8fafc', borderColor: isDark ? 'rgba(56, 189, 248, 0.2)' : '#e2e8f0' }]}>
                        {Platform.OS === 'web' ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#38bdf8' : '#2563eb'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', marginRight: 5 } as any}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        ) : (
                          <Text style={{ fontSize: 12, marginRight: 5 }}>📄</Text>
                        )}
                        <Text style={[styles.docCountText, { color: isDark ? '#7dd3fc' : '#1d4ed8' }]}>
                          {docCount} {docCount === 1 ? 'Document' : 'Documents'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Bottom Buttons: View Documents & Remove */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.viewDocsBtn,
                      Platform.OS === 'web' && ({
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                        cursor: 'pointer',
                        transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      } as any),
                    ]}
                    onPress={() => onViewEmployeeDocs(employee)}
                    activeOpacity={0.85}
                  >
                    {Platform.OS === 'web' ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', marginRight: 6 } as any}>
                        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                      </svg>
                    ) : (
                      <Text style={{ fontSize: 15, marginRight: 6 }}>📁</Text>
                    )}
                    <Text style={styles.viewDocsBtnText}>View Documents Vault</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.removeBtn,
                      {
                        backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2',
                        borderColor: isDark ? 'rgba(239, 68, 68, 0.35)' : '#fecaca',
                      },
                      Platform.OS === 'web' && ({
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      } as any),
                    ]}
                    onPress={() => setEmployeeToRemove(employee)}
                    activeOpacity={0.85}
                  >
                    {Platform.OS === 'web' ? (
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', marginRight: 5 } as any}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    ) : (
                      <Text style={{ fontSize: 13, marginRight: 5 }}>🗑️</Text>
                    )}
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Confirmation Modal for Employee Removal */}
      {employeeToRemove && (
        <Modal transparent animationType="fade" visible={!!employeeToRemove}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.confirmDialog,
                {
                  backgroundColor: isDark ? '#111827' : '#ffffff',
                  borderColor: isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca',
                },
                Platform.OS === 'web' && ({
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.4)',
                } as any),
              ]}
            >
              <View style={styles.dialogWarningIconBox}>
                <Text style={{ fontSize: 28 }}>⚠️</Text>
              </View>
              <Text style={[styles.dialogTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                Remove Personnel
              </Text>
              <Text style={[styles.dialogMessage, { color: isDark ? '#94a3b8' : '#475569' }]}>
                Are you sure you want to revoke access and remove <Text style={{ fontWeight: '800', color: isDark ? '#f8fafc' : '#0f172a' }}>{employeeToRemove.name}</Text> ({employeeToRemove.email}) from the active staff directory?
              </Text>

              <View style={styles.dialogActions}>
                <TouchableOpacity
                  style={[styles.cancelModalBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                  onPress={() => setEmployeeToRemove(null)}
                >
                  <Text style={[styles.cancelModalBtnText, { color: isDark ? '#f8fafc' : '#334155' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmRemoveBtn}
                  onPress={handleConfirmRemove}
                >
                  <Text style={styles.confirmRemoveBtnText}>Confirm Deletion</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  headerSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  searchIconBox: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
  },
  filterBtn: {
    padding: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  employeeCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  infoCol: {
    flex: 1,
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  activePill: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activePillText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  employeeEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  deptTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deptTagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  docCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  viewDocsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
  },
  viewDocsBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  liveStaffPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  liveStaffDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10b981',
  },
  liveStaffText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  clearSearchBtn: {
    padding: 8,
    borderRadius: 8,
  },
  clearSearchText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deptFilterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 16,
  },
  deptPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  deptPillText: {
    fontSize: 12.5,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  onlineStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10b981',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  resetFilterBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dialogWarningIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
  },
  removeBtnText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 36,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14.5,
    textAlign: 'center',
    maxWidth: 320,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmDialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  dialogMessage: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 24,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelModalBtn: {
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  confirmRemoveBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 11,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmRemoveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
