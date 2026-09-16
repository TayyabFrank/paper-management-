import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useDocuments } from '@/context/documents-context';
import { TabKey } from './bottom-navbar';
import { ThemeToggleButton } from './theme-toggle-button';

interface HomeDashboardViewProps {
  onNavigateTab: (tab: TabKey) => void;
}

export function HomeDashboardView({ onNavigateTab }: HomeDashboardViewProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { user } = useAuth();
  const { documents } = useDocuments();

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.maxWidthWrapper}>
        {/* Header with Welcome Greeting and Theme Toggle */}
        <View style={styles.topHeaderRow}>
          <View style={styles.greetingCol}>
            <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
              Welcome back,
            </Text>
            <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>
              {user.name}
            </Text>
          </View>
          <ThemeToggleButton compact showLabel={false} />
        </View>

        {/* User Workspace Status Banner */}
        <View
          style={[
            styles.workspaceBanner,
            {
              backgroundColor: isDark ? '#111827' : '#1b3569',
              borderColor: isDark ? 'rgba(56, 189, 248, 0.25)' : '#172554',
            },
          ]}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.bannerBadgeText}>🟢 ENTERPRISE WORKSPACE ACTIVE</Text>
            </View>
            <Text style={styles.bannerHeading}>🔒 Secure Document Vault</Text>
            <Text style={styles.bannerDesc}>
              {user.department} • {user.role}
            </Text>
          </View>

          <Image
            source={{ uri: user.avatar }}
            style={styles.bannerAvatar}
            resizeMode="cover"
          />
        </View>

        {/* Quick Metrics Grid */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📊 Vault Overview</Text>
        <View style={styles.metricsGrid}>
          <View
            style={[
              styles.metricCard,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
              },
            ]}
          >
            <Text style={[styles.metricNumber, { color: isDark ? '#38bdf8' : '#2563eb' }]}>
              {documents.length}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>📁 Total Documents</Text>
          </View>
        </View>

        {/* Quick Actions Bar */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>⚡ Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionTile,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
            onPress={() => onNavigateTab('docs')}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBg, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
              <Text style={{ fontSize: 20 }}>📂</Text>
            </View>
            <Text style={[styles.actionTileTitle, { color: colors.textPrimary }]}>📄 Document Vault</Text>
            <Text style={[styles.actionTileSub, { color: colors.textSecondary }]}>🔍 View and search all files</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionTile,
              {
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
              },
            ]}
            onPress={() => onNavigateTab('new-doc')}
            activeOpacity={0.75}
          >
            <View style={[styles.actionIconBg, { backgroundColor: isDark ? '#1e293b' : '#f0fdf4' }]}>
              <Text style={{ fontSize: 20 }}>📤</Text>
            </View>
            <Text style={[styles.actionTileTitle, { color: colors.textPrimary }]}>📤 Upload Document</Text>
            <Text style={[styles.actionTileSub, { color: colors.textSecondary }]}>📄 Scan or upload a doc</Text>
          </TouchableOpacity>
        </View>

        {/* Pinned Enterprise Notices */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>📢 Important Notice</Text>
        <View
          style={[
            styles.noticeCard,
            {
              backgroundColor: isDark ? '#16233b' : '#f8fafc',
              borderColor: isDark ? '#273854' : '#e2e8f0',
            },
          ]}
        >
          <View style={styles.noticeHeader}>
            <View style={styles.noticePill}>
              <Text style={styles.noticePillText}>📋 ANNUAL COMPLIANCE</Text>
            </View>
            <Text style={[styles.noticeDate, { color: colors.textSecondary }]}>📅 Due 30 Sep 2026</Text>
          </View>
          <Text style={[styles.noticeTitle, { color: colors.textPrimary }]}>
            ⚠️ Form W-2 & Annual Tax Certification Pending
          </Text>
          <Text style={[styles.noticeBody, { color: colors.textSecondary }]}>
            Your 2023 W-2 Form has not been acknowledged yet. Please check your My Docs vault to upload or certify before the compliance audit deadline.
          </Text>
          <TouchableOpacity
            style={[styles.noticeCta, { backgroundColor: isDark ? '#2563eb' : '#1b3569' }]}
            onPress={() => onNavigateTab('docs')}
            activeOpacity={0.8}
          >
            <Text style={styles.noticeCtaText}>📋 Review Tax Documents →</Text>
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
  topHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingCol: {
    flex: 1,
  },
  welcomeSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  workspaceBanner: {
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerContent: {
    flex: 1,
    marginRight: 12,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 6,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  bannerBadgeText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  bannerHeading: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bannerDesc: {
    color: '#cbd5e1',
    fontSize: 12.5,
    marginTop: 3,
  },
  bannerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    flexBasis: '48%',
    flexGrow: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  actionTile: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  actionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTileTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionTileSub: {
    fontSize: 11.5,
    marginTop: 2,
  },
  noticeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticePill: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  noticePillText: {
    color: '#b91c1c',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  noticeDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  noticeBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  noticeCta: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  noticeCtaText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '600',
  },
});
