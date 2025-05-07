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
    Tooltip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { Clear as ClearIcon } from '@mui/icons-material';
import { formatDateToString, parseStringToDate } from '../../../utils/dateUtils';

const ReservationFilters = ({ onApplyFilters, onClearFilters }) => {
    const [filters, setFilters] = useState({
        startDate: null,
        endDate: null,
        status: '',
        clientName: '',
        clientEmail: ''
    });

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'checked_in', label: 'Check-in' },
        { value: 'checked_out', label: 'Check-out' },
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
            endDate: filters.endDate ? formatDateToString(filters.endDate) : null
        };
        
        onApplyFilters(formattedFilters);
    };

    const handleClearFilters = () => {
        setFilters({
            startDate: null,
            endDate: null,
            status: '',
            clientName: '',
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
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                        <DatePicker
                            label="Start date"
                            value={filters.startDate}
                            onChange={(newValue) => handleFilterChange('startDate', newValue)}
                            TextField={(params) => (
                                <TextField 
                                    {...params} 
                                    fullWidth 
                                    size="small"
                                    sx={inputStyle}
                                />
                            )}
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
                            TextField={(params) => (
                                <TextField 
                                    {...params} 
                                    fullWidth 
                                    size="small"
                                    sx={inputStyle}
                                />
                            )}
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
                <Grid item xs={12} sm={6} md={4} lg={2}>
                    <TextField
                        fullWidth
                        label="Client name"
                        value={filters.clientName}
                        onChange={(e) => handleFilterChange('clientName', e.target.value)}
                        size="small"
                        sx={inputStyle}
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
                    />
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
                        Apply
                    </Button>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ReservationFilters;