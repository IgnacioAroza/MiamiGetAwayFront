import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
    FormControl,
    InputLabel,
    Select,
    FormHelperText,
    CircularProgress,
    Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale';
import { createPayment, updatePayment, fetchAllPayments } from '../../../redux/reservationPaymentSlice';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Cash' },
    { value: 'transfer', label: 'Bank Transfer' },
    { value: 'card', label: 'Card' },
    { value: 'paypal', label: 'Paypal' }
];

const PaymentForm = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const selectedPayment = useSelector(state => state.reservationPayments.selectedPayment);
    const loading = useSelector(state => state.reservationPayments.loading);

    // Estado del formulario
    const [formData, setFormData] = useState({
        amount: '',
        payment_date: new Date(),
        payment_method: 'CASH',
        payment_reference: '',
        notes: '',
        reservation_id: '',
        client_id: ''
    });

    // Estado de errores
    const [errors, setErrors] = useState({});

    // Cargar datos si es edición
    useEffect(() => {
        if (selectedPayment) {
            // Normalizar los datos del pago seleccionado
            const normalizedPayment = {
                amount: selectedPayment.amount?.toString() || '',
                payment_date: selectedPayment.payment_date ? new Date(selectedPayment.payment_date) : null,
                payment_method: selectedPayment.payment_method || 'CASH',
                payment_reference: selectedPayment.payment_reference || '',
                notes: selectedPayment.notes || '',
                reservation_id: selectedPayment.reservation_id?.toString() || '',
                client_id: selectedPayment.client_id?.toString() || ''
            };
            setFormData(normalizedPayment);
        } else {
            // Resetear el formulario si no hay pago seleccionado
            setFormData({
                amount: '',
                payment_date: new Date(),
                payment_method: 'CASH',
                payment_reference: '',
                notes: '',
                reservation_id: '',
                client_id: ''
            });
        }
    }, [selectedPayment]);

    // Validación del formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Enter a valid amount';
        }

        if (!formData.payment_date) {
            newErrors.payment_date = 'Select a date';
        }

        if (!formData.payment_method) {
            newErrors.payment_method = 'Select a payment method';
        }

        if (!formData.reservation_id) {
            newErrors.reservation_id = 'Enter the reservation ID';
        }

        if (formData.payment_method === 'transfer' && !formData.payment_reference) {
            newErrors.payment_reference = 'Enter the transfer reference';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejadores de eventos
    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Limpiar error del campo cuando se modifica
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            payment_date: date
        }));
        if (errors.payment_date) {
            setErrors(prev => ({
                ...prev,
                payment_date: undefined
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const paymentData = {
            amount: parseFloat(formData.amount),
            payment_date: formData.payment_date ? formData.payment_date.toISOString().split('T')[0] : null,
            payment_method: formData.payment_method,
            payment_reference: formData.payment_reference || null,
            notes: formData.notes || null,
            reservation_id: parseInt(formData.reservation_id),
            client_id: selectedPayment?.client_id || null
        };

        try {
            if (selectedPayment) {
                const result = await dispatch(updatePayment({ 
                    id: selectedPayment.id, 
                    paymentData 
                })).unwrap();
                // Recargar la lista de pagos después de la actualización
                await dispatch(fetchAllPayments()).unwrap();
            } else {
                await dispatch(createPayment(paymentData)).unwrap();
            }
            onClose();
            setFormData({
                amount: '',
                payment_date: new Date(),
                payment_method: 'CASH',
                payment_reference: '',
                notes: '',
                reservation_id: '',
                client_id: ''
            });
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                submit: error.message || 'Error processing payment'
            }));
        }
    };

    const handleClose = () => {
        setFormData({
            amount: '',
            payment_date: new Date(),
            payment_method: 'CASH',
            payment_reference: '',
            notes: '',
            reservation_id: '',
            client_id: ''
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {selectedPayment ? 'Edit Payment' : 'New Payment'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        {errors.submit && (
                            <Grid item xs={12}>
                                <Alert severity="error">
                                    {errors.submit}
                                </Alert>
                            </Grid>
                        )}
                        
                        <Grid item xs={12}>
                            <TextField
                                name="reservation_id"
                                label="Reservation ID"
                                fullWidth
                                value={formData.reservation_id}
                                onChange={handleChange}
                                error={!!errors.reservation_id}
                                helperText={errors.reservation_id}
                                disabled
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="amount"
                                label="Amount"
                                type="number"
                                fullWidth
                                value={formData.amount}
                                onChange={handleChange}
                                error={!!errors.amount}
                                helperText={errors.amount}
                                disabled={loading}
                                InputProps={{
                                    startAdornment: '$'
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                                <DatePicker
                                    label="Payment Date"
                                    value={formData.payment_date}
                                    onChange={handleDateChange}
                                    TextField={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            error={!!errors.payment_date}
                                            helperText={errors.payment_date}
                                        />
                                    )}
                                    disabled={loading}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl 
                                fullWidth 
                                error={!!errors.payment_method}
                            >
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    name="payment_method"
                                    value={formData.payment_method}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    {PAYMENT_METHODS.map(method => (
                                        <MenuItem 
                                            key={method.value} 
                                            value={method.value}
                                        >
                                            {method.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.payment_method && (
                                    <FormHelperText>
                                        {errors.payment_method}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {formData.payment_method === 'transfer' && (
                            <Grid item xs={12}>
                                <TextField
                                    name="payment_reference"
                                    label="Payment Reference"
                                    fullWidth
                                    value={formData.payment_reference}
                                    onChange={handleChange}
                                    error={!!errors.payment_reference}
                                    helperText={errors.payment_reference}
                                    disabled={loading}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <TextField
                                name="notes"
                                label="Notes"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData.notes}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={handleClose} 
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} />
                        ) : (
                            selectedPayment ? 'Update' : 'Create'
                        )}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PaymentForm;
