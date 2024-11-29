import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lockoutInfo, setLockoutInfo] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login({
        ...formData,
        ...(showTwoFactor ? { totpToken: twoFactorCode } : {}),
      });

      if (result.requires2FA) {
        setShowTwoFactor(true);
        setError('');
        setError('Please enter the 6-digit code from your authenticator app to complete login.');
      } else if (result.success) {
        navigate('/dashboard');
      } else if (result.lockUntil) {
        setLockoutInfo({
          message: result.message,
          lockUntil: new Date(result.lockUntil),
        });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatLockoutTime = (date) => {
    const minutes = Math.ceil((date - new Date()) / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            {showTwoFactor ? 'Two-Factor Authentication' : 'Login'}
          </Typography>

          {error && (
            <Alert 
              severity={showTwoFactor ? "info" : "error"} 
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          {lockoutInfo && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {lockoutInfo.message}
              <br />
              Try again in {formatLockoutTime(lockoutInfo.lockUntil)}.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {!showTwoFactor ? (
              <>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  margin="normal"
                  required
                  disabled={loading}
                />
              </>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  A 2FA code has been requested for additional security. Please open your authenticator app and enter the 6-digit code below.
                </Typography>
                <TextField
                  fullWidth
                  label="Authentication Code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                  placeholder="Enter 6-digit code"
                  inputProps={{
                    maxLength: 6,
                    pattern: '[0-9]*'
                  }}
                  helperText="Enter the 6-digit code from your authenticator app"
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
              disabled={loading || (showTwoFactor && !twoFactorCode)}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : showTwoFactor ? (
                'Verify Code'
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {!showTwoFactor && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Button
                  color="primary"
                  onClick={() => navigate('/register')}
                  disabled={loading}
                >
                  Register
                </Button>
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 