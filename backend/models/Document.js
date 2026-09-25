const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String },
    body: { type: String, required: true },
  },
  { _id: false }
);

const fullContentSchema = new mongoose.Schema(
  {
    category: { type: String, default: 'General' },
    date: { type: String, default: () => new Date().toLocaleDateString('en-GB') },
    authorOrIssuer: { type: String, default: 'DocuVault System' },
    sections: [sectionSchema],
    metadata: { type: Map, of: String },
  },
  { _id: false }
);

const documentSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: () => `Uploaded: ${new Date().toLocaleDateString('en-GB')}`,
    },
    type: {
      type: String,
      enum: ['pdf', 'docx', 'image', 'video', 'article', 'link', 'other'],
      default: 'pdf',
    },
    icon: {
      type: String,
      default: '📄',
    },
    fileSize: {
      type: String,
      default: '1.2 MB',
    },
    fileUrl: {
      type: String,
    },
    fileName: {
      type: String,
    },
    isSigned: {
      type: Boolean,
      default: false,
    },
    previewImage: {
      type: String,
    },
    contentSnippet: {
      type: String,
    },
    employeeEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    employeeName: {
      type: String,
      default: 'Employee',
    },
    statusNote: {
      type: String,
    },
    fullContent: {
      type: fullContentSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', documentSchema);
