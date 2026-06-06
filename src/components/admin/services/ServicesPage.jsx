import React, { useState, useEffect } from 'react';
import { Box, Typography, Snackbar, Alert, Button, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import ServiceButtons from './ServiceButtons';
import ServiceTable from './ServiceTable';
import FormDialog from '../dialogs/FormDialog';
import DeleteDialog from '../dialogs/DeleteDialog';
import CarForm from '../../form/CarForm';
import YachtForm from '../../form/YachtForm';
import PropertyForm from '../../form/PropertyForm';
import ApartmentForm from '../apartments/ApartmentForm';
import ImageUploader from '../../images/ImageUploader';
import AddIcon from '@mui/icons-material/Add';

import {
  setSelectedService,
  fetchServices,
  createService,
  updateService,
  deleteService,
  setCurrentItem
} from '../../../redux/serviceSlice';
import {
  fetchAdminApartments,
  setSelectedApartment,
  selectApartmentPagination,
} from '../../../redux/adminApartmentSlice';

const ServicesPage = () => {
  const dispatch = useDispatch();
  const [selectedService, setSelectedServiceLocal] = useState('apartments');
  const { items, status, error, currentItem, pagination: servicesPagination } = useSelector((state) => state.services);
  const adminApartments = useSelector((state) => state.adminApartments);
  const apartmentPagination = useSelector(selectApartmentPagination);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const currentPagination = selectedService === 'apartments'
    ? apartmentPagination
    : (servicesPagination?.[selectedService] ?? null);

  // Estados locales para cada tipo de formulario
  const [car, setCar] = useState(null);
  const [yacht, setYacht] = useState(null);
  const [property, setProperty] = useState(null);

  const handleServiceSelect = (serviceType) => {
    setSelectedServiceLocal(serviceType);
    setPage(0);
    dispatch(setSelectedService(serviceType));
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleEdit = (item) => {
    if (selectedService === 'apartments') {
      // Para apartamentos, usar el adminApartmentSlice
      dispatch(setSelectedApartment(item));
    } else {
      // Para otros servicios, usar la lógica original
      const itemWithDefaults = {
        ...item,
        images: item.images || [],
        unitNumber: item.unitNumber || ''
      };
      
      dispatch(setCurrentItem(itemWithDefaults));
      
      // Configurar el estado local según el tipo de servicio
      if (selectedService === 'cars') {
        setCar(itemWithDefaults);
      } else if (selectedService === 'yachts') {
        setYacht(itemWithDefaults);
      } else {
        setProperty(itemWithDefaults);
      }
      
      setNewImages([]);
    }
    
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
      // Obtener los datos del formulario según el tipo de servicio
      let formData = new FormData();
      let serviceData;
      
      if (selectedService === 'cars') {
        serviceData = car;
      } else if (selectedService === 'yachts') {
        serviceData = yacht;
      } else {
        serviceData = property;
      }

      Object.entries(serviceData).forEach(([key, value]) => {
        if (key !== 'images') {
          // Convertir valores undefined a string vacío
          const valueToSend = value !== undefined ? value : '';
          formData.append(key, valueToSend);
        }
      });

      if (serviceData.images) {
        serviceData.images.forEach(image => {
          if (typeof image === 'string') {
            formData.append('existingImages', image);
          }
        });
      }

      newImages.forEach(image => {
        formData.append('images', image);
      });

      if (serviceData.id) {
        await dispatch(updateService({ 
          serviceType: selectedService, 
          id: serviceData.id, 
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
      setCar(null);
      setYacht(null);
      setProperty(null);
      setNewImages([]);
    } catch (error) {
      console.error('Error al guardar:', error);
      setOpenSnackbar(true);
    }
  };

  const handleCreateNew = () => {
    if (selectedService === 'apartments') {
      // Para apartamentos, limpiar el selectedApartment en adminApartmentSlice
      dispatch(setSelectedApartment(null));
    } else {
      // Para otros servicios, usar la lógica original
      const emptyService = {
        name: '',
        description: '',
        address: '',
        capacity: '',
        bathrooms: '',
        rooms: '',
        price: '',
        unitNumber: '',
        images: []
      };
      
      dispatch(setCurrentItem(emptyService));
      
      if (selectedService === 'cars') {
        setCar({
          brand: '',
          model: '',
          description: '',
          price: '',
          passengers: '',
          images: []
        });
      } else if (selectedService === 'yachts') {
        setYacht({
          name: '',
          description: '',
          capacity: '',
          price: '',
          images: []
        });
      } else {
        setProperty(emptyService);
      }
      
      setNewImages([]);
    }
    
    setDialogOpen(true);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setNewImages(prevImages => [...prevImages, ...files]);
  };

  const handleRemoveImage = (index, isNewImage) => {
    if (isNewImage) {
      // Eliminar una imagen nueva
      setNewImages(prevImages => prevImages.filter((_, i) => i !== index - (getCurrentImages().length)));
    } else {
      // Eliminar una imagen existente
      const updatedServiceImages = [...getCurrentImages()];
      updatedServiceImages.splice(index, 1);
      
      // Actualizar el estado según el tipo de servicio
      if (selectedService === 'cars') {
        setCar({ ...car, images: updatedServiceImages });
      } else if (selectedService === 'yachts') {
        setYacht({ ...yacht, images: updatedServiceImages });
      } else {
        setProperty({ ...property, images: updatedServiceImages });
      }
    }
  };

  const getCurrentImages = () => {
    if (selectedService === 'cars') {
      return car?.images || [];
    } else if (selectedService === 'yachts') {
      return yacht?.images || [];
    } else {
      return property?.images || [];
    }
  };

  const renderForm = () => {
    const currentImages = getCurrentImages();

    const commonFormElements = (
      <>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>Images</Typography>
          <ImageUploader 
            images={currentImages}
            newImages={newImages}
            onImageUpload={handleImageUpload}
            onRemoveImage={handleRemoveImage}
          />
        </Box>
      </>
    );

    switch (selectedService) {
      case 'cars':
        return (
          <>
            <CarForm car={car} setCar={setCar} />
            {commonFormElements}
          </>
        );
      case 'yachts':
        return (
          <>
            <YachtForm yacht={yacht} setYacht={setYacht} />
            {commonFormElements}
          </>
        );
      case 'apartments':
      case 'villas':
        return (
          <>
            <PropertyForm 
              property={property} 
              setProperty={setProperty} 
              type={selectedService}
            />
            {commonFormElements}
          </>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (selectedService) {
      if (selectedService === 'apartments') {
        dispatch(fetchAdminApartments({ page: page + 1, limit: rowsPerPage }));
      } else {
        dispatch(fetchServices({ serviceType: selectedService, page: page + 1, limit: rowsPerPage }));
      }
    }
  }, [selectedService, dispatch, page, rowsPerPage]);

  useEffect(() => {
    const hasError = selectedService === 'apartments' 
      ? adminApartments.error 
      : error && error[selectedService];
      
    if (hasError) {
      setOpenSnackbar(true);
    }
  }, [error, selectedService, adminApartments.error]);

  const getServiceTitle = () => {
    const titles = {
      apartments: 'Apartments',
      cars: 'Cars',
      yachts: 'Yachts',
      villas: 'Villas'
    };
    return titles[selectedService] || 'Services';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Services
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          New {getServiceTitle().slice(0, -1)}
        </Button>
      </Box>
      
      <ServiceButtons onServiceSelect={handleServiceSelect} />
      <ServiceTable
        selectedService={selectedService}
        services={selectedService === 'apartments' ? (adminApartments.apartments || []) : (items[selectedService] || [])}
        status={selectedService === 'apartments' ? adminApartments.status : status[selectedService]}
        error={selectedService === 'apartments' ? adminApartments.error : error[selectedService]}
        pagination={currentPagination}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {selectedService === 'apartments' ? (
        <ApartmentForm
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
      ) : (
        <FormDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleDialogSave}
          title={currentItem?.id ? 'Edit' : 'Create New'}
        >
          {renderForm()}
        </FormDialog>
      )}

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
          {selectedService === 'apartments' ? adminApartments.error : (error && error[selectedService])}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicesPage; 