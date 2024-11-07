import React from 'react';
import { Typography, Container } from '@mui/material';
import AdminDashboard from '../components/admin/AdminDashboard';

const AdminPanel = () => {
  return (
    <Container maxWidth="md" className="py-8">
      <Typography variant="h3" component="h1" sx={{ mt: 10 }} gutterBottom>
        Admin Panel
      </Typography>
      <AdminDashboard />
    </Container>
  );
};

export default AdminPanel;