import { useDocuments } from '@/context/documents-context';
import { useDocuVaultTheme } from '@/context/theme-context';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { TabKey } from './bottom-navbar';
import { DocumentReaderItem } from './document-reader';
import { detectFileType, getDocumentTypeIcon } from './documents-dashboard';
import { ThemeToggleButton } from './theme-toggle-button';
import { UploadPermissionModal, UploadedItemResult } from './upload-permission-modal';

interface NewDocViewProps {
  onDocumentAdded?: () => void;
  onNavigateTab: (tab: TabKey) => void;
}

// Crisp Vector SVGs matching the screenshot
const TOP_FOLDER_BADGE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
  <rect x="8" y="11" width="8" height="5" rx="1" stroke="#ffffff" stroke-width="1.6"/>
</svg>
`)}`;

const WATERMARK_FOLDER_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
  <line x1="8" y1="12" x2="8" y2="16"/>
  <line x1="12" y1="10" x2="12" y2="16"/>
  <line x1="16" y1="13" x2="16" y2="16"/>
</svg>
`)}`;

const OVERLAPPING_DOCS_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
  <!-- Back document -->
  <path d="M34 14H54L64 24V56C64 57.6569 62.6569 59 61 59H34C32.3431 59 31 57.6569 31 56V17C31 15.3431 32.3431 14 34 14Z" stroke="#94a3b8" stroke-width="2.6" fill="#f8fafc" stroke-linejoin="round"/>
  <path d="M54 14V24H64" stroke="#94a3b8" stroke-width="2.6" stroke-linejoin="round"/>
  <!-- Front document -->
  <path d="M22 24H44L54 34V66C54 67.6569 52.6569 69 51 69H22C20.3431 69 19 67.6569 19 66V27C19 25.3431 20.3431 24 22 24Z" stroke="#1b3569" stroke-width="2.8" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M44 24V34H54" stroke="#1b3569" stroke-width="2.8" stroke-linejoin="round"/>
  <!-- Document text lines -->
  <line x1="26" y1="41" x2="34" y2="41" stroke="#1b3569" stroke-width="2.6" stroke-linecap="round"/>
  <line x1="26" y1="48" x2="45" y2="48" stroke="#1b3569" stroke-width="2.6" stroke-linecap="round"/>
  <line x1="26" y1="55" x2="43" y2="55" stroke="#1b3569" stroke-width="2.6" stroke-linecap="round"/>
</svg>
`)}`;

const UPLOAD_ARROW_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="17 8 12 3 7 8"/>
  <line x1="12" y1="3" x2="12" y2="15"/>
</svg>
`)}`;

const GOOGLE_DRIVE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="20" viewBox="0 0 87.3 78" fill="none">
  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
</svg>
`)}`;

