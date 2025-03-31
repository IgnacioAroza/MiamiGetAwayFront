import React from 'react';
import { Grid, TextField } from '@mui/material';

const PaymentSection = ({ formData, onChange }) => {
    return (
        <>
            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Monto Total"
                    name="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    disabled
                    InputProps={{
                        startAdornment: '$'
                    }}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Monto Pagado"
                    name="amountPaid"
                    type="number"
                    value={formData.amountPaid}
                    onChange={onChange}
                    InputProps={{
                        startAdornment: '$'
                    }}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <TextField
                    fullWidth
                    label="Saldo Pendiente"
                    name="amountDue"
                    type="number"
                    value={formData.amountDue}
                    disabled
                    InputProps={{
                        startAdornment: '$'
                    }}
                />
            </Grid>
        </>
    );
};

export default PaymentSection; 