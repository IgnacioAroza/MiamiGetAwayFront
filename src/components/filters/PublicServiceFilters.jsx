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
    Chip,
    Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { 
    Clear as ClearIcon, 
    FilterAlt as FilterIcon, 
    Search as SearchIcon,
    TuneRounded as TuneIcon,
    AttachMoneyRounded as MoneyIcon,
    GroupRounded as GroupIcon,
    LocationOnRounded as LocationIcon,
    HomeRounded as HomeIcon
} from '@mui/icons-material';
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
        cars: { min: 50, max: 2000, step: 25 },
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
            height: '48px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            transition: 'all 0.3s ease',
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            },
            '&.Mui-focused': {
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(25, 118, 210, 0.5)',
                boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)',
            }
        },
        '& .MuiOutlinedInput-root': {
            height: '48px',
            '& fieldset': {
                border: 'none',
            },
        },
        '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            transform: 'translate(45px, 13px) scale(1)', // Ajustar posición inicial del label
            '&.MuiInputLabel-shrink': {
                transform: 'translate(45px, -18px) scale(0.75)', // Posición cuando se encoge
            },
            '&.Mui-focused': {
                color: 'rgba(25, 118, 210, 0.8)',
            }
        },
        '& .MuiInputBase-input': {
            color: '#fff',
            '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.5)',
            }
        }
    };

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 3,
                mb: 4,
                background: 'linear-gradient(135deg, rgba(45, 45, 45, 0.95) 0%, rgba(35, 35, 35, 0.98) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                position: { xs: 'relative', md: 'sticky' },
                top: { md: 100 },
                overflow: 'hidden',
                alignSelf: { md: 'flex-start' },
                minWidth: { md: 240 },
                maxWidth: { md: 280 },
                width: '100%',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                }
            }}
        >
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                    }}>
                        <TuneIcon sx={{ color: '#fff', fontSize: '20px' }} />
                    </Box>
                    <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{ 
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            letterSpacing: '0.5px'
                        }}
                    >
                        {t('filters.title') || 'Filtros de búsqueda'}
                    </Typography>
                </Box>
            </Box>
            
            <Divider sx={{ 
                mb: 3, 
                borderColor: 'rgba(255, 255, 255, 0.08)',
                '&::before, &::after': {
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                }
            }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                {/* Slider de precio */}
                <Box sx={{ 
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 25px rgba(0, 0, 0, 0.15)',
                    }
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <MoneyIcon sx={{ color: '#4caf50', mr: 1, fontSize: '20px' }} />
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>
                            {t('filters.priceRange') || 'Rango de precio'}
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ color: '#4caf50', mb: 2, fontWeight: 700 }}>
                        ${priceRange[0]} - ${priceRange[1]}
                    </Typography>
                    <Slider
                        value={priceRange}
                        onChange={handlePriceRangeChange}
                        valueLabelDisplay="auto"
                        min={priceRanges[type]?.min || 50}
                        max={priceRanges[type]?.max || 500}
                        step={priceRanges[type]?.step || 25}
                        sx={{
                            color: '#4caf50',
                            height: 6,
                            '& .MuiSlider-thumb': {
                                width: 20,
                                height: 20,
                                backgroundColor: '#4caf50',
                                boxShadow: '0 3px 10px rgba(76, 175, 80, 0.4)',
                                '&:hover': {
                                    boxShadow: '0 0 0 8px rgba(76, 175, 80, 0.16)',
                                },
                                '&.Mui-active': {
                                    boxShadow: '0 0 0 12px rgba(76, 175, 80, 0.16)',
                                },
                            },
                            '& .MuiSlider-track': {
                                background: 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)',
                                border: 'none',
                            },
                            '& .MuiSlider-rail': {
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                height: 6,
                            },
                            '& .MuiSlider-valueLabel': {
                                backgroundColor: '#4caf50',
                                borderRadius: '8px',
                                '&:before': {
                                    borderTopColor: '#4caf50',
                                }
                            },
                        }}
                    />
                </Box>

                {/* Filtros específicos por tipo */}
                {type === 'cars' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ position: 'relative' }}>
                            <GroupIcon sx={{ 
                                position: 'absolute',
                                left: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255, 255, 255, 0.6)',
                                zIndex: 1,
                                fontSize: '20px'
                            }} />
                            <TextField
                                fullWidth
                                select
                                label={t('filters.minPassengers') || 'Mín. pasajeros'}
                                value={filters.passengers}
                                onChange={(e) => handleFilterChange('passengers', e.target.value)}
                                size="small"
                                sx={{
                                    ...inputStyle,
                                    '& .MuiInputBase-input': {
                                        ...inputStyle['& .MuiInputBase-input'],
                                        paddingLeft: '45px'
                                    }
                                }}
                            >
                                {passengerOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>
                )}

                {type === 'apartments' && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box sx={{ position: 'relative' }}>
                            <HomeIcon sx={{ 
                                position: 'absolute',
                                left: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255, 255, 255, 0.6)',
                                zIndex: 1,
                                fontSize: '20px'
                            }} />
                            <TextField
                                fullWidth
                                select
                                label={t('filters.minCapacity') || 'Mín. capacidad'}
                                value={filters.capacity}
                                onChange={(e) => handleFilterChange('capacity', e.target.value)}
                                size="small"
                                sx={{
                                    ...inputStyle,
                                    '& .MuiInputBase-input': {
                                        ...inputStyle['& .MuiInputBase-input'],
                                        paddingLeft: '45px'
                                    }
                                }}
                            >
                                {capacityOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box sx={{ position: 'relative' }}>
                            <LocationIcon sx={{ 
                                position: 'absolute',
                                left: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: 'rgba(255, 255, 255, 0.6)',
                                zIndex: 1,
                                fontSize: '20px'
                            }} />
                            <TextField
                                fullWidth
                                label={t('filters.location') || 'Ubicación'}
                                value={filters.q}
                                onChange={(e) => handleFilterChange('q', e.target.value)}
                                size="small"
                                placeholder="Miami Beach, Downtown..."
                                sx={{
                                    ...inputStyle,
                                    '& .MuiInputBase-input': {
                                        ...inputStyle['& .MuiInputBase-input'],
                                        paddingLeft: '45px'
                                    }
                                }}
                            />
                        </Box>
                    </Box>
                )}

                {/* Botones de acción */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleApplyFilters}
                        fullWidth
                        sx={{ 
                            height: '48px',
                            textTransform: 'none',
                            width: { xs: '100%', sm: 'auto' },
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.5)',
                                transform: 'translateY(-2px)',
                            },
                            '&:active': {
                                transform: 'translateY(0px)',
                            }
                        }}
                    >
                        <FilterIcon sx={{ mr: 1, fontSize: '18px' }} />
                        {t('filters.applyFilters') || 'Aplicar filtros'}
                    </Button>
                    <Button 
                        variant="outlined" 
                        color="inherit" 
                        onClick={handleClearFilters}
                        fullWidth
                        sx={{ 
                            height: '48px',
                            textTransform: 'none',
                            width: '100%',
                            borderRadius: '12px',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            color: 'rgba(255, 255, 255, 0.8)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                            },
                            '&:active': {
                                transform: 'translateY(0px)',
                            }
                        }}
                    >
                        <ClearIcon sx={{ mr: 1, fontSize: '18px' }} />
                        {t('filters.clearFilters') || 'Limpiar'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
};

export default PublicServiceFilters;
