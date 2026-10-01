const User = require('../models/User');

const FIXED_ADMIN_EMAIL = 'tayyab@admin.com';
const INITIAL_ADMIN_PASSWORD = 'Tayyab@123';

/**
 * Ensures the single fixed admin account (tayyab@admin.com) exists.
 * Preserves the admin password if already modified by the user.
 */
async function ensureSingleAdmin() {
  try {
    // Remove legacy placeholder admin account
    await User.deleteMany({ email: 'admin@enterprise.com' });

    // Find existing admin (role: Admin first, to preserve updated admin email & credentials)
    let admin = await User.findOne({ role: 'Admin' });
    if (!admin) {
      admin = await User.findOne({ email: FIXED_ADMIN_EMAIL });
    }

    if (!admin) {
      console.log(`[DocuVault] Initializing fixed administrator (${FIXED_ADMIN_EMAIL})...`);
      await User.create({
        name: 'Tayyab',
        email: FIXED_ADMIN_EMAIL,
        password: INITIAL_ADMIN_PASSWORD,
        role: 'Admin',
        department: 'Administration',
        employeeId: 'ADM-001',
        status: 'active',
      });
      console.log(`✓ Admin account created (${FIXED_ADMIN_EMAIL}).`);
    } else {
      // Clean up any extra admin accounts so only ONE admin exists
      await User.deleteMany({ _id: { $ne: admin._id }, role: 'Admin' });
      console.log(`✓ Single administrator (${admin.email}) verified.`);
    }
  } catch (error) {
    console.warn('Admin account verification notice:', error.message);
  }
}

module.exports = { ensureSingleAdmin };
