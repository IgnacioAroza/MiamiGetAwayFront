import React from 'react';
import { Grid, TextField, Typography, Paper, Box, Divider } from '@mui/material';

const PricingSection = ({ formData, onChange }) => {
    // Manejar cambios específicos para campos numéricos
    const handleNumericChange = (e) => {
        const { name, value } = e.target;        
        // NO forzar conversión a número si el campo está vacío
        // Si está vacío, mantenerlo como cadena vacía para que el usuario pueda borrar el campo
        let processedValue;
        
        if (value === '') {
            processedValue = '';
        } else {
            // Evitar conversiones innecesarias si ya es un número
            const num = parseFloat(value);
            if (isNaN(num)) {
                processedValue = 0;
            } else {
                // Preservar el valor original si es un número válido
                processedValue = num;
            }
        }
        
        // Crear un evento sintético para mantener compatibilidad con el onChange original
        const syntheticEvent = {
            target: {
                name: name,
                value: processedValue
            }
        };
        
        onChange(syntheticEvent);
    };

    // Calcular resumen para mostrar
    const calculateSummary = () => {
        if (formData.nights > 0 && formData.price > 0) {
            const accommodationTotal = formData.nights * formData.price;
            return {
                accommodation: accommodationTotal,
                cleaning: Number(formData.cleaningFee) || 0,
                parking: Number(formData.parkingFee) || 0,
                other: Number(formData.otherExpenses) || 0,
                subtotal: accommodationTotal + Number(formData.cleaningFee) + Number(formData.parkingFee) + Number(formData.otherExpenses),
                taxes: formData.taxes,
                total: formData.totalAmount
            };
        }
        return null;
    };

    const summary = calculateSummary();

    return (
        <>
            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="Price per night"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleNumericChange}
                    disabled={formData.apartmentId !== ''}
                    InputProps={{
                        startAdornment: '$'
                    }}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="Noches"
                    name="nights"
                    type="number"
                    value={formData.nights}
                    disabled={formData.checkInDate && formData.checkOutDate}
                    onChange={onChange}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="Cleaning fee"
                    name="cleaningFee"
                    type="number"
                    value={formData.cleaningFee}
                    onChange={handleNumericChange}
                    InputProps={{
                        startAdornment: '$'
                    }}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="Parking fee"
                    name="parkingFee"
                    type="number"
                    value={formData.parkingFee}
                    onChange={handleNumericChange}
                    InputProps={{
                        startAdornment: '$'
                    }}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="Other expenses"
                    name="otherExpenses"
                    type="number"
                    value={formData.otherExpenses}
                    onChange={handleNumericChange}
                    InputProps={{
                        startAdornment: '$'
                    }}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <TextField
                    fullWidth
                    label="Taxes"
                    name="taxes"
                    type="number"
                    value={formData.taxes}
                    disabled
                    InputProps={{
                        startAdornment: '$'
                    }}
                />
            </Grid>

            {/* Resumen de precios */}
            <Grid item xs={12}>
                {summary && (
                    <Paper elevation={3} sx={{ p: 2, border: '1px solid #2f2f2f', mt: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="primary">
                            Pricing summary
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.primary">
                                Accommodation ({formData.nights} {formData.nights === 1 ? 'night' : 'nights'} x ${formData.price})
                            </Typography>
                            <Typography variant="body2" color="text.primary">${summary.accommodation.toFixed(2)}</Typography>
                        </Box>
                        
                        {summary.cleaning > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.primary">Cleaning fee</Typography>
                                <Typography variant="body2" color="text.primary">${summary.cleaning.toFixed(2)}</Typography>
                            </Box>
                        )}
                        
                        {summary.parking > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.primary">Parking fee</Typography>
                                <Typography variant="body2" color="text.primary">${summary.parking.toFixed(2)}</Typography>
                            </Box>
                        )}
                        
                        {summary.other > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="text.primary">Other expenses</Typography>
                                <Typography variant="body2" color="text.primary">${summary.other.toFixed(2)}</Typography>
                            </Box>
                        )}
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.primary">Subtotal</Typography>
                            <Typography variant="body2" color="text.primary">${summary.subtotal.toFixed(2)}</Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.primary">Taxes (7%)</Typography>
                            <Typography variant="body2" color="text.primary">${summary.taxes.toFixed(2)}</Typography>
                        </Box>
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <Typography variant="body1" color="text.primary" fontWeight="bold">Total</Typography>
                            <Typography variant="body1" color="text.primary" fontWeight="bold">${summary.total.toFixed(2)}</Typography>
                        </Box>
                    </Paper>
                )}
            </Grid>
        </>
    );
};

export default PricingSection; 