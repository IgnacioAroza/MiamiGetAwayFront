import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import { ListItemLink } from './ListItemLink';
import { DashboardIcon, BookIcon, ApartmentIcon, PeopleIcon, PaymentIcon, ReviewsIcon } from './icons';

const AdminLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box sx={{ 
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh', 
            backgroundColor: theme.palette.background.default,
            overflow: 'hidden'
        }}>
            <DashboardHeader />
            <Box 
                component="main" 
                sx={{ 
                    flexGrow: 1,
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.primary.main,
                    p: 3,
                    height: 'calc(100vh - 130px)',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                        width: '8px'
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: theme.palette.background.paper
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: '#333',
                        borderRadius: '4px'
                    }
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default AdminLayout;
