import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, CircularProgress, Tabs, Tab, Divider } from '@mui/material';
import { authService } from '../../services/api';
import PersonalInfo from './PersonalInfo';
import AddressList from './AddressList';
import PhoneList from './PhoneList';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const response = await authService.getProfile();
        setProfileData(response.data);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileUpdate = (updatedData) => {
    setProfileData({ ...profileData, ...updatedData });
  };

  const handleAddressUpdate = (addresses) => {
    setProfileData({ ...profileData, addresses });
  };

  const handlePhoneUpdate = (phone_numbers) => {
    setProfileData({ ...profileData, phone_numbers });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Profile
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
            <Typography>{error}</Typography>
          </Box>
        )}

        {profileData && (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs">
                <Tab label="Personal Information" />
                <Tab label="Addresses" />
                <Tab label="Phone Numbers" />
              </Tabs>
            </Box>
            
            {/* Personal Information Tab */}
            {activeTab === 0 && (
              <PersonalInfo 
                profileData={profileData} 
                onProfileUpdate={handleProfileUpdate} 
              />
            )}
            
            {/* Addresses Tab */}
            {activeTab === 1 && (
              <AddressList 
                addresses={profileData.addresses || []} 
                onAddressesUpdate={handleAddressUpdate} 
              />
            )}
            
            {/* Phone Numbers Tab */}
            {activeTab === 2 && (
              <PhoneList 
                phoneNumbers={profileData.phone_numbers || []} 
                onPhoneNumbersUpdate={handlePhoneUpdate} 
              />
            )}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;