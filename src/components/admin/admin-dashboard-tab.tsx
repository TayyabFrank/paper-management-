import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { useDocuVaultTheme } from '@/context/theme-context';
import { useAuth } from '@/context/auth-context';
import { useDocuments } from '@/context/documents-context';
import { AdminTabKey } from './admin-bottom-navbar';

interface AdminDashboardTabProps {
  onNavigateTab: (tab: AdminTabKey) => void;
  onOpenMenu?: () => void;
}

// Crisp Vector SVGs for Dashboard Cards
const USERS_METRIC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
  <circle cx="9" cy="7" r="4"></circle>
  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
</svg>
`)}`;

const CLOCK_METRIC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"></circle>
  <polyline points="12 6 12 12 16 14"></polyline>
</svg>
`)}`;

const DOCS_METRIC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
  <polyline points="14 2 14 8 20 8"></polyline>
  <line x1="16" y1="13" x2="8" y2="13"></line>
  <line x1="16" y1="17" x2="8" y2="17"></line>
  <line x1="10" y1="9" x2="8" y2="9"></line>
</svg>
`)}`;

const LOGO_BADGE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none">
  <rect width="24" height="24" rx="6" fill="#1e3a8a"/>
  <path d="M7 6H15L18 9V18C18 18.5523 17.5523 19 17 19H7C6.44772 19 6 18.5523 6 18V7C6 6.44772 6.44772 6 7 6Z" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M14 6V10H18" stroke="#ffffff" stroke-width="1.8" stroke-linejoin="round"/>
</svg>
`)}`;

const HAMBURGER_SVG = (color: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <line x1="3" y1="6" x2="21" y2="6"></line>
  <line x1="3" y1="12" x2="21" y2="12"></line>
  <line x1="3" y1="18" x2="21" y2="18"></line>
</svg>
`)}`;

export function AdminDashboardTab({ onNavigateTab, onOpenMenu }: AdminDashboardTabProps) {
  const { isDark, colors } = useDocuVaultTheme();
  const { registeredAccounts } = useAuth();
  const { documents } = useDocuments();

  const activeEmployees = registeredAccounts.filter(
    (a) => a.role === 'Employee' && a.status !== 'pending' && a.status !== 'rejected'
  );
  const pendingApprovals = registeredAccounts.filter((a) => a.status === 'pending');
  const totalDocumentsCount = documents.length;

  return (
    <View style={[styles.screenContainer, { backgroundColor: isDark ? colors.background : '#f8fafc' }]}>
      {/* Top Header Banner matching Screenshot 5 */}
      <View style={[styles.topHeaderBar, { backgroundColor: isDark ? '#0f172a' : '#172554' }]}>
        <View style={styles.topHeaderContent}>
          <View style={styles.brandRow}>
            {Platform.OS === 'web' ? (
              <img src={LOGO_BADGE_SVG} alt="DocuVault" style={{ width: 28, height: 28 }} />
            ) : (
              <View style={{ width: 28, height: 28 }} />
            )}
            <Text style={styles.brandTitle}>DocuVault</Text>
          </View>

          <TouchableOpacity
            style={styles.hamburgerBtn}
            onPress={onOpenMenu}
            activeOpacity={0.7}
          >
            {Platform.OS === 'web' ? (
              <img
                src={HAMBURGER_SVG('#ffffff')}
                alt="Menu"
                style={{ width: 24, height: 24, display: 'block' }}
              />
            ) : (
              <Text style={{ color: '#ffffff', fontSize: 22 }}>☰</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title & Subtitle */}
        <View style={styles.titleSection}>
          <Text style={[styles.pageTitle, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
            Dashboard Overview
          </Text>
          <Text style={[styles.pageSubtitle, { color: isDark ? '#94a3b8' : '#475569' }]}>
            High-level metrics for the document management platform.
          </Text>
        </View>

        {/* Metric 1: Active Employees */}
        <TouchableOpacity
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
          onPress={() => onNavigateTab('users')}
          activeOpacity={0.8}
        >
          <View style={[styles.metricIconBox, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
            {Platform.OS === 'web' ? (
              <img src={USERS_METRIC_SVG} alt="Users" style={{ width: 26, height: 26 }} />
            ) : null}
          </View>
          <View style={styles.metricInfo}>
            <Text style={[styles.metricLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
              Active Employees
            </Text>
            <Text style={[styles.metricValue, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {activeEmployees.length}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Metric 2: Pending Approvals */}
        <TouchableOpacity
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
          onPress={() => onNavigateTab('approvals')}
          activeOpacity={0.8}
        >
          <View style={[styles.metricIconBox, { backgroundColor: isDark ? '#2a2215' : '#fef3c7' }]}>
            {Platform.OS === 'web' ? (
              <img src={CLOCK_METRIC_SVG} alt="Clock" style={{ width: 26, height: 26 }} />
            ) : null}
          </View>
          <View style={styles.metricInfo}>
            <Text style={[styles.metricLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
              Pending Approvals
            </Text>
            <Text style={[styles.metricValue, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {pendingApprovals.length}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Metric 3: Total Documents */}
        <TouchableOpacity
          style={[
            styles.metricCard,
            {
              backgroundColor: isDark ? '#111827' : '#ffffff',
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0',
            },
          ]}
          onPress={() => onNavigateTab('docs')}
          activeOpacity={0.8}
        >
          <View style={[styles.metricIconBox, { backgroundColor: isDark ? '#143026' : '#ecfdf5' }]}>
            {Platform.OS === 'web' ? (
              <img src={DOCS_METRIC_SVG} alt="Docs" style={{ width: 26, height: 26 }} />
            ) : null}
          </View>
          <View style={styles.metricInfo}>
            <Text style={[styles.metricLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>
              Total Documents
            </Text>
            <Text style={[styles.metricValue, { color: isDark ? colors.textPrimary : '#0f172a' }]}>
              {totalDocumentsCount}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action Required Banner matching Screenshot 5 */}
        <View
          style={[
            styles.actionCard,
            {
              backgroundColor: isDark ? '#1f1b16' : '#fffbeb',
              borderColor: isDark ? '#b45309' : '#fde68a',
            },
          ]}
        >
          <Text style={[styles.actionCardTitle, { color: isDark ? '#fde68a' : '#78350f' }]}>
            Action Required
          </Text>
          <Text style={[styles.actionCardBody, { color: isDark ? '#fef3c7' : '#92400e' }]}>
            There are {pendingApprovals.length} employee registrations waiting for your review.
          </Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#d97706' }]}
            onPress={() => onNavigateTab('approvals')}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>Review Pending</Text>
          </TouchableOpacity>
        </View>
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
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hamburgerBtn: {
    padding: 6,
    borderRadius: 8,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  titleSection: {
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  metricIconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14.5,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actionCard: {
    borderRadius: 18,
    borderWidth: 1.2,
    padding: 22,
    marginTop: 8,
  },
  actionCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  actionCardBody: {
    fontSize: 14.5,
    lineHeight: 21,
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
