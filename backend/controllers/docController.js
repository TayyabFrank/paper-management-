const Document = require('../models/Document');
const User = require('../models/User');

// @desc    Get aggregated document statistics for admin dashboard
// @route   GET /api/documents/stats
exports.getDocumentStats = async (req, res) => {
  try {
    const totalDocuments = await Document.countDocuments();

    // Group count by lowercase type
    const typeAggregation = await Document.aggregate([
      {
        $group: {
          _id: { $toLower: '$type' },
          count: { $sum: 1 },
        },
      },
    ]);

    const countsByType = {
      article: 0,
      pdf: 0,
      docx: 0,
      image: 0,
      video: 0,
      link: 0,
      other: 0,
    };

    typeAggregation.forEach((item) => {
      const typeKey = (item._id || 'other').trim();
      if (Object.prototype.hasOwnProperty.call(countsByType, typeKey)) {
        countsByType[typeKey] = item.count;
      } else {
        countsByType.other = (countsByType.other || 0) + item.count;
      }
    });

    const signedCount = await Document.countDocuments({ isSigned: true });
    const unsignedCount = totalDocuments - signedCount;

    // Staff count from User model
    const activeStaffCount = await User.countDocuments({
      role: { $ne: 'Admin' },
      status: { $nin: ['pending', 'rejected'] },
    });
    const pendingStaffCount = await User.countDocuments({ status: 'pending' });

    // Recent documents
    const recentDocuments = await Document.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('id title type subtitle fileSize icon isSigned employeeName employeeEmail createdAt');

    return res.json({
      success: true,
      stats: {
        totalDocuments,
        countsByType,
        signedCount,
        unsignedCount,
        signedPercentage: totalDocuments > 0 ? Math.round((signedCount / totalDocuments) * 100) : 0,
        activeStaffCount,
        pendingStaffCount,
        recentDocuments,
      },
    });
  } catch (error) {
    console.error('Get document stats error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch document statistics' });
  }
};

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
