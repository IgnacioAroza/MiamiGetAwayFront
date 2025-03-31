import React from 'react';
import {
    Grid,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Card,
    CardMedia,
    Typography,
    Box
} from '@mui/material';

const ApartmentSection = ({ formData, apartments, selectedApartment, onChange }) => {
    // Obtener la URL de la primera imagen o imagen por defecto
    const getApartmentImage = () => {
        if (selectedApartment && selectedApartment.images && selectedApartment.images.length > 0) {
            return selectedApartment.images[0];
        }
        return 'https://via.placeholder.com/150?text=No+Image';
    };

    return (
        <>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Apartamento</InputLabel>
                    <Select
                        name="apartmentId"
                        value={formData.apartmentId}
                        onChange={onChange}
                        label="Apartment"
                    >
                        <MenuItem value="">Select...</MenuItem>
                        {apartments.map((apartment) => (
                            <MenuItem key={apartment.id} value={apartment.id}>
                                {apartment.name} - {apartment.unitNumber}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Mostrar información del apartamento seleccionado */}
            {selectedApartment && (
                <Grid item xs={12} md={6}>
                    <Card sx={{ display: 'flex', height: '100%' }}>
                        <CardMedia
                            component="img"
                            sx={{ width: 120, height: 120, objectFit: 'cover' }}
                            image={getApartmentImage()}
                            alt={selectedApartment.building_name}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', pl: 2, pt: 1 }}>
                            <Typography variant="h6">
                                {selectedApartment.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Unit: {selectedApartment.unitNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Capacity: {selectedApartment.capacity} people
                            </Typography>
                            <Typography variant="body2" color="primary">
                                ${selectedApartment.price} per night
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            )}
        </>
    );
};

export default ApartmentSection; 