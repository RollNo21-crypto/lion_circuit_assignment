import { useState } from 'react';
import { Button, Box, Typography, LinearProgress, Alert, Stack } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { fileService } from '../../services/api';

const FileUpload = ({ onFileUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prevProgress) => {
          const newProgress = Math.min(prevProgress + 10, 90);
          return newProgress;
        });
      }, 300);

      // Upload file
      const response = await fileService.uploadFile(selectedFile);
      
      // Clear interval and set progress to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Show success message
      setSuccess(`File "${selectedFile.name}" uploaded successfully!`);
      
      // Reset selected file
      setSelectedFile(null);
      
      // Notify parent component
      if (onFileUpload && response.data) {
        onFileUpload(response.data);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.detail || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Upload New File
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
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUpload />}
          disabled={uploading}
        >
          Select File
          <input
            type="file"
            hidden
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {selectedFile ? selectedFile.name : 'No file selected'}
        </Typography>
        
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </Box>
      
      {uploading && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="body2" color="text.secondary" align="center">
            {uploadProgress}%
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default FileUpload;