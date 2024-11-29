const mongoose = require('mongoose');

const loginAttemptSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    expires: 900, // Auto-delete after 15 minutes
  },
  successful: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema); 