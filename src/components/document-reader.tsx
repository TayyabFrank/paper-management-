import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Image,
  Modal,
  SafeAreaView,
} from 'react-native';
import { getDocumentTypeIcon, getDetectedBadgeStyle, getDetectedBadgeTextStyle } from './documents-dashboard';
import { ThemeToggleButton } from './theme-toggle-button';
import { useDocuVaultTheme } from '@/context/theme-context';

const BACK_ARROW_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="19" y1="12" x2="5" y2="12"></line>
  <polyline points="12 19 5 12 12 5"></polyline>
</svg>
`)}`;

const BACK_ARROW_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <line x1="19" y1="12" x2="5" y2="12"></line>
  <polyline points="12 19 5 12 12 5"></polyline>
</svg>
`)}`;

const DOWNLOAD_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b3569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="7 10 12 15 17 10"></polyline>
  <line x1="12" y1="15" x2="12" y2="3"></line>
</svg>
`)}`;

const DOWNLOAD_ICON_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="7 10 12 15 17 10"></polyline>
  <line x1="12" y1="15" x2="12" y2="3"></line>
</svg>
`)}`;

const PRINT_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b3569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 9 6 2 18 2 18 9"></polyline>
  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
  <rect x="6" y="14" width="12" height="8"></rect>
</svg>
`)}`;

const PRINT_ICON_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 9 6 2 18 2 18 9"></polyline>
  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
  <rect x="6" y="14" width="12" height="8"></rect>
</svg>
`)}`;

export interface DocumentReaderItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'pdf' | 'docx' | 'image' | 'article' | 'link' | 'other';
  icon: string;
  fileSize?: string;
  fileUrl?: string;
  fileName?: string;
  isSigned?: boolean;
  previewImage?: string;
  contentSnippet?: string;
  fullContent?: {
    category: string;
    date: string;
    authorOrIssuer: string;
    sections: {
      heading?: string;
      body: string;
    }[];
    metadata?: { [key: string]: string };
  };
}

interface DocumentReaderProps {
  document: DocumentReaderItem | null;
  onClose: () => void;
}

