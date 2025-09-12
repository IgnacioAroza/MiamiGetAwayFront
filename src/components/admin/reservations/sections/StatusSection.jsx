import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const StatusSection = ({ formData, onChange }) => {
    // Prevenir submit al presionar Enter
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    // Estilos comunes para los selects
    const selectStyles = {
        backgroundColor: '#4A4747',
        borderRadius: 1,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#717171' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#717171' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#717171' },
        '&.Mui-disabled': {
            backgroundColor: '#3a3a3a',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' }
        },
        '& .MuiSvgIcon-root': { color: '#ccc' },
        '& .MuiSelect-select': {
            color: '#fff',
            padding: '12px 16px',
            '&.Mui-disabled': { 
                color: '#aaa',
                WebkitTextFillColor: '#aaa'
            }
        },
    };

    const labelStyles = {
        color: '#888',
        '&.Mui-focused': { color: '#888' },
        '&.Mui-disabled': { color: '#666' }
    };

    const menuProps = {
        PaperProps: {
            sx: {
                bgcolor: '#4A4747',
                '& .MuiMenuItem-root': {
                    color: '#fff',
                    '&:hover': { bgcolor: '#555' },
                    '&.Mui-selected': { 
                        bgcolor: '#555',
                        '&:hover': { bgcolor: '#666' }
                    },
                },
            },
        },
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel sx={labelStyles}>Status</InputLabel>
                    <Select
                        name="status"
                        value={formData.status}
                        onChange={onChange}
                        onKeyDown={handleKeyDown}
                        label="Status"
                        sx={selectStyles}
                        MenuProps={menuProps}
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="checked_in">Check-in</MenuItem>
                        <MenuItem value="checked_out">Check-out</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel sx={labelStyles}>Payment Status</InputLabel>
                    <Select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={onChange}
                        onKeyDown={handleKeyDown}
                        label="Payment Status"
                        disabled
                        sx={selectStyles}
                        MenuProps={menuProps}
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="partial">Partial</MenuItem>
                        <MenuItem value="complete">Complete</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
        </Grid>
    );
};

export default StatusSection; 