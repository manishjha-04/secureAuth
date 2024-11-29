import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Typography,
  Card,
  CardContent,
  Chip,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const defaultPermissions = {
  read: false,
  write: false,
  delete: false,
  manage_users: false,
  manage_roles: false,
  manage_permissions: false,
};

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: { ...defaultPermissions },
    customAttributes: [],
  });
  const [newAttribute, setNewAttribute] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await axios.get('/api/roles');
      setRoles(response.data);
    } catch (error) {
      enqueueSnackbar('Failed to fetch roles', { variant: 'error' });
    }
  };

  const handleOpenDialog = (role = null) => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description,
        permissions: { ...role.permissions },
        customAttributes: [...role.customAttributes],
      });
      setSelectedRole(role);
    } else {
      setFormData({
        name: '',
        description: '',
        permissions: { ...defaultPermissions },
        customAttributes: [],
      });
      setSelectedRole(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: { ...defaultPermissions },
      customAttributes: [],
    });
    setNewAttribute('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRole) {
        await axios.put(`/api/roles/${selectedRole._id}`, formData);
        enqueueSnackbar('Role updated successfully', { variant: 'success' });
      } else {
        await axios.post('/api/roles', formData);
        enqueueSnackbar('Role created successfully', { variant: 'success' });
      }
      fetchRoles();
      handleCloseDialog();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || 'Operation failed', {
        variant: 'error',
      });
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await axios.delete(`/api/roles/${roleId}`);
      enqueueSnackbar('Role deleted successfully', { variant: 'success' });
      fetchRoles();
    } catch (error) {
      enqueueSnackbar('Failed to delete role', { variant: 'error' });
    }
  };

  const handleAddAttribute = () => {
    if (newAttribute && !formData.customAttributes.includes(newAttribute)) {
      setFormData({
        ...formData,
        customAttributes: [...formData.customAttributes, newAttribute],
      });
      setNewAttribute('');
    }
  };

  const handleDeleteAttribute = (attribute) => {
    setFormData({
      ...formData,
      customAttributes: formData.customAttributes.filter((attr) => attr !== attribute),
    });
  };

  const handlePermissionChange = (permission) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: !formData.permissions[permission],
      },
    });
  };

  const columns = [
    { field: 'name', headerName: 'Role Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 2 },
    {
      field: 'permissions',
      headerName: 'Permissions',
      flex: 2,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {Object.entries(params.value).map(
            ([key, value]) =>
              value && (
                <Chip
                  key={key}
                  label={key.replace('_', ' ')}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() => handleOpenDialog(params.row)}
            color="primary"
            size="small"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            onClick={() => handleDeleteRole(params.row._id)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Role Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Role
        </Button>
      </Box>

      <Card>
        <CardContent>
          <DataGrid
            rows={roles}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            checkboxSelection
            disableSelectionOnClick
            autoHeight
            getRowId={(row) => row._id}
            sx={{
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedRole ? 'Edit Role' : 'Add New Role'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                label="Role Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                multiline
                rows={2}
                fullWidth
              />

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Permissions
              </Typography>
              <FormGroup>
                {Object.keys(defaultPermissions).map((permission) => (
                  <FormControlLabel
                    key={permission}
                    control={
                      <Checkbox
                        checked={formData.permissions[permission]}
                        onChange={() => handlePermissionChange(permission)}
                      />
                    }
                    label={permission.replace('_', ' ')}
                  />
                ))}
              </FormGroup>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Custom Attributes
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="New Attribute"
                  value={newAttribute}
                  onChange={(e) => setNewAttribute(e.target.value)}
                  size="small"
                  fullWidth
                />
                <Button
                  variant="outlined"
                  onClick={handleAddAttribute}
                  disabled={!newAttribute}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {formData.customAttributes.map((attribute) => (
                  <Chip
                    key={attribute}
                    label={attribute}
                    onDelete={() => handleDeleteAttribute(attribute)}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedRole ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </motion.div>
  );
};

export default RoleManagement; 