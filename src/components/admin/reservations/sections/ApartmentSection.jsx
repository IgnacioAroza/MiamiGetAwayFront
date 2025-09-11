import React, { useMemo } from 'react';
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

    // Memorizar los detalles del apartamento para evitar cálculos innecesarios
    const apartmentDetails = useMemo(() => getApartmentDetails(), [getApartmentDetails]);

    // Manejar cambio de apartamento
    const handleApartmentChange = (event) => {
        const { value } = event.target;
        const apartment = apartments.find(apt => apt.id === parseInt(value));
        console.log('depto seleccionado:', apartment);

        if (apartment) {
            onChange({
                target: {
                    name: 'apartmentId',
                    value: value
                }
            });
        } else {
            onChange({
                target: {
                    name: 'apartmentId',
                    value: '' // Restablecer a valor predeterminado si no coincide
                }
            });
        }
    };

    // Validar el valor inicial de apartmentId
    const isValidApartmentId = apartments.some(apt => apt.id === parseInt(formData.apartmentId));
    const apartmentIdValue = isValidApartmentId ? formData.apartmentId : '';

    return (
        <>
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel sx={{ color: '#ccc' }}>Select Apartment</InputLabel>
                    <Select
                        name="apartmentId"
                        value={apartmentIdValue}
                        onChange={handleApartmentChange}
                        label="Select Apartment"
                        sx={{
                            backgroundColor: '#1a1a1a',
                            color: '#fff',
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' },
                            '& .MuiSvgIcon-root': { color: '#ccc' },
                        }}
                    >
                        <MenuItem value="">Select...</MenuItem>
                        {apartments.map((apartment) => (
                            <MenuItem key={apartment.id} value={apartment.id.toString()}>
                                {apartment.name} - Rooms: {apartment.rooms === 0 ? 0 : apartment.rooms || 'N/A'}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Mostrar información del apartamento seleccionado */}
            {apartmentDetails && (
                <Grid item xs={12}>
                    <Card sx={{ 
                        display: 'flex', 
                        height: '120px',
                        bgcolor: '#1a1a1a',
                        color: '#fff',
                        border: '1px solid #555'
                    }}>
                        <CardMedia
                            component="img"
                            sx={{ width: 120, height: 120, objectFit: 'cover' }}
                            image={apartmentDetails.image}
                            alt={apartmentDetails.alt}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', pl: 2, pt: 1 }}>
                            <Typography variant="h6" sx={{ color: '#fff' }}>
                                {apartmentDetails.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ccc' }}>
                                Unit: {apartmentDetails.unitNumber}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ccc' }}>
                                Capacity: {apartmentDetails.capacity} people
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#90caf9' }}>
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