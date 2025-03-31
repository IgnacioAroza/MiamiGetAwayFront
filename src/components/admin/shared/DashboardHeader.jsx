import React from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Typography, 
  Button, 
  Tooltip,
  useTheme
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BookIcon as ReservationsIcon, 
  ApartmentIcon, 
  PaymentIcon, 
  PeopleIcon, 
  LogoutIcon 
} from './icons';

const DashboardHeader = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  // Stats de ejemplo - en producción vendrían del estado de Redux
  const stats = {
    onRent: 4,
    getting: 5,
    booked: 0,
    overbook: 4,
    returning: 0,
    overdue: 1,
    pending: 0,
    noShow: 0
  };

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
            <Button 
              color="inherit" 
              startIcon={<HomeIcon />}
              onClick={() => navigate('/admin')}
              sx={{ 
                mr: 1,
                borderBottom: location.pathname === '/admin' ? '2px solid white' : 'none',
              }}
            >
              Home
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<ReservationsIcon />}
              onClick={() => navigate('/admin/reservations')}
              sx={{ 
                mr: 1,
                borderBottom: location.pathname.includes('/admin/reservations') ? '2px solid white' : 'none',
              }}
            >
              Reservas
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<ApartmentIcon />}
              onClick={() => navigate('/admin/apartments')}
              sx={{ 
                mr: 1,
                borderBottom: location.pathname.includes('/admin/apartments') ? '2px solid white' : 'none',
              }}
            >
              Apartamentos
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<PaymentIcon />}
              onClick={() => navigate('/admin/payments')}
              sx={{ 
                mr: 1,
                borderBottom: location.pathname.includes('/admin/payments') ? '2px solid white' : 'none',
              }}
            >
              Pagos
            </Button>
            
            <Button 
              color="inherit" 
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/admin/users')}
              sx={{ 
                mr: 1,
                borderBottom: location.pathname.includes('/admin/users') ? '2px solid white' : 'none',
              }}
            >
              Usuarios
            </Button>
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
        </Toolbar>
      </AppBar>
    </>
  );
};


export default DashboardHeader; 