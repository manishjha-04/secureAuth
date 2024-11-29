# Administrative Management System

A modern, full-stack authentication and authorization system built with React, Node.js, and MongoDB, implementing industry-standard security practices.

##### Default Admin Credentials
```bash
Email: admin@gmail.com
Password: Admin1234%
```

## Table of Contents
- [Features](#-features)
  - [Authentication & Authorization](#authentication--authorization)
  - [Security Features](#security-features)
  - [User Management](#user-management)
  - [Frontend](#frontend)
  - [Development & Testing](#development--testing)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
  - [Development Mode](#development-mode)
  - [Production Mode](#production-mode)
- [Testing](#-testing)
- [Security Best Practices](#-security-best-practices)
- [API Documentation](#-api-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Protected Endpoints](#protected-endpoints)
  - [Role-Based Access](#role-based-access)
  - [Security Features](#security-features-1)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Authentication & Authorization
- Secure user registration and login
- Role-Based Access Control (RBAC)
- JWT-based authentication
- Two-Factor Authentication (2FA)
- Session management with token blacklisting
- Password hashing with bcrypt

### Security Features
- Rate limiting to prevent brute force attacks
- Helmet.js for security headers
- CORS protection
- Input validation and sanitization
- Secure password policies
- Automated token cleanup
- Login attempt monitoring

### User Management
- User profile management
- Admin panel for user administration
- Email verification
- Password reset functionality

### Frontend
- Modern Material-UI interface
- Responsive design
- Protected routes
- User-friendly error handling

### Development & Testing
- Comprehensive test suite (Jest)
- Development and production configurations
- Code splitting for optimal performance
- Environment-based configurations

## 🛠️ Tech Stack

- **Frontend**: React, Material-UI, React Router
- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Speakeasy (2FA)
- **Security**: Helmet, CORS, Express-validator
- **Testing**: Jest, React Testing Library
- **Others**: Nodemailer, QRCode

## 📦 Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd secureAuth
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

3. Set up environment variables:
```bash
# Copy example env file
cp .env.example .env
```

4. Configure your environment variables in `.env`

## 🚀 Running the Application

### Development Mode
```bash
# Run both frontend and backend
npm run dev

# Run backend only
npm run server

# Run frontend only
npm run client
```

### Production Mode
```bash
# Build frontend
cd client
npm run build

# Start server
cd ..
npm start
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run backend tests
npm run test:backend

# Run frontend tests
npm run test:frontend

# Run tests in watch mode
npm run test:watch
```

## 🔒 Security Best Practices

- Implements rate limiting for API endpoints
- Uses secure HTTP headers with Helmet.js
- Stores passwords using bcrypt hashing
- Implements JWT token blacklisting
- Monitors and limits login attempts
- Provides 2FA for additional security
- Validates and sanitizes all user inputs
- Implements CORS protection

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/2fa/setup` - Setup 2FA
- `POST /api/auth/2fa/verify` - Verify 2FA token
- `POST /api/auth/2fa/disable` - Disable 2FA
- `POST /api/auth/2fa/notify` - Send 2FA status notification
- `POST /api/auth/change-password` - Change user password
- `POST /api/auth/refresh-token` - Refresh access token

### Protected Endpoints
- `GET /api/protected/profile` - Get user profile
- `PUT /api/protected/profile` - Update user profile
- `GET /api/protected/users` - List all users (Admin only)
- `PUT /api/protected/users/:id` - Update user role (Admin only)
- `DELETE /api/protected/users/:id` - Delete user (Admin and Moderator)

### Role-Based Access
- **Admin**: Full access to all endpoints
- **Moderator**: Can delete regular users, access moderator-specific features
- **User**: Access to profile management and basic features

### Security Features
- JWT token rotation with refresh tokens
- Two-Factor Authentication (2FA) with backup codes
- Password history tracking
- Account lockout after failed attempts
- Email notifications for security events

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License. 