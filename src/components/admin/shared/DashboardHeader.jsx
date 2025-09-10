import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Tooltip,
  useTheme,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BookIcon as ReservationsIcon, 
  ApartmentIcon, 
  PaymentIcon, 
  PeopleIcon, 
  LogoutIcon,
  DesignServicesIcon
} from './icons';
import MenuIcon from '@mui/icons-material/Menu';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const DashboardHeader = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useDeviceDetection();
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Navegación compartida para escritorio y móvil
  const navigationItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/admin' },
    { text: 'Services', icon: <DesignServicesIcon />, path: '/admin/services' },
    { text: 'Reservations', icon: <ReservationsIcon />, path: '/admin/reservations' },
    { text: 'Apartments', icon: <ApartmentIcon />, path: '/admin/apartments' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/admin/payments' },
    { text: 'Clients', icon: <PeopleIcon />, path: '/admin/users' },
  ];

  // Contenido del drawer para móviles
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Control Panel
        </Typography>
      </Box>
      <Divider />
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton 
              onClick={() => navigate(item.path)}
              selected={
                item.path === '/admin' ? location.pathname === '/admin' : location.pathname.includes(item.path)
              }
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: theme.palette.background.paper,
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
        }}
      >
        <Toolbar>
          {isMobile ? (
            // Versión móvil con menú hamburguesa
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ flexGrow: 1, fontWeight: 'bold' }}
              >
                Control Panel
              </Typography>
            </>
          ) : (
            // Versión de escritorio con botones
            <>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  flexGrow: 0, 
                  mr: 3, 
                  fontWeight: 'bold' 
                }}
              >
                Control Panel
              </Typography>
              
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                {navigationItems.map((item) => (
                  <Button 
                    key={item.text}
                    color="inherit" 
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    sx={{ 
                      mr: 1,
                      borderBottom: item.path === '/admin' 
                        ? location.pathname === '/admin' ? '2px solid white' : 'none'
                        : location.pathname.includes(item.path) ? '2px solid white' : 'none',
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
              
              <Box>
                <Tooltip title="Cerrar sesión">
                  <Button 
                    color="inherit" 
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Tooltip>
              </Box>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Drawer para navegación en móviles */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};


export default DashboardHeader;