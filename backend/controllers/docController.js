const Document = require('../models/Document');
const User = require('../models/User');

// @desc    Get documents (filtered by email or all)
// @route   GET /api/documents
exports.getDocuments = async (req, res) => {
  try {
    const { email } = req.query;
    let query = {};

    if (email && email !== 'all') {
      const cleanEmail = email.trim().toLowerCase();
      query.employeeEmail = { $regex: new RegExp(`^${cleanEmail}$`, 'i') };
    }

    const documents = await Document.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, count: documents.length, documents });
  } catch (error) {
    console.error('Get documents error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
};

// @desc    Create / Upload a new document
// @route   POST /api/documents
exports.createDocument = async (req, res) => {
  try {
    const docData = req.body;

    if (!docData.title) {
      return res.status(400).json({ success: false, message: 'Document title is required' });
    }

    const documentId = docData.id || `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const document = await Document.findOneAndUpdate(
      { id: documentId },
      {
        ...docData,
        id: documentId,
        employeeEmail: (docData.employeeEmail || 'general@enterprise.com').toLowerCase(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Increment user document count if employee exists
    if (docData.employeeEmail) {
      await User.findOneAndUpdate(
        { email: docData.employeeEmail.toLowerCase() },
        { $inc: { documentsCount: 1 } }
      );
    }

    return res.status(201).json({ success: true, document });
  } catch (error) {
    console.error('Create document error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to save document' });
  }
};

// @desc    Delete document by ID
// @route   DELETE /api/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findOneAndDelete({ id: id });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    // Decrement user document count
    if (document.employeeEmail) {
      await User.findOneAndUpdate(
        { email: document.employeeEmail.toLowerCase() },
        { $inc: { documentsCount: -1 } }
      );
    }

    return res.json({ success: true, message: 'Document deleted successfully', id });
  } catch (error) {
    console.error('Delete document error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
};
