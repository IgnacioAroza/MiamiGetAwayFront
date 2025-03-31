import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const StatusSection = ({ formData, onChange }) => {
    return (
        <>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                        name="status"
                        value={formData.status}
                        onChange={onChange}
                        label="Estado"
                    >
                        <MenuItem value="pending">Pendiente</MenuItem>
                        <MenuItem value="confirmed">Confirmada</MenuItem>
                        <MenuItem value="checked_in">Check-in</MenuItem>
                        <MenuItem value="checked_out">Check-out</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Estado de Pago</InputLabel>
                    <Select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={onChange}
                        label="Estado de Pago"
                        disabled
                    >
                        <MenuItem value="pending">Pendiente</MenuItem>
                        <MenuItem value="partial">Parcial</MenuItem>
                        <MenuItem value="complete">Completo</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
        </>
    );
};

export default StatusSection; 