import React from 'react';
import { useSelector } from 'react-redux';
import {
    Card,
    CardContent,
    Typography,
    Grid,
    Divider,
    Box,
    Chip,
    Button
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const PaymentDetails = ({ payment }) => {
    // Formatear monto
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Obtener el estado del chip según el método de pago
    const getPaymentMethodChip = (method) => {
        const methods = {
            cash: { label: 'Cash', color: 'success' },
            transfer: { label: 'Transfer', color: 'info' },
            card: { label: 'Card', color: 'primary' }
        };
        return methods[method] || { label: method, color: 'default' };
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Grid container spacing={3}>
                    {/* Encabezado */}
                    <Grid item xs={12}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h5" component="h2">
                                Payment Details
                            </Typography>
                            <Chip
                                icon={<PaymentIcon />}
                                label={getPaymentMethodChip(payment.paymentMethod).label}
                                color={getPaymentMethodChip(payment.paymentMethod).color}
                            />
                        </Box>
                        <Divider sx={{ my: 2 }} />
                    </Grid>

                    {/* Información principal */}
                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <AttachMoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="h6">
                                {formatAmount(payment.amount)}
                            </Typography>
                        </Box>
                        
                        <Box display="flex" alignItems="center" mb={2}>
                            <EventIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography>
                                {format(new Date(payment.paymentDate), 'PPP', { locale: es })}
                            </Typography>
                        </Box>

                        {payment.paymentReference && (
                            <Box display="flex" alignItems="center" mb={2}>
                                <ReceiptIcon sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography>
                                    Ref: {payment.paymentReference}
                                </Typography>
                            </Box>
                        )}
                    </Grid>

                    {/* Información de la reserva */}
                    <Grid item xs={12} md={6}>
                        <Box display="flex" alignItems="center" mb={2}>
                            <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography>
                                Reservation ID: {payment.reservationId}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Notas */}
                    {payment.notes && (
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" gutterBottom>
                                Notes:
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {payment.notes}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default PaymentDetails;