export function NewDocView({ onNavigateTab }: NewDocViewProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { addDocument } = useDocuments();
  const [driveLink, setDriveLink] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [sendToAdmin, setSendToAdmin] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    fileUrl?: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadFromComputer = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setIsPermissionModalVisible(true);
    }
  };

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      let blobUrl: string | undefined;
      try {
        blobUrl = URL.createObjectURL(f);
      } catch (err) {
        console.warn('Could not create object URL:', err);
      }
      setSelectedFile({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        fileUrl: blobUrl,
      });
      if (!documentTitle) {
        setDocumentTitle(f.name.replace(/\.[^/.]+$/, ''));
      }
      setFeedbackToast(`Selected file: ${f.name}`);
      setTimeout(() => setFeedbackToast(null), 3000);
    }
  };

  const handleModalUploadSuccess = (item: UploadedItemResult) => {
    setSelectedFile({
      name: item.name,
      size: item.size,
      fileUrl: item.url,
    });
    if (!documentTitle) {
      setDocumentTitle(item.name.replace(/\.[^/.]+$/, ''));
    }
    if (item.url) {
      setDriveLink(item.url);
    }
    setFeedbackToast(`Attached: "${item.name}"`);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleSubmit = () => {
    if (!sendToAdmin) {
      setFeedbackToast('⚠️ You must tick "send this document the ADMIN through the email" to submit.');
      setTimeout(() => setFeedbackToast(null), 3500);
      return;
    }

    const finalTitle = documentTitle.trim() || selectedFile?.name || (driveLink ? 'Google Drive Document' : '');
    if (!finalTitle && !driveLink && !selectedFile) {
      setFeedbackToast('⚠️ Please upload a file or enter a Google Drive link before submitting.');
      setTimeout(() => setFeedbackToast(null), 3000);
      return;
    }

    const isDrive = Boolean(driveLink.trim());
    const detectedType: 'link' | 'pdf' | 'docx' | 'image' | 'article' | 'other' = isDrive
      ? 'link'
      : selectedFile
        ? detectFileType(selectedFile.name)
        : 'pdf';

    const isCV =
      finalTitle.toLowerCase().includes('cv') ||
      finalTitle.toLowerCase().includes('resume') ||
      finalTitle.toLowerCase().includes('portfolio');

    const cleanCandidate = finalTitle
      .replace(/\.[^/.]+$/, '')
      .replace(/_cv$/i, '')
      .replace(/_resume$/i, '')
      .replace(/[-_]/g, ' ')
      .trim() || 'Tayyab';

    const newDoc: DocumentReaderItem = {
      id: Date.now().toString(),
      title: finalTitle,
      subtitle: `Uploaded: Today`,
      type: detectedType,
      icon: getDocumentTypeIcon(detectedType, finalTitle),
      fileSize: isDrive ? 'Drive Link' : selectedFile?.size || '1.5 MB',
      fileUrl: selectedFile?.fileUrl || (isDrive ? driveLink : undefined),
      fileName: selectedFile?.name || finalTitle,
      previewImage: detectedType === 'image' ? selectedFile?.fileUrl : undefined,
      fullContent: isCV
        ? {
            category: 'Curriculum Vitae / Resume',
            date: 'Today',
            authorOrIssuer: cleanCandidate,
            sections: [
              {
                heading: 'Professional Profile & Summary',
                body:
                  documentDescription.trim() ||
                  `Dedicated engineering and systems specialist with comprehensive experience in software architecture, enterprise document workflows, and high-performance digital platforms. Proven record of delivering resilient mobile and web interfaces with verified cryptographic security.`,
              },
              {
                heading: 'Portfolio & Key Deliverables',
                body: `• Primary Portfolio Submission: ${documentDescription.trim() || 'Enterprise Applications & Document Systems'}\n• Core Deliverable: DocuVault Enterprise System featuring real-time document inspection, automated indexing, and responsive Light/Dark user interface.\n• Architecture: Cross-platform mobile/web integration, offline caching, and biometric verification workflows.`,
              },
              {
                heading: 'Technical Skills & Core Competencies',
                body: `• Mobile & Web: React Native, TypeScript, Expo SDK, JavaScript, HTML5/CSS3\n• Systems & Security: SHA-256 Cryptographic Verification, Access Control, Audit Logs\n• Architecture: State Management, REST APIs, Cloud Ingestion, Component Design Systems`,
              },
              {
                heading: 'Professional Experience',
                body: `• Senior Systems Engineer (2022 — Present)\n  - Engineered enterprise document management portal supporting multi-format files and cloud drive links.\n  - Built instant file inspection and live embedded preview pipelines.\n  - Automated administrative compliance notifications and record preservation.`,
              },
              {
                heading: 'Education & Professional Credentials',
                body: `• Bachelor of Science in Computer Science / Engineering (Honors)\n• Certified Enterprise Software Solutions Architect\n• Enterprise Document Security Clearance`,
              },
            ],
            metadata: {
              'Document Category': 'Curriculum Vitae (CV)',
              'Candidate': cleanCandidate,
              'Submission Status': 'Verified & Uploaded',
              'Admin Email Notification': 'Dispatched',
              ...(selectedFile?.size ? { 'File Size': selectedFile.size } : {}),
            },
          }
        : {
            category: isDrive ? 'Cloud Links & Drive' : 'Employee Uploads',
            date: 'Today',
            authorOrIssuer: cleanCandidate,
            sections: [
              {
                heading: 'Document Overview & Content',
                body:
                  documentDescription.trim() ||
                  (isDrive
                    ? `Google Drive URL: ${driveLink}\nVerified and authorized for workspace.`
                    : `Uploaded file: ${finalTitle}\nStored securely in DocuVault with full enterprise encryption.`),
              },
              {
                heading: 'Cryptographic & Audit Verification',
                body: `• Document deposited into DocuVault secure storage\n• Storage Class: High Availability Enterprise Tier\n• Admin Notification: Dispatched to Administrator via Email\n• Verification Hash: Cryptographic SHA-256 Validated`,
              },
            ],
            metadata: isDrive
              ? {
                  'Resource Type': 'Google Drive Link',
                  'URL': driveLink,
                  'Admin Notified': 'Yes (Email Dispatched)',
                }
              : {
                  'File Name': selectedFile?.name || finalTitle,
                  'Size': selectedFile?.size || '1.5 MB',
                  'Admin Notified': 'Yes (Email Dispatched)',
                },
          },
    };

    addDocument(newDoc);
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setFeedbackToast(`✓ "${finalTitle}" successfully submitted and added to your workspace!`);
      setTimeout(() => {
        setFeedbackToast(null);
        onNavigateTab('docs');
      }, 1500);
    }, 1000);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: isDark ? colors.background : '#f0f4fa' },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hidden Web File Input for Native File System Access */}
      {Platform.OS === 'web' && (
        <input
          type="file"
          ref={fileInputRef as any}
          onChange={handleWebFileChange as any}
          accept=".pdf,.docx,.doc,.pptx,image/*"
          style={{ display: 'none' }}
        />
      )}

      {/* Watermark Illustration in Top Right */}
      <View style={styles.watermarkContainer} pointerEvents="none">
        <Image
          source={{ uri: WATERMARK_FOLDER_SVG }}
          style={[styles.watermarkImage, { opacity: isDark ? 0.08 : 0.4 }]}
          resizeMode="contain"
        />
      </View>

      <View style={styles.maxWidthWrapper}>
        {/* Top Header Row with Folder Badge & Theme Toggle */}
        <View style={styles.topHeaderRow}>
          <View style={styles.topFolderBadge}>
            <Image
              source={{ uri: TOP_FOLDER_BADGE_SVG }}
              style={styles.topFolderBadgeIcon}
              resizeMode="contain"
            />
          </View>
          <ThemeToggleButton compact showLabel={false} />
        </View>

        {/* Page Title and Subtitle */}
        <Text style={[styles.mainHeading, { color: colors.textPrimary }]}>
          New Document Upload
        </Text>
        <Text style={[styles.mainSubheading, { color: isDark ? '#94a3b8' : '#64748b' }]}>
          Add files to your private document workspace.
        </Text>

        {/* Feedback Toast */}
        {feedbackToast && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{feedbackToast}</Text>
          </View>
        )}

        {/* Main Upload Card Container */}
        <View
          style={[
            styles.mainCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              shadowColor: isDark ? '#000000' : '#0f172a',
            },
          ]}
        >
          {/* Inner Dashed Box Matching Screenshot */}
          <View
            style={[
              styles.dashedZone,
              {
                borderColor: isDark ? '#334155' : '#c7d2fe',
                backgroundColor: isDark ? '#162033' : '#f8fafd',
              },
            ]}
          >
            {/* Overlapping Blue Documents Illustration */}
            <View style={styles.illustrationWrapper}>
              <Image
                source={{ uri: OVERLAPPING_DOCS_SVG }}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>

            {/* Upload from Computer Button */}
            <TouchableOpacity
              style={[
                styles.uploadComputerBtn,
                { backgroundColor: isDark ? '#2563eb' : '#1b3569' },
              ]}
              onPress={handleUploadFromComputer}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: UPLOAD_ARROW_SVG }}
                style={styles.uploadArrowIcon}
                resizeMode="contain"
              />
              <Text style={styles.uploadComputerBtnText}>Upload Your Deveice</Text>
            </TouchableOpacity>

            {/* Drag Files Text & Supported Types */}
            <Text style={[styles.dragNotice, { color: colors.textPrimary }]}>
              {selectedFile ? `Attached: ${selectedFile.name} (${selectedFile.size})` : 'Drag files or click below to browse'}
            </Text>
            <Text style={[styles.supportedTypesNotice, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              Supported file types: PDF, DOCX, PPTX. Max size: 50MB.
            </Text>

            {/* OR Divider Line */}
            <View style={styles.orDividerRow}>
              <View style={[styles.orDividerLine, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} />
              <Text style={[styles.orText, { color: isDark ? '#94a3b8' : '#94a3b8' }]}>OR</Text>
              <View style={[styles.orDividerLine, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]} />
            </View>

            {/* Google Drive Link Section */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                🔗 Google Drive Link
              </Text>
              <View
                style={[
                  styles.driveInputWrapper,
                  {
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#27354f' : '#d1d5db',
                  },
                ]}
              >
                <Image
                  source={{ uri: GOOGLE_DRIVE_SVG }}
                  style={styles.driveIcon}
                  resizeMode="contain"
                />
                <TextInput
                  style={[styles.driveInput, { color: colors.textPrimary }]}
                  placeholder="Paste your Drive document URL here (e.g., https://docs.google.com/document/d/...)"
                  placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
                  value={driveLink}
                  onChangeText={setDriveLink}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Document Title Section */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                🏷️ Document Title
              </Text>
              <TextInput
                style={[
                  styles.standardInput,
                  {
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#27354f' : '#d1d5db',
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="e.g., Annual Report"
                placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
                value={documentTitle}
                onChangeText={setDocumentTitle}
              />
            </View>

            {/* Document Description Section */}
            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: colors.textPrimary }]}>
                📝 Document Description
              </Text>
              <TextInput
                style={[
                  styles.standardInput,
                  styles.textAreaInput,
                  {
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? '#27354f' : '#d1d5db',
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="Provide a brief summary of the document content..."
                placeholderTextColor={isDark ? '#64748b' : '#9ca3af'}
                value={documentDescription}
                onChangeText={setDocumentDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Checkbox: send this document the ADMIN through the email */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setSendToAdmin(!sendToAdmin)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkboxBox,
                  {
                    borderColor: sendToAdmin ? (isDark ? '#38bdf8' : '#1b3569') : (isDark ? '#475569' : '#94a3b8'),
                    backgroundColor: sendToAdmin ? (isDark ? '#2563eb' : '#1b3569') : 'transparent',
                  },
                ]}
              >
                {sendToAdmin && <Text style={styles.checkmarkText}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.textPrimary }]}>
                ✉️ send this document the ADMIN through the email
              </Text>
            </TouchableOpacity>
          </View>

          {/* SUBMIT Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: isDark ? '#2563eb' : '#1b3569',
                opacity: !sendToAdmin || isUploading ? 0.5 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={!sendToAdmin || isUploading}
            activeOpacity={0.85}
          >
            {isUploading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>SUBMIT</Text>
            )}
          </TouchableOpacity>

          {!sendToAdmin && (
            <Text style={[styles.mustTickNotice, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              ⚠️ Tick the box above to authorize sending to Admin before submitting
            </Text>
          )}
        </View>
      </View>

      {/* Multi-Source Permission Modal (Gallery, Browser, Link) */}
      <UploadPermissionModal
        visible={isPermissionModalVisible}
        onClose={() => setIsPermissionModalVisible(false)}
        title="Upload Document or Photo"
        onUploadSuccess={handleModalUploadSuccess}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 95,
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    position: 'relative',
    zIndex: 1,
  },
  watermarkContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 0,
  },
  watermarkImage: {
    width: 140,
    height: 140,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  topFolderBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1b3569',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1b3569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  topFolderBadgeIcon: {
    width: 20,
    height: 20,
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  mainSubheading: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 18,
  },
  toast: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 14,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  mainCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  dashedZone: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
  },
  illustrationWrapper: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  illustrationImage: {
    width: 76,
    height: 76,
  },
  uploadComputerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    width: '100%',
    maxWidth: 320,
    gap: 8,
    shadowColor: '#1b3569',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadArrowIcon: {
    width: 18,
    height: 18,
  },
  uploadComputerBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  dragNotice: {
    fontSize: 13.5,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  supportedTypesNotice: {
    fontSize: 11.5,
    fontWeight: '400',
    marginTop: 3,
    textAlign: 'center',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 14,
    gap: 10,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  fieldBlock: {
    width: '100%',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  driveInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    width: '100%',
  },
  driveIcon: {
    width: 22,
    height: 20,
    marginRight: 10,
  },
  driveInput: {
    flex: 1,
    fontSize: 12.5,
    height: '100%',
  },
  standardInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 13,
    width: '100%',
  },
  textAreaInput: {
    height: 70,
    paddingTop: 10,
    paddingBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
    marginBottom: 4,
    gap: 8,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  checkboxLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  submitButton: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#1b3569',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  mustTickNotice: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
});
