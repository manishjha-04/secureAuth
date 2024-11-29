import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const TwoFactorSetup = () => {
  const { user, updateUser } = useAuth();
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDisableDialog, setOpenDisableDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const recommendedApps = [
    {
      name: 'Google Authenticator',
      platforms: 'iOS, Android',
      link: {
        ios: 'https://apps.apple.com/app/google-authenticator/id388497605',
        android: 'https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2'
      }
    },
    {
      name: 'Authy',
      platforms: 'iOS, Android, Desktop',
      link: 'https://authy.com/download/'
    },
    {
      name: 'Microsoft Authenticator',
      platforms: 'iOS, Android',
      link: {
        ios: 'https://apps.apple.com/app/microsoft-authenticator/id983156458',
        android: 'https://play.google.com/store/apps/details?id=com.azure.authenticator'
      }
    }
  ];

  const setupTwoFactor = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${API_URL}/api/auth/2fa/setup`);
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setBackupCodes(response.data.backupCodes);
    } catch (error) {
      setError(error.response?.data?.message || 'Error setting up 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    try {
      setLoading(true);
      setError('');
      await axios.post(`${API_URL}/api/auth/2fa/verify`, { token: verificationCode });
      updateUser({ ...user, twoFactorEnabled: true });
      setSuccess('2FA has been enabled successfully');
      // Send email notification
      await axios.post(`${API_URL}/api/auth/2fa/notify`, { 
        action: 'enabled',
        email: user.email 
      });
      setQrCode('');
      setSecret('');
      setVerificationCode('');
      setShowBackupCodes(true);
    } catch (error) {
      setError(error.response?.data?.message || 'Error verifying code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);
      setError('');
      await axios.post(`${API_URL}/api/auth/2fa/disable`, { token: verificationCode });
      updateUser({ ...user, twoFactorEnabled: false });
      // Send email notification
      await axios.post(`${API_URL}/api/auth/2fa/notify`, { 
        action: 'disabled',
        email: user.email 
      });
      setSuccess('2FA has been disabled successfully');
      setVerificationCode('');
      setOpenDisableDialog(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Error disabling 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Two-Factor Authentication
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {showBackupCodes && backupCodes.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Important: Save Your Backup Codes
          </Typography>
          <Typography variant="body2" gutterBottom>
            Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            Each code can only be used once.
          </Typography>
          <Box sx={{ my: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            {backupCodes.map((code, index) => (
              <Typography key={index} variant="mono" sx={{ fontFamily: 'monospace' }}>
                {code}
              </Typography>
            ))}
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              const codesText = backupCodes.join('\n');
              navigator.clipboard.writeText(codesText);
            }}
          >
            Copy Codes
          </Button>
        </Alert>
      )}

      {user.twoFactorEnabled ? (
        <Box>
          <Alert severity="info" sx={{ mb: 2 }}>
            Two-Factor Authentication is currently enabled for your account.
          </Alert>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setOpenDisableDialog(true)}
          >
            Disable 2FA
          </Button>
        </Box>
      ) : (
        <Box>
          {!qrCode ? (
            <>
              <Typography variant="h6" gutterBottom>
                Getting Started with Two-Factor Authentication
              </Typography>
              <Typography variant="body1" paragraph>
                Two-factor authentication adds an extra layer of security to your account. After enabling,
                you'll need both your password and a verification code from your authenticator app to sign in.
              </Typography>

              <Typography variant="h6" gutterBottom>
                Step 1: Install an Authenticator App
              </Typography>
              <Typography variant="body1" paragraph>
                If you haven't already, install one of these recommended authenticator apps on your device:
              </Typography>

              <Box sx={{ mb: 3 }}>
                {recommendedApps.map((app, index) => (
                  <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle1">{app.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Available on: {app.platforms}
                    </Typography>
                    {typeof app.link === 'string' ? (
                      <Button
                        href={app.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Download
                      </Button>
                    ) : (
                      <Box sx={{ mt: 1 }}>
                        <Button
                          href={app.link.ios}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          iOS
                        </Button>
                        <Button
                          href={app.link.android}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="small"
                        >
                          Android
                        </Button>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>
                Step 2: Set Up Two-Factor Authentication
              </Typography>
              <Typography variant="body1" paragraph>
                Once you have installed an authenticator app, click the button below to continue setup:
              </Typography>

              <Button
                variant="contained"
                onClick={setupTwoFactor}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Begin 2FA Setup'}
              </Button>
            </>
          ) : (
            <Box>
              <Typography variant="h6" gutterBottom>
                Step 3: Connect Your Authenticator App
              </Typography>
              <Typography variant="body1" gutterBottom>
                1. Open your authenticator app and add a new account
              </Typography>
              <Typography variant="body1" gutterBottom>
                2. Scan this QR code with your authenticator app:
              </Typography>
              <Box
                component="img"
                src={qrCode}
                alt="QR Code"
                sx={{ my: 2, maxWidth: 200 }}
              />
              
              <Typography variant="body1" gutterBottom>
                Can't scan the QR code? Manually enter this secret key in your app:
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontFamily: 'monospace', my: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}
              >
                {secret}
              </Typography>

              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                Step 4: Verify Setup
              </Typography>
              <Typography variant="body1" gutterBottom>
                Enter the 6-digit verification code shown in your authenticator app:
              </Typography>
              <TextField
                fullWidth
                label="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                sx={{ mb: 2 }}
                inputProps={{
                  maxLength: 6,
                  pattern: '[0-9]*'
                }}
                helperText="Enter the 6-digit code from your authenticator app"
              />
              <Button
                variant="contained"
                onClick={verifyAndEnable}
                disabled={loading || !verificationCode}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify and Enable 2FA'}
              </Button>
            </Box>
          )}
        </Box>
      )}

      <Dialog open={openDisableDialog} onClose={() => setOpenDisableDialog(false)}>
        <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Warning: Disabling 2FA will make your account less secure.
          </Typography>
          <Typography gutterBottom>
            Please enter a verification code from your authenticator app to disable 2FA:
          </Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            sx={{ mt: 1 }}
            inputProps={{
              maxLength: 6,
              pattern: '[0-9]*'
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDisableDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDisable}
            color="error"
            disabled={loading || !verificationCode}
          >
            {loading ? <CircularProgress size={24} /> : 'Disable 2FA'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TwoFactorSetup; 