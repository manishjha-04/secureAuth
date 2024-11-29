require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const { securityHeaders } = require('./middleware/security');
const rateLimit = require('express-rate-limit');
const BlacklistedToken = require('./models/BlacklistedToken');
const LoginAttempt = require('./models/LoginAttempt');

const app = express();

// Trust proxy - required for rate limiting behind reverse proxies
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Authorization']
}));

app.use(express.json());

// Rate limiting for all routes
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Cleanup expired tokens periodically
setInterval(async () => {
  try {
    await BlacklistedToken.deleteMany({ expiresAt: { $lt: new Date() } });
    await LoginAttempt.deleteMany({ timestamp: { $lt: new Date(Date.now() - 15 * 60 * 1000) } });
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
}, 15 * 60 * 1000); // Run every 15 minutes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/protected', protectedRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 