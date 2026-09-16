import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';

// Vector icons as crisp SVG URIs
const BACK_ARROW_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="19" y1="12" x2="5" y2="12"></line>
  <polyline points="12 19 5 12 12 5"></polyline>
</svg>
`)}`;

const SEARCH_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="11" cy="11" r="8"></circle>
  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
</svg>
`)}`;

const FILTER_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

const EYE_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="12" cy="12" r="3.5" stroke="#64748b" stroke-width="2"/>
</svg>
`)}`;

// Document Type Badges
const PDF_BLUE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#e8effb"/>
  <path d="M14 10H22L27 15V29C27 29.5523 26.5523 30 26 30H14C13.4477 30 13 29.5523 13 29V11C13 10.4477 13.4477 10 14 10Z" stroke="#2563eb" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M22 10V15H27" stroke="#2563eb" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="20" y="24" font-size="7" font-weight="bold" fill="#2563eb" text-anchor="middle" font-family="sans-serif">PDF</text>
</svg>
`)}`;

const PDF_RED_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#fae8eb"/>
  <path d="M14 10H22L27 15V29C27 29.5523 26.5523 30 26 30H14C13.4477 30 13 29.5523 13 29V11C13 10.4477 13.4477 10 14 10Z" stroke="#991b1b" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M22 10V15H27" stroke="#991b1b" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="20" y="24" font-size="7" font-weight="bold" fill="#991b1b" text-anchor="middle" font-family="sans-serif">PDF</text>
</svg>
`)}`;

const DOCX_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#e0e7ff"/>
  <path d="M14 10H22L27 15V29C27 29.5523 26.5523 30 26 30H14C13.4477 30 13 29.5523 13 29V11C13 10.4477 13.4477 10 14 10Z" stroke="#3730a3" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M22 10V15H27" stroke="#3730a3" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="20" y="24" font-size="8" font-weight="bold" fill="#3730a3" text-anchor="middle" font-family="sans-serif">W</text>
</svg>
`)}`;

const IMAGE_DOC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#e0f2fe"/>
  <rect x="11" y="11" width="18" height="18" rx="3" stroke="#0284c7" stroke-width="1.8"/>
  <circle cx="16" cy="16" r="1.5" fill="#0284c7"/>
  <path d="M12 25L17 19L22 24L25 21L28 25" stroke="#0284c7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

// Category pill icons
const MINI_PDF_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <rect x="2" y="1" width="12" height="14" rx="2" stroke="#b91c1c" stroke-width="1.2"/>
  <text x="8" y="10" font-size="5" font-weight="bold" fill="#b91c1c" text-anchor="middle" font-family="sans-serif">PDF</text>
</svg>
`)}`;

const MINI_DOCX_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <rect x="2" y="1" width="12" height="14" rx="2" stroke="#2563eb" stroke-width="1.2"/>
  <text x="8" y="10.5" font-size="6" font-weight="bold" fill="#2563eb" text-anchor="middle" font-family="sans-serif">W</text>
</svg>
`)}`;

const MINI_ARTICLE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <rect x="2" y="1" width="12" height="14" rx="2" stroke="#b45309" stroke-width="1.2"/>
  <line x1="5" y1="5" x2="11" y2="5" stroke="#b45309" stroke-width="1.2"/>
  <line x1="5" y1="8" x2="11" y2="8" stroke="#b45309" stroke-width="1.2"/>
  <line x1="5" y1="11" x2="9" y2="11" stroke="#b45309" stroke-width="1.2"/>
</svg>
`)}`;

const MINI_IMAGE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <rect x="2" y="2" width="12" height="12" rx="2" stroke="#2563eb" stroke-width="1.2"/>
  <circle cx="5.5" cy="5.5" r="1" fill="#2563eb"/>
  <path d="M3 12L6 8L9 11L11 9L13 12" stroke="#2563eb" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

const MINI_OTHER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <circle cx="4" cy="8" r="1.3" fill="#64748b"/>
  <circle cx="8" cy="8" r="1.3" fill="#64748b"/>
  <circle cx="12" cy="8" r="1.3" fill="#64748b"/>
</svg>
`)}`;

