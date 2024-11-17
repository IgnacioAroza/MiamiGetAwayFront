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
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import Navbar from '../NavBar';
import CarForm from '../form/CarForm';
import YachtForm from '../form/YachtForm';
import PropertyForm from '../form/PropertyForm';
import UserForm from '../form/UserForm';
import ImageUploader from '../images/ImageUploader';
import AdminReviews from '../admin/AdminReviews';

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

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin');
    }
  }, [navigate]);

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
    dispatch(setCurrentItem(selectedService === 'users' ? {} : { images: [] }));
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
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.firstName}</TableCell>
                    <TableCell>{user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
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

  return (
    <Box sx={{ 
      flexGrow: 1, 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      <Navbar 
        selectedService={selectedService}
        onServiceSelect={handleServiceSelect}
        onLogout={handleLogout}
      />
     <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 3
      }}>
        <Container maxWidth="xl">
          {selectedService && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  {selectedService.charAt(0).toUpperCase() + selectedService.slice(1)}
                </Typography>
                {selectedService !== 'users' && (
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />} 
                    onClick={handleCreateNew}
                  >
                    Create New
                  </Button>
                )}
              </Box>
              <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                {renderContent()}
              </Paper>
            </>
          )}
        </Container>
      </Box>
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <form onSubmit={handleDialogSave}>
          <DialogTitle>{currentItem?.id ? 'Edit' : 'Create'} {selectedService}</DialogTitle>
          <DialogContent>
            {currentItem && renderForm()}
            {selectedService !== 'users' && (
              <ImageUploader 
                images={currentItem?.images || []}
                newImages={newImages}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => {
        setOpenSnackbar(false);
        if (selectedService === 'users') {
          dispatch(clearUserError());
        } else if (selectedService === 'reviews') {
          dispatch(clearReviewError());
        } else if(selectedService) {
          dispatch(clearServiceError(selectedService));
        }
      }}>
        <Alert onClose={() => {
          setOpenSnackbar(false);
          if (selectedService === 'users') {
            dispatch(clearUserError());
          } else if (selectedService === 'reviews') {
            dispatch(clearReviewError());
          } else if (selectedService) {
            dispatch(clearServiceError(selectedService));
          }
        }} severity="error" sx={{ width: '100%' }}>
          {selectedService === 'users' 
            ? userError 
            : (selectedService === 'reviews' 
              ? reviewError 
              : (selectedService && error[selectedService]))}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;