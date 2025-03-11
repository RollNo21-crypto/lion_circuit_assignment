import { useState } from 'react';
import {
  Typography, Box, Button, List, ListItem, ListItemText, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Divider, Chip, Alert
} from '@mui/material';
import { Add, Edit, Delete, Phone } from '@mui/icons-material';
import { phoneService } from '../../services/api';

const PhoneList = ({ phoneNumbers, onPhoneNumbersUpdate }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState(null);
  const [formData, setFormData] = useState({
    number: '',
    is_primary: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Open dialog for creating a new phone number
  const handleAddNew = () => {
    setEditingPhone(null);
    setFormData({
      number: '',
      is_primary: false
    });
    setDialogOpen(true);
  };

  // Open dialog for editing an existing phone number
  const handleEdit = (phone) => {
    setEditingPhone(phone);
    setFormData({
      number: phone.number,
      is_primary: phone.is_primary
    });
    setDialogOpen(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'is_primary' ? checked : value
    });
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let updatedPhoneNumbers;
      
      if (editingPhone) {
        // Update existing phone number
        await phoneService.updatePhoneNumber(editingPhone.id, formData);
        updatedPhoneNumbers = phoneNumbers.map(phone =>
          phone.id === editingPhone.id ? { ...phone, ...formData } : phone
        );
      } else {
        // Create new phone number
        const response = await phoneService.createPhoneNumber(formData);
        updatedPhoneNumbers = [...phoneNumbers, response.data];
      }
      
      // Update parent component
      onPhoneNumbersUpdate(updatedPhoneNumbers);
      setDialogOpen(false);
    } catch (err) {
      console.error('Error saving phone number:', err);
      setError(err.response?.data?.detail || 'Failed to save phone number. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number deletion
  const handleDelete = async (phoneId) => {
    if (window.confirm('Are you sure you want to delete this phone number?')) {
      try {
        await phoneService.deletePhoneNumber(phoneId);
        const updatedPhoneNumbers = phoneNumbers.filter(phone => phone.id !== phoneId);
        onPhoneNumbersUpdate(updatedPhoneNumbers);
      } catch (err) {
        console.error('Error deleting phone number:', err);
        alert('Failed to delete phone number. Please try again.');
      }
    }
  };

  // Handle setting a phone number as primary
  const handleSetPrimary = async (phoneId) => {
    try {
      const phoneToUpdate = phoneNumbers.find(phone => phone.id === phoneId);
      if (phoneToUpdate && !phoneToUpdate.is_primary) {
        await phoneService.updatePhoneNumber(phoneId, { ...phoneToUpdate, is_primary: true });
        
        // Update all phone numbers in state
        const updatedPhoneNumbers = phoneNumbers.map(phone => ({
          ...phone,
          is_primary: phone.id === phoneId
        }));
        
        onPhoneNumbersUpdate(updatedPhoneNumbers);
      }
    } catch (err) {
      console.error('Error setting primary phone number:', err);
      alert('Failed to set primary phone number. Please try again.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Your Phone Numbers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddNew}
        >
          Add New Phone
        </Button>
      </Box>

      {phoneNumbers.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Phone sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography color="text.secondary">
            You don't have any phone numbers yet
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddNew}
            sx={{ mt: 2 }}
          >
            Add Your First Phone Number
          </Button>
        </Box>
      ) : (
        <List>
          {phoneNumbers.map((phone) => (
            <Box key={phone.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton
                      edge="end"
                      aria-label="edit"
                      onClick={() => handleEdit(phone)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDelete(phone.id)}
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
                        {phone.number}
                      </Typography>
                      {phone.is_primary && (
                        <Chip
                          label="Primary"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    !phone.is_primary && (
                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        onClick={() => handleSetPrimary(phone.id)}
                      >
                        Set as Primary
                      </Button>
                    )
                  }
                />
              </ListItem>
              <Divider component="li" />
            </Box>
          ))}
        </List>
      )}

      {/* Phone Form Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPhone ? 'Edit Phone Number' : 'Add New Phone Number'}</DialogTitle>
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
              label="Phone Number"
              name="number"
              value={formData.number}
              onChange={handleChange}
            />
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="is_primary"
                name="is_primary"
                checked={formData.is_primary}
                onChange={handleChange}
              />
              <label htmlFor="is_primary" style={{ marginLeft: '8px' }}>
                Set as primary phone number
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

export default PhoneList;