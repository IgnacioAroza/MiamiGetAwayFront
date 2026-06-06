import React, { Suspense } from 'react';
import { Box, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
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
            height: '100vh',
            backgroundColor: theme.palette.background.default,
        }}>
            <DashboardHeader />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: 0,
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.primary.main,
                    p: 3,
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
                <Suspense fallback={
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <CircularProgress />
                    </Box>
                }>
                    <Outlet />
                </Suspense>
            </Box>
        </Box>
    );
};

export default AdminLayout;
