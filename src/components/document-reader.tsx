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

const BACK_ARROW_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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

const PRINT_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1b3569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="6 9 6 2 18 2 18 9"></polyline>
  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
  <rect x="6" y="14" width="12" height="8"></rect>
</svg>
`)}`;

export interface DocumentReaderItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'pdf' | 'docx' | 'image' | 'article' | 'other';
  icon: string;
  fileSize?: string;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  if (!document) return null;

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 2500);
  };

  const isArticle = document.type === 'article';
  const isImage = document.type === 'image';
  const isPDF = document.type === 'pdf';

  return (
    <Modal visible={!!document} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.navbar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Image source={{ uri: BACK_ARROW_SVG }} style={styles.navIcon} resizeMode="contain" />
            <Text style={styles.backBtnText}>Documents</Text>
          </TouchableOpacity>

          <View style={styles.navTitleContainer}>
            <Text style={styles.navDocTitle} numberOfLines={1}>
              {document.title}
            </Text>
            <Text style={styles.navDocSub}>{document.type.toUpperCase()} • {document.fileSize || 'Encrypted'}</Text>
          </View>

          <View style={styles.navActions}>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => showNotice('Document downloaded securely!')}
              activeOpacity={0.7}
            >
              <Image source={{ uri: DOWNLOAD_ICON_SVG }} style={styles.actionIcon} resizeMode="contain" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionIconButton}
              onPress={() => showNotice('Preparing document for print...')}
              activeOpacity={0.7}
            >
              <Image source={{ uri: PRINT_ICON_SVG }} style={styles.actionIcon} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        {actionNotice && (
          <View style={styles.actionToast}>
            <Text style={styles.actionToastText}>{actionNotice}</Text>
          </View>
        )}

        {/* Main Document Content ScrollView */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.containerMaxWidth}>
            {/* ARTICLE READER */}
            {isArticle ? (
              <View style={styles.articleCard}>
                <View style={styles.articleHeader}>
                  <View style={styles.articleTag}>
                    <Text style={styles.articleTagText}>OFFICIAL WORKSPACE ARTICLE</Text>
                  </View>
                  <Text style={styles.articleTitle}>{document.title}</Text>
                  <Text style={styles.articleMeta}>
                    Published by {document.fullContent?.authorOrIssuer || 'HR Operations'} • {document.fullContent?.date || document.subtitle} • 4 min read
                  </Text>
                </View>

                <View style={styles.articleDivider} />

                {document.fullContent?.sections.map((sec, idx) => (
                  <View key={idx} style={styles.articleSection}>
                    {sec.heading && <Text style={styles.articleHeading}>{sec.heading}</Text>}
                    <Text style={styles.articleParagraph}>{sec.body}</Text>
                  </View>
                ))}

                <View style={styles.acknowledgementBox}>
                  <Text style={styles.ackTitle}>Employee Acknowledgement</Text>
                  <Text style={styles.ackBody}>
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
              <View style={styles.imageCard}>
                <View style={styles.imageHeaderRow}>
                  <View>
                    <Text style={styles.imageTitle}>{document.title}</Text>
                    <Text style={styles.imageSub}>{document.subtitle}</Text>
                  </View>
                  <View style={styles.zoomControls}>
                    <TouchableOpacity
                      style={styles.zoomBtn}
                      onPress={() => setZoomLevel(Math.max(1, zoomLevel - 0.2))}
                    >
                      <Text style={styles.zoomBtnText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.zoomLevelText}>{Math.round(zoomLevel * 100)}%</Text>
                    <TouchableOpacity
                      style={styles.zoomBtn}
                      onPress={() => setZoomLevel(Math.min(2, zoomLevel + 0.2))}
                    >
                      <Text style={styles.zoomBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.imageFrame}>
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
                  <View style={styles.metaTable}>
                    <Text style={styles.metaTableHeader}>Extracted Card Data</Text>
                    {Object.entries(document.fullContent.metadata).map(([k, v]) => (
                      <View key={k} style={styles.metaRow}>
                        <Text style={styles.metaKey}>{k}:</Text>
                        <Text style={styles.metaVal}>{v}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              /* PDF / FORM / CONTRACT PAPER VIEWER */
              <View style={styles.paperDocument}>
                {/* Formal Letterhead */}
                <View style={styles.paperHeader}>
                  <View>
                    <Text style={styles.paperCompany}>DOCUVAULT ENTERPRISE SYSTEMS</Text>
                    <Text style={styles.paperOrgDept}>Corporate Records & Human Resources</Text>
                  </View>
                  <View style={styles.docIdBadge}>
                    <Text style={styles.docIdText}>REF: DV-2024-#{document.id}829</Text>
                  </View>
                </View>

                <View style={styles.paperDivider} />

                {/* Document Main Heading */}
                <Text style={styles.paperTitle}>{document.title}</Text>
                <Text style={styles.paperDate}>Effective Date: {document.subtitle.replace('Signed: ', '').replace('Uploaded: ', '')}</Text>

                {/* Digital Verification Seal */}
                {document.isSigned && (
                  <View style={styles.verifiedSignatureSeal}>
                    <View style={styles.sealIconCircle}>
                      <Text style={styles.sealCheckmark}>✓</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.sealTitle}>CERTIFIED DIGITAL SIGNATURE</Text>
                      <Text style={styles.sealDesc}>
                        Signed by Liam Thompson (SSN: ***-**-8492). Cryptographic SHA-256 Hash Verified.
                      </Text>
                    </View>
                  </View>
                )}

                {/* Form Sections */}
                {document.fullContent?.sections ? (
                  document.fullContent.sections.map((sec, idx) => (
                    <View key={idx} style={styles.paperSection}>
                      {sec.heading && <Text style={styles.paperHeading}>{sec.heading}</Text>}
                      <Text style={styles.paperParagraph}>{sec.body}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.paperSection}>
                    <Text style={styles.paperHeading}>Document Summary & Details</Text>
                    <Text style={styles.paperParagraph}>{document.contentSnippet || 'Standard verified enterprise document.'}</Text>
                  </View>
                )}

                {/* Sign-off & Footer Table */}
                <View style={styles.signatureBlock}>
                  <View style={styles.sigColumn}>
                    <Text style={styles.sigLabel}>Authorized Signer</Text>
                    <Text style={styles.sigName}>Liam Thompson</Text>
                    <Text style={styles.sigRole}>Senior Software Engineer</Text>
                  </View>
                  <View style={styles.sigColumn}>
                    <Text style={styles.sigLabel}>Corporate Reviewer</Text>
                    <Text style={styles.sigName}>Sarah Jenkins, J.D.</Text>
                    <Text style={styles.sigRole}>VP, Legal & Compliance</Text>
                  </View>
                </View>

                {/* Page Navigation */}
                <View style={styles.pageFooterRow}>
                  <Text style={styles.pageNumber}>Page {currentPage} of 2</Text>
                  <View style={styles.pageNavBtns}>
                    <TouchableOpacity
                      style={[styles.pageBtn, currentPage === 1 ? styles.pageBtnDisabled : null]}
                      onPress={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <Text style={styles.pageBtnText}>Prev</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.pageBtn, currentPage === 2 ? styles.pageBtnDisabled : null]}
                      onPress={() => setCurrentPage(2)}
                      disabled={currentPage === 2}
                    >
                      <Text style={styles.pageBtnText}>Next</Text>
                    </TouchableOpacity>
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
});
