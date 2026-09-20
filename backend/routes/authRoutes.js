const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getAllUsers,
  approveUser,
  rejectUser,
  deleteUser,
  updateProfile,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/users', getAllUsers);
router.put('/users/:email/approve', approveUser);
router.put('/users/:email/reject', rejectUser);
router.delete('/users/:email', deleteUser);
router.put('/profile', updateProfile);

module.exports = router;
