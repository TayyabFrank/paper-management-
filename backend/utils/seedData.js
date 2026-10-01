const User = require('../models/User');

const BOOTSTRAP_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || 'admin@docuvault.io';
const BOOTSTRAP_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123';

/**
 * Ensures an administrator account exists in the database.
 * The admin's email and password are not fixed: when the admin updates them,
 * their updated email and password are preserved and used for all future logins.
 */
async function ensureSingleAdmin() {
  try {
    // Remove legacy placeholder admin account
    await User.deleteMany({ email: 'admin@enterprise.com' });

    // Check if an administrator already exists (by role: 'Admin')
    let admin = await User.findOne({ role: 'Admin' });

    if (!admin) {
      console.log(`[DocuVault] No admin found. Initializing bootstrap admin (${BOOTSTRAP_ADMIN_EMAIL})...`);
      admin = await User.create({
        name: 'Administrator',
        email: BOOTSTRAP_ADMIN_EMAIL,
        password: BOOTSTRAP_ADMIN_PASSWORD,
        role: 'Admin',
        department: 'Administration',
        employeeId: 'ADM-001',
        status: 'active',
      });
      console.log(`✓ Admin account initialized (${BOOTSTRAP_ADMIN_EMAIL}).`);
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
