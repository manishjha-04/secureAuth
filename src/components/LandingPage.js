import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  useTheme,
} from '@mui/material';
import {
  Security,
  AdminPanelSettings,
  Code,
  Create,
  VpnKey,
  GroupWork,
  Shield,
  Lock,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeatureSection = ({ icon, title, items }) => {
  const theme = useTheme();
  
  return (
    <Grid item xs={12} md={6}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          height: '100%',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-5px)',
          },
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h5" component="h2" ml={1}>
            {title}
          </Typography>
        </Box>
        <List>
          {items.map((item, index) => (
            <ListItem key={index}>
              <ListItemIcon>
                <Shield sx={{ color: theme.palette.primary.main }} />
              </ListItemIcon>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Grid>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();

  const features = [
    {
      icon: <Security color="primary" sx={{ fontSize: 40 }} />,
      title: 'Security Best Practices',
      items: [
        'Secure password hashing with bcrypt',
        'JWT-based authentication with token rotation',
        'Two-Factor Authentication (2FA) support',
        'Account protection against brute force attacks',
        'Advanced rate limiting and security headers',
      ],
    },
    {
      icon: <AdminPanelSettings color="primary" sx={{ fontSize: 40 }} />,
      title: 'Role-Based Access Control',
      items: [
        'Flexible role management (Admin, Moderator, User)',
        'Protected routes based on user roles',
        'Fine-grained permission control',
        'Role-specific dashboards and features',
        'Secure role validation and verification',
      ],
    },
    {
      icon: <Code color="primary" sx={{ fontSize: 40 }} />,
      title: 'Code Quality',
      items: [
        'Modern and modular architecture',
        'Clean and maintainable codebase',
        'Comprehensive error handling',
        'Extensive input validation',
        'Well-documented API endpoints',
      ],
    },
    {
      icon: <Create color="primary" sx={{ fontSize: 40 }} />,
      title: 'Advanced Features',
      items: [
        'Password history tracking',
        'Automatic account lockout',
        'Token blacklisting',
        'QR code-based 2FA setup',
        'Refresh token mechanism',
      ],
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth="lg">
        <Box textAlign="center" mb={8}>
          <Typography
            component="h1"
            variant="h2"
            color="primary"
            gutterBottom
            fontWeight="bold"
          >
           Administrative Management System
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            A modern authentication and authorization system built with security best practices
          </Typography>
          {!isAuthenticated && (
            <Box mt={4}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/register')}
                sx={{ mr: 2 }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </Box>
          )}
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <FeatureSection key={index} {...feature} />
          ))}
        </Grid>

        <Box mt={8} textAlign="center">
          <Typography variant="h4" color="primary" gutterBottom>
            Security at Every Level
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Our system implements multiple layers of security to protect your data and ensure
            secure access to your resources. From password hashing to token management,
            every aspect is designed with security in mind.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage; 