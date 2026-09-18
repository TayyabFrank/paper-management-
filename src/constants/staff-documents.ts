import { DocumentReaderItem } from '@/components/document-reader';
import { getDocumentTypeIcon } from '@/components/documents-dashboard';

export const BASE_STAFF_DOCUMENTS: DocumentReaderItem[] = [
  {
    id: 'doc-lt-1',
    title: 'Annual Tax Forms 2023',
    subtitle: 'Signed: 10 Jan 2024',
    type: 'pdf',
    icon: getDocumentTypeIcon('pdf', 'Annual Tax Forms 2023'),
    fileSize: '1.8 MB',
    employeeEmail: 'l.thompson@enterprise.com',
    employeeName: 'Liam Thompson',
    isSigned: true,
    fullContent: {
      category: 'Tax & Compliance',
      date: '10 Jan 2024',
      authorOrIssuer: 'Enterprise Finance & Payroll',
      sections: [
        {
          heading: 'W-4 Employee Withholding Certificate',
          body: 'This annual filing certifies the federal and state tax withholding elections for employee Liam Thompson for tax year 2023.',
        },
        {
          heading: 'State Tax Allowance Declarations',
          body: 'State deductions and personal exemptions have been submitted and verified by automated payroll audit on January 10, 2024.',
        },
      ],
      metadata: {
        'Filing Status': 'Complete & Signed',
        'Audit ID': 'AUD-2024-8841',
        'Signed Date': '10 Jan 2024',
      },
    },
  },
  {
    id: 'doc-lt-2',
    title: 'Employment Contract',
    subtitle: 'Signed: 15 Mar 2021',
    type: 'pdf',
    icon: getDocumentTypeIcon('pdf', 'Employment Contract'),
    fileSize: '2.4 MB',
    employeeEmail: 'l.thompson@enterprise.com',
    employeeName: 'Liam Thompson',
    isSigned: true,
    fullContent: {
      category: 'Legal & HR',
      date: '15 Mar 2021',
      authorOrIssuer: 'Enterprise Human Resources',
      sections: [
        {
          heading: 'Terms of Employment & Position',
          body: 'Agreement entered into between Enterprise Corp and Liam Thompson confirming role as Senior Software Engineer.',
        },
        {
          heading: 'Compensation & Benefits',
          body: 'Base salary compensation, healthcare coverage eligibility, and intellectual property assignment schedules.',
        },
      ],
    },
  },
  {
    id: 'doc-lt-3',
    title: 'Q4 Performance Review',
    subtitle: 'Uploaded: 15 Dec 2023',
    type: 'docx',
    icon: getDocumentTypeIcon('docx', 'Q4 Performance Review'),
    fileSize: '840 KB',
    employeeEmail: 'l.thompson@enterprise.com',
    employeeName: 'Liam Thompson',
    fullContent: {
      category: 'Performance & Reviews',
      date: '15 Dec 2023',
      authorOrIssuer: 'Engineering Leadership',
      sections: [
        {
          heading: 'Executive Summary',
          body: 'Liam exceeded technical targets for Q4, specifically in stabilizing high-volume document pipelines and enterprise mobile workflows.',
        },
        {
          heading: 'Core Competencies & Feedback',
          body: 'Exceptional ownership, mentorship of junior engineers, and consistent zero-defect code deliveries.',
        },
      ],
    },
  },
  {
    id: 'doc-lt-4',
    title: 'Health Card Scan',
    subtitle: 'Uploaded: 01 Nov 2023',
    type: 'image',
    icon: getDocumentTypeIcon('image', 'Health Card Scan'),
    fileSize: '3.1 MB',
    employeeEmail: 'l.thompson@enterprise.com',
    employeeName: 'Liam Thompson',
    previewImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80',
    fullContent: {
      category: 'Medical & Benefits',
      date: '01 Nov 2023',
      authorOrIssuer: 'Blue Shield Health Plan',
      sections: [
        {
          heading: 'Health Insurance Verification Scan',
          body: 'Verified insurance membership card scan submitted for employee benefits records and medical emergency protocol.',
        },
      ],
    },
  },
  {
    id: 'doc-lt-5',
    title: 'Non-Disclosure Agreement',
    subtitle: 'Signed: 15 Mar 2021',
    type: 'pdf',
    icon: getDocumentTypeIcon('pdf', 'Non-Disclosure Agreement'),
    fileSize: '1.2 MB',
    employeeEmail: 'l.thompson@enterprise.com',
    employeeName: 'Liam Thompson',
    isSigned: true,
    fullContent: {
      category: 'Legal Agreements',
      date: '15 Mar 2021',
      authorOrIssuer: 'Enterprise Legal Dept',
      sections: [
        {
          heading: 'Confidentiality Provisions',
          body: 'Employee covenants not to disclose proprietary code, trade secrets, architectural blueprints, or client information.',
        },
      ],
    },
  },
  {
    id: 'doc-lt-6',
    title: 'W-2 Form 2023',
    subtitle: 'Not Uploaded',
    type: 'pdf',
    icon: getDocumentTypeIcon('pdf', 'W-2 Form 2023'),
    fileSize: 'Pending Filing',
    employeeEmail: 'l.thompson@enterprise.com',
    employeeName: 'Liam Thompson',
    statusNote: 'Not Uploaded',
    fullContent: {
      category: 'Tax Filing',
      date: 'Tax Year 2023',
      authorOrIssuer: 'Enterprise Payroll Dept',
      sections: [
        {
          heading: 'Pending Document',
          body: 'This document has not been uploaded yet. Liam Thompson will be notified to submit the completed form before deadline.',
        },
      ],
    },
  },
  {
    id: 'doc-lt-7',
    title: 'Direct Deposit Form',
    subtitle: 'Uploaded: 18 Mar 2021',
    type: 'pdf',
    icon: getDocumentTypeIcon('pdf', 'Direct Deposit Form'),
    fileSize: '650 KB',
    employeeEmail: 'l.thompson@enterprise.com',
    employeeName: 'Liam Thompson',
    fullContent: {
      category: 'Payroll & Banking',
      date: '18 Mar 2021',
      authorOrIssuer: 'Chase Commercial Banking',
      sections: [
        {
          heading: 'Direct Deposit Authorization',
          body: 'Bank routing number and checking account verification for automatic payroll dispatches.',
        },
      ],
    },
  },
  {
    id: 'doc-lt-8',
    title: 'Resume',
    subtitle: 'Uploaded: 01 Mar 2021',
    type: 'pdf',
    icon: getDocumentTypeIcon('pdf', 'Resume'),
    fileSize: '1.4 MB',
    employeeEmail: 'l.thompson@enterprise.com',
    employeeName: 'Liam Thompson',
    fullContent: {
      category: 'Candidate Profile',
      date: '01 Mar 2021',
      authorOrIssuer: 'Liam Thompson',
      sections: [
        {
          heading: 'Senior Full Stack Systems Engineer',
          body: 'Specialist in enterprise cloud applications, React Native, TypeScript, distributed storage systems, and scalable API architecture.',
        },
      ],
    },
  },
  {
    id: 'doc-fk-1',
    title: 'Brand Identity Design System',
    subtitle: 'Uploaded: 14 Feb 2024',
    type: 'pdf',
    icon: getDocumentTypeIcon('pdf', 'Brand Identity Design System'),
    fileSize: '12.4 MB',
    employeeEmail: 'f.khan@enterprise.com',
    employeeName: 'Fatima Khan',
    fullContent: {
      category: 'Design & Creative',
      date: '14 Feb 2024',
      authorOrIssuer: 'Fatima Khan - Lead Designer',
      sections: [
        {
          heading: 'Design System & Token Architecture',
          body: 'Complete typography scales, color palettes, micro-interactions, and accessibility specifications.',
        },
      ],
    },
  },
  {
    id: 'doc-fk-2',
    title: 'UI Component Library Specs',
    subtitle: 'Uploaded: 20 Jan 2024',
    type: 'docx',
    icon: getDocumentTypeIcon('docx', 'UI Component Library Specs'),
    fileSize: '3.2 MB',
    employeeEmail: 'f.khan@enterprise.com',
    employeeName: 'Fatima Khan',
    fullContent: {
      category: 'Design Systems',
      date: '20 Jan 2024',
      authorOrIssuer: 'Design Dept',
      sections: [
        {
          heading: 'Component Inventory',
          body: 'Documentation for modals, navigation drawers, card lists, and form elements across web and mobile.',
        },
      ],
    },
  },
  {
    id: 'doc-bg-1',
    title: 'Operations Standard Procedures 2024',
    subtitle: 'Uploaded: 05 Jan 2024',
    type: 'article',
    icon: getDocumentTypeIcon('article', 'Operations Standard Procedures 2024'),
    fileSize: '2.1 MB',
    employeeEmail: 'b.garcia@enterprise.com',
    employeeName: 'Benjamin Garcia',
    fullContent: {
      category: 'Standard Operations',
      date: '05 Jan 2024',
      authorOrIssuer: 'Operations Team',
      sections: [
        {
          heading: 'Standard Operating Procedures',
          body: 'Standard workflow protocols for daily deployment oversight, equipment allocation, and remote staff provisioning.',
        },
      ],
    },
  },
];
