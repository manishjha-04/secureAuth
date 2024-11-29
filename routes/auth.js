const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const LoginAttempt = require('../models/LoginAttempt');
const BlacklistedToken = require('../models/BlacklistedToken');
const { authenticate } = require('../middleware/auth');
const { loginLimiter, trackLoginAttempt } = require('../middleware/security');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate backup codes
const generateBackupCodes = () => {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
};

// Hash backup codes
const hashBackupCodes = async (codes) => {
  return Promise.all(codes.map(async (code) => ({
    code: await bcrypt.hash(code, 10),
    used: false
  })));
};

// Register
router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }),
    body('email').isEmail(),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    body('role').optional().isIn(['user', 'moderator', 'admin'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password, role } = req.body;

      // Check if user exists
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      user = new User({
        username,
        email,
        password,
        role: role || 'user'
      });

      await user.save();

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Save refresh token
      user.refreshToken = {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      await user.save();

      res.status(201).json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login
router.post('/login',
  loginLimiter,
  trackLoginAttempt,
  [
    body('email').isEmail(),
    body('password').exists(),
    body('totpToken').optional().isString()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, totpToken } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        await LoginAttempt.create({
          email,
          ipAddress: req.ip,
          successful: false
        });
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check if account is locked
      if (user.isLocked && user.lockUntil > new Date()) {
        return res.status(423).json({
          message: 'Account is locked. Please try again later.',
          lockUntil: user.lockUntil
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        await LoginAttempt.create({
          email,
          ipAddress: req.ip,
          successful: false
        });
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Verify 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!totpToken) {
          return res.status(400).json({
            message: '2FA token required',
            requires2FA: true
          });
        }

        const isValidToken = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: totpToken,
          window: 1
        });

        if (!isValidToken) {
          return res.status(400).json({ message: 'Invalid 2FA token' });
        }
      }

      // Generate tokens
      const accessToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );

      // Save refresh token and clear any locks
      user.refreshToken = {
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
      user.isLocked = false;
      user.lockUntil = null;
      await user.save();

      // Record successful login
      await LoginAttempt.create({
        email,
        ipAddress: req.ip,
        successful: true
      });

      res.json({
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Setup 2FA
router.post('/2fa/setup', authenticate, async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      name: `AuthSystem:${req.user.email}`
    });

    const user = await User.findById(req.user._id);
    user.twoFactorSecret = secret.base32;
    
    // Generate and save backup codes
    const backupCodes = generateBackupCodes();
    user.backupCodes = await hashBackupCodes(backupCodes);
    
    await user.save();

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes
    });
  } catch (error) {
    res.status(500).json({ message: 'Error setting up 2FA' });
  }
});

// Verify and enable 2FA
router.post('/2fa/verify', authenticate, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying 2FA' });
  }
});

// Send 2FA email notifications
router.post('/2fa/notify', authenticate, async (req, res) => {
  try {
    const { action, email } = req.body;
    const subject = action === 'enabled' 
      ? '2FA Enabled on Your Account'
      : '2FA Disabled on Your Account';
    
    const html = action === 'enabled'
      ? `
        <h2>Two-Factor Authentication Enabled</h2>
        <p>Two-factor authentication has been successfully enabled on your account.</p>
        <p>Your account is now more secure. You will need to enter a verification code from your authenticator app each time you sign in.</p>
        <p>If you did not enable 2FA, please contact support immediately.</p>
      `
      : `
        <h2>Two-Factor Authentication Disabled</h2>
        <p>Two-factor authentication has been disabled on your account.</p>
        <p>Your account is now less secure. We recommend re-enabling 2FA for better security.</p>
        <p>If you did not disable 2FA, please contact support immediately.</p>
      `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html
    });

    res.json({ message: 'Notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification' });
  }
});

// Verify backup code
router.post('/2fa/verify-backup', async (req, res) => {
  try {
    const { email, backupCode } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Find and verify backup code
    const backupCodeEntry = user.backupCodes.find(async entry => {
      const isMatch = await bcrypt.compare(backupCode, entry.code);
      return isMatch && !entry.used;
    });

    if (!backupCodeEntry) {
      return res.status(400).json({ message: 'Invalid or used backup code' });
    }

    // Mark backup code as used
    backupCodeEntry.used = true;
    await user.save();

    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying backup code' });
  }
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Blacklist current access token
    const decoded = jwt.decode(req.token);
    await BlacklistedToken.create({
      token: req.token,
      userId: user._id,
      expiresAt: new Date(decoded.exp * 1000)
    });

    // Clear refresh token
    user.refreshToken = null;
    await user.save();

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error during logout' });
  }
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if new password is in history
    const isInHistory = await user.isPasswordInHistory(newPassword);
    if (isInHistory) {
      return res.status(400).json({ message: 'Password has been used recently' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password' });
  }
});

// Check existing email/username
router.post('/check-existing', async (req, res) => {
  try {
    const { email, username } = req.body;
    const emailUser = await User.findOne({ email });
    const usernameUser = await User.findOne({ username });

    res.json({
      emailExists: !!emailUser,
      usernameExists: !!usernameUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 