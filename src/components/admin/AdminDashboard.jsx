import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Box, Snackbar, Alert, Grid, Paper, Typography, Divider, Button, List, ListItem, ListItemText, ListItemIcon, useTheme } from '@mui/material';
import { 
  ShoppingBag as ShoppingBagIcon,
  CalendarToday as CalendarTodayIcon,
  AttachMoney as AttachMoneyIcon,
  Person as PersonIcon,
  Apartment as ApartmentIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

// Componentes
import DashboardCards from './dashboard/DashboardCards';
import ServiceButtons from './services/ServiceButtons';
import ServiceTable from './services/ServiceTable';
import FormDialog from './dialogs/FormDialog';
import DeleteDialog from './dialogs/DeleteDialog';
import AdminReviews from './reviews/AdminReviews';

// Forms
import CarForm from '../form/CarForm';
import YachtForm from '../form/YachtForm';
import PropertyForm from '../form/PropertyForm';
import UserForm from '../form/UserForm';

// Redux actions
import { 
  fetchServices, 
  createService, 
  updateService, 
  deleteService,
  setSelectedService,
  setCurrentItem
} from '../../redux/serviceSlice';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [apartments, setApartments] = useState([]);
  const [buildingNames, setBuildingNames] = useState({});

  // Selectores de Redux
  const { items, status, error, selectedService, currentItem } = useSelector((state) => state.services);
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
    if (selectedService === 'users' && userStatus === 'idle') {
      dispatch(fetchUsers());
    } else if (selectedService && status[selectedService] === 'idle') {
      dispatch(fetchServices(selectedService));
    }
  }, [selectedService, dispatch, status, userStatus]);

  useEffect(() => {
    const hasError = (selectedService === 'users' && userError) || 
                    (selectedService === 'reviews' && reviewError) ||
                    (selectedService && error[selectedService]);
    if (hasError) {
      setOpenSnackbar(true);
    }
  }, [error, userError, reviewError, selectedService]);

  // Handlers
  const handleCardClick = (path) => navigate(path);
  
  const handleServiceSelect = (serviceType) => {
    dispatch(setSelectedService(serviceType));
  };

  const handleCreateNew = () => {
    dispatch(setCurrentItem({
      name: '',
      description: '',
      address: '',
      capacity: '',
      bathrooms: '',
      rooms: '',
      price: '',
      unit_number: '',
      images: []
    }));
    setNewImages([]);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    dispatch(setCurrentItem(selectedService === 'users' ? {...item} : {...item, images: item.images || []}));
    setNewImages([]);
    setDialogOpen(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        await dispatch(deleteService({ 
          serviceType: selectedService, 
          id: itemToDelete.id 
        })).unwrap();
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        setOpenSnackbar(true);
      }
    }
  };

  const handleDialogSave = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(currentItem).forEach(([key, value]) => {
        if (key !== 'images') {
          formData.append(key, value);
        }
      });

      if (currentItem.images) {
        currentItem.images.forEach(image => {
          if (typeof image === 'string') {
            formData.append('existingImages', image);
          }
        });
      }

      newImages.forEach(image => {
        formData.append('images', image);
      });

      if (currentItem.id) {
        await dispatch(updateService({ 
          serviceType: selectedService, 
          id: currentItem.id, 
          data: formData 
        })).unwrap();
      } else {
        await dispatch(createService({ 
          serviceType: selectedService, 
          data: formData 
        })).unwrap();
      }

      setDialogOpen(false);
      dispatch(setCurrentItem(null));
      setNewImages([]);
    } catch (error) {
      setOpenSnackbar(true);
    }
  };

  const renderForm = () => {
    const forms = {
      cars: <CarForm car={currentItem} setCar={(car) => dispatch(setCurrentItem(car))} />,
      yachts: <YachtForm yacht={currentItem} setYacht={(yacht) => dispatch(setCurrentItem(yacht))} />,
      apartments: <PropertyForm property={currentItem} setProperty={(property) => dispatch(setCurrentItem(property))} />,
      villas: <PropertyForm property={currentItem} setProperty={(property) => dispatch(setCurrentItem(property))} />,
      users: <UserForm user={currentItem} setUser={(user) => dispatch(setCurrentItem(user))} />
    };
    return forms[selectedService] || null;
  };

  // Obtener las últimas reservas para mostrar
  const latestReservations = getLatestReservations();

  return (
    <Box sx={{ p: 0 }}>
      {/* Tarjetas de estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Reservas Totales" 
            value={stats.totalReservations} 
            icon={<CalendarTodayIcon />} 
            color="#4fc3f7"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Ingresos" 
            value={`$${stats.totalRevenue.toLocaleString()}`} 
            icon={<AttachMoneyIcon />} 
            color="#66bb6a"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Usuarios" 
            value={stats.totalUsers} 
            icon={<PersonIcon />} 
            color="#ff7043"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Departamentos" 
            value={stats.totalApartments} 
            icon={<ApartmentIcon />} 
            color="#ba68c8"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Reservas recientes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Reservas Recientes</Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/admin/reservations')}
              >
                Ver todas
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {latestReservations.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No hay reservas disponibles" />
                </ListItem>
              ) : (
                latestReservations.map((reservation) => (
                  <ListItem key={reservation.id} sx={{ 
                    borderLeft: `4px solid ${reservation.status === 'confirmed' || reservation.status === 'ON_RENT' ? theme.palette.success.main : theme.palette.warning.main}`,
                    mb: 1,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '4px'
                  }}>
                    <ListItemText
                      primary={reservation.client_name || 'Cliente'}
                      secondary={`${formatDate(reservation.check_in_date)} - ${formatCurrency(reservation.total_amount)}`}
                    />
                    <Typography 
                      variant="body2" 
                      color={reservation.status === 'confirmed' || reservation.status === 'ON_RENT' ? 'success.main' : 'warning.main'}
                    >
                      {reservation.status}
                    </Typography>
                  </ListItem>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Departamentos recientemente alquilados */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Alquileres Recientes</Typography>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => navigate('/admin/apartments')}
              >
                Ver todos
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              {latestReservations.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No hay alquileres disponibles" />
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
      
      <ServiceButtons 
        onServiceSelect={handleServiceSelect}
      />

      {selectedService === 'reviews' ? (
        <AdminReviews />
      ) : (
        <ServiceTable 
          selectedService={selectedService}
          services={items[selectedService] || []}
          status={status[selectedService]}
          error={error[selectedService]}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <FormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleDialogSave}
        title={currentItem?.id ? 'Editar' : 'Crear Nuevo'}
      >
        {renderForm()}
      </FormDialog>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
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
          {(selectedService === 'users' && userError) || 
           (selectedService === 'reviews' && reviewError) ||
           (selectedService && error[selectedService])}
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