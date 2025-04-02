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

const ServicesPage = () => {
  const dispatch = useDispatch();
  const [selectedService, setSelectedServiceLocal] = useState('apartments');
  const { items, status, error, currentItem } = useSelector((state) => state.services);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  // Estados locales para cada tipo de formulario
  const [car, setCar] = useState(null);
  const [yacht, setYacht] = useState(null);
  const [property, setProperty] = useState(null);

  const handleServiceSelect = (serviceType) => {
    setSelectedServiceLocal(serviceType);
    dispatch(setSelectedService(serviceType));
  };

  const handleEdit = (item) => {
    // Asegurarnos de que estamos preservando el unitNumber en apartamentos
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

      // Para depuración - verificar si tenemos unitNumber
      if (selectedService === 'apartments') {
        console.log("Saving apartment with unitNumber:", serviceData.unitNumber);
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
    // Crear un objeto vacío según el tipo de servicio
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
    } else if (selectedService === 'apartments') {
      setProperty({
        ...emptyService,
        unitNumber: '' // Asegurarnos de que unitNumber esté explícitamente inicializado
      });
    } else {
      setProperty(emptyService);
    }
    
    setNewImages([]);
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
          <Typography variant="h6" gutterBottom>Imágenes</Typography>
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
      dispatch(fetchServices(selectedService));
    }
  }, [selectedService, dispatch]);

  useEffect(() => {
    if (error && error[selectedService]) {
      setOpenSnackbar(true);
    }
  }, [error, selectedService]);

  const getServiceTitle = () => {
    const titles = {
      apartments: 'Apartamentos',
      cars: 'Carros',
      yachts: 'Yates',
      villas: 'Villas'
    };
    return titles[selectedService] || 'Servicios';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Servicios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Nuevo {getServiceTitle().slice(0, -1)}
        </Button>
      </Box>
      
      <ServiceButtons onServiceSelect={handleServiceSelect} />
      <ServiceTable 
        selectedService={selectedService}
        services={items[selectedService] || []}
        status={status[selectedService]}
        error={error[selectedService]}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

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
          {error && error[selectedService]}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServicesPage; 