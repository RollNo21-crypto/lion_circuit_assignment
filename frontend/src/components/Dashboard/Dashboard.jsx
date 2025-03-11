import { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, Grid, CircularProgress } from '@mui/material';
import { fileService, statsService } from '../../services/api';
import FileList from './FileList';
import FileUpload from './FileUpload';
import StatsDisplay from './StatsDisplay';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch files and stats on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [filesResponse, statsResponse] = await Promise.all([
          fileService.getFiles(),
          statsService.getStats()
        ]);
        setFiles(filesResponse.data);
        setStats(statsResponse.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = (newFile) => {
    setFiles([newFile, ...files]);
  };

  const handleFileDelete = async (fileId) => {
    try {
      await fileService.deleteFile(fileId);
      setFiles(files.filter(file => file.id !== fileId));
      
      // Refresh stats after file deletion
      const statsResponse = await statsService.getStats();
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again.');
    }
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
      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}
      
      <Grid container spacing={3}>
        {/* File Upload Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <FileUpload onFileUpload={handleFileUpload} />
          </Paper>
        </Grid>
        
        {/* Stats Display */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <StatsDisplay stats={stats} />
          </Paper>
        </Grid>
        
        {/* File List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <FileList files={files} onDelete={handleFileDelete} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;