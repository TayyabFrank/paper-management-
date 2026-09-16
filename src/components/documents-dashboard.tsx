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

// Vector icons as crisp SVG URIs
const BACK_ARROW_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
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

const EYE_ICON_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="12" cy="12" r="3.5" stroke="#64748b" stroke-width="2"/>
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

// Document Type Badges
const PDF_BLUE_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#e8effb"/>
  <path d="M14 10H22L27 15V29C27 29.5523 26.5523 30 26 30H14C13.4477 30 13 29.5523 13 29V11C13 10.4477 13.4477 10 14 10Z" stroke="#2563eb" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M22 10V15H27" stroke="#2563eb" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="20" y="24" font-size="7" font-weight="bold" fill="#2563eb" text-anchor="middle" font-family="sans-serif">PDF</text>
</svg>
`)}`;

const PDF_RED_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#fae8eb"/>
  <path d="M14 10H22L27 15V29C27 29.5523 26.5523 30 26 30H14C13.4477 30 13 29.5523 13 29V11C13 10.4477 13.4477 10 14 10Z" stroke="#991b1b" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M22 10V15H27" stroke="#991b1b" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="20" y="24" font-size="7" font-weight="bold" fill="#991b1b" text-anchor="middle" font-family="sans-serif">PDF</text>
</svg>
`)}`;

const DOCX_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#e0e7ff"/>
  <path d="M14 10H22L27 15V29C27 29.5523 26.5523 30 26 30H14C13.4477 30 13 29.5523 13 29V11C13 10.4477 13.4477 10 14 10Z" stroke="#3730a3" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M22 10V15H27" stroke="#3730a3" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="20" y="24" font-size="8" font-weight="bold" fill="#3730a3" text-anchor="middle" font-family="sans-serif">W</text>
</svg>
`)}`;

const IMAGE_DOC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#e0f2fe"/>
  <rect x="11" y="11" width="18" height="18" rx="3" stroke="#0284c7" stroke-width="1.8"/>
  <circle cx="16" cy="16" r="1.5" fill="#0284c7"/>
  <path d="M12 25L17 19L22 24L25 21L28 25" stroke="#0284c7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`)}`;

const ARTICLE_DOC_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
  <rect width="40" height="40" rx="10" fill="#fef3c7"/>
  <rect x="11" y="10" width="18" height="20" rx="2" stroke="#b45309" stroke-width="1.8"/>
  <line x1="15" y1="15" x2="25" y2="15" stroke="#b45309" stroke-width="1.8"/>
  <line x1="15" y1="20" x2="25" y2="20" stroke="#b45309" stroke-width="1.8"/>
  <line x1="15" y1="25" x2="21" y2="25" stroke="#b45309" stroke-width="1.8"/>
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

  return PDF_BLUE_SVG;
}

export function detectFileType(fileName: string, mimeType: string = ''): 'pdf' | 'docx' | 'image' | 'article' | 'other' {
  const lowerName = fileName.toLowerCase();
  const lowerMime = mimeType.toLowerCase();

  if (lowerMime.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg|bmp|heic)$/i.test(lowerName)) {
    return 'image';
  }
  if (lowerMime.includes('pdf') || lowerName.endsWith('.pdf')) {
    return 'pdf';
  }
  if (lowerMime.includes('word') || /\.(docx|doc)$/i.test(lowerName)) {
    return 'docx';
  }
  if (lowerMime.includes('text') || /\.(md|txt|rtf|markdown)$/i.test(lowerName)) {
    return 'article';
  }
  return 'pdf';
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

