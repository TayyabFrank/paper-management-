import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';

export interface DocumentBadgeProps {
  type?: string;
  title?: string;
  fileUrl?: string;
  previewImage?: string;
  subtitle?: string;
  size?: number;
  isDark?: boolean;
}

// Crisp Vector SVGs for Web
const MINI_PDF_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#eff6ff"/>
  <path d="M12 9H21L26 14V28C26 29.1046 25.1046 30 24 30H12C10.8954 30 10 29.1046 10 28V11C10 9.89543 10.8954 9 12 9Z" stroke="#2563eb" stroke-width="1.6" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M21 9V14H26" stroke="#2563eb" stroke-width="1.6" stroke-linejoin="round"/>
  <text x="18" y="24" font-size="6.5" font-weight="800" fill="#2563eb" text-anchor="middle" font-family="sans-serif">PDF</text>
</svg>
`)}`;

const MINI_RED_PDF_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#fef2f2"/>
  <path d="M12 9H21L26 14V28C26 29.1046 25.1046 30 24 30H12C10.8954 30 10 29.1046 10 28V11C10 9.89543 10.8954 9 12 9Z" stroke="#dc2626" stroke-width="1.6" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M21 9V14H26" stroke="#dc2626" stroke-width="1.6" stroke-linejoin="round"/>
  <text x="18" y="24" font-size="6.5" font-weight="800" fill="#dc2626" text-anchor="middle" font-family="sans-serif">PDF</text>
</svg>
`)}`;

const MINI_DOCX_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#eff6ff"/>
  <path d="M12 9H21L26 14V28C26 29.1046 25.1046 30 24 30H12C10.8954 30 10 29.1046 10 28V11C10 9.89543 10.8954 9 12 9Z" stroke="#2563eb" stroke-width="1.6" fill="#ffffff" stroke-linejoin="round"/>
  <path d="M21 9V14H26" stroke="#2563eb" stroke-width="1.6" stroke-linejoin="round"/>
  <text x="18" y="24" font-size="7.5" font-weight="900" fill="#2563eb" text-anchor="middle" font-family="sans-serif">W</text>
</svg>
`)}`;

const MINI_IMAGE_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#eff6ff"/>
  <rect x="10" y="10" width="18" height="18" rx="3" stroke="#2563eb" stroke-width="1.6" fill="#ffffff"/>
  <circle cx="15" cy="15" r="1.8" fill="#2563eb"/>
  <path d="M11 25L16 19L20 23L23 20L27 25" stroke="#2563eb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

const MINI_LINK_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#ecfeff"/>
  <path d="M12 20C12 16.6863 14.6863 14 18 14H20M20 14H22C25.3137 14 28 16.6863 28 20C28 23.3137 25.3137 26 22 26H20M15 20H23" stroke="#0891b2" stroke-width="2" stroke-linecap="round"/>
  <text x="19" y="32" font-size="6.5" font-weight="900" fill="#0891b2" text-anchor="middle" font-family="sans-serif">LINK</text>
</svg>
`)}`;

const MINI_VIDEO_BADGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 38 38" fill="none">
  <rect width="38" height="38" rx="10" fill="#fff1f2"/>
  <rect x="9" y="10" width="20" height="15" rx="3" stroke="#e11d48" stroke-width="1.6" fill="#ffffff"/>
  <polygon points="17,14 23,17.5 17,21" fill="#e11d48"/>
  <text x="19" y="32" font-size="6.5" font-weight="900" fill="#e11d48" text-anchor="middle" font-family="sans-serif">VID</text>
</svg>
`)}`;

export function getDocumentColor(type: string = ''): string {
  const t = type.toLowerCase();
  if (t === 'pdf') return '#ef4444';
  if (t === 'docx' || t === 'doc') return '#2563eb';
  if (t === 'image' || t === 'img') return '#06b6d4';
  if (t === 'video') return '#f43f5e';
  if (t === 'article') return '#8b5cf6';
  if (t === 'link') return '#10b981';
  return '#64748b';
}

