const rateLimit = require('express-rate-limit');
const LoginAttempt = require('../models/LoginAttempt');

// Rate limiter for login attempts
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  // Configure IP handling behind proxies
  trustProxy: true,
  handler: (req, res) => {
    res.status(429).json({
      message: 'Too many login attempts, please try again after 15 minutes',
      lockUntil: new Date(Date.now() + 15 * 60 * 1000)
    });
  }
});

// Track failed login attempts
exports.trackLoginAttempt = async (req, res, next) => {
  const { email } = req.body;
  const ipAddress = req.ip;

  try {
    // Count failed attempts in the last 15 minutes
    const failedAttempts = await LoginAttempt.countDocuments({
      email,
      ipAddress,
      successful: false,
      timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
    });

    if (failedAttempts >= 5) {
      // Lock the account
      await User.findOneAndUpdate(
        { email },
        {
          isLocked: true,
          lockUntil: new Date(Date.now() + 15 * 60 * 1000)
        }
      );
      return res.status(429).json({
        message: 'Account locked due to too many failed attempts. Please try again after 15 minutes.'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Security headers middleware
exports.securityHeaders = (req, res, next) => {
  // HSTS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Disable MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';");
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
}; 