export interface DocumentItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'pdf' | 'docx' | 'image' | 'article' | 'other';
  icon: string;
  previewImage?: string;
  contentSnippet?: string;
  fileSize?: string;
  isSigned?: boolean;
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: '1',
    title: 'Annual Tax Forms 2023',
    subtitle: 'Signed: 10 Jan 2024',
    type: 'pdf',
    icon: PDF_BLUE_SVG,
    fileSize: '1.8 MB',
    isSigned: true,
    contentSnippet: 'Form W-4 & State Withholding Allowance Certificate\nEmployee: Liam Thompson (SSN: ***-**-8492)\nVerified digitally with DocuVault Signature Engine.',
  },
  {
    id: '2',
    title: 'Employment Contract',
    subtitle: 'Signed: 15 Mar 2021',
    type: 'pdf',
    icon: PDF_BLUE_SVG,
    fileSize: '2.4 MB',
    isSigned: true,
    contentSnippet: 'Standard Full-Time Employment Agreement\nRole: Senior Software Engineer\nEmployer: Enterprise Document Management Systems LLC',
  },
  {
    id: '3',
    title: 'Q4 Performance Review',
    subtitle: 'Uploaded: 15 Dec 2023',
    type: 'docx',
    icon: DOCX_SVG,
    fileSize: '480 KB',
    contentSnippet: 'Annual Performance Appraisal Q4 2023\nOverall Score: 4.8 / 5.0 (Exceeds Expectations)\nManager Feedback: Exceptional technical leadership and project delivery.',
  },
  {
    id: '4',
    title: 'Health Card Scan',
    subtitle: 'Uploaded: 01 Nov 2023',
    type: 'image',
    icon: IMAGE_DOC_SVG,
    fileSize: '3.1 MB',
    previewImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
    contentSnippet: 'Scanned Medical & Health Insurance ID Card\nPolicy ID: HC-99420-EXP\nCoverage: Comprehensive Health + Dental + Vision',
  },
  {
    id: '5',
    title: 'Non-Disclosure Agreement',
    subtitle: 'Signed: 15 Mar 2021',
    type: 'pdf',
    icon: PDF_BLUE_SVG,
    fileSize: '1.2 MB',
    isSigned: true,
    contentSnippet: 'Mutual Confidentiality & Proprietary Information Agreement\nSigned by employee and corporate legal counsel on 15 Mar 2021.',
  },
  {
    id: '6',
    title: 'W-2 Form 2023',
    subtitle: 'Not Uploaded',
    type: 'pdf',
    icon: PDF_RED_SVG,
    fileSize: 'Pending',
    contentSnippet: 'Annual Wage and Tax Statement (W-2) for Tax Year 2023. This document is currently awaiting employee upload.',
  },
  {
    id: '7',
    title: 'Direct Deposit Form',
    subtitle: 'Uploaded: 18 Mar 2021',
    type: 'pdf',
    icon: PDF_BLUE_SVG,
    fileSize: '890 KB',
    contentSnippet: 'Payroll Direct Deposit Authorization Form\nBank: Chase Commercial Banking\nRouting & Account Verification: Approved',
  },
  {
    id: '8',
    title: 'Resume',
    subtitle: 'Uploaded: 01 Mar 2021',
    type: 'pdf',
    icon: PDF_RED_SVG,
    fileSize: '620 KB',
    contentSnippet: 'Liam Thompson - Senior Engineering Resume\nEducation: B.S. Computer Science\nSpecializations: Distributed Systems, Enterprise Cloud Arch',
  },
];

interface DocumentsDashboardProps {
  onBack?: () => void;
  employeeName?: string;
  employeeEmail?: string;
  employeeAvatar?: string;
}