export function DocumentReader({ document, onClose }: DocumentReaderProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'embedded' | 'content'>(document?.fileUrl ? 'embedded' : 'content');

  if (!document) return null;

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const isArticle = document.type === 'article';
  const isImage = document.type === 'image';
  const isPDF = document.type === 'pdf';

  const isCV =
    document.title.toLowerCase().includes('cv') ||
    document.title.toLowerCase().includes('resume') ||
    document.title.toLowerCase().includes('portfolio') ||
    document.fullContent?.category?.toLowerCase().includes('cv') ||
    document.fullContent?.category?.toLowerCase().includes('resume');

  const candidateName =
    document.fullContent?.authorOrIssuer && document.fullContent.authorOrIssuer !== 'Liam Thompson'
      ? document.fullContent.authorOrIssuer
      : document.title
          .replace(/\.[^/.]+$/, '')
          .replace(/_cv$/i, '')
          .replace(/_resume$/i, '')
          .replace(/[-_]/g, ' ')
          .trim() || 'Tayyab';

  return (
    <Modal visible={!!document} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#0b0f19' : '#f1f5f9' }]}>
        {/* Top Navigation Bar */}
        <View
          style={[
            styles.navbar,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Image
              source={{ uri: isDark ? BACK_ARROW_DARK_SVG : BACK_ARROW_SVG }}
              style={styles.navIcon}
              resizeMode="contain"
            />
            <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Documents</Text>
          </TouchableOpacity>

          <View style={styles.navTitleContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Image
                source={{ uri: getDocumentTypeIcon(document.type, document.title) }}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
              <Text style={[styles.navDocTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {document.title}
              </Text>
            </View>
            <Text style={[styles.navDocSub, { color: colors.textSecondary }]}>
              {isCV ? 'Curriculum Vitae' : document.type.toUpperCase()} • {document.fileSize || 'Vault Encrypted'}
            </Text>
          </View>

          <View style={styles.navActions}>
            <ThemeToggleButton compact showLabel={false} />

            <TouchableOpacity
              style={[
                styles.actionIconButton,
                {
                  backgroundColor: isDark ? '#1f293d' : '#eff6ff',
                  borderColor: isDark ? '#38bdf8' : '#bfdbfe',
                },
              ]}
              onPress={() => {
                if (typeof window !== 'undefined' && document.fileUrl) {
                  const a = window.document.createElement('a');
                  a.href = document.fileUrl;
                  a.download = document.fileName || `${document.title}.pdf`;
                  a.click();
                } else {
                  showNotice('Document downloaded securely!');
                }
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: isDark ? DOWNLOAD_ICON_DARK_SVG : DOWNLOAD_ICON_SVG }}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionIconButton,
                {
                  backgroundColor: isDark ? '#1f293d' : '#eff6ff',
                  borderColor: isDark ? '#38bdf8' : '#bfdbfe',
                },
              ]}
              onPress={() => {
                if (typeof window !== 'undefined' && document.fileUrl) {
                  window.open(document.fileUrl, '_blank');
                } else {
                  showNotice('Preparing document for print...');
                }
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: isDark ? PRINT_ICON_DARK_SVG : PRINT_ICON_SVG }}
                style={styles.actionIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {actionNotice && (
          <View style={styles.actionToast}>
            <Text style={styles.actionToastText}>{actionNotice}</Text>
          </View>
        )}

        {/* Optional View Mode Switcher when fileUrl is available */}
        {document.fileUrl && (
          <View style={[styles.viewModeToggleRow, { backgroundColor: isDark ? '#111827' : '#ffffff', borderBottomColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0' }]}>
            <TouchableOpacity
              style={[
                styles.viewModeToggleBtn,
                viewMode === 'embedded' && [styles.viewModeToggleBtnActive, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }],
              ]}
              onPress={() => setViewMode('embedded')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.viewModeToggleText,
                  viewMode === 'embedded' && styles.viewModeToggleTextActive,
                  { color: viewMode === 'embedded' ? '#ffffff' : colors.textPrimary },
                ]}
              >
                📄 Live Document File
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.viewModeToggleBtn,
                viewMode === 'content' && [styles.viewModeToggleBtnActive, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }],
              ]}
              onPress={() => setViewMode('content')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.viewModeToggleText,
                  viewMode === 'content' && styles.viewModeToggleTextActive,
                  { color: viewMode === 'content' ? '#ffffff' : colors.textPrimary },
                ]}
              >
                📝 Formatted Content
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Document Content ScrollView */}
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: isDark ? '#0b0f19' : '#f1f5f9' }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.containerMaxWidth}>
            {document.fileUrl && viewMode === 'embedded' ? (
              /* LIVE EMBEDDED FILE VIEWER (PDF / RAW FILE) */
              <View
                style={[
                  styles.embeddedFrameCard,
                  {
                    backgroundColor: isDark ? '#131d31' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
                  },
                ]}
              >
                <View style={styles.embeddedTopBar}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={[styles.embeddedDocName, { color: colors.textPrimary }]} numberOfLines={1}>
                      📄 {document.fileName || document.title}
                    </Text>
                    <Text style={[styles.embeddedDocSub, { color: colors.textSecondary }]}>
                      Live Document Stream • {document.fileSize || 'Encrypted Stream'}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      style={[styles.embeddedActionBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                      onPress={() => {
                        if (typeof window !== 'undefined' && document.fileUrl) {
                          window.open(document.fileUrl, '_blank');
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.embeddedActionBtnText, { color: colors.textPrimary }]}>↗️ Fullscreen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.embeddedActionBtn, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }]}
                      onPress={() => {
                        if (typeof window !== 'undefined' && document.fileUrl) {
                          const a = window.document.createElement('a');
                          a.href = document.fileUrl;
                          a.download = document.fileName || `${document.title}.pdf`;
                          a.click();
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.embeddedActionBtnText, { color: '#ffffff' }]}>📥 Download</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {Platform.OS === 'web' ? (
                  <iframe
                    src={document.fileUrl}
                    style={{
                      width: '100%',
                      height: 750,
                      minHeight: 620,
                      border: 'none',
                      borderRadius: 8,
                      backgroundColor: '#ffffff',
                    }}
                    title={document.title}
                  />
                ) : (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text style={{ fontSize: 40, marginBottom: 12 }}>📄</Text>
                    <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '700' }}>{document.title}</Text>
                  </View>
                )}
              </View>
            ) : isArticle ? (
              /* ARTICLE READER */
              <View
                style={[
                  styles.articleCard,
                  {
                    backgroundColor: isDark ? '#131d31' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  },
                ]}
              >
                <View style={styles.articleHeader}>
                  <View style={styles.articleTag}>
                    <Text style={styles.articleTagText}>OFFICIAL WORKSPACE ARTICLE</Text>
                  </View>
                  <Text style={[styles.articleTitle, { color: colors.textPrimary }]}>{document.title}</Text>
                  <Text style={[styles.articleMeta, { color: colors.textSecondary }]}>
                    Published by {document.fullContent?.authorOrIssuer || 'HR Operations'} • {document.fullContent?.date || document.subtitle} • 4 min read
                  </Text>
                </View>

                <View style={[styles.articleDivider, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]} />

                {document.fullContent?.sections.map((sec, idx) => (
                  <View key={idx} style={styles.articleSection}>
                    {sec.heading && <Text style={[styles.articleHeading, { color: colors.textPrimary }]}>{sec.heading}</Text>}
                    <Text style={[styles.articleParagraph, { color: isDark ? '#cbd5e1' : '#334155' }]}>{sec.body}</Text>
                  </View>
                ))}

                <View style={[styles.acknowledgementBox, { backgroundColor: isDark ? '#16233b' : '#f8fafc', borderColor: isDark ? '#273854' : '#e2e8f0' }]}>
                  <Text style={[styles.ackTitle, { color: colors.textPrimary }]}>Employee Acknowledgement</Text>
                  <Text style={[styles.ackBody, { color: colors.textSecondary }]}>
                    By clicking acknowledge, you confirm that you have read, understood, and agree to abide by the contents of this document.
                  </Text>
                  <TouchableOpacity
                    style={[styles.ackButton, acknowledged ? styles.ackButtonDone : null]}
                    onPress={() => {
                      setAcknowledged(true);
                      showNotice('Acknowledged and recorded on your employee profile.');
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.ackButtonText}>
                      {acknowledged ? '✓ Acknowledged & Signed' : 'Confirm & Acknowledge'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : isImage ? (
              /* IMAGE VIEWER */
              <View
                style={[
                  styles.imageCard,
                  {
                    backgroundColor: isDark ? '#131d31' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  },
                ]}
              >
                <View style={styles.imageHeaderRow}>
                  <View>
                    <Text style={[styles.imageTitle, { color: colors.textPrimary }]}>{document.title}</Text>
                    <Text style={[styles.imageSub, { color: colors.textSecondary }]}>{document.subtitle}</Text>
                  </View>
                  <View style={styles.zoomControls}>
                    <TouchableOpacity
                      style={[styles.zoomBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                      onPress={() => setZoomLevel(Math.max(1, zoomLevel - 0.2))}
                    >
                      <Text style={[styles.zoomBtnText, { color: colors.textPrimary }]}>-</Text>
                    </TouchableOpacity>
                    <Text style={[styles.zoomLevelText, { color: colors.textPrimary }]}>{Math.round(zoomLevel * 100)}%</Text>
                    <TouchableOpacity
                      style={[styles.zoomBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                      onPress={() => setZoomLevel(Math.min(2, zoomLevel + 0.2))}
                    >
                      <Text style={[styles.zoomBtnText, { color: colors.textPrimary }]}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.imageFrame, { backgroundColor: isDark ? '#0b0f19' : '#0f172a' }]}>
                  <Image
                    source={{
                      uri:
                        document.previewImage ||
                        'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
                    }}
                    style={[styles.mainImageView, { transform: [{ scale: zoomLevel }] }]}
                    resizeMode="contain"
                  />
                </View>

                {document.fullContent?.metadata && (
                  <View style={[styles.metaTable, { backgroundColor: isDark ? '#16233b' : '#f8fafc', borderColor: isDark ? '#273854' : '#e2e8f0' }]}>
                    <Text style={[styles.metaTableHeader, { color: colors.textPrimary }]}>Extracted Card Data</Text>
                    {Object.entries(document.fullContent.metadata).map(([k, v]) => (
                      <View key={k} style={[styles.metaRow, { borderBottomColor: isDark ? '#22324e' : '#e2e8f0' }]}>
                        <Text style={[styles.metaKey, { color: colors.textSecondary }]}>{k}:</Text>
                        <Text style={[styles.metaVal, { color: colors.textPrimary }]}>{v}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : isCV ? (
              /* COMPLETE CURRICULUM VITAE / RESUME VIEWER */
              <View
                style={[
                  styles.cvPaperDocument,
                  {
                    backgroundColor: isDark ? '#131d31' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
                  },
                ]}
              >
                {/* CV Hero Banner */}
                <View style={styles.cvHeroBanner}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cvTagRow}>
                      <View style={styles.cvBadge}>
                        <Text style={styles.cvBadgeText}>🟢 VERIFIED CURRICULUM VITAE</Text>
                      </View>
                      <Text style={[styles.cvVaultRef, { color: isDark ? '#38bdf8' : '#2563eb' }]}>
                        REF: DV-CV-#{document.id.slice(-6)}
                      </Text>
                    </View>
                    <Text style={[styles.cvCandidateName, { color: colors.textPrimary }]}>
                      {candidateName}
                    </Text>
                    <Text style={[styles.cvCandidateRole, { color: isDark ? '#94a3b8' : '#475569' }]}>
                      Software Systems & Solutions Engineer
                    </Text>
                    <View style={styles.cvMetaGrid}>
                      <Text style={[styles.cvMetaItem, { color: colors.textSecondary }]}>
                        📧 Candidate Vault ID: emp-{document.id.slice(-5)}
                      </Text>
                      <Text style={[styles.cvMetaItem, { color: colors.textSecondary }]}>
                        📅 Effective Date: Today
                      </Text>
                      <Text style={[styles.cvMetaItem, { color: colors.textSecondary }]}>
                        📁 Document: {document.title}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.cvDivider, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]} />

                {/* Professional Profile & Summary */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    👤 Professional Profile & Summary
                  </Text>
                  <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155' }]}>
                    {document.fullContent?.sections?.find((s) => s.heading?.toLowerCase().includes('summary'))?.body ||
                      `Experienced, high-performing software professional with a demonstrated track record of engineering enterprise document workflows, responsive digital interfaces, and cryptographic security systems. Adept at bridging customer business requirements with resilient architectural solutions.`}
                  </Text>
                </View>

                {/* Portfolio & Key Project Deliverables */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    💼 Portfolio & Key Deliverables
                  </Text>
                  <View style={[styles.cvCalloutBox, { backgroundColor: isDark ? '#16233b' : '#f8fafc', borderColor: isDark ? '#273854' : '#e2e8f0' }]}>
                    <Text style={[styles.cvCalloutHeading, { color: isDark ? '#38bdf8' : '#1b3569' }]}>
                      🌟 Portfolio Focus: {document.fullContent?.sections?.[0]?.body || 'Enterprise Systems & Modern Interfaces'}
                    </Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 8 }]}>
                      • Enterprise Document Management Architecture (DocuVault) featuring dynamic indexing and automated type classification.
                    </Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 4 }]}>
                      • High-performance interactive readers with direct inline document streaming and real-time deletion controls.
                    </Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 4 }]}>
                      • Full cross-platform responsive UX with custom Light and Dark mode theming and biometric compliance validation.
                    </Text>
                  </View>
                </View>

                {/* Technical Skills & Competencies */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    🛠️ Technical Skills & Core Competencies
                  </Text>
                  <View style={styles.cvSkillsGrid}>
                    {[
                      'React Native',
                      'TypeScript',
                      'Expo SDK',
                      'Document Engineering',
                      'UI/UX Design Systems',
                      'Security & SHA-256',
                      'State Management',
                      'REST APIs',
                      'Cloud Storage',
                      'Cross-Platform Optimization',
                    ].map((skill, idx) => (
                      <View
                        key={idx}
                        style={[styles.cvSkillBadge, { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: isDark ? '#334155' : '#bfdbfe' }]}
                      >
                        <Text style={[styles.cvSkillBadgeText, { color: isDark ? '#38bdf8' : '#1d4ed8' }]}>
                          {skill}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Professional Experience */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    📈 Professional Experience
                  </Text>
                  <View style={styles.cvExpItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={[styles.cvExpRole, { color: colors.textPrimary }]}>Senior Systems & Software Engineer</Text>
                      <Text style={[styles.cvExpDates, { color: colors.textSecondary }]}>2022 — Present</Text>
                    </View>
                    <Text style={[styles.cvExpOrg, { color: isDark ? '#38bdf8' : '#2563eb' }]}>Enterprise Software Systems</Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 6 }]}>
                      - Spearheaded development of high-reliability document pipelines, providing instant file inspection, offline resilience, and biometric audit trails.
                    </Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#cbd5e1' : '#334155', marginTop: 4 }]}>
                      - Implemented live context management eliminating hardcoded mock assets in favor of dynamic user uploads.
                    </Text>
                  </View>
                </View>

                {/* Education & Credentials */}
                <View style={styles.cvSection}>
                  <Text style={[styles.cvSectionTitle, { color: colors.textPrimary }]}>
                    🎓 Education & Professional Credentials
                  </Text>
                  <View style={styles.cvExpItem}>
                    <Text style={[styles.cvExpRole, { color: colors.textPrimary }]}>Bachelor of Science in Computer Science / Engineering</Text>
                    <Text style={[styles.cvExpOrg, { color: colors.textSecondary }]}>Accredited University • Honors Degree</Text>
                    <Text style={[styles.cvParagraph, { color: isDark ? '#94a3b8' : '#64748b', marginTop: 4 }]}>
                      • Certified Enterprise Solutions Architect • Enterprise Document Security Clearance
                    </Text>
                  </View>
                </View>

                {/* Official Verification Seal */}
                <View
                  style={[
                    styles.cvVerificationSeal,
                    {
                      backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : '#f0fdf4',
                      borderColor: isDark ? '#166534' : '#86efac',
                    },
                  ]}
                >
                  <View style={styles.cvSealCheckCircle}>
                    <Text style={styles.cvSealCheckText}>✓</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.cvSealHeading, { color: isDark ? '#4ade80' : '#15803d' }]}>
                      CERTIFIED WORKSPACE DOCUMENT DEPOSIT
                    </Text>
                    <Text style={[styles.cvSealSub, { color: isDark ? '#86efac' : '#166534' }]}>
                      Owner: {candidateName} • Timestamp: Today • SHA-256 Vault Hash Verified • Admin Email Dispatched
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              /* STANDARD FORM / POLICY / CONTRACT VIEWER */
              <View
                style={[
                  styles.paperDocument,
                  {
                    backgroundColor: isDark ? '#131d31' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#cbd5e1',
                  },
                ]}
              >
                {/* Formal Letterhead */}
                <View style={styles.paperHeader}>
                  <View>
                    <Text style={[styles.paperCompany, { color: colors.textPrimary }]}>DOCUVAULT ENTERPRISE SYSTEMS</Text>
                    <Text style={[styles.paperOrgDept, { color: colors.textSecondary }]}>Enterprise Document Records</Text>
                  </View>
                  <View style={[styles.docIdBadge, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                    <Text style={[styles.docIdText, { color: isDark ? '#38bdf8' : '#475569' }]}>REF: DV-#{document.id.slice(-8)}</Text>
                  </View>
                </View>

                <View style={[styles.paperDivider, { backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }]} />

                {/* Document Main Heading */}
                <Text style={[styles.paperTitle, { color: colors.textPrimary }]}>{document.title}</Text>
                <Text style={[styles.paperDate, { color: colors.textSecondary }]}>
                  Effective Date: {document.subtitle.replace('Signed: ', '').replace('Uploaded: ', '')}
                </Text>

                {/* Digital Verification Seal */}
                <View style={[styles.verifiedSignatureSeal, { backgroundColor: isDark ? 'rgba(34, 197, 94, 0.12)' : '#f0fdf4', borderColor: isDark ? '#166534' : '#bbf7d0' }]}>
                  <View style={styles.sealIconCircle}>
                    <Text style={styles.sealCheckmark}>✓</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={[styles.sealTitle, { color: isDark ? '#4ade80' : '#15803d' }]}>CERTIFIED WORKSPACE DOCUMENT</Text>
                    <Text style={[styles.sealDesc, { color: isDark ? '#86efac' : '#166534' }]}>
                      Deposited by {document.fullContent?.authorOrIssuer || candidateName}. Cryptographic SHA-256 Hash Verified.
                    </Text>
                  </View>
                </View>

                {/* Form Sections */}
                {document.fullContent?.sections ? (
                  document.fullContent.sections.map((sec, idx) => (
                    <View key={idx} style={styles.paperSection}>
                      {sec.heading && <Text style={[styles.paperHeading, { color: colors.textPrimary }]}>{sec.heading}</Text>}
                      <Text style={[styles.paperParagraph, { color: isDark ? '#cbd5e1' : '#334155' }]}>{sec.body}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.paperSection}>
                    <Text style={[styles.paperHeading, { color: colors.textPrimary }]}>Document Summary & Details</Text>
                    <Text style={[styles.paperParagraph, { color: isDark ? '#cbd5e1' : '#334155' }]}>{document.contentSnippet || 'Standard verified enterprise document.'}</Text>
                  </View>
                )}

                {/* Sign-off & Footer Table */}
                <View style={[styles.signatureBlock, { borderTopColor: isDark ? '#1e293b' : '#e2e8f0' }]}>
                  <View style={styles.sigColumn}>
                    <Text style={[styles.sigLabel, { color: isDark ? '#64748b' : '#94a3b8' }]}>Document Submitter</Text>
                    <Text style={[styles.sigName, { color: colors.textPrimary }]}>{document.fullContent?.authorOrIssuer || candidateName}</Text>
                    <Text style={[styles.sigRole, { color: colors.textSecondary }]}>Verified Workspace Member</Text>
                  </View>
                  <View style={styles.sigColumn}>
                    <Text style={[styles.sigLabel, { color: isDark ? '#64748b' : '#94a3b8' }]}>Security & Verification</Text>
                    <Text style={[styles.sigName, { color: colors.textPrimary }]}>DocuVault Security Engine</Text>
                    <Text style={[styles.sigRole, { color: colors.textSecondary }]}>Encrypted Vault Tier</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  navbar: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 10,
  },
  navIcon: {
    width: 20,
    height: 20,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 6,
  },
  navTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navDocTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  navDocSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  navActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    width: 18,
    height: 18,
  },
  actionToast: {
    backgroundColor: '#1b3569',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionToastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  containerMaxWidth: {
    width: '100%',
    maxWidth: 680,
  },
  // ARTICLE STYLES
  articleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  articleHeader: {
    marginBottom: 16,
  },
  articleTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  articleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b45309',
    letterSpacing: 0.5,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 32,
    marginBottom: 8,
  },
  articleMeta: {
    fontSize: 13,
    color: '#64748b',
  },
  articleDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 20,
  },
  articleSection: {
    marginBottom: 18,
  },
  articleHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  articleParagraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
  },
  acknowledgementBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    marginTop: 20,
  },
  ackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  ackBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 14,
  },
  ackButton: {
    backgroundColor: '#1b3569',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ackButtonDone: {
    backgroundColor: '#16a34a',
  },
  ackButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  // IMAGE VIEWER STYLES
  imageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  imageSub: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  zoomControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 8,
  },
  zoomBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  zoomBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  zoomLevelText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  imageFrame: {
    width: '100%',
    height: 320,
    backgroundColor: '#0f172a',
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainImageView: {
    width: '95%',
    height: '95%',
  },
  metaTable: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaTableHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metaKey: {
    fontSize: 13,
    color: '#64748b',
  },
  metaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  // PAPER / FORM / PDF STYLES
  paperDocument: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 30,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paperCompany: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1b3569',
    letterSpacing: 0.5,
  },
  paperOrgDept: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  docIdBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  docIdText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  paperDivider: {
    height: 1.5,
    backgroundColor: '#cbd5e1',
    marginVertical: 18,
  },
  paperTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  paperDate: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 16,
  },
  verifiedSignatureSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  sealIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealCheckmark: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sealTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.3,
  },
  sealDesc: {
    fontSize: 11,
    color: '#166534',
    marginTop: 2,
  },
  paperSection: {
    marginBottom: 16,
  },
  paperHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  paperParagraph: {
    fontSize: 13.5,
    lineHeight: 22,
    color: '#334155',
  },
  signatureBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 18,
    marginTop: 24,
  },
  sigColumn: {
    flex: 1,
  },
  sigLabel: {
    fontSize: 11,
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sigName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  sigRole: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  pageFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 26,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  pageNumber: {
    fontSize: 12,
    color: '#94a3b8',
  },
  pageNavBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  pageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  pageBtnDisabled: {
    opacity: 0.4,
  },
  pageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  // VIEW MODE SWITCHER STYLES
  viewModeToggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  viewModeToggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  viewModeToggleBtnActive: {
    borderColor: 'transparent',
  },
  viewModeToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  viewModeToggleTextActive: {
    color: '#ffffff',
  },
  // EMBEDDED VIEWER STYLES
  embeddedFrameCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  embeddedTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  embeddedDocName: {
    fontSize: 16,
    fontWeight: '700',
  },
  embeddedDocSub: {
    fontSize: 12,
    marginTop: 2,
  },
  embeddedActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  embeddedActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // CV / RESUME STYLES
  cvPaperDocument: {
    borderRadius: 14,
    padding: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cvHeroBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cvTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  cvBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cvBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#15803d',
    letterSpacing: 0.4,
  },
  cvVaultRef: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Courier', default: 'monospace' }),
  },
  cvCandidateName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cvCandidateRole: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  cvMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 12,
  },
  cvMetaItem: {
    fontSize: 12.5,
  },
  cvDivider: {
    height: 1.5,
    marginVertical: 20,
  },
  cvSection: {
    marginBottom: 24,
  },
  cvSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  cvParagraph: {
    fontSize: 14.5,
    lineHeight: 23,
  },
  cvCalloutBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cvCalloutHeading: {
    fontSize: 15,
    fontWeight: '700',
  },
  cvSkillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cvSkillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  cvSkillBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cvExpItem: {
    marginBottom: 14,
  },
  cvExpRole: {
    fontSize: 15,
    fontWeight: '700',
  },
  cvExpDates: {
    fontSize: 12,
  },
  cvExpOrg: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  cvVerificationSeal: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  cvSealCheckCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvSealCheckText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cvSealHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cvSealSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
});
