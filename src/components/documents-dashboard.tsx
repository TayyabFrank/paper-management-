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
import { DocumentReader, DocumentReaderItem } from './document-reader';
import { ThemeToggleButton } from './theme-toggle-button';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useDocuments } from '@/context/documents-context';
import { UploadPermissionModal, UploadedItemResult } from './upload-permission-modal';

// Vector icons as crisp SVG URIs
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

const FILTER_ICON_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z" stroke="#718096" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="12" cy="12" r="3.6" fill="#718096"/>
</svg>
`)}`;

const EYE_ICON_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="12" cy="12" r="3.6" fill="#94a3b8"/>
</svg>
`)}`;

const DOWNLOAD_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="7 10 12 15 17 10"></polyline>
  <line x1="12" y1="15" x2="12" y2="3"></line>
</svg>
`)}`;

const DOWNLOAD_ICON_DARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
  <polyline points="7 10 12 15 17 10"></polyline>
  <line x1="12" y1="15" x2="12" y2="3"></line>
</svg>
`)}`;

const TRASH_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="3 6 5 6 21 6"></polyline>
  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  <line x1="10" y1="11" x2="10" y2="17"></line>
  <line x1="14" y1="11" x2="14" y2="17"></line>
</svg>
`)}`;

function ActionIcon({ type, isDark }: { type: 'eye' | 'trash'; isDark: boolean }) {
  if (Platform.OS === 'web') {
    if (type === 'eye') {
      const strokeColor = isDark ? '#94a3b8' : '#64748b';
      return (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' } as any}
        >
          <path d="M2 12C2 12 5.5 5.5 12 5.5C18.5 5.5 22 12 22 12C22 12 18.5 18.5 12 18.5C5.5 18.5 2 12 2 12Z" />
          <circle cx="12" cy="12" r="3.5" fill={strokeColor} />
        </svg>
      );
    }
    if (type === 'trash') {
      return (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ display: 'block' } as any}
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    }
  }

  return <Text style={{ fontSize: 18 }}>{type === 'eye' ? '👁️' : '🗑️'}</Text>;
}

// Document Type Badges matching screenshot
const PDF_BLUE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none">
  <rect width="46" height="46" rx="12" fill="#eff3fb"/>
  <path d="M16 11H25L31 17V33C31 34.1046 30.1046 35 29 35H16C14.8954 35 14 34.1046 14 33V13C14 11.8954 14.8954 11 16 11Z" stroke="#2563eb" stroke-width="1.8" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M25 11V17H31" stroke="#2563eb" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="22.5" y="27" font-size="7.5" font-weight="bold" fill="#2563eb" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">PDF</text>
</svg>
`)}`;

const PDF_RED_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none">
  <rect width="46" height="46" rx="12" fill="#fdf0f4"/>
  <path d="M16 11H25L31 17V33C31 34.1046 30.1046 35 29 35H16C14.8954 35 14 34.1046 14 33V13C14 11.8954 14.8954 11 16 11Z" stroke="#831843" stroke-width="1.8" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M25 11V17H31" stroke="#831843" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="22.5" y="27" font-size="7.5" font-weight="bold" fill="#831843" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">PDF</text>
</svg>
`)}`;

const DOCX_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none">
  <rect width="46" height="46" rx="12" fill="#eff3fb"/>
  <path d="M16 11H25L31 17V33C31 34.1046 30.1046 35 29 35H16C14.8954 35 14 34.1046 14 33V13C14 11.8954 14.8954 11 16 11Z" stroke="#3b5998" stroke-width="1.8" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M25 11V17H31" stroke="#3b5998" stroke-width="1.8" stroke-linejoin="round"/>
  <rect x="15" y="20" width="13" height="10" rx="1.5" fill="#2563eb"/>
  <text x="21.5" y="27.5" font-size="8" font-weight="900" fill="#ffffff" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">W</text>
</svg>
`)}`;

