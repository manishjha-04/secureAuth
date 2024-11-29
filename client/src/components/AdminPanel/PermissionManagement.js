import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const PermissionManagement = () => {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPermission, setNewPermission] = useState({
    name: '',
    description: '',
    category: '',
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchRolesAndPermissions();
  }, []);

  const fetchRolesAndPermissions = async () => {
    try {
      const [rolesResponse, permissionsResponse] = await Promise.all([
        axios.get('/api/roles'),
        axios.get('/api/permissions'),
      ]);
      setRoles(rolesResponse.data);
      setPermissions(permissionsResponse.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch data', { variant: 'error' });
    }
  };

  const handlePermissionChange = async (roleId, permissionName, checked) => {
    try {
      await axios.patch(`/api/roles/${roleId}/permissions`, {
        permission: permissionName,
        value: checked,
      });
      fetchRolesAndPermissions();
      enqueueSnackbar('Permission updated successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to update permission', { variant: 'error' });
    }
  };

  const handleAddPermission = async () => {
    try {
      await axios.post('/api/permissions', newPermission);
      setOpenDialog(false);
      setNewPermission({ name: '', description: '', category: '' });
      fetchRolesAndPermissions();
      enqueueSnackbar('Permission added successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to add permission', { variant: 'error' });
    }
  };

  const handleDeletePermission = async (permissionId) => {
    try {
      await axios.delete(`/api/permissions/${permissionId}`);
      fetchRolesAndPermissions();
      enqueueSnackbar('Permission deleted successfully', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Failed to delete permission', { variant: 'error' });
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Permission Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Permission
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ width: '100%', overflow: 'auto' }}>
            <Grid container spacing={3}>
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <Grid item xs={12} key={category}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {category}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      {categoryPermissions.map((permission) => (
                        <Grid item xs={12} key={permission._id}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              p: 1,
                              borderRadius: 1,
                              '&:hover': {
                                backgroundColor: 'action.hover',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography>{permission.name}</Typography>
                              <Tooltip title={permission.description}>
                                <IconButton size="small">
                                  <InfoIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {roles.map((role) => (
                                <FormControlLabel
                                  key={role._id}
                                  control={
                                    <Switch
                                      size="small"
                                      checked={role.permissions[permission.name] || false}
                                      onChange={(e) =>
                                        handlePermissionChange(
                                          role._id,
                                          permission.name,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  }
                                  label={role.name}
                                  sx={{ mx: 1 }}
                                />
                              ))}
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeletePermission(permission._id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Permission</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Permission Name"
              value={newPermission.name}
              onChange={(e) =>
                setNewPermission({ ...newPermission, name: e.target.value })
              }
              required
              fullWidth
            />
            <TextField
              label="Description"
              value={newPermission.description}
              onChange={(e) =>
                setNewPermission({ ...newPermission, description: e.target.value })
              }
              multiline
              rows={2}
              fullWidth
            />
            <TextField
              label="Category"
              value={newPermission.category}
              onChange={(e) =>
                setNewPermission({ ...newPermission, category: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddPermission}
            variant="contained"
            disabled={!newPermission.name}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default PermissionManagement; 