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
import { createPayment, updatePayment } from '../../../redux/reservationPaymentSlice';

const PAYMENT_METHODS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'card', label: 'Tarjeta' }
];

const PaymentForm = ({ open, onClose }) => {
    const dispatch = useDispatch();
    const selectedPayment = useSelector(state => state.reservationPayments.selectedPayment);
    const loading = useSelector(state => state.reservationPayments.loading);

    // Estado del formulario
    const [formData, setFormData] = useState({
        amount: '',
        paymentDate: new Date(),
        paymentMethod: 'cash',
        paymentReference: '',
        notes: '',
        reservationId: ''
    });

    // Estado de errores
    const [errors, setErrors] = useState({});

    // Cargar datos si es edición
    useEffect(() => {
        if (selectedPayment) {
            setFormData({
                amount: selectedPayment.amount.toString(),
                paymentDate: new Date(selectedPayment.paymentDate),
                paymentMethod: selectedPayment.paymentMethod,
                paymentReference: selectedPayment.paymentReference || '',
                notes: selectedPayment.notes || '',
                reservationId: selectedPayment.reservationId.toString()
            });
        }
    }, [selectedPayment]);

    // Validación del formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Enter a valid amount';
        }

        if (!formData.paymentDate) {
            newErrors.paymentDate = 'Select a date';
        }

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Select a payment method';
        }

        if (!formData.reservationId) {
            newErrors.reservationId = 'Enter the reservation ID';
        }

        if (formData.paymentMethod === 'transfer' && !formData.paymentReference) {
            newErrors.paymentReference = 'Enter the transfer reference';
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
            paymentDate: date
        }));
        if (errors.paymentDate) {
            setErrors(prev => ({
                ...prev,
                paymentDate: undefined
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const paymentData = {
            ...formData,
            amount: parseFloat(formData.amount),
            reservationId: parseInt(formData.reservationId)
        };

        try {
            if (selectedPayment) {
                await dispatch(updatePayment({ 
                    id: selectedPayment.id, 
                    paymentData 
                })).unwrap();
            } else {
                await dispatch(createPayment(paymentData)).unwrap();
            }
            onClose();
            setFormData({
                amount: '',
                paymentDate: new Date(),
                paymentMethod: 'cash',
                paymentReference: '',
                notes: '',
                reservationId: ''
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
            paymentDate: new Date(),
            paymentMethod: 'cash',
            paymentReference: '',
            notes: '',
            reservationId: ''
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
                                name="reservationId"
                                label="Reservation ID"
                                fullWidth
                                value={formData.reservationId}
                                onChange={handleChange}
                                error={!!errors.reservationId}
                                helperText={errors.reservationId}
                                disabled={loading}
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
                                    value={formData.paymentDate}
                                    onChange={handleDateChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            fullWidth
                                            error={!!errors.paymentDate}
                                            helperText={errors.paymentDate}
                                        />
                                    )}
                                    disabled={loading}
                                />
                            </LocalizationProvider>
                        </Grid>

                        <Grid item xs={12}>
                            <FormControl 
                                fullWidth 
                                error={!!errors.paymentMethod}
                            >
                                <InputLabel>Payment Method</InputLabel>
                                <Select
                                    name="paymentMethod"
                                    value={formData.paymentMethod}
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
                                {errors.paymentMethod && (
                                    <FormHelperText>
                                        {errors.paymentMethod}
                                    </FormHelperText>
                                )}
                            </FormControl>
                        </Grid>

                        {formData.paymentMethod === 'transfer' && (
                            <Grid item xs={12}>
                                <TextField
                                    name="paymentReference"
                                    label="Payment Reference"
                                    fullWidth
                                    value={formData.paymentReference}
                                    onChange={handleChange}
                                    error={!!errors.paymentReference}
                                    helperText={errors.paymentReference}
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
