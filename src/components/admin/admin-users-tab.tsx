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

// Crisp Vector SVGs matching Screenshot 1
const SEARCH_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"></circle>
  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
</svg>
`)}`;

const FILTER_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="4" y1="21" x2="4" y2="14"></line>
  <line x1="4" y1="10" x2="4" y2="3"></line>
  <line x1="12" y1="21" x2="12" y2="12"></line>
  <line x1="12" y1="8" x2="12" y2="3"></line>
  <line x1="20" y1="21" x2="20" y2="16"></line>
  <line x1="20" y1="12" x2="20" y2="3"></line>
  <line x1="1" y1="14" x2="7" y2="14"></line>
  <line x1="9" y1="8" x2="15" y2="8"></line>
  <line x1="17" y1="16" x2="23" y2="16"></line>
</svg>
`)}`;

const FOLDER_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path>
</svg>
`)}`;

const TRASH_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6"></polyline>
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  <line x1="10" y1="11" x2="10" y2="17"></line>
  <line x1="14" y1="11" x2="14" y2="17"></line>
</svg>
`)}`;

const DOC_COUNTER_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
</svg>
`)}`;

export function AdminUsersTab({ onViewEmployeeDocs }: AdminUsersTabProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { registeredAccounts, removeAccount, syncWithBackend } = useAuth();
  const { documents, refreshDocuments } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
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

  const filteredStaff = activeStaff.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        {/* Header matching Screenshot 1 */}
        <View style={styles.headerSection}>
          <Text style={[styles.mainTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
            Staff Directory
          </Text>
          <Text style={[styles.subTitle, { color: isDark ? '#94a3b8' : '#475569' }]}>
            {activeStaff.length} Active Employees
          </Text>
        </View>

        {/* Search Bar matching Screenshot 1 */}
        <View
          style={[
            styles.searchBarWrapper,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          <View style={styles.searchIconBox}>
            <Image source={{ uri: SEARCH_ICON_SVG }} style={{ width: 18, height: 18 }} resizeMode="contain" />
          </View>
          <TextInput
            style={[styles.searchInput, { color: isDark ? colors.textPrimary : '#0f172a' }]}
            placeholder="Search by Name or Email..."
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
            activeOpacity={0.7}
          >
            <Image source={{ uri: FILTER_ICON_SVG }} style={{ width: 18, height: 18 }} resizeMode="contain" />
          </TouchableOpacity>
        </View>

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
            <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              No employees match "{searchQuery}".
            </Text>
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
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  },
                ]}
              >
                {/* Top Row: Avatar, Info, Active Pill */}
                <View style={styles.cardHeaderRow}>
                  <Image
                    source={{
                      uri:
                        employee.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                    }}
                    style={styles.avatarImg}
                  />

                  <View style={styles.infoCol}>
                    <View style={styles.nameBadgeRow}>
                      <Text
                        style={[styles.employeeName, { color: isDark ? colors.textPrimary : '#0f172a' }]}
                        numberOfLines={1}
                      >
                        {employee.name}
                      </Text>
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>Active</Text>
                      </View>
                    </View>

                    <Text style={[styles.employeeEmail, { color: isDark ? '#94a3b8' : '#475569' }]}>
                      {employee.email}
                    </Text>

                    {/* Department Tag & Document Count */}
                    <View style={styles.tagRow}>
                      <View
                        style={[
                          styles.deptTag,
                          { backgroundColor: isDark ? '#1e293b' : '#e0e7ff' },
                        ]}
                      >
                        <Text style={[styles.deptTagText, { color: isDark ? '#cbd5e1' : '#3730a3' }]}>
                          {employee.department || 'Operations'} ▾
                        </Text>
                      </View>

                      <View style={styles.docCountRow}>
                        <Image
                          source={{ uri: DOC_COUNTER_ICON_SVG }}
                          style={{ width: 14, height: 14, marginRight: 5 }}
                          resizeMode="contain"
                        />
                        <Text style={[styles.docCountText, { color: isDark ? '#94a3b8' : '#475569' }]}>
                          {docCount} Documents
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Bottom Buttons: View Documents & Remove */}
                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.viewDocsBtn}
                    onPress={() => onViewEmployeeDocs(employee)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: FOLDER_ICON_SVG }}
                      style={{ width: 18, height: 18, marginRight: 6 }}
                      resizeMode="contain"
                    />
                    <Text style={styles.viewDocsBtnText}>View Documents</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => setEmployeeToRemove(employee)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: TRASH_ICON_SVG }}
                      style={{ width: 16, height: 16, marginRight: 5 }}
                      resizeMode="contain"
                    />
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
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                },
              ]}
            >
              <Text style={[styles.dialogTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                Remove Employee
              </Text>
              <Text style={[styles.dialogMessage, { color: isDark ? '#94a3b8' : '#475569' }]}>
                Are you sure you want to remove <Text style={{ fontWeight: '700' }}>{employeeToRemove.name}</Text> from the staff directory?
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
                  <Text style={styles.confirmRemoveBtnText}>Remove Staff</Text>
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
  removeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  removeBtnText: {
    color: '#b91c1c',
    fontSize: 14.5,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  confirmDialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 14.5,
    lineHeight: 22,
    marginBottom: 20,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelModalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmRemoveBtn: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  confirmRemoveBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
