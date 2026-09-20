const User = require('../models/User');
const Document = require('../models/Document');

const DEFAULT_ACCOUNTS = [
  {
    name: 'Alex Smith',
    email: 'a.smith@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'Admin',
    department: 'Executive Management',
    employeeId: 'ADM-001',
    status: 'active',
    password: 'password123',
    documentsCount: 4,
  },
  {
    name: 'System Admin',
    email: 'admin@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'Admin',
    department: 'IT Administration',
    employeeId: 'ADM-002',
    status: 'active',
    password: 'password123',
    documentsCount: 4,
  },
  {
    name: 'DocuVault Admin',
    email: 'admin@docuvault.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    role: 'Admin',
    department: 'Executive Management',
    employeeId: 'ADM-003',
    status: 'active',
    password: 'password123',
    documentsCount: 4,
  },
  {
    name: 'Sarah Jenkins',
    email: 's.jenkins@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    role: 'Senior Financial Analyst',
    department: 'Corporate Finance',
    employeeId: 'FIN-042',
    status: 'active',
    password: 'password123',
    documentsCount: 4,
  },
  {
    name: 'Michael Chen',
    email: 'm.chen@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    role: 'Lead Infrastructure Engineer',
    department: 'Cloud Operations',
    employeeId: 'ENG-108',
    status: 'active',
    password: 'password123',
    documentsCount: 3,
  },
  {
    name: 'Elena Rostova',
    email: 'e.rostova@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    role: 'Compliance Officer',
    department: 'Legal & Risk',
    employeeId: 'LEG-019',
    status: 'active',
    password: 'password123',
    documentsCount: 3,
  },
  {
    name: 'Liam Thompson',
    email: 'l.thompson@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    role: 'Senior Software Engineer',
    department: 'Product Engineering',
    employeeId: 'ENG-204',
    status: 'active',
    password: 'password123',
    documentsCount: 4,
  },
  {
    name: 'Marcus Brody',
    email: 'm.brody@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    role: 'DevOps Specialist',
    department: 'Cloud Operations',
    employeeId: 'ENG-305',
    status: 'pending',
    password: 'password123',
    documentsCount: 0,
  },
  {
    name: 'Priya Patel',
    email: 'p.patel@enterprise.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    role: 'UX Architect',
    department: 'Product Design',
    employeeId: 'DES-102',
    status: 'pending',
    password: 'password123',
    documentsCount: 0,
  },
];

const DEFAULT_DOCUMENTS = [
  {
    id: 'doc-lt-1',
    title: 'Annual Tax Forms 2023',
    subtitle: 'Signed: 10 Jan 2024',
    type: 'pdf',
    icon: '📄',
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
    icon: '📄',
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
    icon: '📝',
    fileSize: '840 KB',
    employeeEmail: 'l.thompson@enterprise.com',
    employeeName: 'Liam Thompson',
    isSigned: false,
    fullContent: {
      category: 'Performance & Reviews',
      date: '15 Dec 2023',
      authorOrIssuer: 'Engineering Management',
      sections: [
        {
          heading: 'Technical Deliverables',
          body: 'Exceeded targets on backend architecture overhaul, microservices scaling, and pipeline resilience.',
        },
      ],
    },
  },
  {
    id: 'doc-sj-1',
    title: 'Q4 Financial Audit Report',
    subtitle: 'Signed: 05 Jan 2024',
    type: 'pdf',
    icon: '📊',
    fileSize: '4.2 MB',
    employeeEmail: 's.jenkins@enterprise.com',
    employeeName: 'Sarah Jenkins',
    isSigned: true,
    fullContent: {
      category: 'Finance & Audit',
      date: '05 Jan 2024',
      authorOrIssuer: 'Deloitte & Touche Audit LLP',
      sections: [
        {
          heading: 'Executive Summary',
          body: 'Unqualified audit opinion issued for fiscal year 2023 financial statements and balance sheet reserves.',
        },
      ],
    },
  },
];

async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding initial users into MongoDB...');
      for (const acc of DEFAULT_ACCOUNTS) {
        await User.create(acc);
      }
      console.log(`Seeded ${DEFAULT_ACCOUNTS.length} users.`);
    }

    const docCount = await Document.countDocuments();
    if (docCount === 0) {
      console.log('Seeding initial documents into MongoDB...');
      for (const doc of DEFAULT_DOCUMENTS) {
        await Document.create(doc);
      }
      console.log(`Seeded ${DEFAULT_DOCUMENTS.length} documents.`);
    }
  } catch (error) {
    console.error('Data seeding warning:', error.message);
  }
}

module.exports = { seedInitialData };
