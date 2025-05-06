import React, { useState } from 'react';
import {
    Box,
    Typography,
    Divider,
    Paper,
    Grid,
    Button,
    TextField,
    Alert,
    Snackbar,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PaymentIcon from '@mui/icons-material/Payment';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useReservation } from '../../../hooks/useReservation';

const PaymentSummary = ({ reservation, onPaymentRegistered }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { handleSendConfirmation } = useReservation();
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const paymentMethods = [
        { value: 'cash', label: 'Cash' },
        { value: 'card', label: 'Credit Card' },
        { value: 'transfer', label: 'Bank Transfer' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'zelle', label: 'Zelle' },
        { value: 'stripe', label: 'Stripe' },
        { value: 'other', label: 'Other' }
    ];

    const handlePaymentRegistration = async () => {
        if (!reservation?.id) {
            setError('No hay una reserva seleccionada');
            return;
        }

        const amount = Number(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (amount > amountDue) {
            setError('The amount cannot be greater than the pending balance');
            return;
        }

        try {
            // Calcular el nuevo monto pagado y pendiente con precisión
            const newAmountPaid = parseFloat((amountPaid + amount).toFixed(2));
            const newAmountDue = parseFloat((totalAmount - newAmountPaid).toFixed(2));

            // Verificar que los montos sean válidos
            if (isNaN(newAmountPaid) || newAmountPaid < 0) {
                throw new Error('The new paid amount is not valid');
            }
            
            if (isNaN(newAmountDue) || newAmountDue < 0) {
                throw new Error('The new pending amount is not valid');
            }

            // Determinar el nuevo estado de pago según la documentación
            let newPaymentStatus;
            if (newAmountDue <= 0) {
                newPaymentStatus = "PAID";
            } else if (newAmountPaid > 0) {
                newPaymentStatus = "PARTIAL";
            } else {
                newPaymentStatus = "PENDING";
            }
            
            // Usar las claves que coinciden con los nombres de columna en la base de datos
            const updateData = {
                amountPaid: parseFloat(newAmountPaid),
                amountDue: parseFloat(newAmountDue),
                paymentStatus: newPaymentStatus
            };
            
            try {
                // Usar axios directamente para evitar problemas con el servicio
                const api = (await import('../../../utils/api')).default;
                await api.patch(`/reservations/${reservation.id}/payment-status`, updateData);
                
                // Registrar el pago en el historial (opcional)
                try {
                    const paymentRecord = {
                        reservationId: reservation.id,
                        amount: parseFloat(amount),
                        paymentMethod: paymentMethod,
                        paymentDate: new Date().toISOString(),
                        notes: `Payment registered from admin panel - Method: ${paymentMethods.find(m => m.value === paymentMethod)?.label}`
                    };
                    
                    await api.post('/reservation-payments', paymentRecord);
                } catch (paymentError) {
                    console.error('Error al registrar el pago en el historial:', paymentError);
                }

                // Enviar notificación de pago por correo
                /* Comentado para hacer el envío de correos manual
                try {
                    await handleSendConfirmation({
                        id: reservation.id,
                        notificationType: 'payment'
                    });
                } catch (emailError) {
                    console.error('Error sending the payment notification:', emailError);
                }
                */
                
                // Mostrar mensaje de éxito
                setSuccess(true);
                
                // Limpiar el formulario
                setPaymentAmount('');
                setPaymentMethod('cash');
                
                // Llamar a la función para recargar los datos
                if (onPaymentRegistered) {
                    onPaymentRegistered();
                }
                
                // Esperar un momento para que el usuario vea el mensaje de éxito
                setTimeout(() => {
                    // Navegar a la lista de reservas
                    navigate('/admin/reservations');
                }, 1500);
            } catch (error) {
                let errorMessage = 'Error updating the payment';
                if (error.response?.data?.error) {
                    errorMessage = error.response.data.error;
                }
                throw new Error(errorMessage);
            }
        } catch (error) {
            setError(typeof error === 'string' ? error : error.message || 'Error registering payment');
        }
    };

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
                            {nights} {nights === 1 ? 'Night' : 'Nights'} x {formatCurrency(pricePerNight)}
                        </Typography>
                        <Typography>
                            {formatCurrency(subtotal)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Cargo por Limpieza */}
                {cleaningFee > 0 && (
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
                )}

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
                            {formatCurrency(totalAmount)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Pagos recibidos */}
                <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography>
                            Amount Paid
                        </Typography>
                        <Typography color="success.main">
                            {formatCurrency(amountPaid)}
                        </Typography>
                    </Box>
                </Grid>

                {/* Saldo pendiente */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography fontWeight="bold">
                                Balance Due
                            </Typography>
                            <Typography fontWeight="bold" color={amountDue > 0 ? "error.main" : "success.main"}>
                                {formatCurrency(amountDue)}
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
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Amount to Pay"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    error={!!error}
                                    helperText={error}
                                    InputProps={{
                                        startAdornment: '$'
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Payment Method</InputLabel>
                                    <Select
                                        value={paymentMethod}
                                        label="Payment Method"
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        {paymentMethods.map((method) => (
                                            <MenuItem key={method.value} value={method.value}>
                                                {method.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<PaymentIcon />}
                            onClick={handlePaymentRegistration}
                            disabled={!paymentAmount || Number(paymentAmount) <= 0}
                            sx={{ mt: 2 }}
                        >
                            Register Payment
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            {/* Alertas */}
            <Snackbar 
                open={!!error} 
                autoHideDuration={6000} 
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>

            <Snackbar 
                open={success} 
                autoHideDuration={6000} 
                onClose={() => setSuccess(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
                    Payment registered successfully
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PaymentSummary;
