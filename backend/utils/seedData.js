const User = require('../models/User');

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

async function seedInitialData() {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      console.log('[DocuVault] Creating initial administrator account in MongoDB...');
      await User.create(DEFAULT_ADMIN);
      console.log('✓ Initial Admin account ready (admin@enterprise.com).');
    }
  } catch (error) {
    console.error('Initial admin setup warning:', error.message);
  }
}

module.exports = { seedInitialData };
