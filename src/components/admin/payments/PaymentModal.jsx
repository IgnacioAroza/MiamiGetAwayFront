import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import { useReservation } from '../../../../hooks/useReservation';

const PaymentModal = ({ open, onClose, reservationId, totalAmount }) => {
    const { handleRegisterPayment } = useReservation();
    const [paymentData, setPaymentData] = useState({
        amount: '',
        method: 'CASH',
        reference: '',
        notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        await handleRegisterPayment(reservationId, paymentData);
        onClose();
        setPaymentData({
            amount: '',
            method: 'CASH',
            reference: '',
            notes: ''
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Register Payment</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Amount"
                            name="amount"
                            type="number"
                            value={paymentData.amount}
                            onChange={handleChange}
                            InputProps={{
                                startAdornment: '$'
                            }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Payment Method</InputLabel>
                            <Select
                                name="method"
                                value={paymentData.method}
                                onChange={handleChange}
                                label="Payment Method"
                            >
                                <MenuItem value="CASH">Cash</MenuItem>
                                <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                                <MenuItem value="PAYPAL">PayPal</MenuItem>
                                <MenuItem value="ZELLE">Zelle</MenuItem>
                                <MenuItem value="STRIPE">Stripe</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Reference"
                            name="reference"
                            value={paymentData.reference}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Notes"
                            name="notes"
                            multiline
                            rows={3}
                            value={paymentData.notes}
                            onChange={handleChange}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={handleSubmit} color="primary" variant="contained">
                    Register Payment
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PaymentModal;
