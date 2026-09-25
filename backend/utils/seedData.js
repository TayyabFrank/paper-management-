const User = require('../models/User');
const Document = require('../models/Document');

const DEFAULT_ADMIN = {
  name: 'System Administrator',
  email: 'admin@enterprise.com',
  role: 'Admin',
  department: 'IT Administration',
  employeeId: 'ADM-001',
  status: 'active',
  password: 'password123',
  documentsCount: 0,
};

const DEFAULT_SAMPLE_DOCS = [
  {
    id: 'doc-seed-art-01',
    title: 'Enterprise AI & Research Governance Policy',
    subtitle: 'Research Ethics, Machine Learning & Standard Protocols',
    type: 'article',
    icon: '📰',
    fileSize: '1.4 MB',
    isSigned: true,
    employeeEmail: 'elena.vance@enterprise.com',
    employeeName: 'Dr. Elena Vance',
    statusNote: 'Approved by AI Ethics Board',
  },
  {
    id: 'doc-seed-art-02',
    title: 'Information Security Protocols & Zero-Trust Blueprint',
    subtitle: 'Mandatory CISO Information Security Guidelines 2026',
    type: 'article',
    icon: '📰',
    fileSize: '2.1 MB',
    isSigned: true,
    employeeEmail: 'john.doe@enterprise.com',
    employeeName: 'John Doe',
    statusNote: 'Enterprise Verified',
  },
  {
    id: 'doc-seed-art-03',
    title: 'Remote Work & Global Intellectual Property Policy',
    subtitle: 'HR Workspace Conduct & Hardware Security Standard',
    type: 'article',
    icon: '📰',
    fileSize: '980 KB',
    isSigned: false,
    employeeEmail: 'sarah.smith@enterprise.com',
    employeeName: 'Sarah Smith',
    statusNote: 'Annual Revision Pending',
  },
  {
    id: 'doc-seed-pdf-01',
    title: 'Master Enterprise Services Agreement (MSA 2026)',
    subtitle: 'Corporate Legal Binding Terms & Service Level Agreement',
    type: 'pdf',
    icon: '📄',
    fileSize: '3.4 MB',
    isSigned: true,
    employeeEmail: 'john.doe@enterprise.com',
    employeeName: 'John Doe',
    statusNote: 'Signed & Legally Executed',
  },
  {
    id: 'doc-seed-pdf-02',
    title: 'DocuVault System Overview & Compliance Handbook',
    subtitle: 'Platform Architecture & Certified Administrative Reference',
    type: 'pdf',
    icon: '📄',
    fileSize: '2.8 MB',
    isSigned: true,
    employeeEmail: 'admin@enterprise.com',
    employeeName: 'System Administrator',
    statusNote: 'Core Reference Manual',
  },
  {
    id: 'doc-seed-pdf-03',
    title: 'Q3 Corporate Financial & Audit Statement',
    subtitle: 'Quarterly Operating Balance, Projections & Tax Review',
    type: 'pdf',
    icon: '📄',
    fileSize: '4.6 MB',
    isSigned: false,
    employeeEmail: 'sarah.smith@enterprise.com',
    employeeName: 'Sarah Smith',
    statusNote: 'Awaiting Audit Signature',
  },
  {
    id: 'doc-seed-docx-01',
    title: 'Engineering Architecture Blueprint v4.2',
    subtitle: 'Microservices, Event Streams & Sharded DB Schemas',
    type: 'docx',
    icon: '📘',
    fileSize: '1.9 MB',
    isSigned: true,
    employeeEmail: 'michael.chen@enterprise.com',
    employeeName: 'Michael Chen',
    statusNote: 'Approved for Q4 Implementation',
  },
  {
    id: 'doc-seed-docx-02',
    title: 'Annual Product Strategy & Roadmap Specifications',
    subtitle: 'Deliverables, Milestones & Engineering KPI Matrix',
    type: 'docx',
    icon: '📘',
    fileSize: '1.2 MB',
    isSigned: false,
    employeeEmail: 'sarah.smith@enterprise.com',
    employeeName: 'Sarah Smith',
    statusNote: 'Draft In Review',
  },
  {
    id: 'doc-seed-img-01',
    title: 'Headquarters Data Center & Network Topology',
    subtitle: 'Core Optical Fiber Routing & Redundant Power Grid',
    type: 'image',
    icon: '🖼️',
    fileSize: '4.8 MB',
    isSigned: true,
    employeeEmail: 'michael.chen@enterprise.com',
    employeeName: 'Michael Chen',
    previewImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
    statusNote: 'Infrastructure Verified',
  },
  {
    id: 'doc-seed-img-02',
    title: 'Campus Emergency Evacuation & Safety Blueprint',
    subtitle: 'Facility Management, Primary Exits & Safe Zones',
    type: 'image',
    icon: '🖼️',
    fileSize: '2.5 MB',
    isSigned: true,
    employeeEmail: 'admin@enterprise.com',
    employeeName: 'System Administrator',
    previewImage: 'https://images.unsplash.com/photo-1524813686514-a57563d77d4c?w=800&auto=format&fit=crop&q=80',
    statusNote: 'Facility Certified',
  },
  {
    id: 'doc-seed-oth-01',
    title: 'Enterprise Cloud Drive & Media Repository Mirror',
    subtitle: 'Central Design Tokens, Marketing Assets & Cloud Sync',
    type: 'link',
    icon: '💬',
    fileSize: '12.4 GB Cloud',
    isSigned: false,
    employeeEmail: 'admin@enterprise.com',
    employeeName: 'System Administrator',
    statusNote: 'Continuous Cloud Sync',
  },
  {
    id: 'doc-seed-vid-01',
    title: 'Enterprise Security Protocol & Compliance Walkthrough',
    subtitle: 'Mandatory Cyber Hygiene & Document Handling Briefing',
    type: 'video',
    icon: '🎥',
    fileSize: '48.5 MB',
    isSigned: true,
    employeeEmail: 'john.doe@enterprise.com',
    employeeName: 'John Doe',
    statusNote: 'Annual Security Certified',
  },
];

async function seedInitialData() {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      console.log('[DocuVault] Creating initial administrator account in MongoDB...');
      await User.create(DEFAULT_ADMIN);
      console.log('✓ Initial Admin account ready (admin@enterprise.com).');
    }

    const docCount = await Document.countDocuments();
    if (docCount === 0) {
      console.log('[DocuVault] Seeding enterprise demo documents into MongoDB...');
      await Document.insertMany(DEFAULT_SAMPLE_DOCS);
      console.log(`✓ Seeded ${DEFAULT_SAMPLE_DOCS.length} demo documents.`);
    }
  } catch (error) {
    console.error('Initial admin setup warning:', error.message);
  }
}

module.exports = { seedInitialData };
