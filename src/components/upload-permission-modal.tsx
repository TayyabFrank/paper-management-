import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';

export interface UploadedItemResult {
  name: string;
  type: 'pdf' | 'docx' | 'image' | 'video' | 'article' | 'link' | 'other';
  size: string;
  url?: string;
  previewImage?: string;
}

interface UploadPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  onlyImages?: boolean;
  onUploadSuccess: (item: UploadedItemResult) => void;
}

// Crisp SVG icons for upload channels
const GALLERY_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  <circle cx="8.5" cy="8.5" r="1.5"/>
  <polyline points="21 15 16 10 5 21"/>
</svg>
`)}`;

const FOLDER_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
</svg>
`)}`;

const LINK_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
</svg>
`)}`;

const SHIELD_PERM_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  <path d="M9 12l2 2 4-4"/>
</svg>
`)}`;

export function UploadPermissionModal({
  visible,
  onClose,
  title = 'Upload Document or Photo',
  onlyImages = false,
  onUploadSuccess,
}: UploadPermissionModalProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const documentInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectGallery = () => {
    setPermissionGranted(true);
    if (Platform.OS === 'web' && galleryInputRef.current) {
      galleryInputRef.current.click();
    } else {
      // Mobile fallback demonstration
      onUploadSuccess({
        name: 'Gallery_Photo_Scan.jpg',
        type: 'image',
        size: '3.4 MB',
        previewImage:
          'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
      });
      onClose();
    }
  };

  const handleSelectDocument = () => {
    setPermissionGranted(true);
    if (Platform.OS === 'web' && documentInputRef.current) {
      documentInputRef.current.click();
    } else {
      onUploadSuccess({
        name: 'Enterprise_Policy_Document.pdf',
        type: 'pdf',
        size: '1.9 MB',
      });
      onClose();
    }
  };

  const handleWebFileSelected = (e: React.ChangeEvent<HTMLInputElement>, fileKind: 'image' | 'doc') => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      const isImg = fileKind === 'image' || f.type.startsWith('image/');
      const detectedType: 'pdf' | 'docx' | 'image' | 'article' | 'other' = isImg
        ? 'image'
        : f.name.endsWith('.pdf')
        ? 'pdf'
        : f.name.endsWith('.docx')
        ? 'docx'
        : 'other';

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        onUploadSuccess({
          name: f.name.replace(/\.[^/.]+$/, ''),
          type: detectedType,
          size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
          previewImage: isImg && loadEvent.target?.result ? (loadEvent.target.result as string) : undefined,
        });
        onClose();
      };
      if (isImg) {
        reader.readAsDataURL(f);
      } else {
        reader.readAsArrayBuffer(f);
      }
    }
  };

  const handleImportLink = () => {
    if (!linkUrl) return;
    const finalTitle = linkTitle.trim() || 'Imported Web Document';
    const isImgUrl = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(linkUrl);
    const isPdfUrl = linkUrl.toLowerCase().includes('pdf') || linkUrl.endsWith('.pdf');

    onUploadSuccess({
      name: finalTitle,
      type: isImgUrl ? 'image' : isPdfUrl ? 'pdf' : 'article',
      size: 'Cloud Stream',
      url: linkUrl,
      previewImage: isImgUrl ? linkUrl : undefined,
    });
    setLinkUrl('');
    setLinkTitle('');
    setShowLinkInput(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Hidden inputs for native browser file triggers */}
        {Platform.OS === 'web' && (
          <>
            <input
              type="file"
              ref={galleryInputRef as any}
              onChange={(e) => handleWebFileSelected(e as any, 'image')}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <input
              type="file"
              ref={documentInputRef as any}
              onChange={(e) => handleWebFileSelected(e as any, 'doc')}
              accept=".pdf,.docx,.doc,image/*"
              style={{ display: 'none' }}
            />
          </>
        )}

        <View
          style={[
            styles.dialog,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
            },
          ]}
        >
          {/* Permission Header with Shield */}
          <View style={styles.permHeader}>
            <View style={[styles.permShieldCircle, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
              <Image source={{ uri: SHIELD_PERM_SVG }} style={{ width: 28, height: 28 }} resizeMode="contain" />
            </View>
            <Text style={[styles.dialogTitle, { color: colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.dialogSubtitle, { color: colors.textSecondary }]}>
              DocuVault requests permission to access your device gallery and file storage to import your items.
            </Text>
          </View>

          {/* If Link input view is open */}
          {showLinkInput ? (
            <View style={styles.linkInputContainer}>
              <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>🔗 Document / Picture Link (URL)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDark ? '#162033' : '#f8fafc',
                    borderColor: isDark ? '#27354f' : '#cbd5e1',
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="https://example.com/document.pdf or image.jpg"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={linkUrl}
                onChangeText={setLinkUrl}
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.textPrimary, marginTop: 10 }]}>
                🏷️ Item Title (Optional)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: isDark ? '#162033' : '#f8fafc',
                    borderColor: isDark ? '#27354f' : '#cbd5e1',
                    color: colors.textPrimary,
                  },
                ]}
                placeholder="e.g. Q4 Financial Report"
                placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                value={linkTitle}
                onChangeText={setLinkTitle}
              />

              <View style={styles.linkBtnRow}>
                <TouchableOpacity
                  style={[styles.backLinkBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                  onPress={() => setShowLinkInput(false)}
                >
                  <Text style={[styles.backLinkBtnText, { color: colors.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.importConfirmBtn, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }]}
                  onPress={handleImportLink}
                >
                  <Text style={styles.importConfirmBtnText}>Import Link</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Upload Channel Options */
            <View style={styles.optionsList}>
              {/* Option 1: Gallery / Camera */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isDark ? '#162033' : '#f8fafc',
                    borderColor: isDark ? '#27354f' : '#e2e8f0',
                  },
                ]}
                onPress={handleSelectGallery}
                activeOpacity={0.75}
              >
                <View style={styles.optionIconContainer}>
                  <Image source={{ uri: GALLERY_ICON_SVG }} style={{ width: 28, height: 28 }} resizeMode="contain" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                    🖼️ Photo Gallery & Camera
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    Allow permission & choose photos from your device library or camera
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Option 2: Document Browser */}
              {!onlyImages && (
                <TouchableOpacity
                  style={[
                    styles.optionCard,
                    {
                      backgroundColor: isDark ? '#162033' : '#f8fafc',
                      borderColor: isDark ? '#27354f' : '#e2e8f0',
                    },
                  ]}
                  onPress={handleSelectDocument}
                  activeOpacity={0.75}
                >
                  <View style={styles.optionIconContainer}>
                    <Image source={{ uri: FOLDER_ICON_SVG }} style={{ width: 28, height: 28 }} resizeMode="contain" />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                      📁 Browse Device Documents
                    </Text>
                    <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                      Select PDF files, Word docs (.docx), or scans from local storage
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {/* Option 3: Web Link / URL */}
              <TouchableOpacity
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: isDark ? '#162033' : '#f8fafc',
                    borderColor: isDark ? '#27354f' : '#e2e8f0',
                  },
                ]}
                onPress={() => setShowLinkInput(true)}
                activeOpacity={0.75}
              >
                <View style={styles.optionIconContainer}>
                  <Image source={{ uri: LINK_ICON_SVG }} style={{ width: 28, height: 28 }} resizeMode="contain" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.optionTitle, { color: colors.textPrimary }]}>
                    🔗 Add via Web Link / Cloud URL
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                    Paste an online link to import a document, picture, or article
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Close button */}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={[styles.closeButtonText, { color: isDark ? '#94a3b8' : '#475569' }]}>
              ✕ Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  permHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  permShieldCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  dialogSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
  },
  optionsList: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.2,
  },
  optionIconContainer: {
    marginRight: 14,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  optionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  linkInputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    fontSize: 13.5,
  },
  linkBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  backLinkBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backLinkBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  importConfirmBtn: {
    flex: 2,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  importConfirmBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
