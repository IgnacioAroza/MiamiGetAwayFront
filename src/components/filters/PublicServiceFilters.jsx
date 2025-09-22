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
    Slider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Clear as ClearIcon, FilterAlt as FilterIcon, Search as SearchIcon } from '@mui/icons-material';
import useDeviceDetection from '../../hooks/useDeviceDetection';

const PublicServiceFilters = ({ type, onFiltersChange }) => {
    const { t } = useTranslation();
    const { isMobile } = useDeviceDetection();
    
    // Estados de filtros específicos por tipo
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        passengers: '', // solo para cars
        capacity: '',   // solo para apartments
        q: ''          // solo para apartments
    });

    // Opciones para select de pasajeros
    const passengerOptions = [
        { value: '', label: t('filters.allPassengers') || 'Todos' },
        { value: '2', label: '2+' },
        { value: '4', label: '4+' },
        { value: '5', label: '5+' },
        { value: '7', label: '7+' },
    ];

    // Opciones para select de capacidad
    const capacityOptions = [
        { value: '', label: t('filters.allCapacities') || 'Todas' },
        { value: '2', label: '2+' },
        { value: '4', label: '4+' },
        { value: '6', label: '6+' },
        { value: '8', label: '8+' },
    ];

    // Rangos de precio según el tipo
    const priceRanges = {
        cars: { min: 50, max: 500, step: 25 },
        apartments: { min: 80, max: 800, step: 50 }
    };

    // Estado para slider de precio
    const [priceRange, setPriceRange] = useState([
        priceRanges[type]?.min || 50,
        priceRanges[type]?.max || 500
    ]);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePriceRangeChange = (event, newValue) => {
        setPriceRange(newValue);
        setFilters(prev => ({
            ...prev,
            minPrice: newValue[0],
            maxPrice: newValue[1]
        }));
    };

    const handleApplyFilters = () => {
        // Preparar filtros para envío
        const activeFilters = {
            minPrice: filters.minPrice || priceRange[0],
            maxPrice: filters.maxPrice || priceRange[1],
        };

        // Agregar filtros específicos por tipo
        if (type === 'cars' && filters.passengers) {
            activeFilters.passengers = filters.passengers;
        }
        
        if (type === 'apartments') {
            if (filters.capacity) {
                activeFilters.capacity = filters.capacity;
            }
            if (filters.q) {
                activeFilters.q = filters.q;
            }
        }

        onFiltersChange(activeFilters);
    };

    const handleClearFilters = () => {
        const defaultRange = [
            priceRanges[type]?.min || 50,
            priceRanges[type]?.max || 500
        ];
        
        setPriceRange(defaultRange);
        setFilters({
            minPrice: '',
            maxPrice: '',
            passengers: '',
            capacity: '',
            q: ''
        });
        
        onFiltersChange({});
    };

    const inputStyle = {
        '& .MuiInputBase-root': {
            height: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
        '& .MuiOutlinedInput-root': {
            height: '40px'
        }
    };

    return (
        <Paper 
            elevation={1} 
            sx={{ 
                p: 2, 
                mb: 3,
                backgroundColor: '#2D2D2D',
                borderRadius: 2
            }}
        >
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2 
            }}>
                <Typography variant="h6" component="div" sx={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                    <FilterIcon fontSize="small" sx={{ mr: 1 }} />
                    {t('filters.title') || 'Filtros'}
                </Typography>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
                {/* Slider de precio */}
                <Grid item xs={12} md={4}>
                    <Typography variant="body2" sx={{ color: '#fff', mb: 1 }}>
                        {t('filters.priceRange') || 'Rango de precio'}: ${priceRange[0]} - ${priceRange[1]}
                    </Typography>
                    <Slider
                        value={priceRange}
                        onChange={handlePriceRangeChange}
                        valueLabelDisplay="auto"
                        min={priceRanges[type]?.min || 50}
                        max={priceRanges[type]?.max || 500}
                        step={priceRanges[type]?.step || 25}
                        sx={{
                            color: 'primary.main',
                            '& .MuiSlider-thumb': {
                                backgroundColor: 'primary.main',
                            },
                            '& .MuiSlider-track': {
                                backgroundColor: 'primary.main',
                            },
                            '& .MuiSlider-rail': {
                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            },
                        }}
                    />
                </Grid>

                {/* Filtros específicos por tipo */}
                {type === 'cars' && (
                    <Grid item xs={12} sm={6} md={3}>
                        <TextField
                            fullWidth
                            select
                            label={t('filters.minPassengers') || 'Mín. pasajeros'}
                            value={filters.passengers}
                            onChange={(e) => handleFilterChange('passengers', e.target.value)}
                            size="small"
                            sx={inputStyle}
                        >
                            {passengerOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                )}

                {type === 'apartments' && (
                    <>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <TextField
                                fullWidth
                                select
                                label={t('filters.minCapacity') || 'Mín. capacidad'}
                                value={filters.capacity}
                                onChange={(e) => handleFilterChange('capacity', e.target.value)}
                                size="small"
                                sx={inputStyle}
                            >
                                {capacityOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <TextField
                                fullWidth
                                label={t('filters.location') || 'Ubicación'}
                                value={filters.q}
                                onChange={(e) => handleFilterChange('q', e.target.value)}
                                size="small"
                                placeholder="Miami Beach, Downtown..."
                                sx={inputStyle}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ color: 'rgba(255, 255, 255, 0.5)', mr: 1 }} />
                                }}
                            />
                        </Grid>
                    </>
                )}

                {/* Botones de acción */}
                <Grid item xs={12} sm={12} md={3}>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: isMobile ? 'column' : 'row' }}>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleApplyFilters}
                            fullWidth={isMobile}
                            sx={{ 
                                height: '40px',
                                textTransform: 'none',
                                minWidth: '120px'
                            }}
                        >
                            {t('filters.applyFilters') || 'Aplicar'}
                        </Button>
                        <Button 
                            variant="outlined" 
                            color="inherit" 
                            onClick={handleClearFilters}
                            fullWidth={isMobile}
                            sx={{ 
                                height: '40px',
                                textTransform: 'none',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                color: '#fff',
                                '&:hover': {
                                    borderColor: '#fff',
                                    backgroundColor: 'rgba(255, 255, 255, 0.04)'
                                }
                            }}
                        >
                            {t('filters.clearFilters') || 'Limpiar'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default PublicServiceFilters;