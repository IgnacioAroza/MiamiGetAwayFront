import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  People as PeopleIcon,
  Apartment as ApartmentIcon,
  BookOnline as BookOnlineIcon,
  Payment as PaymentIcon,
  Reviews as ReviewsIcon,
} from '@mui/icons-material';

import Navbar from '../NavBar';
import CarForm from '../form/CarForm';
import YachtForm from '../form/YachtForm';
import PropertyForm from '../form/PropertyForm';
import UserForm from '../form/UserForm';
import ImageUploader from '../images/ImageUploader';
import AdminReviews from './reviews/AdminReviews';

import { 
  fetchServices, 
  createService, 
  updateService, 
  deleteService,
  setSelectedService,
  setCurrentItem,
  clearError as clearServiceError
} from '../../redux/serviceSlice';

import {
  fetchUsers,
  clearError as clearUserError,
  selectUserCount,
  selectUserInfo
} from '../../redux/userSlice';

import {
  clearError as clearReviewError
} from '../../redux/reviewSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, status, error, selectedService, currentItem } = useSelector((state) => state.services);
  const userCount = useSelector(selectUserCount);
  const users = useSelector(selectUserInfo);
  const userStatus = useSelector(state => state.users.status);
  const userError = useSelector(state => state.users.error);
  const reviewError = useSelector(state => state.reviews.error);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Aquí puedes agregar los selectores que necesites de Redux
  const totalUsers = useSelector(state => state.users?.total || 0);
  const totalApartments = useSelector(state => state.adminApartments?.apartments?.length || 0);
  const totalReservations = useSelector(state => state.reservations?.reservations?.length || 0);
  const totalPayments = useSelector(state => state.reservationPayments?.payments?.length || 0);
  const totalReviews = useSelector(state => state.reviews?.total || 0);

  const dashboardItems = [
    {
      title: 'Usuarios',
      count: totalUsers,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: '#1976d2',
      path: '/admin'
    },
    {
      title: 'Apartamentos',
      count: totalApartments,
      icon: <ApartmentIcon sx={{ fontSize: 40 }} />,
      color: '#2e7d32',
      path: '/admin/apartments'
    },
    {
      title: 'Reservaciones',
      count: totalReservations,
      icon: <BookOnlineIcon sx={{ fontSize: 40 }} />,
      color: '#ed6c02',
      path: '/admin/reservations'
    },
    {
      title: 'Pagos',
      count: totalPayments,
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: '#9c27b0',
      path: '/admin/payments'
    },
    {
      title: 'Reseñas',
      count: totalReviews,
      icon: <ReviewsIcon sx={{ fontSize: 40 }} />,
      color: '#d32f2f',
      path: '/admin/reviews'
    }
  ];

  useEffect(() => {
    if (selectedService === 'users' && userStatus === 'idle') {
      dispatch(fetchUsers());
    } else if (selectedService && status[selectedService] === 'idle') {
      dispatch(fetchServices(selectedService));
    }
  }, [selectedService, dispatch, status, userStatus]);

  useEffect(() => {
    if ((selectedService === 'users' && userError) || 
    (selectedService === 'reviews' && reviewError) ||
    (selectedService && error[selectedService])) {
      setOpenSnackbar(true);
    }
  }, [error, userError, reviewError, selectedService]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin');
  };

  const handleServiceSelect = (serviceType) => {
    dispatch(setSelectedService(serviceType));
  };

  const handleCreateNew = () => {
    const initialState = {
      name: '',
      description: '',
      address: '',
      capacity: '',
      bathrooms: '',
      rooms: '',
      price: '',
      images: []
    };
    dispatch(setCurrentItem(initialState));
    setNewImages([]);
    setDialogOpen(true);
  };

  const handleEdit = (item) => {
    dispatch(setCurrentItem(selectedService === 'users' ? {...item} : {...item, images: item.images || []}));
    setNewImages([]);
    setDialogOpen(true);
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      try {
        if (selectedService === 'users') {
          await dispatch(deleteUser(itemToDelete.id)).unwrap();
        } else {
          await dispatch(deleteService({ serviceType: selectedService, id: itemToDelete.id })).unwrap();
        }
        setDeleteDialogOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error('Error deleting item:', error);
        setOpenSnackbar(true);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleDialogClose = (event) => {
    event.preventDefault();
    setDialogOpen(false);
    dispatch(setCurrentItem(null));
    setNewImages([]);
  };

  const handleDialogSave = async (event) => {
    event.preventDefault();
    try {
      if (selectedService === 'users') {
        console.log('User data:', currentItem);
      } else {
        const formData = new FormData();
        Object.keys(currentItem).forEach(key => {
          if (key !== 'images') {
            formData.append(key, currentItem[key]);
          }
        });
        
        if (currentItem.images) {
          currentItem.images.forEach((image, index) => {
            if (typeof image === 'string') {
              formData.append('existingImages', image);
            }
          });
        }
    
        newImages.forEach((image, index) => {
          formData.append('images', image);
        });
    
        if (currentItem.id) {
          await dispatch(updateService({ serviceType: selectedService, id: currentItem.id, data: formData })).unwrap();
        } else {
          await dispatch(createService({ serviceType: selectedService, data: formData })).unwrap();
        }
      }
  
      setDialogOpen(false);
      dispatch(setCurrentItem(null));
      setNewImages([]);
    } catch (error) {
      console.error('Error saving item:', error);
      setOpenSnackbar(true);
    }
  };

  const handleImageUpload = (event) => {
    setNewImages([...newImages, ...Array.from(event.target.files)]);
  };

  const handleRemoveImage = (index, isNewImage) => {
    if (isNewImage) {
      setNewImages(newImages.filter((_, i) => i !== index));
    } else {
      dispatch(setCurrentItem({
        ...currentItem,
        images: currentItem.images.filter((_, i) => i !== index)
      }));
    }
  };

  const renderForm = () => {
    switch(selectedService) {
      case 'cars':
        return <CarForm car={currentItem} setCar={(car) => dispatch(setCurrentItem(car))} />;
      case 'yachts':
        return <YachtForm yacht={currentItem} setYacht={(yacht) => dispatch(setCurrentItem(yacht))} />;
      case 'apartments':
      case 'villas':
        return <PropertyForm property={currentItem} setProperty={(property) => dispatch(setCurrentItem(property))} />;
      case 'users':
        return <UserForm user={currentItem} setUser={(user) => dispatch(setCurrentItem(user))} />;
      default:
        return null;
    }
  };

  const renderTableHeaders = () => {
    switch(selectedService) {
      case 'cars':
        return (
          <TableRow>
            <TableCell>Brand</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Images</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        );
      case 'yachts':
        return (
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Images</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        );
      case 'apartments':
      case 'villas':
        return (
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Capacity</TableCell>
            <TableCell>Bathrooms</TableCell>
            <TableCell>Bedrooms</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Images</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (service) => {
    switch(selectedService) {
      case 'cars':
        return (
          <TableRow key={service.id}>
            <TableCell>{service.brand}</TableCell>
            <TableCell>{service.model}</TableCell>
            <TableCell>{service.description}</TableCell>
            <TableCell>${service.price}</TableCell>
            <TableCell>{service.images ? service.images.length : 0} images</TableCell>
            <TableCell>
              <Button startIcon={<EditIcon />} onClick={() => handleEdit(service)}>Edit</Button>
              <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(service)}>Delete</Button>
            </TableCell>
          </TableRow>
        );
      case 'yachts':
        return (
          <TableRow key={service.id}>
            <TableCell>{service.name}</TableCell>
            <TableCell>{service.description}</TableCell>
            <TableCell>{service.capacity}</TableCell>
            <TableCell>${service.price}</TableCell>
            <TableCell>{service.images ? service.images.length : 0} images</TableCell>
            <TableCell>
              <Button startIcon={<EditIcon />} onClick={() => handleEdit(service)}>Edit</Button>
              <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(service)}>Delete</Button>
            </TableCell>
          </TableRow>
        );
      case 'apartments':
      case 'villas':
        return (
          <TableRow key={service.id}>
            <TableCell>{service.name}</TableCell>
            <TableCell>{service.description}</TableCell>
            <TableCell>{service.address}</TableCell>
            <TableCell>{service.capacity}</TableCell>
            <TableCell>{service.bathrooms}</TableCell>
            <TableCell>{service.rooms}</TableCell>
            <TableCell>${service.price}</TableCell>
            <TableCell>{service.images ? service.images.length : 0} images</TableCell>
            <TableCell>
              <Button startIcon={<EditIcon />} onClick={() => handleEdit(service)}>Edit</Button>
              <Button startIcon={<DeleteIcon />} onClick={() => handleDeleteClick(service)}>Delete</Button>
            </TableCell>
          </TableRow>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (selectedService === 'users') {
      if (userStatus === 'loading') {
        return (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        );
      }

      if (userStatus === 'failed') {
        return (
          <Typography color="error" align="center">
            Error: {userError}
          </Typography>
        );
      }

      return (
        <>
          <Typography variant="h6" gutterBottom>Total Users: {userCount}</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell>{user.city}</TableCell>
                    <TableCell>{user.country}</TableCell>
                    <TableCell>{user.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      );
    }

    if (selectedService === 'reviews') {
      return <AdminReviews />;
    }

    const services = items[selectedService] || [];

    if (status[selectedService] === 'loading') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (status[selectedService] === 'failed') {
      return (
        <Typography color="error" align="center">
          Error: {error[selectedService]}
        </Typography>
      );
    }

    if (services.length === 0) {
      return <Typography align="center">No items found.</Typography>;
    }

    return (
      <TableContainer component={Paper}>
        <Table size='small'>
          <TableHead>
            {renderTableHeaders()}
          </TableHead>
          <TableBody>
            {services.map((service) => renderTableRow(service))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const handleCardClick = (path) => {
    navigate(path);
  };

  const renderDashboard = () => (
    <Box sx={{ backgroundColor: '#121212', minHeight: '100vh', p: 3 }}>
      <Container maxWidth="xl" sx={{ mx: 'auto', mt: 4 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {dashboardItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.title}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  backgroundColor: '#1e1e1e',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)'
                  }
                }}
                onClick={() => handleCardClick(item.path)}
              >
                <CardContent>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      color: '#fff'
                    }}
                  >
                    <Box>
                      <Typography variant="h6" component="div" sx={{ color: '#fff' }}>
                        {item.title}
                      </Typography>
                      <Typography variant="h3" component="div" sx={{ mt: 2, fontWeight: 'bold', color: '#fff' }}>
                        {item.count}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        backgroundColor: `${item.color}15`,
                        borderRadius: '50%',
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {React.cloneElement(item.icon, { sx: { color: item.color, fontSize: 40 } })}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sección de servicios */}
        <Paper sx={{ p: 3, backgroundColor: '#1e1e1e', maxWidth: '100%', overflow: 'auto' }}>
          <Typography variant="h5" gutterBottom sx={{ color: '#fff', mb: 3 }}>
            Servicios
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {['cars', 'yachts', 'apartments', 'villas'].map((service) => (
              <Grid item xs={12} sm={6} md={3} key={service}>
                <Button
                  fullWidth
                  variant={selectedService === service ? 'contained' : 'outlined'}
                  onClick={() => handleServiceSelect(service)}
                  sx={{ 
                    textTransform: 'capitalize',
                    color: '#fff',
                    borderColor: selectedService === service ? 'transparent' : '#fff',
                    backgroundColor: selectedService === service ? 'rgba(255,255,255,0.12)' : 'transparent',
                    '&:hover': {
                      borderColor: '#fff',
                      backgroundColor: selectedService === service ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)'
                    }
                  }}
                >
                  {service}
                </Button>
              </Grid>
            ))}
          </Grid>

          {/* Contenido del servicio seleccionado */}
          {selectedService && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="h6" sx={{ color: '#fff' }}>
                  {selectedService.charAt(0).toUpperCase() + selectedService.slice(1)}
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />} 
                  onClick={handleCreateNew}
                  sx={{
                    backgroundColor: '#2196f3',
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#1976d2'
                    }
                  }}
                >
                  Crear Nuevo
                </Button>
              </Box>
              <Box sx={{ overflowX: 'auto' }}>
                {renderContent()}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Estadísticas recientes */}
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#1e1e1e' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Reservaciones Recientes
              </Typography>
              {/* Contenido de reservaciones recientes */}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, backgroundColor: '#1e1e1e' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Últimos Pagos
              </Typography>
              {/* Contenido de pagos recientes */}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Mantener los diálogos existentes */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>
          {currentItem?.id ? 'Editar' : 'Crear Nuevo'} {selectedService?.charAt(0).toUpperCase() + selectedService?.slice(1)}
        </DialogTitle>
        <form onSubmit={handleDialogSave}>
          <DialogContent>
            {renderForm()}
            {selectedService !== 'users' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: '#fff' }}>
                  Imágenes
                </Typography>
                <ImageUploader
                  images={currentItem?.images || []}
                  newImages={newImages}
                  onUpload={handleImageUpload}
                  onRemove={handleRemoveImage}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} sx={{ color: '#fff' }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: {
            backgroundColor: '#1e1e1e',
            color: '#fff'
          }
        }}
      >
        <DialogTitle sx={{ color: '#fff' }}>
          Confirmar eliminación
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'rgba(255,255,255,0.7)' }}>
            ¿Está seguro que desea eliminar este elemento? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} sx={{ color: '#fff' }}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

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

  return renderDashboard();
};

export default AdminDashboard;