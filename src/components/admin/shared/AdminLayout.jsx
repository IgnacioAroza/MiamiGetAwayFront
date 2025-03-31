import React from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import DashboardHeader from './DashboardHeader';
import { ListItemLink } from './ListItemLink';
import { DashboardIcon, BookIcon, ApartmentIcon, PeopleIcon, PaymentIcon, ReviewsIcon } from './icons';

const AdminLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Elementos del menú principal
    const mainListItems = (
        <>
            <ListItemLink to="/admin/dashboard" primary="Dashboard" icon={<DashboardIcon />} />
            <ListItemLink to="/admin/reservations" primary="Reservas" icon={<BookIcon />} />
            <ListItemLink to="/admin/apartments" primary="Apartamentos" icon={<ApartmentIcon />} />
            <ListItemLink to="/admin/users" primary="Clientes" icon={<PeopleIcon />} />
            <ListItemLink to="/admin/payments" primary="Pagos" icon={<PaymentIcon />} />
            <ListItemLink to="/admin/reviews" primary="Reseñas" icon={<ReviewsIcon />} />
        </>
    );

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
