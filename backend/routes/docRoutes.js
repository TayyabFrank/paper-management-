const express = require('express');
const router = express.Router();
const {
  getDocuments,
  createDocument,
  deleteDocument,
} = require('../controllers/docController');

router.get('/', getDocuments);
router.post('/', createDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
