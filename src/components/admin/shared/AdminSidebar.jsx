import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box,
    useTheme,
    useMediaQuery,
    Typography,
    Divider
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    BookOnline as BookOnlineIcon,
    Payment as PaymentIcon,
    Apartment as ApartmentIcon,
    Reviews as ReviewsIcon,
    Settings as SettingsIcon,
    People as PeopleIcon,
    LocalOffer as LocalOfferIcon,
    Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const menuItems = [
        { 
            label: 'Dashboard', 
            icon: <DashboardIcon />, 
            path: '/admin' 
        },
        { 
            label: 'Reservations', 
            icon: <BookOnlineIcon />, 
            path: '/admin/reservations' 
        },
        { 
            label: 'Pagos', 
            icon: <PaymentIcon />, 
            path: '/admin/payments' 
        },
        { 
            label: 'Apartamentos', 
            icon: <ApartmentIcon />, 
            path: '/admin/apartments' 
        },
        { 
            label: 'Reseñas', 
            icon: <ReviewsIcon />, 
            path: '/admin/reviews' 
        }
    ];

    const drawerContent = (
        <>
            <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center',
                height: '64px',
                backgroundColor: '#1e1e1e',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
            }}>
                <Typography variant="h6" sx={{ color: '#fff', fontWeight: 'bold' }}>
                    Miami GetAway
                </Typography>
            </Box>
            <Box sx={{ 
                backgroundColor: '#121212', 
                height: '100%', 
                color: '#fff'
            }}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            selected={location.pathname === item.path}
                            sx={{
                                my: 0.5,
                                mx: 1,
                                borderRadius: 1,
                                color: '#fff',
                                '&.Mui-selected': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                    }
                                },
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                }
                            }}
                        >
                            <ListItemIcon sx={{ 
                                color: location.pathname === item.path ? '#fff' : 'rgba(255, 255, 255, 0.7)',
                                minWidth: 40
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.label} 
                                sx={{
                                    '& .MuiListItemText-primary': {
                                        color: location.pathname === item.path ? '#fff' : 'rgba(255, 255, 255, 0.7)'
                                    }
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
                <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
                    <ListItem
                        button
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 1,
                            backgroundColor: '#1e1e1e',
                            color: '#ff1744',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 23, 68, 0.08)'
                            }
                        }}
                    >
                        <ListItemIcon sx={{ color: '#ff1744', minWidth: 40 }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Cerrar Sesión"
                            sx={{
                                '& .MuiListItemText-primary': {
                                    fontWeight: 'medium'
                                }
                            }}
                        />
                    </ListItem>
                </Box>
            </Box>
        </>
    );

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            sx={{
                width: 240,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: 240,
                    boxSizing: 'border-box',
                    backgroundColor: '#121212',
                    borderRight: '1px solid rgba(255, 255, 255, 0.12)'
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};

export default AdminSidebar;
