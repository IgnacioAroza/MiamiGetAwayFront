import React, { useState, useEffect } from 'react';
import {
    Grid,
    TextField,
    MenuItem,
    Typography,
    Divider,
    Box,
    FormControl,
    InputLabel,
    Select,
    FormControlLabel,
    Checkbox,
    Button
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useDispatch, useSelector } from 'react-redux';
import { createReservation, updateReservation } from '../../../redux/reservationSlice';

const ReservationForm = ({ initialData }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        // Datos del apartamento
        apartmentId: '',
        buildingName: '',
        unitNumber: '',
        
        // Datos del cliente
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        
        // Fechas
        checkInDate: null,
        checkOutDate: null,
        
        // Precios base
        pricePerNight: 0,
        nights: 0,
        cleaningFee: 0,
        
        // Extras
        parkingFee: 0,
        otherExpenses: 0,
        
        // Depósito
        securityDeposit: 0,
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    // Manejar cambios en el formulario
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Manejar cambios en las fechas
    const handleDateChange = (name) => (date) => {
        setFormData(prev => ({
            ...prev,
            [name]: date
        }));
    };

    // Efecto para calcular noches cuando cambian las fechas
    useEffect(() => {
        if (formData.checkInDate && formData.checkOutDate) {
            const nights = Math.ceil(
                (formData.checkOutDate - formData.checkInDate) / (1000 * 60 * 60 * 24)
            );
            setFormData(prev => ({
                ...prev,
                nights: nights > 0 ? nights : 0
            }));
        }
    }, [formData.checkInDate, formData.checkOutDate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (initialData) {
            dispatch(updateReservation({ id: initialData.id, reservationData: formData }));
        } else {
            dispatch(createReservation(formData));
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box component="form" onSubmit={handleSubmit} p={3}>
                <Grid container spacing={3}>
                    {/* Sección de Apartamento */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Información del Apartamento
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Apartment</InputLabel>
                            <Select
                                name="apartmentId"
                                value={formData.apartmentId}
                                onChange={handleChange}
                                label="Apartment"
                            >
                                <MenuItem value="">Seleccionar...</MenuItem>
                                {/* Aquí irán los apartamentos disponibles */}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Sección de Fechas */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Reservation Dates
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <DateTimePicker
                            label="Check-in"
                            value={formData.checkInDate}
                            onChange={handleDateChange('checkInDate')}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <DateTimePicker
                            label="Check-out"
                            value={formData.checkOutDate}
                            onChange={handleDateChange('checkOutDate')}
                            renderInput={(params) => <TextField {...params} fullWidth />}
                        />
                    </Grid>

                    {/* Sección de Cliente */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Client Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Client Name"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            name="clientEmail"
                            type="email"
                            value={formData.clientEmail}
                            onChange={handleChange}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Phone"
                            name="clientPhone"
                            value={formData.clientPhone}
                            onChange={handleChange}
                        />
                    </Grid>

                    {/* Sección de Precios y Extras */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Prices and Extras
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Price per Night"
                            name="pricePerNight"
                            type="number"
                            value={formData.pricePerNight}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: '$'
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Cleaning Fee"
                            name="cleaningFee"
                            type="number"
                            value={formData.cleaningFee}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: '$'
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Security Deposit"
                            name="securityDeposit"
                            type="number"
                            value={formData.securityDeposit}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: '$'
                            }}
                        />
                    </Grid>

                    {/* Botones de Acción */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button variant="outlined" color="secondary">
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary">
                                Create Reservation
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default ReservationForm;