export function DocumentsDashboard({
  onBack,
  employeeName = 'Liam Thompson',
  employeeEmail = 'l.thompson@enterprise.com',
  employeeAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
}: DocumentsDashboardProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [uploadNotification, setUploadNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleUploadNew = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      // Demo upload fallback
      simulateNewUpload('Passport Scan (Uploaded)', 'image');
    }
  };

  const handleWebFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isImg = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const newDoc: DocumentItem = {
          id: Date.now().toString(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          subtitle: `Uploaded: Today`,
          type: isImg ? 'image' : 'pdf',
          icon: isImg ? IMAGE_DOC_SVG : PDF_BLUE_SVG,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          previewImage: isImg && uploadEvent.target?.result ? (uploadEvent.target.result as string) : undefined,
          contentSnippet: `Uploaded document: ${file.name}\nStored securely in DocuVault.`,
        };
        setDocuments([newDoc, ...documents]);
        setUploadNotification(`Successfully uploaded "${file.name}"!`);
        setTimeout(() => setUploadNotification(null), 3500);
      };
      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const simulateNewUpload = (name: string, type: 'image' | 'pdf') => {
    const newDoc: DocumentItem = {
      id: Date.now().toString(),
      title: name,
      subtitle: `Uploaded: Just now`,
      type: type,
      icon: type === 'image' ? IMAGE_DOC_SVG : PDF_BLUE_SVG,
      fileSize: '2.5 MB',
      previewImage: type === 'image' ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80' : undefined,
      contentSnippet: `Verified uploaded document: ${name}`,
    };
    setDocuments([newDoc, ...documents]);
    setUploadNotification(`Successfully uploaded "${name}"!`);
    setTimeout(() => setUploadNotification(null), 3500);
  };

  const handleUploadMissing = (docId: string) => {
    setDocuments(
      documents.map((d) =>
        d.id === docId
          ? {
              ...d,
              subtitle: 'Uploaded: Just now',
              icon: PDF_BLUE_SVG,
              contentSnippet: 'W-2 Form 2023 uploaded successfully by employee. Pending HR confirmation.',
            }
          : d
      )
    );
    setSelectedDoc(null);
    setUploadNotification('W-2 Form 2023 uploaded successfully!');
    setTimeout(() => setUploadNotification(null), 3000);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeCategory === 'all') return matchesSearch;
    return matchesSearch && doc.type === activeCategory;
  });

  const pdfCount = documents.filter((d) => d.type === 'pdf').length;
  const docxCount = documents.filter((d) => d.type === 'docx').length;
  const articleCount = documents.filter((d) => d.type === 'article').length;
  const imageCount = documents.filter((d) => d.type === 'image').length;
  const otherCount = documents.filter((d) => d.type === 'other').length;

  return (
    <View style={styles.container}>
      {/* Hidden file input for web document/image upload */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef as any}
          onChange={handleWebFileSelect as any}
          accept="image/*,.pdf,.docx,.doc"
          style={{ display: 'none' }}
        />
      )}

      {/* Upload Notification Toast */}
      {uploadNotification && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{uploadNotification}</Text>
        </View>
      )}

      {/* Top Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <Image source={{ uri: BACK_ARROW_SVG }} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Documents</Text>

        <TouchableOpacity
          style={styles.uploadHeaderButton}
          onPress={handleUploadNew}
          activeOpacity={0.8}
        >
          <Text style={styles.uploadHeaderButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Employee Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: employeeAvatar }}
          style={styles.profileAvatar}
          resizeMode="cover"
        />
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{employeeName}</Text>
          <Text style={styles.profileEmail}>{employeeEmail}</Text>
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Image source={{ uri: SEARCH_ICON_SVG }} style={styles.searchIcon} resizeMode="contain" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your documents..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Image source={{ uri: FILTER_ICON_SVG }} style={styles.filterIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Category Stats Horizontal Scroll / Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'all' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('all')}
          activeOpacity={0.7}
        >
          <Text style={styles.statCount}>{documents.length}</Text>
          <Text style={styles.statLabel}>Total Documents</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'pdf' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('pdf')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_PDF_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{pdfCount}</Text>
          </View>
          <Text style={styles.statLabel}>PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'docx' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('docx')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_DOCX_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{docxCount}</Text>
          </View>
          <Text style={styles.statLabel}>Doxc</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'article' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('article')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_ARTICLE_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{articleCount}</Text>
          </View>
          <Text style={styles.statLabel}>Articles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'image' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('image')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_IMAGE_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{imageCount}</Text>
          </View>
          <Text style={styles.statLabel}>Images</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'other' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('other')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_OTHER_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{otherCount}</Text>
          </View>
          <Text style={styles.statLabel}>Other</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Document Items List */}
      <View style={styles.docList}>
        {filteredDocs.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={styles.docCard}
            onPress={() => setSelectedDoc(doc)}
            activeOpacity={0.8}
          >
            <View style={styles.docIconWrapper}>
              <Image source={{ uri: doc.icon }} style={styles.docTypeImage} resizeMode="contain" />
            </View>

            <View style={styles.docInfo}>
              <Text style={styles.docTitle} numberOfLines={1}>
                {doc.title}
              </Text>
              <Text
                style={[
                  styles.docSubtitle,
                  doc.subtitle === 'Not Uploaded' ? styles.notUploadedText : null,
                ]}
              >
                {doc.subtitle}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setSelectedDoc(doc)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: EYE_ICON_SVG }} style={styles.eyeIcon} resizeMode="contain" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>

      {/* Rich Document & Image Viewer Modal */}
      <Modal
        visible={!!selectedDoc}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedDoc(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            {selectedDoc && (
              <>
                <View style={styles.modalHeaderRow}>
                  <View style={styles.modalIconBadge}>
                    <Image
                      source={{ uri: selectedDoc.icon }}
                      style={styles.modalDocIcon}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalTitle}>{selectedDoc.title}</Text>
                    <Text style={styles.modalSubtitle}>{selectedDoc.subtitle}</Text>
                  </View>
                </View>

                {/* Visual Preview Section (Images & Scans) */}
                {selectedDoc.type === 'image' && selectedDoc.previewImage ? (
                  <View style={styles.imagePreviewContainer}>
                    <Text style={styles.previewSectionLabel}>Uploaded Document Image:</Text>
                    <Image
                      source={{ uri: selectedDoc.previewImage }}
                      style={styles.scannedImage}
                      resizeMode="cover"
                    />
                  </View>
                ) : (
                  /* Digital Document Page Preview */
                  <View style={styles.docPreviewPaper}>
                    <View style={styles.docHeaderStampRow}>
                      <Text style={styles.docPaperDocId}>DOC-ID: #{selectedDoc.id}982</Text>
                      {selectedDoc.isSigned && (
                        <View style={styles.signedBadge}>
                          <Text style={styles.signedBadgeText}>✓ VERIFIED DIGITAL SIGNATURE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.docSnippetText}>{selectedDoc.contentSnippet}</Text>
                  </View>
                )}

                <View style={styles.docStatusRow}>
                  <Text style={styles.docMetaLabel}>File Format:</Text>
                  <Text style={styles.docMetaValue}>{selectedDoc.type.toUpperCase()}</Text>
                </View>

                <View style={styles.docStatusRow}>
                  <Text style={styles.docMetaLabel}>Security & Vault:</Text>
                  <Text style={styles.docMetaEncrypted}>AES-256 Cloud Encrypted</Text>
                </View>

                <View style={styles.modalActionButtons}>
                  {selectedDoc.subtitle === 'Not Uploaded' ? (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: '#1b3569' }]}
                      onPress={() => handleUploadMissing(selectedDoc.id)}
                    >
                      <Text style={styles.modalButtonText}>Upload W-2 Document Now</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.modalButton, { backgroundColor: '#1b3569' }]}
                      onPress={() => setSelectedDoc(null)}
                    >
                      <Text style={styles.modalButtonText}>Download / Print Document</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#f1f5f9', marginTop: 8 }]}
                    onPress={() => setSelectedDoc(null)}
                  >
                    <Text style={{ color: '#475569', fontWeight: '600', fontSize: 14 }}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  toast: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 6,
    marginRight: 6,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
    flex: 1,
  },
  uploadHeaderButton: {
    backgroundColor: '#1b3569',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  uploadHeaderButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#e2e8f0',
  },
  profileDetails: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  profileEmail: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 46,
    marginBottom: 16,
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1e293b',
  },
  filterButton: {
    padding: 6,
  },
  filterIcon: {
    width: 18,
    height: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 6,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  statItemActive: {
    backgroundColor: '#f1f5f9',
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniTypeIcon: {
    width: 16,
    height: 16,
  },
  statCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    fontWeight: '500',
  },
  docList: {
    gap: 10,
  },
  docCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e8edf4',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  docIconWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTypeImage: {
    width: 40,
    height: 40,
  },
  docInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: -0.1,
  },
  docSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 3,
  },
  notUploadedText: {
    color: '#94a3b8',
  },
  eyeButton: {
    padding: 8,
  },
  eyeIcon: {
    width: 22,
    height: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDocIcon: {
    width: 44,
    height: 44,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  imagePreviewContainer: {
    marginVertical: 12,
  },
  previewSectionLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '500',
  },
  scannedImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  docPreviewPaper: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 12,
  },
  docHeaderStampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  docPaperDocId: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  signedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  signedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  docSnippetText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
  docStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  docMetaLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  docMetaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  docMetaEncrypted: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16a34a',
  },
  modalActionButtons: {
    width: '100%',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
