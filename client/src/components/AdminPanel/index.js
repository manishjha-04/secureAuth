import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
} from '@mui/material';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import PermissionManagement from './PermissionManagement';
import { useSnackbar } from 'notistack';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const tabPanelVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  return (
    <Container maxWidth="xl">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Administrative Management System
          </Typography>
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: 2,
              backgroundColor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                backgroundColor: theme.palette.primary.main,
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: '#ffffff',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#ffffff',
                },
              }}
            >
              <Tab label="User Management" />
              <Tab label="Role Management" />
              <Tab label="Permissions" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={tabPanelVariants}
                key={activeTab}
              >
                {activeTab === 0 && <UserManagement />}
                {activeTab === 1 && <RoleManagement />}
                {activeTab === 2 && <PermissionManagement />}
              </motion.div>
            </Box>
          </Paper>
        </Box>
      </motion.div>
    </Container>
  );
};

export default AdminPanel; 