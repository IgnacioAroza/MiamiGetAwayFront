import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Snackbar, Alert, Grid, Paper, Typography, Divider, Button, List, ListItem, ListItemText, ListItemIcon, useTheme } from '@mui/material';
import { 
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

// Componentes
import DashboardCards from './dashboard/DashboardCards';

// Redux actions
import {
  fetchUsers,
  selectUserCount,
  selectAllUsers
} from '../../redux/userSlice';

import { fetchReservations } from '../../redux/reservationSlice';
import adminApartmentService from '../../services/adminApartmentService';

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Estados locales
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [buildingNames, setBuildingNames] = useState({});

  // Selectores de Redux
  const userStatus = useSelector(state => state.users.status);
  const userError = useSelector(state => state.users.error);
  const reviewError = useSelector(state => state.reviews.error);
  const users = useSelector(selectAllUsers);
  const { reservations } = useSelector((state) => state.reservations);

  const stats = {
    totalUsers: useSelector(selectUserCount),
    totalApartments: apartments.length,
    totalReservations: reservations?.length || 0,
    totalPayments: useSelector(state => state.reservationPayments?.payments?.length || 0),
    totalReviews: useSelector(state => state.reviews?.total || 0),
    totalRevenue: useSelector(state => {
      // Calculamos los ingresos a partir de los pagos
      const payments = state.reservationPayments?.payments || [];
      return payments.reduce((total, payment) => total + (payment.amount || 0), 0);
    })
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(fetchReservations({}));
    loadApartments();
  }, [dispatch]);

  // Cargar apartamentos para obtener los nombres
  const loadApartments = async () => {
    try {
      const apartmentList = await adminApartmentService.getAllApartments();
      setApartments(apartmentList);
      
      // Crear un mapeo de IDs a nombres de edificios
      const namesMap = {};
      apartmentList.forEach(apt => {
        const idKey = String(apt.id);
        // Utilizar building_name y agregar unit_number si está disponible
        const buildingName = apt.building_name || apt.name || 'Sin nombre';
        const unitNumber = apt.unit_number ? ` - Unidad ${apt.unit_number}` : '';
        namesMap[idKey] = buildingName + unitNumber;
      });
      setBuildingNames(namesMap);
    } catch (error) {
      console.error('Error al cargar apartamentos:', error);
    }
  };

  // Obtener las últimas 4 reservas ordenadas por fecha
  const getLatestReservations = () => {
    if (!reservations || reservations.length === 0) return [];
    
    // Ordenar reservas por fecha (más recientes primero)
    return [...reservations]
      .sort((a, b) => new Date(b.created_at || b.check_in_date) - new Date(a.created_at || a.check_in_date))
      .slice(0, 4);
  };

  // Formatear moneda
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Obtener nombre del apartamento
  const getBuildingName = (reservation) => {
    // Ahora las reservas deberían tener directamente el apartment_id
    const apartmentId = reservation.apartment_id;
    
    if (apartmentId) {
      return buildingNames[String(apartmentId)] || 'N/A';
    }
    
    return 'N/A';
  };

  // Effects
  useEffect(() => {
    if (userStatus === 'idle') {
      dispatch(fetchUsers());
    }
  }, [dispatch, userStatus]);

  useEffect(() => {
    const hasError = userError || reviewError;
    if (hasError) {
      setOpenSnackbar(true);
    }
  }, [userError, reviewError]);

  // Handlers
  const handleCardClick = (path) => navigate(path);
  
  // Obtener las últimas reservas
  const latestReservations = getLatestReservations();

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" component="h2" gutterBottom>
              ¡Welcome to your dashboard!
            </Typography>
            <Typography variant="body1" paragraph>
              From here you can manage all aspects of your business.
            </Typography>
            
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
              General statistics
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard 
                  title="Users"
                  value={stats.totalUsers}
                  icon={<PersonIcon />}
                  color={theme.palette.primary.main}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard 
                  title="Reservations"
                  value={stats.totalReservations}
                  icon={<CalendarTodayIcon />}
                  color={theme.palette.success.main}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard 
                  title="Incomes"
                  value={formatCurrency(stats.totalRevenue)}
                  icon={<AttachMoneyIcon />}
                  color={theme.palette.warning.main}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" component="h3">
                Latest reservations
              </Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/admin/reservations')}
              >
                See all
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {latestReservations.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No reservations available" />
                </ListItem>
              ) : (
                latestReservations.map((reservation) => (
                  <ListItem key={reservation.id} sx={{ 
                    mb: 1,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '4px'
                  }}>
                    <ListItemIcon>
                      <ApartmentIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={getBuildingName(reservation)}
                      secondary={`${reservation.client_name || 'Cliente'} · ${formatDate(reservation.check_in_date)} al ${formatDate(reservation.check_out_date)}`}
                    />
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <DashboardCards 
        stats={stats}
        onCardClick={handleCardClick}
      />

      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {userError || reviewError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Componente de tarjeta estadística
const StatCard = ({ title, value, icon, color }) => {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderTop: `4px solid ${color}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: `${color}20`,
            color: color,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" component="div">
          {value}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {title}
      </Typography>
    </Paper>
  );
};

export default AdminDashboard;