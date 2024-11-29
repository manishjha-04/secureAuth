import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#f44336';
      case 'moderator':
        return '#2196f3';
      default:
        return '#4caf50';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user.username}!
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    <strong>Username:</strong> {user.username}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Email:</strong> {user.email}
                  </Typography>
                  <Typography
                    variant="body1"
                    gutterBottom
                    sx={{
                      color: getRoleColor(user.role),
                      fontWeight: 'bold',
                    }}
                  >
                    <strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Typography>
                </CardContent>
              </Card>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Role Permissions
              </Typography>
              <Card>
                <CardContent>
                  {user.role === 'admin' && (
                    <Typography variant="body1" gutterBottom>
                      • Full access to all system features
                      <br />
                      • User management
                      <br />
                      • Role management
                      <br />
                      • System configuration
                    </Typography>
                  )}
                  {user.role === 'moderator' && (
                    <Typography variant="body1" gutterBottom>
                      • Content moderation
                      <br />
                      • User reports handling
                      <br />
                      • Limited administrative actions
                    </Typography>
                  )}
                  {user.role === 'user' && (
                    <Typography variant="body1" gutterBottom>
                      • Basic user features
                      <br />
                      • Profile management
                      <br />
                      • Content creation
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 