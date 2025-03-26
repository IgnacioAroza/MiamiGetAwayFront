import React from 'react';
import { Typography, Box } from '@mui/material';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminPanel = () => {
  return (
    <Box>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4,
          mt: 10,
          fontWeight: 'bold'
        }}
      >
        Admin Panel
      </Typography>
      <AdminDashboard />
    </Box>
  );
};

export default AdminPanel;