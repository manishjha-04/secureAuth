import '@testing-library/jest-dom';

// Add any backend-specific test setup here
// For example, setting up test environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/auth-test'; 