import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { TabKey } from './bottom-navbar';
import { ThemeToggleButton } from './theme-toggle-button';

interface NewDocViewProps {
  onDocumentAdded?: () => void;
  onNavigateTab: (tab: TabKey) => void;
}

export function NewDocView({ onNavigateTab }: NewDocViewProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Tax' | 'Legal' | 'Medical' | 'Performance' | 'General'>('General');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handlePickFile = () => {
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      setSelectedFile({ name: 'Scanned_Document_2026.pdf', size: '2.4 MB' });
    }
  };

  const handleWebFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      });
      if (!title) {
        setTitle(f.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = () => {
    if (!title) return;
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setSuccessToast(`"${title}" successfully stored in your DocuVault!`);
      setTimeout(() => {
        setSuccessToast(null);
        onNavigateTab('docs');
      }, 1500);
    }, 1200);
  };

  const categories: ('Tax' | 'Legal' | 'Medical' | 'Performance' | 'General')[] = [
    'General',
    'Tax',
    'Legal',
    'Medical',
    'Performance',
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.maxWidthWrapper}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.heading, { color: colors.textPrimary }]}>Upload New Document</Text>
            <Text style={[styles.subheading, { color: colors.textSecondary }]}>
              Securely index documents into your enterprise vault
            </Text>
          </View>
          <ThemeToggleButton compact showLabel={false} />
        </View>

        {/* Hidden web file input */}
        {Platform.OS === 'web' && (
          <input
            type="file"
            ref={fileInputRef as any}
            onChange={handleWebFileChange as any}
            accept="image/*,.pdf,.docx,.doc"
            style={{ display: 'none' }}
          />
        )}

        {/* Success Toast */}
        {successToast && (
          <View style={styles.successToast}>
            <Text style={styles.successToastText}>✓ {successToast}</Text>
          </View>
        )}

        {/* Dropzone / Upload Box */}
        <TouchableOpacity
          style={[
            styles.dropzoneBox,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? '#22324e' : '#cbd5e1',
            },
          ]}
          onPress={handlePickFile}
          activeOpacity={0.8}
        >
          <View style={[styles.uploadIconCircle, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
            <Text style={{ fontSize: 26 }}>📄</Text>
          </View>
          <Text style={[styles.dropzoneTitle, { color: colors.textPrimary }]}>
            {selectedFile ? selectedFile.name : 'Tap to Select or Scan File'}
          </Text>
          <Text style={[styles.dropzoneSub, { color: colors.textSecondary }]}>
            {selectedFile ? `File Size: ${selectedFile.size}` : 'Supports PDF, Word (.docx), Scanned Photos & Images'}
          </Text>
          <View style={[styles.chooseBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
            <Text style={[styles.chooseBtnText, { color: isDark ? '#38bdf8' : '#1b3569' }]}>
              {selectedFile ? 'Replace File' : 'Browse Files'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Form Fields */}
        <View
          style={[
            styles.formCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            },
          ]}
        >
          {/* Document Title */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#475569' }]}>Document Title</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: isDark ? '#162033' : '#f8fafc',
                  borderColor: isDark ? '#27354f' : '#cbd5e1',
                  color: colors.textPrimary,
                },
              ]}
              placeholder="e.g. Q3 Healthcare Claim Receipt"
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Category Selector */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#475569' }]}>Category</Text>
            <View style={styles.categoriesRow}>
              {categories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: isSelected
                          ? (isDark ? '#2563eb' : '#1b3569')
                          : (isDark ? '#162033' : '#f1f5f9'),
                        borderColor: isSelected
                          ? (isDark ? '#38bdf8' : '#1b3569')
                          : (isDark ? '#27354f' : '#e2e8f0'),
                      },
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.catChipText,
                        {
                          color: isSelected ? '#ffffff' : (isDark ? '#94a3b8' : '#475569'),
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Optional Notes */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: isDark ? '#94a3b8' : '#475569' }]}>Notes & Description (Optional)</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  backgroundColor: isDark ? '#162033' : '#f8fafc',
                  borderColor: isDark ? '#27354f' : '#cbd5e1',
                  color: colors.textPrimary,
                },
              ]}
              placeholder="Add any verification reference or remarks..."
              placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor: isDark ? '#2563eb' : '#1b3569',
                opacity: !title ? 0.6 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={!title || isUploading}
            activeOpacity={0.85}
          >
            {isUploading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Store Document in Vault</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    marginTop: 2,
  },
  successToast: {
    backgroundColor: '#15803d',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  successToastText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  dropzoneBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dropzoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  dropzoneSub: {
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  chooseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  chooseBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    gap: 16,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  input: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  textArea: {
    height: 78,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 12.5,
  },
  submitBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
