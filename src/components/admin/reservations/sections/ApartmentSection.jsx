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
                    <Select
                        name="apartmentId"
                        value={apartmentIdValue}
                        onChange={handleApartmentChange}
                        displayEmpty
                        sx={{
                            backgroundColor: '#333',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 1,
                            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 'none' },
                            '& .MuiSvgIcon-root': { color: '#ccc' },
                            '& .MuiSelect-select': {
                                padding: '12px 16px',
                                color: apartmentIdValue ? '#fff' : '#888',
                            },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    bgcolor: '#333',
                                    '& .MuiMenuItem-root': {
                                        color: '#fff',
                                        '&:hover': { bgcolor: '#444' },
                                        '&.Mui-selected': { bgcolor: '#555' },
                                    },
                                },
                            },
                        }}
                    >
                        <MenuItem value="" disabled>
                            <Box sx={{ color: '#888' }}>Select Apartment</Box>
                        </MenuItem>
                        {apartments.map((apartment) => (
                            <MenuItem key={apartment.id} value={apartment.id.toString()}>
                                {apartment.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>

            {/* Mostrar información del apartamento seleccionado */}
            {apartmentDetails && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Card sx={{ 
                        display: 'flex', 
                        height: '80px',
                        bgcolor: '#444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 2,
                        overflow: 'hidden'
                    }}>
                        <CardMedia
                            component="img"
                            sx={{ width: 80, height: 80, objectFit: 'cover' }}
                            image={apartmentDetails.image}
                            alt={apartmentDetails.alt}
                        />
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            pl: 2, 
                            flex: 1
                        }}>
                            <Typography variant="subtitle1" sx={{ color: '#fff', fontSize: '1.15rem', fontWeight: 500, mb: 0.5 }}>
                                {apartmentDetails.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ccc', fontSize: '0.95rem' }}>
                                {apartmentDetails.unitNumber} • {apartmentDetails.capacity} people • ${apartmentDetails.price} per night
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            )}
        </>
    );
};

export default ApartmentSection;