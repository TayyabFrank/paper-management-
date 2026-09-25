const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocumentStats,
  createDocument,
  deleteDocument,
} = require('../controllers/docController');

router.get('/stats', getDocumentStats);
router.get('/', getDocuments);
router.post('/', createDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
