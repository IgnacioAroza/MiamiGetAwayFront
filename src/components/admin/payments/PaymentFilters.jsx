import React, { useState } from 'react';
import {
    Box,
    Grid,
    TextField,
    MenuItem,
    Button,
    Paper,
    Typography,
    IconButton,
    Tooltip,
    Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Clear as ClearIcon, FilterAlt as FilterIcon } from '@mui/icons-material';
import { formatDateToString } from '../../../utils/dateUtils';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const PaymentFilters = ({ onApplyFilters, onClearFilters }) => {
    const { isMobile } = useDeviceDetection();
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        paymentMethod: '',
        reservationId: '',
        q: '', // Búsqueda general por nombre o apellido
        clientEmail: ''
    });

    const paymentMethodOptions = [
        { value: '', label: 'All Methods' },
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Card' },
        { value: 'transfer', label: 'Transfer' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'zelle', label: 'Zelle' },
        { value: 'stripe', label: 'Stripe' },
        { value: 'other', label: 'Other' },
    ];

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilters = () => {
        const formattedFilters = {
            ...filters,
            startDate: filters.startDate ? formatDateToString(filters.startDate, false) : null, // Solo fecha, sin hora
            endDate: filters.endDate ? formatDateToString(filters.endDate, false) : null, // Solo fecha, sin hora
        };
        
        // Limpiar campos vacíos para enviar solo los filtros activos
        const activeFilters = {};
        Object.keys(formattedFilters).forEach(key => {
            if (formattedFilters[key] !== '' && formattedFilters[key] !== null && formattedFilters[key] !== undefined) {
                activeFilters[key] = formattedFilters[key];
            }
        });
        
        onApplyFilters(activeFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            startDate: null,
            endDate: null,
            paymentMethod: '',
            reservationId: '',
            q: '',
            clientEmail: ''
        });
        onClearFilters();
    };

    // Estilo común para todos los campos
    const inputStyle = {
        '& .MuiInputBase-root': {
            height: '40px'
        },
        '& .MuiOutlinedInput-root': {
            height: '40px'
        }
    };

    return (
        <Paper 
            elevation={1} 
            sx={{ 
                p: 1.5, 
                mb: 2,
                backgroundColor: '#2D2D2D'
            }}
        >
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 1 
            }}>
                <Typography variant="subtitle1" component="div" sx={{ color: '#fff' }}>
                    {isMobile ? <FilterIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} /> : null}
                    Payment filters
                </Typography>
                <Tooltip title="Clear filters">
                    <IconButton 
                        onClick={handleClearFilters}
                        color="error"
                        size="small"
                    >
                        <ClearIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            
            <Grid container spacing={1}>
                {/* Una sola fila con todos los filtros */}
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                            label="Start date"
                            value={filters.startDate}
                            onChange={(newValue) => handleFilterChange('startDate', newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: "small",
                                    sx: inputStyle
                                }
                            }}
                            sx={{
                                width: '100%',
                                '& .MuiInputBase-root': {
                                    height: '40px'
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                            label="End date"
                            value={filters.endDate}
                            onChange={(newValue) => handleFilterChange('endDate', newValue)}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: "small",
                                    sx: inputStyle
                                }
                            }}
                            sx={{
                                width: '100%',
                                '& .MuiInputBase-root': {
                                    height: '40px'
                                }
                            }}
                        />
                    </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <TextField
                        select
                        fullWidth
                        label="Payment Method"
                        value={filters.paymentMethod}
                        onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                        size="small"
                        sx={inputStyle}
                    >
                        {paymentMethodOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <TextField
                        fullWidth
                        label="Reservation ID"
                        value={filters.reservationId}
                        onChange={(e) => {
                            // Solo permitir números
                            const value = e.target.value;
                            if (value === '' || /^\d+$/.test(value)) {
                                handleFilterChange('reservationId', value);
                            }
                        }}
                        size="small"
                        sx={inputStyle}
                        type="number"
                        placeholder="123"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <TextField
                        fullWidth
                        label="Client search"
                        value={filters.q}
                        onChange={(e) => handleFilterChange('q', e.target.value)}
                        size="small"
                        sx={inputStyle}
                        placeholder="Name or surname"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <TextField
                        fullWidth
                        label="Client email"
                        value={filters.clientEmail}
                        onChange={(e) => handleFilterChange('clientEmail', e.target.value)}
                        size="small"
                        sx={inputStyle}
                        type="email"
                    />
                </Grid>

                {/* Segunda fila solo para el botón */}
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    {/* Espacio vacío */}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    {/* Espacio vacío */}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    {/* Espacio vacío */}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    {/* Espacio vacío */}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    {/* Espacio vacío */}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleApplyFilters}
                        fullWidth
                        sx={{ 
                            height: '40px',
                            textTransform: 'none'
                        }}
                    >
                        Apply Filters
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default PaymentFilters;