const IMAGE_DOC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none">
  <rect width="46" height="46" rx="12" fill="#eff3fb"/>
  <rect x="13" y="13" width="20" height="20" rx="3.5" stroke="#2563eb" stroke-width="1.8" fill="#ffffff"/>
  <circle cx="18" cy="18" r="1.8" fill="#2563eb"/>
  <path d="M14 28L19 22L24 27L27 24L32 29" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

const ARTICLE_DOC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none">
  <rect width="46" height="46" rx="12" fill="#fef8ee"/>
  <rect x="13" y="11" width="20" height="24" rx="3" stroke="#b45309" stroke-width="1.8" fill="#ffffff"/>
  <line x1="17" y1="17" x2="29" y2="17" stroke="#b45309" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="17" y1="22" x2="29" y2="22" stroke="#b45309" stroke-width="1.8" stroke-linecap="round"/>
  <line x1="17" y1="27" x2="25" y2="27" stroke="#b45309" stroke-width="1.8" stroke-linecap="round"/>
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

const LINK_DOC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none">
  <rect width="46" height="46" rx="12" fill="#eff6ff"/>
  <path d="M21 16h-4a5 5 0 0 0-5 5v0a5 5 0 0 0 5 5h4" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M25 26h4a5 5 0 0 0 5-5v0a5 5 0 0 0-5-5h-4" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round"/>
  <line x1="18" y1="21" x2="28" y2="21" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round"/>
</svg>
`)}`;

const MINI_LINK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
</svg>
`)}`;

/**
 * Returns the exact visual icon according to the document or content type.
 * Automatically handles:
 * - PDF: PDF_BLUE_SVG
 * - Image: IMAGE_DOC_SVG
 * - Article: ARTICLE_DOC_SVG
 * - Docx: DOCX_SVG
 */
export function getDocumentTypeIcon(type: string, title?: string): string {
  const lowerType = (type || '').toLowerCase();
  const lowerTitle = (title || '').toLowerCase();

  if (
    lowerType === 'link' ||
    lowerTitle.includes('drive') ||
    lowerTitle.includes('link') ||
    lowerTitle.includes('url') ||
    lowerTitle.includes('sheet')
  ) {
    return LINK_DOC_SVG;
  }

  if (
    lowerType === 'image' ||
    /\.(jpg|jpeg|png|webp|gif|svg|bmp|heic)$/i.test(lowerTitle)
  ) {
    return IMAGE_DOC_SVG;
  }

  if (
    lowerType === 'article' ||
    /\.(md|txt|rtf|markdown)$/i.test(lowerTitle) ||
    lowerTitle.includes('handbook') ||
    lowerTitle.includes('guide') ||
    lowerTitle.includes('guidelines') ||
    lowerTitle.includes('ethics') ||
    lowerTitle.includes('policy')
  ) {
    return ARTICLE_DOC_SVG;
  }

  if (
    lowerType === 'docx' ||
    lowerType === 'doc' ||
    /\.(docx|doc)$/i.test(lowerTitle)
  ) {
    return DOCX_SVG;
  }

  // W-2 Form and Resume use the burgundy/red PDF icon as shown in screenshot
  if (lowerTitle.includes('w-2') || lowerTitle.includes('resume')) {
    return PDF_RED_SVG;
  }

  return PDF_BLUE_SVG;
}

export function detectFileType(fileName: string, mimeType: string = ''): 'pdf' | 'docx' | 'image' | 'article' | 'link' | 'other' {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  if (
    lowerName.startsWith('http://') ||
    lowerName.startsWith('https://') ||
    lowerName.includes('drive.google.com') ||
    lowerName.includes('docs.google.com')
  ) {
    return 'link';
  }

  if (lowerMime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|bmp|heic)$/i.test(lowerName)) {
    return 'image';
  }
  if (lowerMime.includes('pdf') || lowerName.endsWith('.pdf')) {
    return 'pdf';
  }
  if (lowerMime.includes('word') || /\.(docx|doc)$/i.test(lowerName)) {
    return 'docx';
  }
  if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
    return 'article';
  }

  return 'other';
}

