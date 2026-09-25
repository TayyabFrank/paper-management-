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
  RefreshControl,
  Modal,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useDocuments } from '@/context/documents-context';
import { useAuth, StoredAccount } from '@/context/auth-context';
import { DocumentReaderItem } from '@/components/document-reader';

interface AdminDocsTabProps {
  selectedEmployee: StoredAccount | null;
  onSelectEmployee?: (emp: StoredAccount | null) => void;
  onBackToUsers: () => void;
  onOpenDocument: (doc: DocumentReaderItem) => void;
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
}

// File type badge icons matching Screenshot 3
const MINI_PDF_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#eff6ff"/>
  <path d="M12 9H21L26 14V28C26 29.1046 25.1046 30 24 30H12C10.8954 30 10 29.1046 10 28V11C10 9.89543 10.8954 9 12 9Z" stroke="#2563eb" stroke-width="1.6" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M21 9V14H26" stroke="#2563eb" stroke-width="1.6" stroke-linejoin="round"/>
  <text x="18" y="24" font-size="6.5" font-weight="800" fill="#2563eb" text-anchor="middle" font-family="sans-serif">PDF</text>
</svg>
`)}`;

const MINI_RED_PDF_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#fef2f2"/>
  <path d="M12 9H21L26 14V28C26 29.1046 25.1046 30 24 30H12C10.8954 30 10 29.1046 10 28V11C10 9.89543 10.8954 9 12 9Z" stroke="#dc2626" stroke-width="1.6" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M21 9V14H26" stroke="#dc2626" stroke-width="1.6" stroke-linejoin="round"/>
  <text x="18" y="24" font-size="6.5" font-weight="800" fill="#dc2626" text-anchor="middle" font-family="sans-serif">PDF</text>
</svg>
`)}`;

const MINI_DOCX_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#eff6ff"/>
  <path d="M12 9H21L26 14V28C26 29.1046 25.1046 30 24 30H12C10.8954 30 10 29.1046 10 28V11C10 9.89543 10.8954 9 12 9Z" stroke="#2563eb" stroke-width="1.6" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M21 9V14H26" stroke="#2563eb" stroke-width="1.6" stroke-linejoin="round"/>
  <text x="18" y="24" font-size="7.5" font-weight="900" fill="#2563eb" text-anchor="middle" font-family="sans-serif">W</text>
</svg>
`)}`;

const MINI_IMAGE_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#eff6ff"/>
  <rect x="10" y="10" width="18" height="18" rx="3" stroke="#2563eb" stroke-width="1.6" fill="#ffffff"/>
  <circle cx="15" cy="15" r="1.8" fill="#2563eb"/>
  <path d="M11 25L16 19L20 23L23 20L27 25" stroke="#2563eb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;



const MINI_LINK_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#ecfeff"/>
  <path d="M12 20C12 16.6863 14.6863 14 18 14H20M20 14H22C25.3137 14 28 16.6863 28 20C28 23.3137 25.3137 26 22 26H20M15 20H23" stroke="#0891b2" stroke-width="2" stroke-linecap="round"/>
  <text x="19" y="32" font-size="6.5" font-weight="900" fill="#0891b2" text-anchor="middle" font-family="sans-serif">LINK</text>
</svg>
`)}`;

const MINI_VIDEO_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#fff1f2"/>
  <rect x="9" y="10" width="20" height="15" rx="3" stroke="#e11d48" stroke-width="1.6" fill="#ffffff"/>
  <polygon points="17,14 23,17.5 17,21" fill="#e11d48"/>
  <text x="19" y="32" font-size="6.5" font-weight="900" fill="#e11d48" text-anchor="middle" font-family="sans-serif">VID</text>
</svg>
`)}`;

function getMiniFileBadge(doc: DocumentReaderItem) {
  if (doc.type === 'image') return MINI_IMAGE_BADGE;
  if (doc.type === 'docx') return MINI_DOCX_BADGE;
  if (
    doc.type === 'link' ||
    Boolean(
      doc.fileUrl &&
        (doc.fileUrl.includes('drive.google.com') ||
          doc.fileUrl.includes('docs.google.com') ||
          doc.fileUrl.startsWith('http'))
    )
  ) {
    return MINI_LINK_BADGE;
  }
  if (doc.type === 'video') return MINI_VIDEO_BADGE;
  if (doc.subtitle?.toLowerCase().includes('not uploaded')) return MINI_RED_PDF_BADGE;
  return MINI_PDF_BADGE;
}

