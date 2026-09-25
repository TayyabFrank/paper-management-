import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useDocuments } from '@/context/documents-context';
import { DocumentReaderItem } from '@/components/document-reader';
import { APP_LOGO } from '@/components/docuvault-logo';
import { AdminTabKey } from './admin-bottom-navbar';

export interface AdminDashboardTabProps {
  onNavigateTab: (tab: AdminTabKey, category?: string) => void;
  onOpenMenu?: () => void;
  onOpenDocument?: (doc: DocumentReaderItem) => void;
}

// Crisp Vector SVGs for Dashboard
const HAMBURGER_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <line x1="3" y1="6" x2="21" y2="6"></line>
  <line x1="3" y1="12" x2="21" y2="12"></line>
  <line x1="3" y1="18" x2="21" y2="18"></line>
</svg>
`)}`;

const CHART_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <line x1="18" y1="20" x2="18" y2="10"></line>
  <line x1="12" y1="20" x2="12" y2="4"></line>
  <line x1="6" y1="20" x2="6" y2="14"></line>
</svg>
`)}`;

const ARROW_RIGHT_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="9 18 15 12 9 6"></polyline>
</svg>
`)}`;

const USERS_ICON_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
  <circle cx="9" cy="7" r="4"></circle>
  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
</svg>
`)}`;

const SHIELD_CHECK_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  <polyline points="9 12 11 14 15 10"></polyline>
</svg>
`)}`;

interface CategoryMetric {
  key: 'article' | 'pdf' | 'docx' | 'image' | 'other';
  label: string;
  emoji: string;
  count: number;
  pct: number;
  color: string;
  darkColor: string;
  bgLight: string;
  bgDark: string;
  description: string;
}

