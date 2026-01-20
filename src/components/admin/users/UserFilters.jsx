import React, { useState } from 'react';
import {
    Box,
    Grid,
    TextField,
    Button,
    Paper,
    Typography
} from '@mui/material';
import { FilterAlt as FilterIcon } from '@mui/icons-material';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const UserFilters = ({ onApplyFilters, onClearFilters }) => {
    const { isMobile } = useDeviceDetection();
    const [filters, setFilters] = useState({
        name: '',
        lastname: '',
        email: '',
        phone: ''
    });

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApplyFilters = () => {
        const activeFilters = {};
        Object.entries(filters).forEach(([key, value]) => {
            const trimmed = typeof value === 'string' ? value.trim() : value;
            if (trimmed) {
                activeFilters[key] = trimmed;
            }
        });

        onApplyFilters(activeFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            name: '',
            lastname: '',
            email: '',
            phone: ''
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
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1
                }}
            >
                <Typography variant="subtitle1" component="div" sx={{ color: '#fff' }}>
                    {isMobile ? <FilterIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} /> : null}
                    Search filters
                </Typography>
            </Box>

            <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Name"
                        value={filters.name}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                        size="small"
                        sx={inputStyle}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Last name"
                        value={filters.lastname}
                        onChange={(e) => handleFilterChange('lastname', e.target.value)}
                        size="small"
                        sx={inputStyle}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Email"
                        value={filters.email}
                        onChange={(e) => handleFilterChange('email', e.target.value)}
                        size="small"
                        sx={inputStyle}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Phone"
                        value={filters.phone}
                        onChange={(e) => handleFilterChange('phone', e.target.value)}
                        size="small"
                        sx={inputStyle}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
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
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleClearFilters}
                            fullWidth
                            sx={{
                                height: '40px',
                                textTransform: 'none',
                                color: '#fff',
                                borderColor: 'rgba(255, 255, 255, 0.4)',
                                '&:hover': {
                                    borderColor: '#fff'
                                }
                            }}
                        >
                            Clear Filters
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default UserFilters;
