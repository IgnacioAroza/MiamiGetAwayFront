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
    const cancellationFee = Number(reservation.cancellation_fee || reservation.cancellationFee || 0);
    const parkingFee = Number(reservation.parking_fee || reservation.parkingFee || 0);
    const otherExpenses = Number(reservation.other_expenses || reservation.otherExpenses || 0);
    const taxes = Number(reservation.taxes || 0);
    const totalAmount = Number(reservation.total_amount || reservation.totalAmount || 0);
    const amountPaid = Number(reservation.amount_paid || reservation.amountPaid || 0);
    const amountDue = Number(reservation.amount_due || reservation.amountDue || 0);
    
    // Calcular subtotal (si no viene calculado)
    const subtotal = pricePerNight * nights;
    // cancellationFee es un ítem aparte y NO suma al subtotal imponible
    const taxableAmount = subtotal + cleaningFee + parkingFee + otherExpenses;

    return (
        <Paper 
            variant="outlined" 
            sx={{ 
                p: isMobile ? 1.5 : 2,
                bgcolor: '#2a2a2a',
                borderColor: '#555',
                color: '#fff',
                height: isMobile ? 'auto' : '675px', // Altura fija en desktop, auto en mobile
                minHeight: isMobile ? '400px' : '580px', // Altura mínima
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Título */}
            <Box 
                display="flex" 
                alignItems="center" 
                mb={2}
                sx={{ 
                    bgcolor: '#333',
                    mx: -2,
                    mt: -2,
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid #555'
                }}
            >
                <ReceiptIcon sx={{ mr: 1, color: '#fff' }} />
                <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ color: '#fff', fontWeight: 'bold' }}>
                    Payment Summary
                </Typography>
            </Box>

            {/* Detalles del cálculo */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Grid container spacing={isMobile ? 1 : 2} sx={{ mt: 1, flex: 1 }}>
                {/* Noches */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#ccc' }}>
                            {nights} {nights === 1 ? 'night' : 'nights'} × {formatCurrency(pricePerNight)}
                        </Typography>
                        <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#fff' }}>
                            {formatCurrency(subtotal)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Cargo por Limpieza */}
                {cleaningFee > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#ccc' }}>
                                Cleaning Fee
                            </Typography>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#fff' }}>
                                {formatCurrency(cleaningFee)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Parking */}
                {parkingFee > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#ccc' }}>
                                Parking Fee
                            </Typography>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#fff' }}>
                                {formatCurrency(parkingFee)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Otros gastos */}
                {otherExpenses > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#ccc' }}>
                                Other Expenses
                            </Typography>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#fff' }}>
                                {formatCurrency(otherExpenses)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Cancellation */}
                {cancellationFee > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#ccc' }}>
                                Cancellation Fee
                            </Typography>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#fff' }}>
                                {formatCurrency(cancellationFee)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                {/* Subtotal */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography fontWeight="bold" fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#fff' }}>
                            Subtotal
                        </Typography>
                        <Typography fontWeight="bold" fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#fff' }}>
                            {formatCurrency(taxableAmount)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Impuestos - solo mostrar si son mayores que cero */}
                {taxes > 0 && (
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" mb={0.5}>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#ccc' }}>
                                Taxes
                            </Typography>
                            <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#fff' }}>
                                {formatCurrency(taxes)}
                            </Typography>
                        </Box>
                    </Grid>
                )}

                <Grid item xs={12}>
                    <Divider sx={{ my: isMobile ? 1 : 2, bgcolor: '#555' }} />
                </Grid>

                {/* Total */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={isMobile ? 1 : 2}>
                        <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ color: '#fff' }}>
                            Total
                        </Typography>
                        <Typography variant={isMobile ? "body1" : "h6"} fontWeight="bold" sx={{ color: '#fff' }}>
                            {formatCurrency(totalAmount)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Pagos recibidos */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#ccc' }}>
                            Amount Paid
                        </Typography>
                        <Typography sx={{ color: '#4caf50', fontSize: isMobile ? "0.9rem" : "inherit" }}>
                            {formatCurrency(amountPaid)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Saldo pendiente */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={0}>
                        <Typography fontWeight="bold" fontSize={isMobile ? "0.9rem" : "inherit"} sx={{ color: '#ccc' }}>
                            Pending Balance
                        </Typography>
                        <Typography 
                            fontWeight="bold" 
                            sx={{ 
                                color: amountDue > 0 ? "#f44336" : "#4caf50",
                                fontSize: isMobile ? "0.9rem" : "inherit"
                            }}
                        >
                            {formatCurrency(amountDue)}
                        </Typography>
                    </Box>
                </Grid>
                
                {/* Espaciador flexible para empujar contenido hacia arriba */}
                {!isMobile && (
                    <Grid item xs={12} sx={{ flex: 1 }}>
                        <Box sx={{ flex: 1 }} />
                    </Grid>
                )}
            </Grid>
            </Box>
        </Paper>
    );
};

export default ReservationSummary;