export function AdminDashboardTab({
  onNavigateTab,
  onOpenMenu,
  onOpenDocument,
}: AdminDashboardTabProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { registeredAccounts } = useAuth();
  const { documents } = useDocuments();

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('article');

  // Staff metrics
  const activeEmployees = useMemo(
    () =>
      registeredAccounts.filter(
        (a) => a.role?.toLowerCase() !== 'admin' && a.status !== 'pending' && a.status !== 'rejected'
      ),
    [registeredAccounts]
  );
  const pendingApprovals = useMemo(
    () => registeredAccounts.filter((a) => a.status === 'pending'),
    [registeredAccounts]
  );

  // Document Counts
  const totalCount = documents.length;
  const articleDocs = useMemo(() => documents.filter((d) => d.type === 'article'), [documents]);
  const pdfDocs = useMemo(() => documents.filter((d) => d.type === 'pdf'), [documents]);
  const docxDocs = useMemo(() => documents.filter((d) => d.type === 'docx'), [documents]);
  const imageDocs = useMemo(() => documents.filter((d) => d.type === 'image'), [documents]);
  const otherDocs = useMemo(
    () => documents.filter((d) => d.type === 'other' || d.type === 'link'),
    [documents]
  );

  const articleCount = articleDocs.length;
  const pdfCount = pdfDocs.length;
  const docxCount = docxDocs.length;
  const imageCount = imageDocs.length;
  const otherCount = otherDocs.length;

  // Percentages (safe against div by 0)
  const calcPct = (count: number) => (totalCount > 0 ? Math.round((count / totalCount) * 100) : 0);

  const categories: CategoryMetric[] = useMemo(
    () => [
      {
        key: 'article',
        label: 'Articles',
        emoji: '📰',
        count: articleCount,
        pct: calcPct(articleCount),
        color: '#8b5cf6',
        darkColor: '#a78bfa',
        bgLight: '#f5f3ff',
        bgDark: '#2e1065',
        description: 'Knowledge bases, editorial whitepapers & internal guidelines',
      },
      {
        key: 'pdf',
        label: 'PDF Docs',
        emoji: '📄',
        count: pdfCount,
        pct: calcPct(pdfCount),
        color: '#ef4444',
        darkColor: '#f87171',
        bgLight: '#fef2f2',
        bgDark: '#450a0a',
        description: 'Portable agreements, handbooks & signed legal records',
      },
      {
        key: 'docx',
        label: 'Word Docs',
        emoji: '📘',
        count: docxCount,
        pct: calcPct(docxCount),
        color: '#0284c7',
        darkColor: '#38bdf8',
        bgLight: '#f0f9ff',
        bgDark: '#082f49',
        description: 'Project blueprints, proposals & operational roadmaps',
      },
      {
        key: 'image',
        label: 'Images',
        emoji: '🖼️',
        count: imageCount,
        pct: calcPct(imageCount),
        color: '#10b981',
        darkColor: '#34d399',
        bgLight: '#ecfdf5',
        bgDark: '#064e3b',
        description: 'Facility blueprints, architectural maps & diagrams',
      },
      {
        key: 'other',
        label: 'Other & Links',
        emoji: '💬',
        count: otherCount,
        pct: calcPct(otherCount),
        color: '#f59e0b',
        darkColor: '#fbbf24',
        bgLight: '#fffbeb',
        bgDark: '#451a03',
        description: 'Cloud storage mirrors, external bookmarks & drive files',
      },
    ],
    [articleCount, pdfCount, docxCount, imageCount, otherCount, totalCount]
  );

  // Maximum count for graph scaling (minimum 1 to prevent /0)
  const maxCount = useMemo(() => Math.max(...categories.map((c) => c.count), 1), [categories]);

  // Selected category info for inspector
  const activeCategoryMetric = useMemo(
    () => categories.find((c) => c.key === selectedCategoryKey) || categories[0],
    [categories, selectedCategoryKey]
  );

  // Compliance / Signed stats
  const signedDocs = useMemo(() => documents.filter((d) => d.isSigned), [documents]);
  const signedCount = signedDocs.length;
  const unsignedCount = totalCount - signedCount;
  const signedPct = totalCount > 0 ? Math.round((signedCount / totalCount) * 100) : 0;

  // Recent 4 documents for preview list
  const recentDocs = useMemo(() => documents.slice(0, 4), [documents]);

  return (
    <View style={[styles.screenContainer, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      {/* Top Header Banner matching DocuVault Admin Spec */}
      <View style={[styles.topHeaderBar, { backgroundColor: isDark ? '#0f172a' : '#172554' }]}>
        <View style={styles.topHeaderContent}>
          <View style={styles.brandRow}>
            <Image
              source={APP_LOGO}
              style={styles.logoBadge}
              resizeMode="contain"
            />
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={styles.brandTitle}>DocuVault</Text>
                <View style={styles.adminTagPill}>
                  <Text style={styles.adminTagText}>🛡️ ADMIN</Text>
                </View>
              </View>
              <Text style={styles.brandSub}>Enterprise Intelligence Platform</Text>
            </View>
          </View>

          <View style={styles.headerRightActions}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>

            <TouchableOpacity
              style={styles.hamburgerBtn}
              onPress={onOpenMenu}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: HAMBURGER_SVG('#ffffff') }}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Title Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadgeRow}>
            <Text style={[styles.heroSectionBadge, { backgroundColor: isDark ? '#1e293b' : '#e0e7ff', color: isDark ? '#93c5fd' : '#3730a3' }]}>
              DOCUMENT REPOSITORY ANALYTICS
            </Text>
          </View>
          <Text style={[styles.pageTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
            Platform Dashboard & Graphs
          </Text>
          <Text style={[styles.pageSubtitle, { color: isDark ? '#94a3b8' : '#475569' }]}>
            High-level metrics and visual breakdown of total documents, articles, PDFs, and staff activity.
          </Text>
        </View>

        {/* Top Summary KPI Cards (Primary Totals) */}
        <View style={styles.kpiGrid}>
          {/* Main Total Documents Card */}
          <TouchableOpacity
            style={[
              styles.kpiTotalCard,
              {
                backgroundColor: isDark ? '#1e1b4b' : '#1e3a8a',
                borderColor: isDark ? '#4338ca' : '#1d4ed8',
              },
            ]}
            onPress={() => onNavigateTab('docs', 'all')}
            activeOpacity={0.85}
          >
            <View style={styles.kpiHeaderRow}>
              <View style={styles.kpiIconWrapper}>
                <Image source={{ uri: CHART_ICON_SVG('#ffffff') }} style={{ width: 22, height: 22 }} resizeMode="contain" />
              </View>
              <View style={styles.kpiPill}>
                <Text style={styles.kpiPillText}>100% REPOSITORY</Text>
              </View>
            </View>

            <Text style={styles.kpiBigNumber}>{totalCount}</Text>
            <Text style={styles.kpiMainLabel}>Total Documents Uploaded</Text>
            <Text style={styles.kpiSubLabel}>
              Comprehensive count across articles, PDFs, DOCX, images & media
            </Text>

            <View style={styles.kpiFooterAction}>
              <Text style={styles.kpiFooterText}>Open Repository</Text>
              <Image source={{ uri: ARROW_RIGHT_SVG('#ffffff') }} style={{ width: 14, height: 14 }} resizeMode="contain" />
            </View>
          </TouchableOpacity>

          {/* Quick 2-Column Sub KPI: Articles vs Staff */}
          <View style={styles.subKpiRow}>
            {/* Articles Highlight Card */}
            <TouchableOpacity
              style={[
                styles.subKpiCard,
                {
                  backgroundColor: isDark ? '#18181b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                },
              ]}
              onPress={() => onNavigateTab('docs', 'article')}
              activeOpacity={0.8}
            >
              <View style={styles.subKpiTop}>
                <Text style={styles.subKpiEmoji}>📰</Text>
                <View style={[styles.pctBadge, { backgroundColor: isDark ? '#3b0764' : '#f3e8ff' }]}>
                  <Text style={[styles.pctBadgeText, { color: isDark ? '#d8b4fe' : '#7e22ce' }]}>
                    {calcPct(articleCount)}% Total
                  </Text>
                </View>
              </View>
              <Text style={[styles.subKpiValue, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                {articleCount}
              </Text>
              <Text style={[styles.subKpiTitle, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                Articles
              </Text>
              <Text style={[styles.subKpiAction, { color: isDark ? '#a78bfa' : '#6d28d9' }]}>
                View Articles →
              </Text>
            </TouchableOpacity>

            {/* Active Staff Card */}
            <TouchableOpacity
              style={[
                styles.subKpiCard,
                {
                  backgroundColor: isDark ? '#18181b' : '#ffffff',
                  borderColor: isDark ? '#27272a' : '#e4e4e7',
                },
              ]}
              onPress={() => onNavigateTab('users')}
              activeOpacity={0.8}
            >
              <View style={styles.subKpiTop}>
                <Image source={{ uri: USERS_ICON_SVG(isDark ? '#38bdf8' : '#0284c7') }} style={{ width: 22, height: 22 }} resizeMode="contain" />
                <View style={[styles.pctBadge, { backgroundColor: isDark ? '#082f49' : '#e0f2fe' }]}>
                  <Text style={[styles.pctBadgeText, { color: isDark ? '#7dd3fc' : '#0369a1' }]}>
                    {pendingApprovals.length} Pending
                  </Text>
                </View>
              </View>
              <Text style={[styles.subKpiValue, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                {activeEmployees.length}
              </Text>
              <Text style={[styles.subKpiTitle, { color: isDark ? '#a1a1aa' : '#52525b' }]}>
                Active Staff
              </Text>
              <Text style={[styles.subKpiAction, { color: isDark ? '#38bdf8' : '#0284c7' }]}>
                Staff Directory →
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIMARY GRAPH 1: Document Volume Distribution Bar / Column Chart */}
        <View
          style={[
            styles.chartCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          <View style={styles.chartHeader}>
            <View>
              <View style={styles.chartTitleRow}>
                <Text style={styles.chartIconEmoji}>📊</Text>
                <Text style={[styles.chartTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  Document Distribution Graph
                </Text>
              </View>
              <Text style={[styles.chartSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Total volume breakdown by file category (tap any bar to inspect)
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.allDocsPillBtn, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
              onPress={() => onNavigateTab('docs', 'all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.allDocsPillText, { color: isDark ? '#93c5fd' : '#2563eb' }]}>
                View All {totalCount}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Graph Visual Area */}
          <View style={styles.graphWrapper}>
            {/* Background Horizontal Guide Lines */}
            <View style={styles.gridLinesContainer}>
              <View style={[styles.gridLine, { borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <Text style={[styles.gridLineLabel, { color: isDark ? '#64748b' : '#94a3b8' }]}>{maxCount}</Text>
              </View>
              <View style={[styles.gridLine, { borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <Text style={[styles.gridLineLabel, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                  {Math.round(maxCount / 2)}
                </Text>
              </View>
              <View style={[styles.gridLine, { borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <Text style={[styles.gridLineLabel, { color: isDark ? '#64748b' : '#94a3b8' }]}>0</Text>
              </View>
            </View>

            {/* Vertical Columns */}
            <View style={styles.columnsRow}>
              {categories.map((cat) => {
                const isSelected = selectedCategoryKey === cat.key;
                const columnHeightPct = maxCount > 0 ? (cat.count / maxCount) * 100 : 0;
                // Minimum bar height for visibility even if 0
                const displayHeightPct = Math.max(columnHeightPct, cat.count > 0 ? 16 : 4);

                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={styles.columnContainer}
                    onPress={() => setSelectedCategoryKey(cat.key)}
                    activeOpacity={0.75}
                  >
                    {/* Top Floating Count Badge */}
                    <View
                      style={[
                        styles.barValueBadge,
                        {
                          backgroundColor: isSelected
                            ? isDark
                              ? cat.darkColor
                              : cat.color
                            : isDark
                            ? '#1e293b'
                            : '#f8fafc',
                          borderColor: isSelected ? '#ffffff' : isDark ? '#334155' : '#e2e8f0',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.barValueText,
                          {
                            color: isSelected
                              ? '#ffffff'
                              : isDark
                              ? colors.textPrimary
                              : '#0f172a',
                          },
                        ]}
                      >
                        {cat.count}
                      </Text>
                    </View>

                    {/* Bar Pillar */}
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${displayHeightPct}%`,
                            backgroundColor: isDark ? cat.darkColor : cat.color,
                            opacity: isSelected ? 1 : 0.75,
                            borderWidth: isSelected ? 2 : 0,
                            borderColor: '#ffffff',
                          },
                        ]}
                      />
                    </View>

                    {/* Category Label & Emoji at Foot */}
                    <View style={styles.barFoot}>
                      <Text style={styles.barFootEmoji}>{cat.emoji}</Text>
                      <Text
                        style={[
                          styles.barFootLabel,
                          {
                            color: isSelected
                              ? isDark
                                ? cat.darkColor
                                : cat.color
                              : isDark
                              ? '#94a3b8'
                              : '#64748b',
                            fontWeight: isSelected ? '800' : '600',
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {cat.label}
                      </Text>
                      <Text style={[styles.barFootPct, { color: isDark ? '#64748b' : '#94a3b8' }]}>
                        {cat.pct}%
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Active Category Drilldown / Inspector Card */}
          <View
            style={[
              styles.inspectorCard,
              {
                backgroundColor: isDark ? activeCategoryMetric.bgDark : activeCategoryMetric.bgLight,
                borderColor: isDark ? activeCategoryMetric.darkColor : activeCategoryMetric.color,
              },
            ]}
          >
            <View style={styles.inspectorLeft}>
              <View style={styles.inspectorHeader}>
                <Text style={styles.inspectorEmoji}>{activeCategoryMetric.emoji}</Text>
                <View>
                  <Text
                    style={[
                      styles.inspectorTitle,
                      { color: isDark ? '#f8fafc' : '#0f172a' },
                    ]}
                  >
                    {activeCategoryMetric.label} Summary
                  </Text>
                  <Text
                    style={[
                      styles.inspectorSub,
                      { color: isDark ? '#cbd5e1' : '#475569' },
                    ]}
                  >
                    {activeCategoryMetric.description}
                  </Text>
                </View>
              </View>

              <View style={styles.inspectorStatsRow}>
                <View style={styles.inspectorStatItem}>
                  <Text style={[styles.inspectorStatValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                    {activeCategoryMetric.count}
                  </Text>
                  <Text style={[styles.inspectorStatLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>
                    Total Files
                  </Text>
                </View>

                <View style={styles.inspectorStatDivider} />

                <View style={styles.inspectorStatItem}>
                  <Text style={[styles.inspectorStatValue, { color: isDark ? '#ffffff' : '#0f172a' }]}>
                    {activeCategoryMetric.pct}%
                  </Text>
                  <Text style={[styles.inspectorStatLabel, { color: isDark ? '#cbd5e1' : '#64748b' }]}>
                    Vault Share
                  </Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.inspectorActionBtn,
                { backgroundColor: isDark ? activeCategoryMetric.darkColor : activeCategoryMetric.color },
              ]}
              onPress={() => onNavigateTab('docs', activeCategoryMetric.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.inspectorActionBtnText}>
                Filter {activeCategoryMetric.label}
              </Text>
              <Image source={{ uri: ARROW_RIGHT_SVG('#ffffff') }} style={{ width: 14, height: 14 }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        {/* PRIMARY GRAPH 2: Stacked Composition Spectrum Bar */}
        <View
          style={[
            styles.spectrumCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          <View style={styles.spectrumHeader}>
            <View>
              <Text style={[styles.spectrumTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                Proportional Vault Composition
              </Text>
              <Text style={[styles.spectrumSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Relative proportion of each document type across {totalCount} total assets
              </Text>
            </View>
          </View>

          {/* Continuous Stacked Segment Bar */}
          <View style={styles.stackedBarContainer}>
            {categories.map((cat) => {
              if (cat.pct <= 0) return null;
              return (
                <View
                  key={cat.key}
                  style={[
                    styles.stackedBarSegment,
                    {
                      flex: cat.count || 1,
                      backgroundColor: isDark ? cat.darkColor : cat.color,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Interactive Legend Pills */}
          <View style={styles.legendGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.legendPill,
                  {
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    borderColor: isDark ? '#334155' : '#e2e8f0',
                  },
                ]}
                onPress={() => onNavigateTab('docs', cat.key)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.legendColorDot,
                    { backgroundColor: isDark ? cat.darkColor : cat.color },
                  ]}
                />
                <Text style={styles.legendEmoji}>{cat.emoji}</Text>
                <Text style={[styles.legendLabel, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  {cat.label}
                </Text>
                <Text style={[styles.legendCount, { color: isDark ? cat.darkColor : cat.color }]}>
                  {cat.count}
                </Text>
                <Text style={[styles.legendPct, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  ({cat.pct}%)
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PRIMARY GRAPH 3: Compliance & Security Status */}
        <View
          style={[
            styles.complianceCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
        >
          <View style={styles.complianceHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Image source={{ uri: SHIELD_CHECK_SVG(isDark ? '#34d399' : '#059669') }} style={{ width: 22, height: 22 }} resizeMode="contain" />
              <View>
                <Text style={[styles.complianceTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  Verification & Compliance Status
                </Text>
                <Text style={[styles.complianceSubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  Signed corporate records vs standard operational files
                </Text>
              </View>
            </View>

            <View style={[styles.complianceBadge, { backgroundColor: isDark ? '#064e3b' : '#d1fae5' }]}>
              <Text style={[styles.complianceBadgeText, { color: isDark ? '#6ee7b7' : '#065f46' }]}>
                {signedPct}% Signed
              </Text>
            </View>
          </View>

          {/* Dual Bar Comparison */}
          <View style={styles.dualBarSection}>
            {/* Signed bar */}
            <View style={styles.dualBarItem}>
              <View style={styles.dualBarLabelRow}>
                <Text style={[styles.dualBarLabel, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  ✅ Signed & Legally Verified
                </Text>
                <Text style={[styles.dualBarCount, { color: isDark ? '#34d399' : '#059669' }]}>
                  {signedCount} ({signedPct}%)
                </Text>
              </View>
              <View style={[styles.dualBarTrack, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <View
                  style={[
                    styles.dualBarFill,
                    {
                      width: `${signedPct}%`,
                      backgroundColor: isDark ? '#10b981' : '#059669',
                    },
                  ]}
                />
              </View>
            </View>

            {/* Unsigned bar */}
            <View style={styles.dualBarItem}>
              <View style={styles.dualBarLabelRow}>
                <Text style={[styles.dualBarLabel, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
                  📋 Standard / Informational Files
                </Text>
                <Text style={[styles.dualBarCount, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  {unsignedCount} ({100 - signedPct}%)
                </Text>
              </View>
              <View style={[styles.dualBarTrack, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                <View
                  style={[
                    styles.dualBarFill,
                    {
                      width: `${100 - signedPct}%`,
                      backgroundColor: isDark ? '#64748b' : '#94a3b8',
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* RECENT UPLOADS STREAM */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeaderRow}>
            <Text style={[styles.recentSectionTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              Recent Enterprise Uploads
            </Text>
            <TouchableOpacity
              onPress={() => onNavigateTab('docs', 'all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.recentViewAllText, { color: isDark ? '#60a5fa' : '#2563eb' }]}>
                View All →
              </Text>
            </TouchableOpacity>
          </View>

          {recentDocs.map((doc) => {
            const isArticle = doc.type === 'article';
            const isPdf = doc.type === 'pdf';
            const isDocx = doc.type === 'docx';
            const isImg = doc.type === 'image';

            const badgeBg = isArticle
              ? isDark ? '#3b0764' : '#f3e8ff'
              : isPdf
              ? isDark ? '#450a0a' : '#fee2e2'
              : isDocx
              ? isDark ? '#082f49' : '#e0f2fe'
              : isImg
              ? isDark ? '#064e3b' : '#dcfce7'
              : isDark ? '#451a03' : '#fef3c7';

            const badgeColor = isArticle
              ? isDark ? '#d8b4fe' : '#7e22ce'
              : isPdf
              ? isDark ? '#fca5a5' : '#dc2626'
              : isDocx
              ? isDark ? '#7dd3fc' : '#0284c7'
              : isImg
              ? isDark ? '#86efac' : '#16a34a'
              : isDark ? '#fcd34d' : '#d97706';

            return (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.recentDocCard,
                  {
                    backgroundColor: isDark ? '#111827' : '#ffffff',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
                  },
                ]}
                onPress={() => onOpenDocument?.(doc)}
                activeOpacity={0.8}
              >
                <View style={styles.recentDocLeft}>
                  <Text style={styles.recentDocEmoji}>{doc.icon || '📄'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.recentDocTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}
                      numberOfLines={1}
                    >
                      {doc.title}
                    </Text>
                    <Text
                      style={[styles.recentDocSub, { color: isDark ? '#94a3b8' : '#64748b' }]}
                      numberOfLines={1}
                    >
                      {doc.employeeName || 'Staff Member'} • {doc.fileSize || 'Standard'}
                    </Text>
                  </View>
                </View>

                <View style={styles.recentDocRight}>
                  <View style={[styles.recentTypePill, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.recentTypePillText, { color: badgeColor }]}>
                      {(doc.type || 'DOC').toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.recentOpenPrompt, { color: isDark ? '#60a5fa' : '#2563eb' }]}>
                    Read
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Required Banner for Pending Staff Approvals */}
        {pendingApprovals.length > 0 && (
          <View
            style={[
              styles.actionCard,
              {
                backgroundColor: isDark ? '#1f1b16' : '#fffbeb',
                borderColor: isDark ? '#b45309' : '#fde68a',
              },
            ]}
          >
            <View style={styles.actionCardTop}>
              <Text style={{ fontSize: 20 }}>⏳</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionCardTitle, { color: isDark ? '#fde68a' : '#78350f' }]}>
                  Staff Action Required
                </Text>
                <Text style={[styles.actionCardBody, { color: isDark ? '#fef3c7' : '#92400e' }]}>
                  There are {pendingApprovals.length} employee registration requests awaiting your administrative review.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#d97706' }]}
              onPress={() => onNavigateTab('approvals')}
              activeOpacity={0.85}
            >
              <Text style={styles.actionButtonText}>
                Review Pending Staff ({pendingApprovals.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  topHeaderBar: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  topHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 36,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandSub: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  adminTagPill: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  adminTagText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hamburgerBtn: {
    padding: 6,
    borderRadius: 8,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  heroSection: {
    marginBottom: 20,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  heroSectionBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14.5,
    lineHeight: 22,
  },
  kpiGrid: {
    marginBottom: 24,
    gap: 14,
  },
  kpiTotalCard: {
    padding: 22,
    borderRadius: 20,
    borderWidth: 1.5,
    shadowColor: '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  kpiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kpiIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kpiPillText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  kpiBigNumber: {
    color: '#ffffff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  kpiMainLabel: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 4,
  },
  kpiSubLabel: {
    color: '#bfdbfe',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  kpiFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  kpiFooterText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '700',
  },
  subKpiRow: {
    flexDirection: 'row',
    gap: 14,
  },
  subKpiCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  subKpiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subKpiEmoji: {
    fontSize: 22,
  },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pctBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subKpiValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subKpiTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 8,
  },
  subKpiAction: {
    fontSize: 12,
    fontWeight: '700',
  },
  chartCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  chartIconEmoji: {
    fontSize: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  chartSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  allDocsPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  allDocsPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  graphWrapper: {
    height: 220,
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  gridLinesContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 50,
    justifyContent: 'space-between',
  },
  gridLine: {
    borderBottomWidth: 1,
    width: '100%',
    alignItems: 'flex-end',
    paddingBottom: 2,
  },
  gridLineLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginRight: 4,
  },
  columnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 4,
  },
  columnContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  barValueBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  barValueText: {
    fontSize: 11,
    fontWeight: '800',
  },
  barTrack: {
    width: '65%',
    maxWidth: 42,
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    minHeight: 8,
  },
  barFoot: {
    alignItems: 'center',
    marginTop: 8,
    height: 48,
  },
  barFootEmoji: {
    fontSize: 14,
    marginBottom: 2,
  },
  barFootLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  barFootPct: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  inspectorCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  inspectorLeft: {
    flex: 1,
    minWidth: 220,
  },
  inspectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  inspectorEmoji: {
    fontSize: 26,
  },
  inspectorTitle: {
    fontSize: 15.5,
    fontWeight: '800',
  },
  inspectorSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  inspectorStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  inspectorStatItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  inspectorStatValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  inspectorStatLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  inspectorStatDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  inspectorActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  inspectorActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  spectrumCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  spectrumHeader: {
    marginBottom: 16,
  },
  spectrumTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  spectrumSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  stackedBarContainer: {
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: 16,
  },
  stackedBarSegment: {
    height: '100%',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  legendColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendEmoji: {
    fontSize: 13,
  },
  legendLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  legendCount: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  legendPct: {
    fontSize: 11,
    fontWeight: '600',
  },
  complianceCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  complianceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  complianceTitle: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  complianceSubtitle: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  complianceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  complianceBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dualBarSection: {
    gap: 14,
  },
  dualBarItem: {
    gap: 6,
  },
  dualBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dualBarLabel: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  dualBarCount: {
    fontSize: 13,
    fontWeight: '800',
  },
  dualBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  dualBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  recentSection: {
    marginBottom: 24,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recentSectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  recentViewAllText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  recentDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  recentDocLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recentDocEmoji: {
    fontSize: 24,
  },
  recentDocTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  recentDocSub: {
    fontSize: 12,
  },
  recentDocRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  recentTypePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recentTypePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recentOpenPrompt: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  actionCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 20,
    marginTop: 4,
  },
  actionCardTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  actionCardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionCardBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '700',
  },
});
