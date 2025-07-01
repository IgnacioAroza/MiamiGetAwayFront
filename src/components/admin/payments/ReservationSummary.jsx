import React from 'react';
import {
    Box,
    Typography,
    Divider,
    Paper,
    Grid,
    Stack
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const ReservationSummary = ({ reservation }) => {
    const { isMobile, isTablet } = useDeviceDetection();
    
    if (!reservation) return null;

    // Función para formatear montos
    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '$0.00';
        
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD'
        }).format(Number(amount));
    };

    // Adaptar nombres de campos según cómo vienen del servidor
    const pricePerNight = Number(reservation.price_per_night || reservation.pricePerNight || 0);
    const nights = Number(reservation.nights || 0);
    const cleaningFee = Number(reservation.cleaning_fee || reservation.cleaningFee || 0);
    const parkingFee = Number(reservation.parking_fee || reservation.parkingFee || 0);
    const otherExpenses = Number(reservation.other_expenses || reservation.otherExpenses || 0);
    const taxes = Number(reservation.taxes || 0);
    const totalAmount = Number(reservation.total_amount || reservation.totalAmount || 0);
    const amountPaid = Number(reservation.amount_paid || reservation.amountPaid || 0);
    const amountDue = Number(reservation.amount_due || reservation.amountDue || 0);
    
    // Calcular subtotal (si no viene calculado)
    const subtotal = pricePerNight * nights;
    const taxableAmount = subtotal + cleaningFee + parkingFee + otherExpenses;

    return (
        <Paper variant="outlined" sx={{ p: isMobile ? 1.5 : 2 }}>
            {/* Título */}
            <Box display="flex" alignItems="center" mb={2}>
                <ReceiptIcon sx={{ mr: 1 }} />
                <Typography variant={isMobile ? "subtitle1" : "h6"}>
                    Payment Summary
                </Typography>
            </Box>

            {/* Detalles del cálculo */}
            <Grid container spacing={isMobile ? 1 : 2}>
                {/* Noches */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                            {nights} {nights === 1 ? 'Night' : 'Nights'} x {formatCurrency(pricePerNight)}
                        </Typography>
                        <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                            {formatCurrency(subtotal)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Cargo por Limpieza */}
                {cleaningFee > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                                Cleaning Fee
                            </Typography>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                                {formatCurrency(cleaningFee)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Parking */}
                {parkingFee > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                                Parking Fee
                            </Typography>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                                {formatCurrency(parkingFee)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Otros gastos */}
                {otherExpenses > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                                Other Expenses
                            </Typography>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                                {formatCurrency(otherExpenses)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Subtotal */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography fontWeight="bold" fontSize={isMobile ? "0.9rem" : "inherit"}>
                            Subtotal
                        </Typography>
                        <Typography fontWeight="bold" fontSize={isMobile ? "0.9rem" : "inherit"}>
                            {formatCurrency(taxableAmount)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Impuestos - solo mostrar si son mayores que cero */}
                {taxes > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                                Taxes
                            </Typography>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                                {formatCurrency(taxes)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Divider sx={{ my: isMobile ? 1 : 2 }} />
                </Grid>

                {/* Total */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={isMobile ? 1 : 2}>
                        <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold">
                            Total
                        </Typography>
                        <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold">
                            {formatCurrency(totalAmount)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Pagos recibidos */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography fontSize={isMobile ? "0.9rem" : "inherit"}>
                            Paid Amount
                        </Typography>
                        <Typography color="success.main" fontSize={isMobile ? "0.9rem" : "inherit"}>
                            {formatCurrency(amountPaid)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Saldo pendiente */}
                <Grid item xs={12}>
                    <Paper sx={{ p: isMobile ? 1 : 2, bgcolor: 'background.default' }}>
                        <Box display="flex" justifyContent="space-between" mb={0}>
                            <Typography fontWeight="bold" fontSize={isMobile ? "0.9rem" : "inherit"}>
                                Pending Balance
                            </Typography>
                            <Typography fontWeight="bold" color={amountDue > 0 ? "error.main" : "success.main"} fontSize={isMobile ? "0.9rem" : "inherit"}>
                                {formatCurrency(amountDue)}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default ReservationSummary;