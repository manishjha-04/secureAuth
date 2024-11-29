const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user',
  },
  twoFactorSecret: {
    type: String,
    default: null,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  backupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockUntil: {
    type: Date,
    default: null,
  },
  passwordHistory: [{
    password: String,
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }],
  refreshToken: {
    token: String,
    expiresAt: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    
    // Add current password to history
    if (this.passwordHistory.length >= 5) {
      this.passwordHistory.shift(); // Remove oldest password
    }
    this.passwordHistory.push({
      password: hashedPassword,
      createdAt: new Date()
    });
    
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if password exists in history
userSchema.methods.isPasswordInHistory = async function(candidatePassword) {
  for (const historyEntry of this.passwordHistory) {
    if (await bcrypt.compare(candidatePassword, historyEntry.password)) {
      return true;
    }
  }
  return false;
};

module.exports = mongoose.model('User', userSchema); 