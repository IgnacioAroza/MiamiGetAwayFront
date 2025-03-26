import React from 'react';
import {
    Box,
    Typography,
    Divider,
    Paper,
    Grid,
    Button,
    TextField
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import { useDispatch } from 'react-redux';
import { registerPayment } from '../../../redux/reservationSlice';

const PaymentSummary = ({ reservation }) => {
    const dispatch = useDispatch();

    const handlePaymentRegistration = (paymentData) => {
        if (reservation?.id) {
            dispatch(registerPayment({
                id: reservation.id,
                paymentData
            }));
        }
    };

    if (!reservation) return null;

    // Función para formatear montos
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Calcular totales
    const subtotal = reservation.pricePerNight * reservation.nights;
    const cleaningFee = reservation.cleaningFee || 0;
    const parkingFee = reservation.parkingFee || 0;
    const otherExpenses = reservation.otherExpenses || 0;
    const securityDeposit = reservation.securityDeposit || 0;
    
    // Calcular impuestos (7%)
    const taxRate = 0.07;
    const taxableAmount = subtotal + cleaningFee + parkingFee + otherExpenses;
    const taxes = taxableAmount * taxRate;
    
    // Total final
    const total = taxableAmount + taxes;

    return (
        <Box>
            {/* Título */}
            <Box display="flex" alignItems="center" mb={3}>
                <ReceiptIcon sx={{ mr: 1 }} />
                <Typography variant="h6">
                    Payment Summary
                </Typography>
            </Box>

            {/* Detalles del cálculo */}
            <Grid container spacing={2}>
                {/* Noches */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>
                            Nights ({reservation?.nights || 0})
                        </Typography>
                        <Typography>
                            {formatCurrency(subtotal)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Cargo por Limpieza */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>
                            Cleaning Fee
                        </Typography>
                        <Typography>
                            {formatCurrency(cleaningFee)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Parking */}
                {parkingFee > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography>
                                Parking Fee
                            </Typography>
                            <Typography>
                                {formatCurrency(parkingFee)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Otros gastos */}
                {otherExpenses > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography>
                                Other Expenses
                            </Typography>
                            <Typography>
                                {formatCurrency(otherExpenses)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Subtotal */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography fontWeight="bold">
                            Subtotal
                        </Typography>
                        <Typography fontWeight="bold">
                            {formatCurrency(taxableAmount)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Impuestos */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>
                            Taxes (7%)
                        </Typography>
                        <Typography>
                            {formatCurrency(taxes)}
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                </Grid>

                {/* Total */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight="bold">
                            Total
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                            {formatCurrency(total)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Depósito de Seguridad */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography fontWeight="bold">
                                Security Deposit
                            </Typography>
                            <Typography fontWeight="bold">
                                {formatCurrency(securityDeposit)}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Sección de Pago */}
                <Grid item xs={12}>
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Payment Registration
                        </Typography>
                        <TextField
                            fullWidth
                            label="Amount to Pay"
                            type="number"
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: '$'
                            }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<PaymentIcon />}
                        >
                            Register Payment
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PaymentSummary;
