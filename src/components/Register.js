import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { CheckCircleOutline } from '@mui/icons-material';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    enable2FA: false,
  });
  const [error, setError] = useState('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const passwordRequirements = [
    'At least 8 characters long',
    'At least one uppercase letter',
    'At least one lowercase letter',
    'At least one number',
    'At least one special character (@$!%*?&)'
  ];

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    if (e.target.name === 'password') {
      setShowPasswordRequirements(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { confirmPassword, enable2FA, ...registerData } = formData;
    const result = await register(registerData);
    
    if (result.success) {
      if (enable2FA) {
        navigate('/security/2fa');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Register
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
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
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.enable2FA}
                  onChange={handleChange}
                  name="enable2FA"
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1">Enable Two-Factor Authentication</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enhance your account security with 2FA
                  </Typography>
                </Box>
              }
              sx={{ mt: 2, mb: 1 }}
            />

            {showPasswordRequirements && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Password Requirements:
                </Typography>
                <List dense>
                  {passwordRequirements.map((req, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <CheckCircleOutline fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={req} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3 }}
            >
              Register
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                  Login here
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 