const INITIAL_DOCUMENTS: DocumentReaderItem[] = [
  {
    id: '1',
    title: 'Annual Tax Forms 2023',
    subtitle: 'Signed: 10 Jan 2024',
    type: 'pdf',
    icon: PDF_BLUE_SVG,
    fileSize: '1.8 MB',
    isSigned: true,
    fullContent: {
      category: 'Tax & Compliance',
      date: '10 Jan 2024',
      authorOrIssuer: 'Payroll & Treasury Division',
      sections: [
        {
          heading: '1. Personal Information & Tax Filing Status',
          body: 'Employee Name: Liam Thompson | Filing Status: Single or Married Filing Separately | Federal Withholding Elections: Standard Allowance.\nTotal Allowances Claimed: 01. State Tax Code: CA-540 Resident Withholding.',
        },
        {
          heading: '2. Total Compensation & Withholdings Schedule',
          body: 'Gross Wages & Tips: $148,500.00 | Federal Income Tax Withheld: $27,412.50 | Social Security Wages: $148,500.00 | Social Security Tax Withheld: $9,207.00 | Medicare Wages & Tax: $2,153.25.',
        },
        {
          heading: '3. Digital Certification & Signature Stamp',
          body: 'Under penalties of perjury, I declare that I have examined this certificate and to the best of my knowledge and belief, it is true, correct, and complete.\nSigned by: Liam Thompson (Digitally authenticated via DocuVault Security Token).',
        },
      ],
    },
  },
  {
    id: '2',
    title: 'Employment Contract',
    subtitle: 'Signed: 15 Mar 2021',
    type: 'pdf',
    icon: PDF_BLUE_SVG,
    fileSize: '2.4 MB',
    isSigned: true,
    fullContent: {
      category: 'Legal Agreements',
      date: '15 Mar 2021',
      authorOrIssuer: 'Corporate Legal & Talent Acquisition',
      sections: [
        {
          heading: '1. Appointment & Position Duties',
          body: 'The Employer hereby employs Liam Thompson as Senior Software Engineer. The Employee will report directly to the VP of Engineering and be responsible for enterprise architecture, high-availability distributed systems, and team mentoring.',
        },
        {
          heading: '2. Base Salary & Incentive Compensation',
          body: 'Employer shall pay Employee an annual base salary of $165,000, payable semi-monthly in accordance with Employer’s normal payroll practices. Employee shall be eligible for an annual performance bonus targeted at 15% of base salary.',
        },
        {
          heading: '3. Paid Time Off (PTO) & Comprehensive Benefits',
          body: 'Employee is entitled to 24 business days of paid vacation per calendar year, plus 11 recognized corporate holidays. Standard medical, dental, optical, and 401(k) matching benefits commence on day one of employment.',
        },
      ],
    },
  },
  {
    id: '3',
    title: 'Q4 Performance Review',
    subtitle: 'Uploaded: 15 Dec 2023',
    type: 'docx',
    icon: DOCX_SVG,
    fileSize: '480 KB',
    fullContent: {
      category: 'Performance Management',
      date: '15 Dec 2023',
      authorOrIssuer: 'Engineering Leadership Review Board',
      sections: [
        {
          heading: '1. Executive Appraisal Summary',
          body: 'Overall Evaluation Rating: 4.8 / 5.0 (Exceeds Expectations). Liam demonstrated extraordinary technical craftsmanship throughout 2023, orchestrating the document pipeline overhaul that improved processing throughput by 42%.',
        },
        {
          heading: '2. Core Competencies & Deliverables',
          body: '• Technical Architecture: 5.0/5.0 - Flawless multi-tenant vault security rollout.\n• Collaboration & Mentorship: 4.7/5.0 - Successfully onboarded 4 new engineers.\n• Strategic Execution: 4.8/5.0 - On-time delivery of all quarterly roadmap commitments.',
        },
        {
          heading: '3. Growth Objectives for 2024',
          body: 'Lead the next-generation microservices migration and contribute to the cross-team tech radar initiative for AI document parsing.',
        },
      ],
    },
  },
  {
    id: '4',
    title: 'Health Card Scan',
    subtitle: 'Uploaded: 01 Nov 2023',
    type: 'image',
    icon: IMAGE_DOC_SVG,
    fileSize: '3.1 MB',
    previewImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
    fullContent: {
      category: 'Medical Insurance',
      date: '01 Nov 2023',
      authorOrIssuer: 'BlueCross BlueShield Premier Health',
      sections: [
        {
          heading: 'Verified Health Insurance Record',
          body: 'Front and back scan verified by Enterprise Benefits Administration. Active across all primary and specialist in-network facilities.',
        },
      ],
      metadata: {
        'Member Name': 'Liam Thompson',
        'Member ID': 'BCBS-9840219-X',
        'Group Number': 'GRP-55420',
        'Coverage Type': 'PPO Comprehensive Plus',
        'Primary Care Copay': '$15.00',
        'Specialist Copay': '$25.00',
        'Rx BIN': '004336',
      },
    },
  },
  {
    id: '5',
    title: 'Non-Disclosure Agreement',
    subtitle: 'Signed: 15 Mar 2021',
    type: 'pdf',
    icon: PDF_BLUE_SVG,
    fileSize: '1.2 MB',
    isSigned: true,
    fullContent: {
      category: 'Legal Agreements',
      date: '15 Mar 2021',
      authorOrIssuer: 'Enterprise Compliance Office',
      sections: [
        {
          heading: '1. Definition of Proprietary Information',
          body: 'Includes trade secrets, client records, source code, cryptographic keys, architectural blueprints, patent drafts, and pricing structures disclosed to the Employee during the course of employment.',
        },
        {
          heading: '2. Obligations of Strict Non-Disclosure',
          body: 'Employee agrees to hold all proprietary materials in strictest confidence and shall not disclose, reproduce, or distribute any confidential technical or financial assets to unauthorized parties during or after employment.',
        },
      ],
    },
  },
  {
    id: '6',
    title: 'W-2 Form 2023',
    subtitle: 'Not Uploaded',
    type: 'pdf',
    icon: PDF_RED_SVG,
    fileSize: 'Pending',
    fullContent: {
      category: 'Tax Filing Documents',
      date: 'Pending',
      authorOrIssuer: 'Internal Revenue Service (IRS)',
      sections: [
        {
          heading: 'Notice of Missing Document',
          body: 'Your 2023 Form W-2 has not yet been submitted or acknowledged. Please use the upload button to submit your signed Form W-2 for HR audit compliance.',
        },
      ],
    },
  },
  {
    id: '7',
    title: 'Direct Deposit Form',
    subtitle: 'Uploaded: 18 Mar 2021',
    type: 'pdf',
    icon: PDF_BLUE_SVG,
    fileSize: '890 KB',
    isSigned: true,
    fullContent: {
      category: 'Banking & Payroll',
      date: '18 Mar 2021',
      authorOrIssuer: 'Treasury & Disbursements',
      sections: [
        {
          heading: '1. Primary Deposit Account Allocation',
          body: 'Financial Institution: Chase Commercial Banking\nAccount Holder: Liam Thompson\nRouting Number: *****4819 | Checking Account: *******3902\nAllocation: 100% Net Pay Deposit.',
        },
        {
          heading: '2. Electronic Funds Authorization',
          body: 'I hereby authorize Enterprise Document Management Systems LLC to initiate credit entries and adjustments for any credit entries in error to my designated bank account.',
        },
      ],
    },
  },
  {
    id: '8',
    title: 'Resume',
    subtitle: 'Uploaded: 01 Mar 2021',
    type: 'pdf',
    icon: PDF_RED_SVG,
    fileSize: '620 KB',
    isSigned: true,
    fullContent: {
      category: 'Employee Dossier',
      date: '01 Mar 2021',
      authorOrIssuer: 'Verified Candidate Records',
      sections: [
        {
          heading: 'Liam Thompson - Senior Software Engineer',
          body: 'San Francisco, CA • l.thompson@enterprise.com • (555) 392-8192\nSpecialized in building high-scale distributed data pipelines, cloud-native document vaults, and cryptographic security primitives.',
        },
        {
          heading: 'Core Technical Proficiencies',
          body: 'Languages: TypeScript, Go, Python, SQL, Rust.\nFrameworks & Platforms: React, React Native, Node.js, Kubernetes, AWS, Docker.\nStorage & Caching: PostgreSQL, Redis, Apache Kafka, Cassandra.',
        },
        {
          heading: 'Education & Honors',
          body: 'Bachelor of Science in Computer Science (Cum Laude)\nUniversity of California, Berkeley (2014 - 2018).',
        },
      ],
    },
  },
  // ARTICLES
  {
    id: '9',
    title: 'Employee Handbook 2024',
    subtitle: 'Published: 02 Jan 2024',
    type: 'article',
    icon: ARTICLE_DOC_SVG,
    fileSize: 'Article',
    fullContent: {
      category: 'Company Culture & Standards',
      date: '02 Jan 2024',
      authorOrIssuer: 'Human Resources & People Operations',
      sections: [
        {
          heading: 'Welcome to Our Collaborative Workplace',
          body: 'Our mission is to build the world’s most secure enterprise document intelligence platform. This handbook defines our values: transparency, rigorous technical execution, customer privacy, and empathy.',
        },
        {
          heading: 'Working Hours & Flexible Collaboration',
          body: 'Core collaboration hours are 10:00 AM to 3:00 PM in your local time zone. Beyond core hours, team members have full autonomy to manage their schedules to achieve peak focus and work-life harmony.',
        },
        {
          heading: 'Professional Development & Education Stipends',
          body: 'Every full-time team member receives an annual $2,500 continuous learning stipend for conferences, technical books, certifications, and university courses.',
        },
      ],
    },
  },
  {
    id: '10',
    title: 'Remote Work & Security Guidelines',
    subtitle: 'Published: 14 Nov 2023',
    type: 'article',
    icon: ARTICLE_DOC_SVG,
    fileSize: 'Article',
    fullContent: {
      category: 'Information Security',
      date: '14 Nov 2023',
      authorOrIssuer: 'Chief Information Security Office (CISO)',
      sections: [
        {
          heading: '1. Multi-Factor Authentication (MFA) Mandate',
          body: 'Hardware security keys (FIDO2/WebAuthn) or corporate authenticator apps are required for all workspace access. SMS-based 2FA is prohibited for production environments.',
        },
        {
          heading: '2. Device Encryption & Endpoint Protection',
          body: 'All laptops and workstations must have full-disk encryption enabled (FileVault / BitLocker). Never disable corporate endpoint telemetry or connect via public unsecured Wi-Fi without the corporate WireGuard VPN.',
        },
        {
          heading: '3. Data Retention & Secure Destruction',
          body: 'Client documents must remain within DocuVault encrypted storage zones and should never be copied to unencrypted local storage or personal cloud drives.',
        },
      ],
    },
  },
  {
    id: '11',
    title: 'Health & Wellness Benefits Guide',
    subtitle: 'Published: 01 Oct 2023',
    type: 'article',
    icon: ARTICLE_DOC_SVG,
    fileSize: 'Article',
    fullContent: {
      category: 'Employee Wellbeing',
      date: '01 Oct 2023',
      authorOrIssuer: 'Total Rewards & Benefits Team',
      sections: [
        {
          heading: 'Comprehensive Healthcare Coverage',
          body: 'We pay 100% of employee premiums and 85% of dependent premiums across medical, dental, and vision care plans. Health Savings Accounts (HSA) include a $1,200 annual employer contribution.',
        },
        {
          heading: 'Mental Health & Wellness Reimbursements',
          body: 'Employees have unlimited access to licensed mental health therapy sessions via our digital counseling partner, plus a $75/month wellness subsidy for gym memberships, fitness trackers, or meditation apps.',
        },
      ],
    },
  },
  {
    id: '12',
    title: 'Code of Conduct & Workplace Ethics',
    subtitle: 'Published: 15 Sep 2023',
    type: 'article',
    icon: ARTICLE_DOC_SVG,
    fileSize: 'Article',
    fullContent: {
      category: 'Governance & Ethics',
      date: '15 Sep 2023',
      authorOrIssuer: 'Office of the Ombudsperson',
      sections: [
        {
          heading: 'Zero-Tolerance Policy on Harassment',
          body: 'We are dedicated to providing a safe, inclusive, and harassment-free work experience for everyone regardless of gender identity, sexual orientation, disability, physical appearance, race, or religion.',
        },
        {
          heading: 'Whistleblower Protections & Anonymous Reporting',
          body: 'Any employee may report ethical, financial, or safety concerns via our 24/7 confidential integrity hotline without fear of retaliation.',
        },
      ],
    },
  },
  // MORE IMAGES
  {
    id: '13',
    title: 'Passport & Identity Verification Scan',
    subtitle: 'Uploaded: 05 Jan 2022',
    type: 'image',
    icon: IMAGE_DOC_SVG,
    fileSize: '4.2 MB',
    previewImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    fullContent: {
      category: 'Identity Verification',
      date: '05 Jan 2022',
      authorOrIssuer: 'Department of State / Verified by HR',
      sections: [
        {
          heading: 'Government Issued Identity Document',
          body: 'Biometric page and identity data validated against I-9 employment eligibility standards.',
        },
      ],
      metadata: {
        'Document Type': 'U.S. Passport Book',
        'Document Number': 'USA-99201948',
        'Nationality': 'United States of America',
        'Verification Status': 'Confirmed (I-9 Verified)',
      },
    },
  },
  {
    id: '14',
    title: 'Employee Security Badge Scan',
    subtitle: 'Uploaded: 16 Mar 2021',
    type: 'image',
    icon: IMAGE_DOC_SVG,
    fileSize: '1.9 MB',
    previewImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    fullContent: {
      category: 'Facility Access',
      date: '16 Mar 2021',
      authorOrIssuer: 'Global Security & Facilities Operations',
      sections: [
        {
          heading: 'Smart NFC Campus Credential',
          body: 'Tier 3 Access Clearance: Primary Engineering Labs, Cloud Data Center Suites, and Executive Boardroom.',
        },
      ],
      metadata: {
        'Badge ID': 'SEC-4402',
        'Access Level': 'Level 3 (Engineering & Operations)',
        'Card Format': 'HID Prox / MIFARE DESFire EV3',
      },
    },
  },
];

