import React from 'react';
import {
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardMedia,
    Typography,
    Box
} from '@mui/material';
import { useApartmentImages } from '../../../../hooks/useApartmentImages';

const ApartmentSection = ({ formData, apartments, selectedApartment, onChange }) => {
    const { getApartmentDetails } = useApartmentImages(selectedApartment);
    const apartmentDetails = getApartmentDetails();

    // Manejar cambio de apartamento
    const handleApartmentChange = (event) => {
        const { value } = event.target;
        const apartment = apartments.find(apt => apt.id === parseInt(value));
        
        if (apartment) {
            onChange({
                target: {
                    name: 'apartmentId',
                    value: value
                }
            });
        }
    };

    return (
        <>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Apartment</InputLabel>
                    <Select
                        name="apartmentId"
                        value={formData.apartmentId}
                        onChange={handleApartmentChange}
                        label="Apartment"
                    >
                        <MenuItem value="">Select...</MenuItem>
                        {apartments.map((apartment) => (
                            <MenuItem key={apartment.id} value={apartment.id}>
                                {apartment.name} - Rooms: {apartment.rooms || 'N/A'}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Mostrar información del apartamento seleccionado */}
            {apartmentDetails && (
                <Grid item xs={12} md={6}>
                    <Card sx={{ display: 'flex', height: '100%' }}>
                        <CardMedia
                            component="img"
                            sx={{ width: 120, height: 120, objectFit: 'cover' }}
                            image={apartmentDetails.image}
                            alt={apartmentDetails.alt}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', pl: 2, pt: 1 }}>
                            <Typography variant="h6">
                                {apartmentDetails.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Unit: {apartmentDetails.unitNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Capacity: {apartmentDetails.capacity} people
                            </Typography>
                            <Typography variant="body2" color="primary">
                                ${apartmentDetails.price} per night
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            )}
        </>
    );
};

export default ApartmentSection; 