export function AdminDocsTab({
  selectedEmployee,
  onSelectEmployee,
  onBackToUsers,
  onOpenDocument,
  initialCategory = 'all',
  onCategoryChange,
}: AdminDocsTabProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { documents, refreshDocuments, deleteDocument } = useDocuments();
  const { registeredAccounts, syncWithBackend } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'all');
  const [otherSubFilter, setOtherSubFilter] = useState<'all' | 'links' | 'misc'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentReaderItem | null>(null);

  const [prevInitialCategory, setPrevInitialCategory] = useState(initialCategory);
  if (prevInitialCategory !== initialCategory) {
    setPrevInitialCategory(initialCategory);
    if (initialCategory) {
      if (initialCategory === 'link') {
        setActiveCategory('other');
        setOtherSubFilter('links');
      } else {
        setActiveCategory(initialCategory);
      }
    }
  }

  const selectCategory = (cat: string) => {
    setActiveCategory(cat);
    if (cat === 'other') {
      setOtherSubFilter('all');
    }
    onCategoryChange?.(cat);
  };

  useEffect(() => {
    refreshDocuments();
    syncWithBackend();
  }, [refreshDocuments, syncWithBackend]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshDocuments(), syncWithBackend()]);
    setRefreshing(false);
  };

  // Active employees registered in the system (all staff except admin)
  const activeEmployees = registeredAccounts.filter(
    (a) => a.role?.toLowerCase() !== 'admin' && a.status !== 'pending' && a.status !== 'rejected'
  );

  const isAllDocsMode = !selectedEmployee;
  const employeeName = selectedEmployee ? selectedEmployee.name : 'All Staff Documents';
  const employeeEmail = selectedEmployee?.email || '';
  const employeeAvatar = selectedEmployee?.avatar ||
    (selectedEmployee
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(employeeName)}&background=2563eb&color=fff&size=128`
      : 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80');

  // Filter documents: if an employee is selected, show ONLY that employee's docs. Otherwise show ALL documents.
  const employeeDocs = selectedEmployee?.email
    ? documents.filter((d: DocumentReaderItem) => {
        const docEmail = (d.employeeEmail || '').trim().toLowerCase();
        const selEmail = (selectedEmployee.email || '').trim().toLowerCase();
        const docName = (d.employeeName || '').trim().toLowerCase();
        const selName = (selectedEmployee.name || '').trim().toLowerCase();
        return (docEmail && docEmail === selEmail) || (docName && selName && docName === selName);
      })
    : documents;

  const isLinkDoc = (d: DocumentReaderItem) =>
    d.type === 'link' ||
    Boolean(
      d.fileUrl &&
        (d.fileUrl.includes('drive.google.com') ||
          d.fileUrl.includes('docs.google.com') ||
          d.fileUrl.startsWith('http'))
    );

  // Other folder contains Google Drive links and miscellaneous archives
  const isOtherDoc = (d: DocumentReaderItem) =>
    isLinkDoc(d) ||
    d.type === 'other' ||
    !['pdf', 'docx', 'article', 'image', 'video'].includes(d.type || '');

  const filteredDocs = employeeDocs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.employeeName && d.employeeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.employeeEmail && d.employeeEmail.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeCategory === 'all') return true;
    if (activeCategory === 'video') return d.type === 'video';
    if (activeCategory === 'other' || activeCategory === 'link') {
      if (!isOtherDoc(d)) return false;
      if (otherSubFilter === 'links' || activeCategory === 'link') return isLinkDoc(d);
      if (otherSubFilter === 'misc') return !isLinkDoc(d);
      return true;
    }
    return d.type === activeCategory;
  });

  const pdfCount = employeeDocs.filter((d) => d.type === 'pdf').length;
  const docxCount = employeeDocs.filter((d) => d.type === 'docx').length;
  const articleCount = employeeDocs.filter((d) => d.type === 'article').length;
  const imageCount = employeeDocs.filter((d) => d.type === 'image').length;
  const videoCount = employeeDocs.filter((d) => d.type === 'video').length;
  const linkDocsCount = employeeDocs.filter(isLinkDoc).length;
  const otherTotalCount = employeeDocs.filter(isOtherDoc).length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      {/* Top Header with Back Arrow and Title */}
      <View style={[styles.topHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBackToUsers}
          activeOpacity={0.7}
        >
          {Platform.OS === 'web' ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#f8fafc' : '#0f172a'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          ) : (
            <Text style={{ fontSize: 20, color: isDark ? '#f8fafc' : '#0f172a', fontWeight: '700' }}>←</Text>
          )}
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}
          numberOfLines={1}
        >
          {selectedEmployee ? `Documents: ${employeeName}` : 'All Employee Documents'}
        </Text>

        {selectedEmployee && onSelectEmployee && (
          <TouchableOpacity
            style={styles.allDocsHeaderBtn}
            onPress={() => onSelectEmployee(null)}
            activeOpacity={0.7}
          >
            <Text style={styles.allDocsHeaderBtnText}>All Docs</Text>
          </TouchableOpacity>
        )}
      </View>

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
        {/* Employee Switcher Pills */}
        <View style={styles.employeeFilterContainer}>
          <Text style={[styles.filterSectionLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            FILTER BY EMPLOYEE:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.employeeFilterScroll}
          >
            <TouchableOpacity
              style={[
                styles.empFilterPill,
                isAllDocsMode && styles.empFilterPillActive,
                { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' },
              ]}
              onPress={() => onSelectEmployee?.(null)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.empFilterPillText,
                isAllDocsMode && styles.empFilterPillTextActive,
                { color: isAllDocsMode ? '#ffffff' : (isDark ? '#e2e8f0' : '#334155') },
              ]}>
                📁 All Documents ({documents.length})
              </Text>
            </TouchableOpacity>

            {activeEmployees.map((emp) => {
              const empEmail = (emp.email || '').trim().toLowerCase();
              const empName = (emp.name || '').trim().toLowerCase();
              const isSelected = selectedEmployee?.email?.trim().toLowerCase() === empEmail;
              const empDocCount = documents.filter((d) => {
                const docEmail = (d.employeeEmail || '').trim().toLowerCase();
                const docName = (d.employeeName || '').trim().toLowerCase();
                return (docEmail && docEmail === empEmail) || (docName && empName && docName === empName);
              }).length;

              return (
                <TouchableOpacity
                  key={emp.email}
                  style={[
                    styles.empFilterPill,
                    isSelected && styles.empFilterPillActive,
                    { borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1' },
                  ]}
                  onPress={() => onSelectEmployee?.(emp)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.empFilterPillText,
                    isSelected && styles.empFilterPillTextActive,
                    { color: isSelected ? '#ffffff' : (isDark ? '#e2e8f0' : '#334155') },
                  ]}>
                    👤 {emp.name} ({empDocCount})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Employee Summary Card or All-Docs Hub Card */}
        <View
          style={[
            styles.employeeSummaryCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          <Image source={{ uri: employeeAvatar }} style={styles.summaryAvatar} />
          <View style={styles.summaryInfo}>
            <View style={styles.summaryNameRow}>
              <Text style={[styles.summaryName, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                {isAllDocsMode ? 'All Employee Documents' : employeeName}
              </Text>
              <View style={[styles.activePill, isAllDocsMode && { backgroundColor: '#f0fdf4' }]}>
                <Text style={[styles.activePillText, isAllDocsMode && { color: '#16a34a' }]}>
                  {isAllDocsMode ? `${documents.length} Total Docs` : 'Active Staff'}
                </Text>
              </View>
            </View>
            <Text style={[styles.summaryEmail, { color: isDark ? '#94a3b8' : '#475569' }]}>
              {isAllDocsMode
                ? `Showing uploads across all registered staff members (${activeEmployees.length} employees)`
                : employeeEmail}
            </Text>

            {selectedEmployee && onSelectEmployee && (
              <TouchableOpacity
                style={styles.switchAllBtn}
                onPress={() => onSelectEmployee(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.switchAllBtnText}>← View All Employee Documents</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search Bar matching Screenshot 3 */}
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
            {Platform.OS === 'web' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            ) : (
              <Text style={{ fontSize: 14 }}>🔍</Text>
            )}
          </View>
          <TextInput
            style={[styles.searchInput, { color: isDark ? colors.textPrimary : '#0f172a' }]}
            placeholder={isAllDocsMode ? "Search all uploaded documents..." : `Search ${employeeName.split(' ')[0]}'s documents...`}
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
            activeOpacity={0.7}
          >
            {Platform.OS === 'web' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
              </svg>
            ) : (
              <Text style={{ fontSize: 14 }}>⚙️</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Stat Pills matching Screenshot 3 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryStatsRow}
        >
          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'all' && styles.categoryPillActive,
            ]}
            onPress={() => selectCategory('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.categoryCount, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {employeeDocs.length}
            </Text>
            <Text style={[styles.categoryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Total Documents
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'pdf' && styles.categoryPillActive,
            ]}
            onPress={() => selectCategory('pdf')}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryPillEmoji}>📄</Text>
            <Text style={[styles.categoryCount, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {pdfCount}
            </Text>
            <Text style={[styles.categoryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              PDF
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'docx' && styles.categoryPillActive,
            ]}
            onPress={() => selectCategory('docx')}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryPillEmoji}>📘</Text>
            <Text style={[styles.categoryCount, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {docxCount}
            </Text>
            <Text style={[styles.categoryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Doxc
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'article' && styles.categoryPillActive,
            ]}
            onPress={() => selectCategory('article')}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryPillEmoji}>📰</Text>
            <Text style={[styles.categoryCount, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {articleCount}
            </Text>
            <Text style={[styles.categoryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Articles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'image' && styles.categoryPillActive,
            ]}
            onPress={() => selectCategory('image')}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryPillEmoji}>🖼️</Text>
            <Text style={[styles.categoryCount, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {imageCount}
            </Text>
            <Text style={[styles.categoryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Images
            </Text>
          </TouchableOpacity>

          {/* Videos */}
          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'video' && styles.categoryPillActive,
            ]}
            onPress={() => selectCategory('video')}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryPillEmoji}>🎥</Text>
            <Text style={[styles.categoryCount, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {videoCount}
            </Text>
            <Text style={[styles.categoryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Videos
            </Text>
          </TouchableOpacity>

          {/* Other (contains Google Drive Links & Other files) */}
          <TouchableOpacity
            style={[
              styles.categoryPill,
              (activeCategory === 'other' || activeCategory === 'link') && styles.categoryPillActive,
            ]}
            onPress={() => selectCategory('other')}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryPillEmoji}>📁</Text>
            <Text style={[styles.categoryCount, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {otherTotalCount}
            </Text>
            <Text style={[styles.categoryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Other
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Prominent Google Drive Links Folder inside the "Other" folder */}
        {(activeCategory === 'other' || activeCategory === 'link') && (
          <View
            style={[
              styles.otherFolderBanner,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
          >
            <View style={styles.otherFolderHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.folderIconBox, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                  <Text style={{ fontSize: 20 }}>📁</Text>
                </View>
                <View>
                  <Text style={[styles.otherFolderTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                    Other Repository Vault
                  </Text>
                  <Text style={[styles.otherFolderSub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                    {otherTotalCount} items • {linkDocsCount} Google Drive Links
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.otherSubTabsRow}>
              <TouchableOpacity
                style={[
                  styles.otherSubTabBtn,
                  otherSubFilter === 'all' && styles.otherSubTabBtnActive,
                  {
                    backgroundColor:
                      otherSubFilter === 'all'
                        ? '#2563eb'
                        : isDark
                        ? '#1e293b'
                        : '#f1f5f9',
                  },
                ]}
                onPress={() => setOtherSubFilter('all')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.otherSubTabText,
                    {
                      color:
                        otherSubFilter === 'all'
                          ? '#ffffff'
                          : isDark
                          ? '#cbd5e1'
                          : '#475569',
                    },
                  ]}
                >
                  All Other ({otherTotalCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.otherSubTabBtn,
                  otherSubFilter === 'links' && styles.otherSubTabBtnActive,
                  {
                    backgroundColor:
                      otherSubFilter === 'links'
                        ? '#0891b2'
                        : isDark
                        ? '#083344'
                        : '#ecfeff',
                    borderColor: isDark ? '#155e75' : '#a5f3fc',
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setOtherSubFilter('links')}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13, marginRight: 2 }}>🔗</Text>
                <Text
                  style={[
                    styles.otherSubTabText,
                    {
                      color:
                        otherSubFilter === 'links'
                          ? '#ffffff'
                          : isDark
                          ? '#38bdf8'
                          : '#0891b2',
                      fontWeight: '700',
                    },
                  ]}
                >
                  Google Drive Links ({linkDocsCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.otherSubTabBtn,
                  otherSubFilter === 'misc' && styles.otherSubTabBtnActive,
                  {
                    backgroundColor:
                      otherSubFilter === 'misc'
                        ? '#475569'
                        : isDark
                        ? '#1e293b'
                        : '#f1f5f9',
                  },
                ]}
                onPress={() => setOtherSubFilter('misc')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.otherSubTabText,
                    {
                      color:
                        otherSubFilter === 'misc'
                          ? '#ffffff'
                          : isDark
                          ? '#cbd5e1'
                          : '#475569',
                    },
                  ]}
                >
                  Other Files ({otherTotalCount - linkDocsCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Document Cards List */}
        {filteredDocs.length === 0 ? (
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
              {selectedEmployee
                ? `No documents found for ${employeeName}.`
                : 'No documents uploaded yet.'}
            </Text>
            {selectedEmployee && onSelectEmployee && (
              <TouchableOpacity
                style={styles.emptyViewAllBtn}
                onPress={() => onSelectEmployee(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.emptyViewAllBtnText}>
                  View All Uploaded Documents ({documents.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredDocs.map((doc) => {
            const isNotUploaded = doc.subtitle?.toLowerCase().includes('not uploaded');
            const docAccentColor =
              doc.type === 'pdf'
                ? '#ef4444'
                : doc.type === 'docx'
                ? '#2563eb'
                : doc.type === 'article'
                ? '#8b5cf6'
                : doc.type === 'image'
                ? '#06b6d4'
                : doc.type === 'video'
                ? '#f43f5e'
                : '#10b981';

            return (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.docCard,
                  {
                    backgroundColor: isDark ? 'rgba(17, 24, 39, 0.8)' : '#ffffff',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
                    borderLeftColor: docAccentColor,
                    borderLeftWidth: 4,
                  },
                  Platform.OS === 'web' && ({
                    backdropFilter: 'blur(10px)',
                    boxShadow: isDark
                      ? '0 6px 20px rgba(0, 0, 0, 0.3)'
                      : '0 4px 16px rgba(15, 23, 42, 0.06)',
                    cursor: 'pointer',
                    transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.18s ease',
                  } as any),
                ]}
                onPress={() => onOpenDocument(doc)}
                activeOpacity={0.8}
              >
                {/* File Icon Badge */}
                <View style={[styles.badgeContainer, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', borderColor: isDark ? '#334155' : '#e2e8f0' }]}>
                  {Platform.OS === 'web' ? (
                    <Image
                      source={{ uri: getMiniFileBadge(doc) }}
                      style={{ width: 38, height: 38 }}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={{ fontSize: 24, textAlign: 'center' }}>
                      {doc.type === 'image' ? '🖼️' : doc.type === 'docx' ? '📝' : isLinkDoc(doc) ? '🔗' : doc.type === 'video' ? '🎬' : '📄'}
                    </Text>
                  )}
                </View>

                {/* Document Information */}
                <View style={styles.docDetailsCol}>
                  <Text
                    style={[
                      styles.docTitle,
                      { color: isDark ? colors.textPrimary : '#0f172a' },
                    ]}
                    numberOfLines={1}
                  >
                    {doc.title}
                  </Text>
                  <Text
                    style={[
                      styles.docSubtitle,
                      {
                        color: isNotUploaded
                          ? '#ef4444'
                          : isDark
                          ? '#94a3b8'
                          : '#64748b',
                      },
                    ]}
                  >
                    {doc.subtitle}
                  </Text>

                  {/* Uploaded By Author Chip & Drive Indicator */}
                  <View style={styles.uploaderRow}>
                    <Text
                      style={[
                        styles.uploaderBadgeText,
                        { color: isDark ? '#60a5fa' : '#2563eb' },
                      ]}
                      numberOfLines={1}
                    >
                      👤 {doc.employeeName || 'Staff Member'}{doc.employeeEmail ? ` • ${doc.employeeEmail}` : ''}
                    </Text>
                    {isLinkDoc(doc) && (
                      <View
                        style={[
                          styles.driveLinkPill,
                          {
                            backgroundColor: isDark ? '#083344' : '#ecfeff',
                            borderColor: isDark ? '#155e75' : '#a5f3fc',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.driveLinkPillText,
                            { color: isDark ? '#38bdf8' : '#0891b2' },
                          ]}
                        >
                          🔗 Google Drive Link
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Actions: Eye View & Trash Delete */}
                <View style={styles.cardActionsCol}>
                  <TouchableOpacity
                    style={[
                      styles.eyeBtn,
                      { backgroundColor: isDark ? 'rgba(56, 189, 248, 0.12)' : '#eff6ff', borderColor: isDark ? '#0284c7' : '#bfdbfe' },
                      Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                    ]}
                    onPress={() => onOpenDocument(doc)}
                    activeOpacity={0.7}
                  >
                    {Platform.OS === 'web' ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isDark ? '#38bdf8' : '#2563eb'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                        <path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z"/>
                        <circle cx="12" cy="12" r="3.5" fill={isDark ? '#38bdf8' : '#2563eb'}/>
                      </svg>
                    ) : (
                      <Text style={{ fontSize: 16 }}>👁️</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.trashBtn,
                      { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2', borderColor: isDark ? '#b91c1c' : '#fecaca' },
                      Platform.OS === 'web' && ({ cursor: 'pointer', transition: 'all 0.15s ease' } as any),
                    ]}
                    onPress={(e) => {
                      e.stopPropagation?.();
                      setDocToDelete(doc);
                    }}
                    activeOpacity={0.7}
                  >
                    {Platform.OS === 'web' ? (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' } as any}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    ) : (
                      <Text style={{ fontSize: 14 }}>🗑️</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <Modal transparent animationType="fade" visible={Boolean(docToDelete)}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: isDark ? '#1e293b' : '#ffffff',
                  borderColor: isDark ? '#334155' : '#e2e8f0',
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                Delete Document?
              </Text>
              <Text style={[styles.modalDesc, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Are you sure you want to delete &quot;{docToDelete.title}&quot;? This will remove the document from both the employee profile and administration.
              </Text>
              <View style={styles.modalActionsRow}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: isDark ? '#475569' : '#cbd5e1' }]}
                  onPress={() => setDocToDelete(null)}
                >
                  <Text style={[styles.modalCancelText, { color: isDark ? '#cbd5e1' : '#475569' }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  onPress={async () => {
                    await deleteDocument(docToDelete.id);
                    setDocToDelete(null);
                  }}
                >
                  <Text style={styles.modalDeleteText}>Delete</Text>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    flex: 1,
  },
  allDocsHeaderBtn: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  allDocsHeaderBtnText: {
    color: '#2563eb',
    fontSize: 12.5,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  employeeFilterContainer: {
    marginBottom: 16,
  },
  filterSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  employeeFilterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  empFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  empFilterPillActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  empFilterPillText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  empFilterPillTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  employeeSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  summaryInfo: {
    flex: 1,
  },
  summaryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  summaryName: {
    fontSize: 17,
    fontWeight: '800',
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
  summaryEmail: {
    fontSize: 13,
    lineHeight: 18,
  },
  switchAllBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  switchAllBtnText: {
    color: '#2563eb',
    fontSize: 12,
    fontWeight: '700',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 16,
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
    height: 42,
    fontSize: 14.5,
  },
  filterBtn: {
    padding: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
    gap: 6,
  },
  categoryPillActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  categoryPillEmoji: {
    fontSize: 13,
  },
  categoryCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  badgeContainer: {
    marginRight: 14,
  },
  docDetailsCol: {
    flex: 1,
  },
  docTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  docSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  uploaderRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  uploaderBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
  },
  driveLinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  driveLinkPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cardActionsCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eyeBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  trashBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  emptyCard: {
    padding: 30,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14.5,
    textAlign: 'center',
  },
  emptyViewAllBtn: {
    marginTop: 14,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyViewAllBtnText: {
    color: '#2563eb',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalDeleteBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#ef4444',
  },
  modalDeleteText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  otherFolderBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  otherFolderHeader: {
    marginBottom: 12,
  },
  folderIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherFolderTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  otherFolderSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  otherSubTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  otherSubTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  otherSubTabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  otherSubTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