interface DocumentsDashboardProps {
  onBack?: () => void;
  employeeName?: string;
  employeeEmail?: string;
  employeeAvatar?: string;
}

export function DocumentsDashboard({
  onBack,
  employeeName = 'Liam Thompson',
  employeeEmail = 'l.thompson@enterprise.com',
  employeeAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
}: DocumentsDashboardProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentReaderItem[]>(INITIAL_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [readingDoc, setReadingDoc] = useState<DocumentReaderItem | null>(null);
  const [docToDelete, setDocToDelete] = useState<DocumentReaderItem | null>(null);
  const [uploadNotification, setUploadNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    const deletedTitle = docToDelete.title;
    setDocuments((prev) => prev.filter((d) => d.id !== docToDelete.id));
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
    if (Platform.OS === 'web' && fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      simulateNewUpload('Passport Scan (Uploaded)', 'image');
    }
  };

  const handleWebFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const detectedType = detectFileType(file.name, file.type);
      const isImg = detectedType === 'image';
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const newDoc: DocumentReaderItem = {
          id: Date.now().toString(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          subtitle: `Uploaded: Today`,
          type: detectedType,
          icon: getDocumentTypeIcon(detectedType, file.name),
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          previewImage: isImg && uploadEvent.target?.result ? (uploadEvent.target.result as string) : undefined,
          fullContent: {
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
        setDocuments([newDoc, ...documents]);
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
    setDocuments([newDoc, ...documents]);
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
  const imageCount = documents.filter((d) => d.type === 'image').length;
  const otherCount = documents.filter((d) => d.type === 'other').length;

  return (
    <View style={styles.container}>
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
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
          <Image source={{ uri: BACK_ARROW_SVG }} style={styles.backIcon} resizeMode="contain" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Documents</Text>

        <TouchableOpacity
          style={styles.uploadHeaderButton}
          onPress={handleUploadNew}
          activeOpacity={0.8}
        >
          <Text style={styles.uploadHeaderButtonText}>+ Upload</Text>
        </TouchableOpacity>
      </View>

      {/* Employee Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: employeeAvatar }}
          style={styles.profileAvatar}
          resizeMode="cover"
        />
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{employeeName}</Text>
          <Text style={styles.profileEmail}>{employeeEmail}</Text>
        </View>
        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>Active</Text>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Image source={{ uri: SEARCH_ICON_SVG }} style={styles.searchIcon} resizeMode="contain" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your documents..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
          <Image source={{ uri: FILTER_ICON_SVG }} style={styles.filterIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Category Stats Horizontal Scroll / Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'all' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('all')}
          activeOpacity={0.7}
        >
          <Text style={styles.statCount}>{documents.length}</Text>
          <Text style={styles.statLabel}>Total Documents</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'pdf' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('pdf')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_PDF_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{pdfCount}</Text>
          </View>
          <Text style={styles.statLabel}>PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'docx' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('docx')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_DOCX_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{docxCount}</Text>
          </View>
          <Text style={styles.statLabel}>Doxc</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'article' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('article')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_ARTICLE_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{articleCount}</Text>
          </View>
          <Text style={styles.statLabel}>Articles</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'image' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('image')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_IMAGE_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{imageCount}</Text>
          </View>
          <Text style={styles.statLabel}>Images</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statItem, activeCategory === 'other' ? styles.statItemActive : null]}
          onPress={() => setActiveCategory('other')}
          activeOpacity={0.7}
        >
          <View style={styles.statTopRow}>
            <Image source={{ uri: MINI_OTHER_SVG }} style={styles.miniTypeIcon} resizeMode="contain" />
            <Text style={styles.statCount}>{otherCount}</Text>
          </View>
          <Text style={styles.statLabel}>Other</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Document Items List */}
      <View style={styles.docList}>
        {filteredDocs.map((doc) => (
          <TouchableOpacity
            key={doc.id}
            style={styles.docCard}
            onPress={() => setReadingDoc(doc)}
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
              <Text style={styles.docTitle} numberOfLines={1}>
                {doc.title}
              </Text>
              <View style={styles.subtitleRow}>
                <Text
                  style={[
                    styles.docSubtitle,
                    doc.subtitle === 'Not Uploaded' ? styles.notUploadedText : null,
                  ]}
                >
                  {doc.subtitle}
                </Text>
                <View style={[styles.detectedTypeBadge, getDetectedBadgeStyle(doc.type)]}>
                  <Text style={[styles.detectedTypeBadgeText, getDetectedBadgeTextStyle(doc.type)]}>
                    {doc.type.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.cardActionsRow}>
              {/* Eye button: Opens complete document to read */}
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setReadingDoc(doc)}
                activeOpacity={0.7}
                accessibilityLabel="Read Document"
              >
                <Image source={{ uri: EYE_ICON_SVG }} style={styles.eyeIcon} resizeMode="contain" />
              </TouchableOpacity>

              {/* Delete button: Removes document from DocuVault */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setDocToDelete(doc)}
                activeOpacity={0.7}
                accessibilityLabel="Delete Document"
              >
                <Image source={{ uri: TRASH_ICON_SVG }} style={styles.trashIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={!!docToDelete}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDocToDelete(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteDialog}>
            <View style={styles.deleteIconBadge}>
              <Image source={{ uri: TRASH_ICON_SVG }} style={{ width: 28, height: 28 }} resizeMode="contain" />
            </View>
            <Text style={styles.deleteModalTitle}>Delete Document?</Text>
            <Text style={styles.deleteModalBody}>
              Are you sure you want to delete "{docToDelete?.title}"? This document will be permanently removed from your DocuVault.
            </Text>

            <View style={styles.deleteModalActionRow}>
              <TouchableOpacity
                style={styles.deleteCancelBtn}
                onPress={() => setDocToDelete(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteConfirmBtn}
                onPress={handleConfirmDelete}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteConfirmBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Dedicated Full Document / Article / Image Reader */}
      <DocumentReader
        document={readingDoc}
        onClose={() => setReadingDoc(null)}
      />
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
    paddingBottom: 40,
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
    gap: 4,
  },
  eyeButton: {
    padding: 8,
    borderRadius: 8,
  },
  eyeIcon: {
    width: 22,
    height: 22,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  trashIcon: {
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
});
