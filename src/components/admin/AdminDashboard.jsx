import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Snackbar, Alert, Grid, Paper, Typography, Divider, Button, List, ListItem, ListItemText, ListItemIcon, useTheme, Tabs, Tab } from '@mui/material';
import { 
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  TrendingUp as TrendingUpIcon,
  Summarize as SummarizeIcon
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useMonthlySummary } from '../../hooks/useMonthlySummary';

// Componentes
import DashboardCards from './dashboard/DashboardCards';
import MonthlySummary from './dashboard/MonthlySummary';

// Redux actions
import {
  fetchUsers,
  selectUserCount,
  selectAllUsers
} from '../../redux/userSlice';

import { fetchReservations } from '../../redux/reservationSlice';
import { fetchAllPayments } from '../../redux/reservationPaymentSlice';
import { fetchReviews } from '../../redux/reviewSlice';
import adminApartmentService from '../../services/adminApartmentService';

const AdminDashboard = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

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
  const payments = useSelector((state) => state.reservationPayments.payments);
  const reviews = useSelector((state) => state.reviews.items);

  // Usar el hook de resumen mensual
  const { 
    currentSummary,
    selectedMonth,
    selectedYear,
    handleMonthChange,
    handleYearChange
  } = useMonthlySummary();

  // Formatear moneda
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '$0.00';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Calcular ingresos totales
  const calculateTotalRevenue = (payments) => {
    if (!Array.isArray(payments)) return 0;
    
    return payments.reduce((total, payment) => {
      const amount = parseFloat(payment?.amount || 0);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
  };

  const stats = {
    totalUsers: useSelector(selectUserCount),
    totalApartments: apartments.length,
    totalReservations: reservations?.length || 0,
    totalPayments: payments?.length || 0,
    totalReviews: reviews?.length || 0,
    totalRevenue: calculateTotalRevenue(payments)
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    dispatch(fetchReservations({}));
    dispatch(fetchAllPayments());
    dispatch(fetchReviews());
    loadApartments();
  }, [dispatch]);

  // Cargar apartamentos para obtener los nombres
  const loadApartments = async () => {
    try {
      const apartmentList = await adminApartmentService.getAllApartments();
      setApartments(apartmentList);
      
      const namesMap = {};
      apartmentList.forEach(apt => {
        const idKey = String(apt.id);
        const buildingName = apt.building_name || apt.name || 'Sin nombre';
        const unitNumber = apt.unit_number ? ` - Unidad ${apt.unit_number}` : '';
        namesMap[idKey] = buildingName + unitNumber;
      });
      setBuildingNames(namesMap);
    } catch (error) {
      console.error('Error al cargar apartamentos:', error);
    }
  };

  // Obtener las últimas 3 reservas ordenadas por fecha
  const getLatestReservations = () => {
    if (!reservations || reservations.length === 0) return [];
    
    return [...reservations]
      .sort((a, b) => new Date(b.created_at || b.check_in_date) - new Date(a.created_at || a.check_in_date))
      .slice(0, 3);
  };

  // Obtener nombre del apartamento
  const getBuildingName = (reservation) => {
    const apartmentId = reservation.apartment_id;
    return apartmentId ? buildingNames[String(apartmentId)] || 'N/A' : 'N/A';
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
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Obtener las últimas reservas
  const latestReservations = getLatestReservations();

  // Procesar datos para el gráfico usando los datos del resumen
  const reservationTrends = useMemo(() => {
    if (!reservations || reservations.length === 0) return [];

    // Obtener mes actual y crear fecha base
    const now = new Date();

    // Crear array con mes anterior, actual y siguiente
    const monthsData = [
      { 
        date: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        isCurrent: false,
        label: 'anterior'
      },
      { 
        date: new Date(now.getFullYear(), now.getMonth(), 1),
        isCurrent: true,
        label: 'actual'
      },
      { 
        date: new Date(now.getFullYear(), now.getMonth() + 1, 1),
        isCurrent: false,
        label: 'siguiente'
      }
    ];

    // Agrupar reservas por mes
    const monthlyData = {};
    
    // Inicializar los 3 meses con 0 reservas
    monthsData.forEach(({ date, isCurrent }) => {
      const monthKey = date.toISOString().slice(0, 7);
      monthlyData[monthKey] = {
        date: date,
        month: monthKey,
        reservations: 0,
        revenue: 0,
        isCurrentMonth: isCurrent
      };
    });

    // Contar reservas y sumar ingresos por mes
    reservations.forEach(reservation => {
      // Usar siempre la fecha de check-in para las estadísticas
      const checkInDate = new Date(reservation.check_in_date);
      const monthYear = checkInDate.toISOString().slice(0, 7);
      
      if (monthlyData[monthYear]) {
        monthlyData[monthYear].reservations++;
        const price = parseFloat(reservation.total_amount || reservation.total_price || 0);
        monthlyData[monthYear].revenue += isNaN(price) ? 0 : price;
      }
    });

    // Convertir a array y ordenar por fecha
    const dataArray = Object.values(monthlyData)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    return dataArray.map((item) => {
      const prevMonth = dataArray[dataArray.indexOf(item) - 1];
      let percentageChange = null;

      if (prevMonth) {
        if (prevMonth.reservations === 0 && item.reservations > 0) {
          percentageChange = 'NEW';
        } else if (prevMonth.reservations === 0 && item.reservations === 0) {
          percentageChange = 'NO DATA';
        } else if (item.reservations === 0) {
          percentageChange = '-100.0';
        } else {
          const change = ((item.reservations - prevMonth.reservations) / prevMonth.reservations * 100).toFixed(1);
          percentageChange = change;
        }
      }

      return {
        month: item.date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        }),
        reservations: item.reservations,
        revenue: item.revenue.toFixed(2),
        percentageChange: percentageChange,
        isCurrentMonth: item.isCurrentMonth
      };
    });
  }, [reservations]);

  // Función personalizada para el tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'background.paper',
            p: 1.5,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 1
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {label} {data.isCurrentMonth ? '(Current)' : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total Bookings: <strong>{data.reservations}</strong>
          </Typography>
          {parseFloat(data.revenue) > 0 && (
            <Typography variant="body2" color="text.secondary">
              Revenue: <strong>${data.revenue}</strong>
            </Typography>
          )}
          {data.percentageChange && (
            <Typography 
              variant="body2" 
              color={data.percentageChange === 'NO DATA' ? 'text.secondary' :
                     data.percentageChange === 'NEW' ? 'success.main' :
                     parseFloat(data.percentageChange) >= 0 ? 'success.main' : 'error.main'}
            >
              {data.percentageChange === 'NO DATA' ? 'No data available' :
               data.percentageChange === 'NEW' ? 'New bookings!' :
               parseFloat(data.percentageChange) >= 0 ? 
                  `↑ ${data.percentageChange}%` : 
                  `↓ ${Math.abs(parseFloat(data.percentageChange))}%`} vs prev month
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 3 }}
        indicatorColor="primary"
        textColor="primary"
      >
        <Tab 
          icon={<TrendingUpIcon />} 
          label="Overview" 
          iconPosition="start" 
        />
        <Tab 
          icon={<SummarizeIcon />} 
          label="Monthly Summary" 
          iconPosition="start" 
        />
      </Tabs>

      {activeTab === 0 ? (
        <>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  Booking Trends
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={reservationTrends}
                      margin={{
                        top: 5,
                        right: 20,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                        domain={[0, 'auto']}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="reservations"
                        stroke={theme.palette.primary.main}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        name="Reservations"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5" component="h2">
                    Latest Bookings
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
                        borderRadius: '4px',
                        '&:last-child': { mb: 0 }
                      }}>
                        <ListItemIcon>
                          <ApartmentIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={getBuildingName(reservation)}
                          secondary={`${reservation.client_name || 'Client'} · ${formatDate(reservation.check_in_date)} to ${formatDate(reservation.check_out_date)}`}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <DashboardCards 
                stats={stats}
                onCardClick={handleCardClick}
              />
            </Grid>
          </Grid>
        </>
      ) : (
        <MonthlySummary />
      )}

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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
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
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography 
          variant="h5" 
          component="div" 
          sx={{ 
            wordBreak: 'break-word',
            fontSize: {
              xs: '1.2rem',
              sm: '1.5rem',
              md: value.toString().length > 8 ? '1.8rem' : '2rem'
            },
            lineHeight: 1.2,
            fontWeight: 600
          }}
        >
          {value}
        </Typography>
      </Box>
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          mt: 'auto',
          fontSize: '0.9rem'
        }}
      >
        {title}
      </Typography>
    </Paper>
  );
};

export default AdminDashboard;