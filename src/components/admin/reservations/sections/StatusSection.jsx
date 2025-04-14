import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const StatusSection = ({ formData, onChange }) => {
    return (
        <>
            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                        name="status"
                        value={formData.status}
                        onChange={onChange}
                        label="Status"
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="confirmed">Confirmed</MenuItem>
                        <MenuItem value="checked_in">Check-in</MenuItem>
                        <MenuItem value="checked_out">Check-out</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={onChange}
                        label="Payment Status"
                        disabled
                    >
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="partial">Partial</MenuItem>
                        <MenuItem value="complete">Complete</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
        </>
    );
};

export default StatusSection; 