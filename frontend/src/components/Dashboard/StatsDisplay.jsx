import { Typography, Box, Divider, List, ListItem, ListItemText, Chip } from '@mui/material';
import { PictureAsPdf, Description, TableChart, TextSnippet, InsertDriveFile } from '@mui/icons-material';

const StatsDisplay = ({ stats }) => {
  if (!stats) {
    return (
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          Portal Statistics
        </Typography>
        <Typography color="text.secondary">
          No statistics available
        </Typography>
      </Box>
    );
  }

  // Get icon based on file type
  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'excel':
        return <TableChart color="success" />;
      case 'word':
        return <Description color="primary" />;
      case 'txt':
        return <TextSnippet color="warning" />;
      default:
        return <InsertDriveFile />;
    }
  };

  return (
    <Box>
      <Typography variant="h6" component="h2" gutterBottom>
        Portal Statistics
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Total Files
        </Typography>
        <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
          {stats.total_files}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Files by Type
        </Typography>
        <List dense>
          {stats.files_by_type && stats.files_by_type.map((item) => (
            <ListItem key={item.file_type} sx={{ py: 0.5 }}>
              <Box sx={{ mr: 1 }}>
                {getFileTypeIcon(item.file_type)}
              </Box>
              <ListItemText 
                primary={item.file_type.toUpperCase()} 
                secondary={`${item.count} file${item.count !== 1 ? 's' : ''}`} 
              />
              <Chip 
                label={item.count} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
            </ListItem>
          ))}
        </List>
      </Box>
      
      {stats.files_by_user && stats.files_by_user.length > 0 && (
        <>
          <Divider sx={{ my: 2 }} />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Top Users
            </Typography>
            <List dense>
              {stats.files_by_user.slice(0, 5).map((item, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={item.user__username} 
                    secondary={`${item.count} file${item.count !== 1 ? 's' : ''}`} 
                  />
                  <Chip 
                    label={item.count} 
                    size="small" 
                    color="secondary" 
                    variant="outlined" 
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </>
      )}
    </Box>
  );
};

export default StatsDisplay;