export function getDetectedBadgeStyle(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' };
    case 'image':
      return { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' };
    case 'article':
      return { backgroundColor: '#fefce8', borderColor: '#fef08a' };
    case 'docx':
      return { backgroundColor: '#f5f3ff', borderColor: '#ddd6fe' };
    default:
      return { backgroundColor: '#f1f5f9', borderColor: '#e2e8f0' };
  }
}

export function getDetectedBadgeTextStyle(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf':
      return { color: '#1d4ed8' };
    case 'image':
      return { color: '#15803d' };
    case 'article':
      return { color: '#a16207' };
    case 'docx':
      return { color: '#6d28d9' };
    default:
      return { color: '#475569' };
  }
}

const INITIAL_DOCUMENTS: DocumentReaderItem[] = [];

interface DocumentsDashboardProps {
  onBack?: () => void;
  onNavigateNewDoc?: () => void;
  employeeName?: string;
  employeeEmail?: string;
  employeeAvatar?: string;
}

const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
  <circle cx="24" cy="24" r="23" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="24" cy="18" r="7.5" fill="#64748b"/>
  <path d="M11 40C11 32.8203 16.8203 27 24 27C31.1797 27 37 32.8203 37 40" fill="#64748b"/>
</svg>
`)}`;

export function DocumentsDashboard({
  onBack,
  onNavigateNewDoc,
  employeeName = '',
  employeeEmail = '',
  employeeAvatar = '',
}: DocumentsDashboardProps) {
  const router = useRouter();
  const { isDark, colors } = useDocuVaultTheme();
  const { documents, addDocument, deleteDocument } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [readingDoc, setReadingDoc] = useState<DocumentReaderItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentReaderItem | null>(null);
  const [uploadNotification, setUploadNotification] = useState<string | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDeleteDoc = (doc: DocumentReaderItem, e?: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setDocToDelete(doc);
  };

  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    const deletedTitle = docToDelete.title;
    deleteDocument(docToDelete.id);
    setDocToDelete(null);
    setUploadNotification(`"${deletedTitle}" deleted successfully.`);
    setTimeout(() => setUploadNotification(null), 3000);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleUploadNew = () => {
    if (onNavigateNewDoc) {
      onNavigateNewDoc();
    } else {
      setUploadModalVisible(true);
    }
  };

  const handleUploadSuccess = (item: UploadedItemResult) => {
    const isImg = item.type === 'image';
    const isCV = item.name.toLowerCase().includes('cv') || item.name.toLowerCase().includes('resume');
    const cleanName = item.name.replace(/\.[^/.]+$/, '').replace(/_cv$/i, '').replace(/_resume$/i, '').replace(/[-_]/g, ' ') || employeeName;

    const newDoc: DocumentReaderItem = {
      id: Date.now().toString(),
      title: item.name,
      subtitle: `Uploaded: Today`,
      type: item.type,
      icon: getDocumentTypeIcon(item.type, item.name),
      fileSize: item.size,
      fileUrl: item.url,
      fileName: item.name,
      previewImage: item.previewImage,
      fullContent: isCV
        ? {
            category: 'Curriculum Vitae / Resume',
            date: 'Today',
            authorOrIssuer: cleanName,
            sections: [
              {
                heading: 'Professional Profile & Summary',
                body: `Dedicated software and systems engineering specialist with extensive experience in enterprise document architectures, mobile applications, and cryptographic record keeping.`,
              },
              {
                heading: 'Portfolio & Deliverables',
                body: `• DocuVault Enterprise Systems Architecture\n• High-performance interactive document viewer with live streaming and instant deletion\n• Biometric access verification and administrative audit trail`,
              },
            ],
          }
        : {
            category: 'Employee Uploads',
            date: 'Today',
            authorOrIssuer: employeeName,
            sections: [
              {
                heading: `${item.name} (${item.type.toUpperCase()})`,
                body: item.url
                  ? `Cloud / Web Resource: ${item.url}\nStored securely in DocuVault with biometric audit trail.`
                  : `Uploaded via secure permissions gateway.\nFile Name: ${item.name}\nSize: ${item.size}\nStatus: Active & Verified.`,
              },
            ],
          },
    };
    addDocument(newDoc);
    setUploadNotification(`Successfully uploaded "${item.name}"!`);
    setTimeout(() => setUploadNotification(null), 3500);
  };

  const handleWebFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const detectedType = detectFileType(file.name, file.type);
      const isImg = detectedType === 'image';
      let blobUrl: string | undefined;
      try {
        blobUrl = URL.createObjectURL(file);
      } catch (err) {
        console.warn('Could not create blob URL:', err);
      }
      const rawTitle = file.name.replace(/\.[^/.]+$/, '');
      const isCV = rawTitle.toLowerCase().includes('cv') || rawTitle.toLowerCase().includes('resume');
      const cleanName = rawTitle.replace(/_cv$/i, '').replace(/_resume$/i, '').replace(/[-_]/g, ' ') || employeeName;

      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const newDoc: DocumentReaderItem = {
          id: Date.now().toString(),
          title: rawTitle,
          subtitle: `Uploaded: Today`,
          type: detectedType,
          icon: getDocumentTypeIcon(detectedType, file.name),
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          fileUrl: blobUrl,
          fileName: file.name,
          previewImage: isImg && uploadEvent.target?.result ? (uploadEvent.target.result as string) : undefined,
          fullContent: isCV
            ? {
                category: 'Curriculum Vitae / Resume',
                date: 'Today',
                authorOrIssuer: cleanName,
                sections: [
                  {
                    heading: 'Professional Profile & Summary',
                    body: `Dedicated software and systems engineering specialist with extensive experience in enterprise document architectures, mobile applications, and cryptographic record keeping.`,
                  },
                  {
                    heading: 'Portfolio & Deliverables',
                    body: `• DocuVault Enterprise Systems Architecture\n• High-performance interactive document viewer with live streaming and instant deletion\n• Biometric access verification and administrative audit trail`,
                  },
                ],
              }
            : {
                category: 'Employee Uploads',
                date: 'Today',
                authorOrIssuer: employeeName,
                sections: [
                  {
                    heading: 'Uploaded Document Content',
                    body: `File: ${file.name}\nType: ${detectedType.toUpperCase()}\nSize: ${(file.size / 1024).toFixed(1)} KB\nStored securely in DocuVault.`,
                  },
                ],
              },
        };
        addDocument(newDoc);
        setUploadNotification(`Successfully uploaded "${file.name}" as ${detectedType.toUpperCase()}!`);
        setTimeout(() => setUploadNotification(null), 3500);
      };
      if (isImg) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    }
  };

  const simulateNewUpload = (name: string, type: 'image' | 'pdf' | 'article') => {
    const newDoc: DocumentReaderItem = {
      id: Date.now().toString(),
      title: name,
      subtitle: `Uploaded: Just now`,
      type: type,
      icon: getDocumentTypeIcon(type, name),
      fileSize: '2.5 MB',
      previewImage: type === 'image' ? 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80' : undefined,
      fullContent: {
        category: 'Employee Uploads',
        date: 'Today',
        authorOrIssuer: employeeName,
        sections: [
          {
            heading: 'Uploaded Document',
            body: `Verified uploaded document: ${name}`,
          },
        ],
      },
    };
    addDocument(newDoc);
    setUploadNotification(`Successfully uploaded "${name}"!`);
    setTimeout(() => setUploadNotification(null), 3500);
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
  const linkCount = documents.filter((d) => d.type === 'link').length;
  const imageCount = documents.filter((d) => d.type === 'image').length;
  const otherCount = documents.filter((d) => d.type === 'other').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <Image
              source={{ uri: isDark ? BACK_ARROW_DARK_SVG : BACK_ARROW_SVG }}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>My Documents</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {/* Theme Toggle Button */}
          <ThemeToggleButton compact showLabel={false} />

          <TouchableOpacity
            style={[styles.uploadHeaderButton, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }]}
            onPress={handleUploadNew}
            activeOpacity={0.8}
          >
            <Text style={styles.uploadHeaderButtonText}>📤 + Upload</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Employee Profile Card */}
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
            shadowColor: isDark ? '#000000' : '#0f172a',
          },
        ]}
      >
        <Image
          source={{ uri: employeeAvatar || DEFAULT_AVATAR_SVG }}
          style={styles.profileAvatar}
          resizeMode="cover"
        />
        <View style={styles.profileDetails}>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>{employeeName}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{employeeEmail}</Text>
        </View>
        <View
          style={[
            styles.activeBadge,
            {
              backgroundColor: isDark ? 'rgba(34, 197, 94, 0.16)' : '#eff6ff',
            },
          ]}
        >
          <Text
            style={[
              styles.activeBadgeText,
              { color: isDark ? '#4ade80' : '#2563eb' },
            ]}
          >
            🟢 Active
          </Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: isDark ? '#111827' : '#ffffff',
            borderColor: isDark ? '#27354f' : '#e2e8f0',
            shadowColor: isDark ? '#000000' : '#0f172a',
          },
        ]}
      >
        <Image
          source={{ uri: SEARCH_ICON_SVG }}
          style={[styles.searchIcon, { tintColor: isDark ? '#64748b' : '#94a3b8' }]}
          resizeMode="contain"
        />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="🔍 Search your documents..."
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Image
            source={{ uri: isDark ? FILTER_ICON_DARK_SVG : FILTER_ICON_SVG }}
            style={styles.filterIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Category Stats Horizontal Scroll / Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <TouchableOpacity
          style={[
            styles.statItem,
            activeCategory === 'all'
              ? (isDark ? { backgroundColor: '#1e293b' } : styles.statItemActive)
              : null,
          ]}
          onPress={() => setActiveCategory('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.statCount, { color: colors.textPrimary }]}>{documents.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>📊 All Docs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statItem,
            activeCategory === 'pdf'
              ? (isDark ? { backgroundColor: '#1e293b' } : styles.statItemActive)
              : null,
          ]}
          onPress={() => setActiveCategory('pdf')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_PDF_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={[styles.statCount, { color: colors.textPrimary }]}>{pdfCount}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>📄 PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statItem,
            activeCategory === 'docx'
              ? (isDark ? { backgroundColor: '#1e293b' } : styles.statItemActive)
              : null,
          ]}
          onPress={() => setActiveCategory('docx')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_DOCX_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={[styles.statCount, { color: colors.textPrimary }]}>{docxCount}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>📝 DOCX</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statItem,
            activeCategory === 'article'
              ? (isDark ? { backgroundColor: '#1e293b' } : styles.statItemActive)
              : null,
          ]}
          onPress={() => setActiveCategory('article')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_ARTICLE_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={[styles.statCount, { color: colors.textPrimary }]}>{articleCount}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>📰 Articles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statItem,
            activeCategory === 'link'
              ? (isDark ? { backgroundColor: '#1e293b' } : styles.statItemActive)
              : null,
          ]}
          onPress={() => setActiveCategory('link')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_LINK_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={[styles.statCount, { color: colors.textPrimary }]}>{linkCount}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>🔗 Links</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statItem,
            activeCategory === 'image'
              ? (isDark ? { backgroundColor: '#1e293b' } : styles.statItemActive)
              : null,
          ]}
          onPress={() => setActiveCategory('image')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_IMAGE_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={[styles.statCount, { color: colors.textPrimary }]}>{imageCount}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>🖼️ Images</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.statItem,
            activeCategory === 'other'
              ? (isDark ? { backgroundColor: '#1e293b' } : styles.statItemActive)
              : null,
          ]}
          onPress={() => setActiveCategory('other')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_OTHER_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={[styles.statCount, { color: colors.textPrimary }]}>{otherCount}</Text>
          </View>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>📁 Other</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Document Items List */}
      <View style={styles.docList}>
        {filteredDocs.length === 0 ? (
          <View
            style={[
              styles.emptyStateCard,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              },
            ]}
          >
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
              <Text style={{ fontSize: 36 }}>📂</Text>
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Documents Yet</Text>
            <Text style={[styles.emptySub, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {searchQuery
                ? 'No documents match your search.'
                : 'All mock documents have been removed. Go to the Upload page to upload documents, images, or Google Drive links.'}
            </Text>
            <TouchableOpacity
              style={[styles.emptyActionBtn, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }]}
              onPress={handleUploadNew}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyActionBtnText}>📤 Go to Upload Page</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredDocs.map((doc) => (
            <TouchableOpacity
              key={doc.id}
              style={[
                styles.docCard,
                {
                  backgroundColor: isDark ? '#111827' : '#ffffff',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e8edf4',
                  shadowColor: isDark ? '#000000' : '#64748b',
                },
              ]}
              onPress={() => setReadingDoc(doc)}
              onLongPress={() => setDocToDelete(doc)}
              activeOpacity={0.8}
            >
              <View style={styles.docIconWrapper}>
                <Image
                  source={{ uri: getDocumentTypeIcon(doc.type, doc.title) }}
                  style={styles.docTypeImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.docInfo}>
                <Text
                  style={[
                    styles.docTitle,
                    { color: colors.textPrimary },
                  ]}
                  numberOfLines={1}
                >
                  {doc.title}
                </Text>
                <Text
                  style={[
                    styles.docSubtitle,
                    { color: isDark ? '#94a3b8' : '#64748b' },
                    doc.subtitle === 'Not Uploaded' ? (isDark ? { color: '#64748b' } : styles.notUploadedText) : null,
                  ]}
                >
                  {doc.subtitle}
                </Text>
              </View>

              {/* Actions: Right side shows exactly two icons: Eye (Read) and Delete */}
              <View style={styles.cardActionsRow}>
                {/* Eye Button: View & Read */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    setReadingDoc(doc);
                  }}
                  activeOpacity={0.7}
                  accessibilityLabel={`Read ${doc.title}`}
                >
                  <ActionIcon type="eye" isDark={isDark} />
                </TouchableOpacity>

                {/* Delete Button: Delete document */}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    handleDeleteDoc(doc, e);
                  }}
                  activeOpacity={0.7}
                  accessibilityLabel={`Delete ${doc.title}`}
                >
                  <ActionIcon type="trash" isDark={isDark} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!docToDelete}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDocToDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.deleteDialog,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
                borderWidth: isDark ? 1 : 0,
              },
            ]}
          >
            <View style={styles.deleteIconBadge}>
              <Image source={{ uri: TRASH_ICON_SVG }} style={{ width: 28, height: 28 }} resizeMode="contain" />
            </View>
            <Text style={[styles.deleteModalTitle, { color: colors.textPrimary }]}>🗑️ Delete Document?</Text>
            <Text style={[styles.deleteModalBody, { color: colors.textSecondary }]}>
              ⚠️ Are you sure you want to delete "{docToDelete?.title}"? This document will be permanently removed from your DocuVault.
            </Text>

            <View style={styles.deleteModalActionRow}>
              <TouchableOpacity
                style={[
                  styles.deleteCancelBtn,
                  { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' },
                ]}
                onPress={() => setDocToDelete(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.deleteCancelBtnText, { color: isDark ? '#94a3b8' : '#475569' }]}>❌ Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleConfirmDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteConfirmBtnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Multi-Source Upload Permission Modal (Gallery, Browser, Web Link) */}
      <UploadPermissionModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        title="Upload Document or Photo"
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Dedicated Full Document / Article / Image Reader */}
      {readingDoc && (
        <DocumentReader
          key={readingDoc.id}
          document={readingDoc}
          onClose={() => setReadingDoc(null)}
        />
      )}
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
    paddingBottom: 95,
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
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  detectedTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  detectedTypeBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  notUploadedText: {
    color: '#94a3b8',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnIcon: {
    width: 20,
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteDialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  deleteIconBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  deleteModalBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 20,
  },
  deleteModalActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  deleteCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  deleteConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  emptyStateCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
    maxWidth: 290,
  },
  emptyActionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#1b3569',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
