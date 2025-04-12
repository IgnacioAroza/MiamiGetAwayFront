import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography, Button, Alert, Snackbar } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { fetchReservationById, updateReservation, createReservation, registerPayment } from '../../../redux/reservationSlice';
import ReservationForm from './ReservationForm';
import reservationService from '../../../services/reservationService';

const ReservationManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedReservation, loading, error } = useSelector(state => state.reservations);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
    
    useEffect(() => {
        // Si hay un ID en la URL, cargar la reserva específica
        if (id) {
            dispatch(fetchReservationById(id));
        }
    }, [dispatch, id]);
    
    // Función para actualización directa de tarifas
    const updateDirectly = async (formData) => {
        try {
            // Determinar qué campos se han modificado comparando con los datos originales
            const originalData = selectedReservation || {};
            const changedFields = {};
            
            // Función auxiliar para comparar valores numéricos con tolerancia a diferencias de precisión
            const hasNumericChanged = (newVal, oldVal) => {
                // Convertir ambos valores a número, con manejo de strings, null y undefined
                const newNum = typeof newVal === 'string' ? parseFloat(newVal) : (typeof newVal === 'number' ? newVal : 0);
                const oldNum = typeof oldVal === 'string' ? parseFloat(oldVal) : (typeof oldVal === 'number' ? oldVal : 0);
                
                // Considerar una pequeña tolerancia para evitar problemas de redondeo
                return Math.abs(newNum - oldNum) > 0.001;
            };
            
            // Verificar cada campo de tarifa
            if (formData.parkingFee !== undefined && 
                hasNumericChanged(formData.parkingFee, originalData.parking_fee)) {
                changedFields.parkingFee = formData.parkingFee;
            }
            
            if (formData.cleaningFee !== undefined && 
                hasNumericChanged(formData.cleaningFee, originalData.cleaning_fee)) {
                changedFields.cleaningFee = formData.cleaningFee;
            }
            
            if (formData.otherExpenses !== undefined && 
                hasNumericChanged(formData.otherExpenses, originalData.other_expenses)) {
                changedFields.otherExpenses = formData.otherExpenses;
            }

            // Si no hay cambios, no hacer nada
            if (Object.keys(changedFields).length === 0) {
                setNotification({
                    open: true,
                    message: 'No se detectaron cambios en las tarifas',
                    type: 'info'
                });
                return true;
            }
            
            // Usar el método general para actualizar todas las tarifas de una vez
            const response = await reservationService.updateFees(id, changedFields);
            
            // Mostrar notificación de éxito con los detalles de lo actualizado
            let successMessage = 'Tarifas actualizadas:';
            if (changedFields.parkingFee !== undefined) {
                successMessage += ` Parking $${parseFloat(changedFields.parkingFee).toFixed(2)}`;
            }
            if (changedFields.cleaningFee !== undefined) {
                successMessage += ` Cleaning $${parseFloat(changedFields.cleaningFee).toFixed(2)}`;
            }
            if (changedFields.otherExpenses !== undefined) {
                successMessage += ` Other $${parseFloat(changedFields.otherExpenses).toFixed(2)}`;
            }
            
            setNotification({
                open: true,
                message: successMessage,
                type: 'success'
            });
            
            // Recargar los datos para mostrar los nuevos valores calculados por el servidor
            dispatch(fetchReservationById(id));
            
            return true;
        } catch (error) {
            // Mostrar notificación de error
            setNotification({
                open: true,
                message: `Error: ${error.response?.data?.message || error.message}`,
                type: 'error'
            });
            
            return false;
        }
    };
    
    const handleSubmit = async (formData) => {
        try {            
            let reservationId;
            
            // Si estamos creando una nueva reserva
            if (!id) {
                const result = await dispatch(createReservation(formData)).unwrap();
                reservationId = result.id;
                
                // Si hay un monto pagado, registrar el pago
                if (formData.amountPaid && parseFloat(formData.amountPaid) > 0) {
                    try {
                        // Calcular el amountDue con validación y manejo de decimales
                        const totalAmount = Math.max(0, parseFloat(formData.totalAmount) || 0);
                        const amountPaid = Math.max(0, parseFloat(formData.amountPaid) || 0);
                        const amountDue = Math.max(0, parseFloat((totalAmount - amountPaid).toFixed(2)));
                        
                        // Preparar datos para el pago
                        const paymentData = {
                            amount: parseFloat(formData.amountPaid),
                            payment_method: 'cash', // Método por defecto
                            notes: 'Pago inicial registrado durante la creación de la reserva',
                            reservation_update: {
                                amount_paid: parseFloat(amountPaid.toFixed(2)),
                                amount_due: parseFloat(amountDue.toFixed(2)),
                                payment_status: amountDue <= 0 ? 'PAID' : (amountPaid > 0 ? 'PARTIAL' : 'PENDING')
                            }
                        };
                        
                        // Registrar el pago
                        try {
                            const response = await dispatch(registerPayment({ 
                                id: reservationId, 
                                paymentData 
                            })).unwrap();
                            
                            // Verificar si los montos son correctos
                            const responseAmountPaid = response.amount_paid || response.amountPaid;
                            const responseAmountDue = response.amount_due || response.amountDue;
                            
                            if (Math.abs(responseAmountPaid - amountPaid) < 0.01 && 
                                Math.abs(responseAmountDue - amountDue) < 0.01) {
                                // Los montos coinciden, el pago se registró correctamente
                                setNotification({
                                    open: true,
                                    message: 'Reserva creada y pago registrado exitosamente',
                                    type: 'success'
                                });
                            } else {
                                setNotification({
                                    open: true,
                                    message: 'Reserva creada, pero los montos registrados no coinciden con los esperados',
                                    type: 'warning'
                                });
                            }
                        } catch (paymentError) {
                            // Verificar si el error es 500 y si el pago podría haberse registrado de todos modos
                            if (paymentError.status === 500) {
                                // Intentar verificar si el pago se registró a pesar del error
                                try {
                                    // Esperar un momento para dar tiempo al servidor a procesar
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    
                                    // Obtener la reserva actualizada para verificar si el pago se registró
                                    const updatedReservation = await reservationService.getReservationById(reservationId);
                                    
                                    // Verificar si el monto pagado coincide con lo que intentamos registrar
                                    const currentAmountPaid = parseFloat(updatedReservation.amount_paid) || 0;
                                    const expectedAmountPaid = parseFloat(formData.amountPaid);
                                    
                                    if (Math.abs(currentAmountPaid - expectedAmountPaid) < 0.01) {
                                        // El pago parece haberse registrado correctamente a pesar del error
                                        setNotification({
                                            open: true,
                                            message: 'Reserva creada y pago registrado exitosamente (verificado)',
                                            type: 'success'
                                        });
                                    } else {
                                        // El pago no se registró correctamente
                                        setNotification({
                                            open: true,
                                            message: `Reserva creada, pero el pago no se registró correctamente. Error: ${paymentError.message || 'Error desconocido'}`,
                                            type: 'warning'
                                        });
                                    }
                                } catch (verificationError) {
                                    // No pudimos verificar si el pago se registró
                                    setNotification({
                                        open: true,
                                        message: `Reserva creada, pero hubo un error al registrar el pago: ${paymentError.message || 'Error desconocido'}. No se pudo verificar si el pago se registró.`,
                                        type: 'warning'
                                    });
                                }
                            } else {
                                // Para otros tipos de errores, mostrar el mensaje normal
                                setNotification({
                                    open: true,
                                    message: `Reserva creada, pero hubo un error al registrar el pago: ${paymentError.message || 'Error desconocido'}`,
                                    type: 'warning'
                                });
                            }
                        }
                    } catch (error) {
                        setNotification({
                            open: true,
                            message: `Reserva creada, pero hubo un error al procesar el pago: ${error.message || 'Error desconocido'}`,
                            type: 'warning'
                        });
                    }
                }
                
                navigate('/admin/reservations');
                return;
            }
            
            // Si estamos modificando una reserva existente
            const originalData = selectedReservation || {};
            
            // Verificar si solo se modificaron campos de tarifas
            const hasNumericChanged = (newVal, oldVal) => {
                // Convertir ambos valores a número, con manejo de strings, null y undefined
                const newNum = typeof newVal === 'string' ? parseFloat(newVal) : (typeof newVal === 'number' ? newVal : 0);
                const oldNum = typeof oldVal === 'string' ? parseFloat(oldVal) : (typeof oldVal === 'number' ? oldVal : 0);
                
                return Math.abs(newNum - oldNum) > 0.001;
            };
            
            // Determinar qué campos de tarifas cambiaron
            const feeFieldsChanged = {
                parkingFee: formData.parkingFee !== undefined && 
                    hasNumericChanged(formData.parkingFee, originalData.parking_fee),
                cleaningFee: formData.cleaningFee !== undefined && 
                    hasNumericChanged(formData.cleaningFee, originalData.cleaning_fee),
                otherExpenses: formData.otherExpenses !== undefined && 
                    hasNumericChanged(formData.otherExpenses, originalData.other_expenses)
            };
            
            const onlyFeesChanged = (
                // Al menos un campo de tarifa cambió
                (feeFieldsChanged.parkingFee || feeFieldsChanged.cleaningFee || feeFieldsChanged.otherExpenses)
                &&
                // Y no cambiaron otros campos importantes
                !hasNumericChanged(formData.price, originalData.price_per_night) &&
                formData.nights === originalData.nights &&
                formData.status === originalData.status &&
                formData.clientName === originalData.client_name &&
                formData.checkInDate?.toString() === new Date(originalData.check_in_date)?.toString() &&
                formData.checkOutDate?.toString() === new Date(originalData.check_out_date)?.toString()
            );
            
            // Si solo se modificaron tarifas, usar el método específico
            if (onlyFeesChanged) {
                const success = await updateDirectly(formData);
                if (success) {
                    return; // No continuar con la actualización completa
                }
            }
            
            // Si llegamos aquí, hacer una actualización completa
            const result = await dispatch(updateReservation({ 
                id, 
                reservationData: formData 
            })).unwrap();
            
            // Verificar si el monto pagado ha aumentado
            const originalAmountPaid = parseFloat(originalData.amount_paid) || 0;
            const newAmountPaid = parseFloat(formData.amountPaid) || 0;
            
            if (newAmountPaid > originalAmountPaid) {
                const paymentDifference = newAmountPaid - originalAmountPaid;
                
                if (paymentDifference > 0) {
                    try {
                        // Calcular el nuevo amountDue con validación y manejo de decimales
                        const totalAmount = Math.max(0, parseFloat(formData.totalAmount) || 0);
                        const amountDue = Math.max(0, parseFloat((totalAmount - newAmountPaid).toFixed(2)));
                        
                        // Preparar datos para el pago
                        const paymentData = {
                            amount: paymentDifference,
                            payment_method: 'cash', // Método por defecto
                            notes: 'Pago adicional registrado durante la actualización de la reserva',
                            reservation_update: {
                                amount_paid: parseFloat(newAmountPaid.toFixed(2)),
                                amount_due: parseFloat(amountDue.toFixed(2)),
                                payment_status: amountDue <= 0 ? 'PAID' : (newAmountPaid > 0 ? 'PARTIAL' : 'PENDING')
                            }
                        };
                        
                        // Registrar el pago
                        try {
                            await dispatch(registerPayment({ 
                                id, 
                                paymentData 
                            })).unwrap();
                            
                            // Mostrar notificación de éxito
                            setNotification({
                                open: true,
                                message: 'Reserva actualizada y pago registrado exitosamente',
                                type: 'success'
                            });
                        } catch (paymentError) {
                            // Verificar si el error es 500 y si el pago podría haberse registrado de todos modos
                            if (paymentError.status === 500) {
                                // Intentar verificar si el pago se registró a pesar del error
                                try {
                                    // Esperar un momento para dar tiempo al servidor a procesar
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                    
                                    // Obtener la reserva actualizada para verificar si el pago se registró
                                    const updatedReservation = await reservationService.getReservationById(id);
                                    
                                    // Verificar si el monto pagado coincide con lo que intentamos registrar
                                    const currentAmountPaid = parseFloat(updatedReservation.amount_paid) || 0;
                                    
                                    if (Math.abs(currentAmountPaid - newAmountPaid) < 0.01) {
                                        // El pago parece haberse registrado correctamente a pesar del error
                                        setNotification({
                                            open: true,
                                            message: 'Reserva actualizada y pago registrado exitosamente (verificado)',
                                            type: 'success'
                                        });
                                    } else {
                                        // El pago no se registró correctamente
                                        setNotification({
                                            open: true,
                                            message: `Reserva actualizada, pero el pago no se registró correctamente. Error: ${paymentError.message || 'Error desconocido'}`,
                                            type: 'warning'
                                        });
                                    }
                                } catch (verificationError) {
                                    // No pudimos verificar si el pago se registró
                                    setNotification({
                                        open: true,
                                        message: `Reserva actualizada, pero hubo un error al registrar el pago: ${paymentError.message || 'Error desconocido'}. No se pudo verificar si el pago se registró.`,
                                        type: 'warning'
                                    });
                                }
                            } else {
                                // Para otros tipos de errores, mostrar el mensaje normal
                                setNotification({
                                    open: true,
                                    message: `Reserva actualizada, pero hubo un error al registrar el pago: ${paymentError.message || 'Error desconocido'}`,
                                    type: 'warning'
                                });
                            }
                        }
                    } catch (error) {
                        setNotification({
                            open: true,
                            message: `Reserva actualizada, pero hubo un error al procesar el pago: ${error.message || 'Error desconocido'}`,
                            type: 'warning'
                        });
                    }
                }
            }
            
            navigate('/admin/reservations');
        } catch (error) {
            // Mostrar notificación de error
            setNotification({
                open: true,
                message: `Error: ${error.message || 'No se pudo guardar la reserva'}`,
                type: 'error'
            });
        }
    };
    
    const handleBack = () => {
        navigate('/admin/reservations');
    };
    
    const handleCloseNotification = () => {
        setNotification({...notification, open: false});
    };
    
    return (
        <Container maxWidth="xl">
            <Box py={3}>
                <Box display="flex" alignItems="center" mb={3}>
                    <Button 
                        startIcon={<ArrowBackIcon />} 
                        onClick={handleBack}
                        variant="outlined"
                        sx={{ mr: 2 }}
                    >
                        Back
                    </Button>
                    <Typography variant="h4" component="h1">
                        {id ? 'Edit reservation' : 'New reservation'}
                    </Typography>
                </Box>
                
                {loading ? (
                    <Typography>Loading...</Typography>
                ) : error ? (
                    <Typography color="error">Error: {error}</Typography>
                ) : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <ReservationForm
                                    initialData={selectedReservation}
                                    onSubmit={handleSubmit}
                                />
                            </Paper>
                        </Grid>
                    </Grid>
                )}
                
                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    message={notification.message}
                    severity={notification.type}
                />
            </Box>
        </Container>
    );
};

export default ReservationManagement;