export function DocumentBadge({
  type = 'other',
  title = '',
  fileUrl,
  previewImage,
  subtitle = '',
  size = 42,
  isDark = false,
}: DocumentBadgeProps) {
  const lowerType = type.toLowerCase();
  const lowerTitle = title.toLowerCase();
  const isNotUploaded = subtitle.toLowerCase().includes('not uploaded');

  const isLink =
    lowerType === 'link' ||
    Boolean(
      fileUrl &&
        (fileUrl.includes('drive.google.com') ||
          fileUrl.includes('docs.google.com') ||
          fileUrl.startsWith('http'))
    ) ||
    lowerTitle.includes('drive');

  const isImg = lowerType === 'image' || /\.(jpg|jpeg|png|webp|gif|svg|bmp|heic)$/i.test(lowerTitle);
  const isDocx = lowerType === 'docx' || lowerType === 'doc' || /\.(docx|doc)$/i.test(lowerTitle);
  const isVideo = lowerType === 'video' || /\.(mp4|mov|avi|mkv|webm)$/i.test(lowerTitle);
  const isPdf = lowerType === 'pdf' || lowerTitle.endsWith('.pdf') || lowerTitle.includes('w-2') || lowerTitle.includes('resume');
  const isArticle = lowerType === 'article' || /\.(txt|md)$/i.test(lowerTitle);

  // If user uploaded an image and preview URL is available
  if (isImg && previewImage) {
    return (
      <View
        style={[
          styles.badgeBase,
          {
            width: size,
            height: size,
            borderRadius: 10,
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(56, 189, 248, 0.4)' : '#cbd5e1',
          },
        ]}
      >
        <Image
          source={{ uri: previewImage }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    );
  }

  // On Web, use crisp SVG badges
  if (Platform.OS === 'web') {
    let svgBadge = MINI_PDF_BADGE;
    if (isNotUploaded) svgBadge = MINI_RED_PDF_BADGE;
    else if (isLink) svgBadge = MINI_LINK_BADGE;
    else if (isImg) svgBadge = MINI_IMAGE_BADGE;
    else if (isDocx) svgBadge = MINI_DOCX_BADGE;
    else if (isVideo) svgBadge = MINI_VIDEO_BADGE;

    return (
      <View style={[styles.badgeBase, { width: size, height: size }]}>
        <Image
          source={{ uri: svgBadge }}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </View>
    );
  }

  // Cross-Platform Native View Badge (Android / iOS)
  // Perfectly styled colored card with clear file badge
  let bg = '#eff6ff';
  let border = '#93c5fd';
  let tagColor = '#2563eb';
  let emoji = '📄';
  let label = 'PDF';

  if (isNotUploaded) {
    bg = isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2';
    border = isDark ? '#7f1d1d' : '#fecaca';
    tagColor = '#ef4444';
    emoji = '📄';
    label = 'PDF';
  } else if (isPdf) {
    bg = isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2';
    border = isDark ? 'rgba(239, 68, 68, 0.4)' : '#fecaca';
    tagColor = '#dc2626';
    emoji = '📄';
    label = 'PDF';
  } else if (isDocx) {
    bg = isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff';
    border = isDark ? 'rgba(37, 99, 235, 0.4)' : '#bfdbfe';
    tagColor = '#2563eb';
    emoji = '📝';
    label = 'DOC';
  } else if (isLink) {
    bg = isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5';
    border = isDark ? 'rgba(16, 185, 129, 0.4)' : '#a7f3d0';
    tagColor = '#059669';
    emoji = '🔗';
    label = 'LINK';
  } else if (isImg) {
    bg = isDark ? 'rgba(6, 182, 212, 0.15)' : '#ecfeff';
    border = isDark ? 'rgba(6, 182, 212, 0.4)' : '#a5f3fc';
    tagColor = '#0891b2';
    emoji = '🖼️';
    label = 'IMG';
  } else if (isVideo) {
    bg = isDark ? 'rgba(244, 63, 94, 0.15)' : '#fff1f2';
    border = isDark ? 'rgba(244, 63, 94, 0.4)' : '#fecdd3';
    tagColor = '#e11d48';
    emoji = '🎬';
    label = 'VID';
  } else if (isArticle) {
    bg = isDark ? 'rgba(139, 92, 246, 0.15)' : '#f5f3ff';
    border = isDark ? 'rgba(139, 92, 246, 0.4)' : '#ddd6fe';
    tagColor = '#7c3aed';
    emoji = '📑';
    label = 'TXT';
  } else {
    bg = isDark ? 'rgba(148, 163, 184, 0.15)' : '#f8fafc';
    border = isDark ? '#334155' : '#e2e8f0';
    tagColor = isDark ? '#cbd5e1' : '#475569';
    emoji = '📁';
    label = 'DOC';
  }

  return (
    <View
      style={[
        styles.nativeBadge,
        {
          width: size,
          height: size,
          backgroundColor: bg,
          borderColor: border,
        },
      ]}
    >
      <Text style={{ fontSize: size * 0.38, marginBottom: -1 }}>{emoji}</Text>
      <Text
        style={[
          styles.nativeBadgeLabel,
          {
            color: tagColor,
            fontSize: Math.max(size * 0.22, 8),
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badgeBase: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeBadge: {
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  nativeBadgeLabel: {
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
