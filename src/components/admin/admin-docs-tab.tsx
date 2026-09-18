import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useDocuments } from '@/context/documents-context';
import { useAuth, StoredAccount } from '@/context/auth-context';
import { DocumentReaderItem } from '@/components/document-reader';

interface AdminDocsTabProps {
  selectedEmployee: StoredAccount | null;
  onBackToUsers: () => void;
  onOpenDocument: (doc: DocumentReaderItem) => void;
}

// Crisp Vector SVGs for Documents View
const BACK_ARROW_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="19" y1="12" x2="5" y2="12"></line>
  <polyline points="12 19 5 12 12 5"></polyline>
</svg>
`)}`;

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

const EYE_ACTION_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z"/>
  <circle cx="12" cy="12" r="3.5" fill="${color}"/>
</svg>
`)}`;

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

function getMiniFileBadge(doc: DocumentReaderItem) {
  if (doc.type === 'image') return MINI_IMAGE_BADGE;
  if (doc.type === 'docx') return MINI_DOCX_BADGE;
  if (doc.subtitle?.toLowerCase().includes('not uploaded')) return MINI_RED_PDF_BADGE;
  return MINI_PDF_BADGE;
}

export function AdminDocsTab({
  selectedEmployee,
  onBackToUsers,
  onOpenDocument,
}: AdminDocsTabProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { documents } = useDocuments();
  const { registeredAccounts } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Target selected employee or first registered employee
  const firstStaff = registeredAccounts.find((a) => a.role === 'Employee');
  const targetEmployee = selectedEmployee || firstStaff || null;

  const employeeName = targetEmployee?.name || 'All Registered Staff';
  const employeeEmail = targetEmployee?.email || '';
  const employeeAvatar =
    targetEmployee?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

  // Gather documents strictly for this employee (or all documents if none selected)
  const employeeDocs = targetEmployee
    ? documents.filter(
        (d) =>
          (d.employeeEmail && d.employeeEmail.toLowerCase() === targetEmployee.email.toLowerCase()) ||
          (d.employeeName && d.employeeName.toLowerCase() === targetEmployee.name.toLowerCase()) ||
          (!d.employeeEmail && !d.employeeName)
      )
    : documents;

  const filteredDocs = employeeDocs.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'all') return matchesSearch;
    return matchesSearch && d.type === activeCategory;
  });

  const pdfCount = employeeDocs.filter((d) => d.type === 'pdf').length;
  const docxCount = employeeDocs.filter((d) => d.type === 'docx').length;
  const articleCount = employeeDocs.filter((d) => d.type === 'article').length;
  const imageCount = employeeDocs.filter((d) => d.type === 'image').length;
  const otherCount = employeeDocs.filter((d) => d.type === 'other' || d.type === 'link').length;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      {/* Top Header with Back Arrow matching Screenshot 3 */}
      <View style={[styles.topHeader, { borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBackToUsers}
          activeOpacity={0.7}
        >
          <Image
            source={{ uri: BACK_ARROW_SVG(isDark ? '#f8fafc' : '#0f172a') }}
            style={{ width: 22, height: 22 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text
          style={[styles.headerTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}
          numberOfLines={1}
        >
          All Documents for {employeeName}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Employee Summary Card matching Screenshot 3 */}
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
                {employeeName}
              </Text>
              <View style={styles.activePill}>
                <Text style={styles.activePillText}>Active</Text>
              </View>
            </View>
            <Text style={[styles.summaryEmail, { color: isDark ? '#94a3b8' : '#475569' }]}>
              {employeeEmail}
            </Text>
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
            <Image
              source={{ uri: SEARCH_ICON_SVG }}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          </View>
          <TextInput
            style={[styles.searchInput, { color: isDark ? colors.textPrimary : '#0f172a' }]}
            placeholder={`Search ${employeeName.split(' ')[0]}'s documents...`}
            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: FILTER_ICON_SVG }}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
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
            onPress={() => setActiveCategory('all')}
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
            onPress={() => setActiveCategory('pdf')}
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
            onPress={() => setActiveCategory('docx')}
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
            onPress={() => setActiveCategory('article')}
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
            onPress={() => setActiveCategory('image')}
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

          <TouchableOpacity
            style={[
              styles.categoryPill,
              activeCategory === 'other' && styles.categoryPillActive,
            ]}
            onPress={() => setActiveCategory('other')}
            activeOpacity={0.7}
          >
            <Text style={styles.categoryPillEmoji}>💬</Text>
            <Text style={[styles.categoryCount, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {otherCount}
            </Text>
            <Text style={[styles.categoryLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Other
            </Text>
          </TouchableOpacity>
        </ScrollView>

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
              No documents found for this category.
            </Text>
          </View>
        ) : (
          filteredDocs.map((doc) => {
            const isNotUploaded = doc.subtitle?.toLowerCase().includes('not uploaded');

            return (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.docCard,
                  {
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  },
                ]}
                onPress={() => onOpenDocument(doc)}
                activeOpacity={0.8}
              >
                {/* File Icon Badge */}
                <View style={styles.badgeContainer}>
                  <Image
                    source={{ uri: getMiniFileBadge(doc) }}
                    style={{ width: 38, height: 38 }}
                    resizeMode="contain"
                  />
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
                </View>

                {/* Eye Icon Action Button */}
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => onOpenDocument(doc)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: EYE_ACTION_SVG(isDark ? '#94a3b8' : '#64748b') }}
                    style={{ width: 22, height: 22 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
        )}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
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
    fontSize: 13.5,
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
    marginBottom: 3,
  },
  docSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  eyeBtn: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});
