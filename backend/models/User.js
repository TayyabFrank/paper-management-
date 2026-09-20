const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    role: {
      type: String,
      default: 'Staff',
    },
    department: {
      type: String,
      default: 'General',
    },
    employeeId: {
      type: String,
      default: () => `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected'],
      default: 'pending',
    },
    documentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  // If stored password isn't hashed yet (e.g. from plain seeds), allow direct match
  if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    return this.password === enteredPassword;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  // If already hashed, skip
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
