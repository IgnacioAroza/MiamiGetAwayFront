import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212' }}>
            <AdminSidebar />
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1,
                    p: 3,
                    ml: { sm: '240px' }, // Ancho del sidebar
                    backgroundColor: '#121212',
                    color: '#fff'
                }}
            >
                <Box sx={{ mt: 2 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;
