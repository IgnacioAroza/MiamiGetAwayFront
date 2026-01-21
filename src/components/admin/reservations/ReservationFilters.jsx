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
import { formatDateToString, parseStringToDate } from '../../../utils/dateUtils';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const ReservationFilters = ({ onApplyFilters, onClearFilters }) => {
    const { isMobile } = useDeviceDetection();
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        status: '',
        clientName: '',
        clientEmail: '',
        q: '', // Búsqueda general
        clientLastname: '', // Apellido del cliente
        upcoming: 'true', // Reservaciones futuras (por defecto próximas)
        fromDate: null, // Fecha base para upcoming
        withinDays: '' // Días límite para upcoming
    });

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'checked_in', label: 'Check-in' },
        { value: 'checked_out', label: 'Check-out' },
        { value: 'cancelled', label: 'Cancelled' },
    ];

    const upcomingOptions = [
        { value: '', label: 'All reservations' },
        { value: 'true', label: 'Upcoming only' },
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
            startDate: filters.startDate ? formatDateToString(filters.startDate) : null,
            endDate: filters.endDate ? formatDateToString(filters.endDate) : null,
            fromDate: filters.fromDate ? formatDateToString(filters.fromDate, false) : null, // Solo fecha, sin hora
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
            status: '',
            clientName: '',
            clientEmail: '',
            q: '',
            clientLastname: '',
            upcoming: '',
            fromDate: null,
            withinDays: ''
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
                    Search filters
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
                {/* Primera fila - Filtros principales */}
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <TextField
                        select
                        fullWidth
                        label="Status"
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        size="small"
                        sx={inputStyle}
                    >
                        {statusOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
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
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <TextField
                        fullWidth
                        label="Client email"
                        value={filters.clientEmail}
                        onChange={(e) => handleFilterChange('clientEmail', e.target.value)}
                        size="small"
                        sx={inputStyle}
                    />
                </Grid>

                {/* Segunda fila - Filtros de timeline y botón */}
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <TextField
                        select
                        fullWidth
                        label="Upcoming"
                        value={filters.upcoming}
                        onChange={(e) => handleFilterChange('upcoming', e.target.value)}
                        size="small"
                        sx={inputStyle}
                    >
                        {upcomingOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                            label="From date"
                            value={filters.fromDate}
                            onChange={(newValue) => handleFilterChange('fromDate', newValue)}
                            disabled={filters.upcoming !== 'true'}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    size: "small",
                                    sx: {
                                        ...inputStyle,
                                        ...(filters.upcoming !== 'true' && { 
                                            '& .MuiInputBase-root': { 
                                                ...inputStyle['& .MuiInputBase-root'],
                                                opacity: 0.5 
                                            } 
                                        })
                                    },
                                    helperText: filters.upcoming === 'true' ? 'Base date' : ''
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
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    <TextField
                        fullWidth
                        label="Within days"
                        value={filters.withinDays}
                        onChange={(e) => handleFilterChange('withinDays', e.target.value)}
                        size="small"
                        type="number"
                        disabled={filters.upcoming !== 'true'}
                        sx={{
                            ...inputStyle,
                            ...(filters.upcoming !== 'true' && { 
                                '& .MuiInputBase-root': { 
                                    ...inputStyle['& .MuiInputBase-root'],
                                    opacity: 0.5 
                                } 
                            })
                        }}
                        helperText={filters.upcoming === 'true' ? 'Limit days' : ''}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
                    {/* Espacio vacío para balance visual */}
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2.4}>
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

export default ReservationFilters;
