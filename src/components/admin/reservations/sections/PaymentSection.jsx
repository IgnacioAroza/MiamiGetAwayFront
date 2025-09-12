import React, { useState, useEffect } from 'react';
import { Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import reservationService from '../../../../services/reservationService';

const PaymentSection = ({ formData, onChange, onPaymentRegistered, onInitialPaymentChange, initialPaymentData }) => {
    // Usar datos del prop o estado local
    const [paymentData, setPaymentData] = useState(initialPaymentData || {
        paymentAmount: '',
        paymentMethod: 'cash',
        paymentNotes: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    // Verificar si la reserva ya existe
    const isNewReservation = !formData.id;

    // Sincronizar con initialPaymentData cuando cambie
    useEffect(() => {
        if (initialPaymentData) {
            setPaymentData({
                paymentAmount: initialPaymentData.amount || '',
                paymentMethod: initialPaymentData.paymentMethod || 'cash',
                paymentNotes: initialPaymentData.notes || ''
            });
        }
    }, [initialPaymentData]);

    const handlePaymentChange = (event) => {
        const { name, value } = event.target;
        const newPaymentData = {
            ...paymentData,
            [name]: value
        };
        
        setPaymentData(newPaymentData);
        
        // Si es reserva nueva, notificar al componente padre
        if (isNewReservation && onInitialPaymentChange) {
            onInitialPaymentChange({
                amount: newPaymentData.paymentAmount,
                paymentMethod: newPaymentData.paymentMethod,
                notes: newPaymentData.paymentNotes
            });
        }
    };

    const handleRegisterPayment = async () => {
        if (!paymentData.paymentAmount || paymentData.paymentAmount <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        // Para reservas nuevas, solo actualizar el estado (se enviará con la reserva)
        if (isNewReservation) {
            if (onInitialPaymentChange) {
                onInitialPaymentChange({
                    amount: parseFloat(paymentData.paymentAmount),
                    paymentMethod: paymentData.paymentMethod,
                    notes: paymentData.paymentNotes
                });
            }
            alert('Payment will be registered when the reservation is saved');
            return;
        }

        // Para reservas existentes, funcionar como antes
        if (!formData.id) {
            alert('Cannot register payment: Reservation not yet created');
            return;
        }

        setIsLoading(true);
        try {
            const paymentPayload = {
                amount: parseFloat(paymentData.paymentAmount),
                payment_method: paymentData.paymentMethod,
                notes: paymentData.paymentNotes,
                payment_date: new Date().toISOString(),
                reservation_update: {
                    amount_paid: (parseFloat(formData.amountPaid) || 0) + parseFloat(paymentData.paymentAmount),
                    amount_due: Math.max(0, (parseFloat(formData.totalAmount) || 0) - ((parseFloat(formData.amountPaid) || 0) + parseFloat(paymentData.paymentAmount))),
                    payment_status: ((parseFloat(formData.amountPaid) || 0) + parseFloat(paymentData.paymentAmount)) >= (parseFloat(formData.totalAmount) || 0) ? 'paid' : 'partial'
                }
            };

            const response = await reservationService.registerPayment(formData.id, paymentPayload);
            
            // Actualizar el formulario con los nuevos valores
            if (onChange) {
                onChange({
                    target: { name: 'amountPaid', value: paymentPayload.reservation_update.amount_paid }
                });
                onChange({
                    target: { name: 'amountDue', value: paymentPayload.reservation_update.amount_due }
                });
                onChange({
                    target: { name: 'paymentStatus', value: paymentPayload.reservation_update.payment_status }
                });
            }

            // Limpiar el formulario de pago
            setPaymentData({
                paymentAmount: '',
                paymentMethod: 'cash',
                paymentNotes: ''
            });

            // Notificar al componente padre si hay callback
            if (onPaymentRegistered) {
                onPaymentRegistered(response);
            }

            alert('Payment registered successfully!');
        } catch (error) {
            console.error('Error registering payment:', error);
            alert('Error registering payment. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Box>
            {isNewReservation && (
                <Box sx={{ 
                    mb: 2, 
                    p: 2, 
                    bgcolor: '#333', 
                    borderRadius: 1, 
                    border: '1px solid #555' 
                }}>
                    <Typography sx={{ 
                        color: '#4caf50', 
                        fontSize: '0.85rem',
                        textAlign: 'center'
                    }}>
                        💡 Initial payment will be registered with the reservation
                    </Typography>
                </Box>
            )}
            
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        label="Amount"
                        name="paymentAmount"
                        type="number"
                        value={paymentData.paymentAmount}
                        onChange={handlePaymentChange}
                        placeholder="$0.00"
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#1a1a1a',
                                '& fieldset': { borderColor: '#555' },
                                '&:hover fieldset': { borderColor: '#777' },
                                '&.Mui-focused fieldset': { borderColor: '#90caf9' },
                            },
                            '& .MuiInputLabel-root': { color: '#ccc' },
                            '& .MuiOutlinedInput-input': { color: '#fff' },
                        }}
                    />
                </Grid>
                
                <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                        <InputLabel sx={{ color: '#ccc' }}>Method</InputLabel>
                        <Select
                            name="paymentMethod"
                            value={paymentData.paymentMethod}
                            onChange={handlePaymentChange}
                            label="Method"
                            sx={{
                                backgroundColor: '#1a1a1a',
                                color: '#fff',
                                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#777' },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' },
                                '& .MuiSvgIcon-root': { color: '#ccc' },
                            }}
                        >
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="card">Card</MenuItem>
                            <MenuItem value="transfer">Transfer</MenuItem>
                            <MenuItem value="check">Check</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Payment Notes"
                        name="paymentNotes"
                        value={paymentData.paymentNotes}
                        onChange={handlePaymentChange}
                        multiline
                        rows={2}
                        size="small"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: '#1a1a1a',
                                '& fieldset': { borderColor: '#555' },
                                '&:hover fieldset': { borderColor: '#777' },
                                '&.Mui-focused fieldset': { borderColor: '#90caf9' },
                            },
                            '& .MuiInputLabel-root': { color: '#ccc' },
                            '& .MuiOutlinedInput-input': { color: '#fff' },
                        }}
                    />
                </Grid>
                
                <Grid item xs={12}>
                    <Button
                        fullWidth
                        variant="contained"
                        color="success"
                        size="medium"
                        onClick={handleRegisterPayment}
                        disabled={isLoading || !paymentData.paymentAmount}
                        sx={{
                            bgcolor: '#4caf50',
                            '&:hover': { bgcolor: '#45a049' },
                            '&:disabled': { bgcolor: '#666', color: '#999' },
                            fontWeight: 'bold',
                            py: 1.5
                        }}
                    >
                        {isLoading ? 'Processing...' : 
                         isNewReservation ? 'Add Initial Payment' : 
                         'Register Payment'}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PaymentSection; 