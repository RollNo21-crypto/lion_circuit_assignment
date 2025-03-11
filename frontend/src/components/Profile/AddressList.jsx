import { useState } from 'react';
import {
  Typography, Box, Button, List, ListItem, ListItemText, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  Divider, Chip, Alert
} from '@mui/material';
import { Add, Edit, Delete, LocationOn } from '@mui/icons-material';
import { addressService } from '../../services/api';

const AddressList = ({ addresses, onAddressesUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Open dialog for creating a new address
  const handleAddNew = () => {
    setEditingAddress(null);
    setFormData({
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      is_default: false
    });
    setDialogOpen(true);
  };

  // Open dialog for editing an existing address
  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default
    });
    setDialogOpen(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'is_default' ? checked : value
    });
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let updatedAddresses;
      
      if (editingAddress) {
        // Update existing address
        await addressService.updateAddress(editingAddress.id, formData);
        updatedAddresses = addresses.map(addr =>
          addr.id === editingAddress.id ? { ...addr, ...formData } : addr
        );
      } else {
        // Create new address
        const response = await addressService.createAddress(formData);
        updatedAddresses = [...addresses, response.data];
      }
      
      // Update parent component
      onAddressesUpdate(updatedAddresses);
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving address:', err);
      setError(err.response?.data?.detail || 'Failed to save address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle address deletion
  const handleDelete = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressService.deleteAddress(addressId);
        const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
        onAddressesUpdate(updatedAddresses);
      } catch (err) {
        console.error('Error deleting address:', err);
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  // Handle setting an address as default
  const handleSetDefault = async (addressId) => {
    try {
      const addressToUpdate = addresses.find(addr => addr.id === addressId);
      if (addressToUpdate && !addressToUpdate.is_default) {
        await addressService.updateAddress(addressId, { ...addressToUpdate, is_default: true });
        
        // Update all addresses in state
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          is_default: addr.id === addressId
        }));
        
        onAddressesUpdate(updatedAddresses);
      }
    } catch (err) {
      console.error('Error setting default address:', err);
      alert('Failed to set default address. Please try again.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Your Addresses
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
        >
          Add New Address
        </Button>
      </Box>

      {addresses.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <LocationOn sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            You don't have any addresses yet
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddNew}
            sx={{ mt: 2 }}
          >
            Add Your First Address
          </Button>
        </Box>
      ) : (
        <List>
          {addresses.map((address) => (
            <Box key={address.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        {address.street}
                      </Typography>
                      {address.is_default && (
                        <Chip
                          label="Default"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        {`${address.city}, ${address.state} ${address.postal_code}`}
                        <br />
                        {address.country}
                      </Typography>
                      {!address.is_default && (
                        <Button
                          size="small"
                          sx={{ mt: 1 }}
                          onClick={() => handleSetDefault(address.id)}
                        >
                          Set as Default
                        </Button>
                      )}
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </Box>
          ))}
        </List>
      )}

      {/* Address Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Street Address"
              name="street"
              value={formData.street}
              onChange={handleChange}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="State/Province"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Postal Code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="is_default"
                name="is_default"
                checked={formData.is_default}
                onChange={handleChange}
              />
              <label htmlFor="is_default" style={{ marginLeft: '8px' }}>
                Set as default address
              </label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddressList;