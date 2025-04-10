import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Grid, Paper, Typography, Button, Tabs, Tab, Alert, Snackbar } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { fetchReservationById, updateReservation, createReservation } from '../../../redux/reservationSlice';
import ReservationForm from './ReservationForm';
import PaymentSummary from '../payments/PaymentSummary';
import reservationService from '../../../services/reservationService';

const ReservationManagement = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedReservation, loading, error } = useSelector(state => state.reservations);
    const [activeTab, setActiveTab] = useState(0);
    const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });
    
    useEffect(() => {
        // Si hay un ID en la URL, cargar la reserva específica
        if (id) {
            dispatch(fetchReservationById(id));
        }
    }, [dispatch, id]);
    
    // Agregar este log para ver si los datos están llegando
    useEffect(() => {
        if (selectedReservation) {
            console.log("Datos de reserva cargados:", selectedReservation);
        }
    }, [selectedReservation]);
    
    const handlePaymentRegistered = async () => {
        if (id) {
            // Recargar la reserva para obtener los datos actualizados
            await dispatch(fetchReservationById(id)).unwrap();
        }
    };
    
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
            console.error("Error en actualización directa:", error);
            if (error.response) {
                console.error("Detalles:", error.response.data);
            }
            
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
            // Si estamos creando una nueva reserva
            if (!id) {
                await dispatch(createReservation(formData)).unwrap();
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
            await dispatch(updateReservation({ 
                id, 
                reservationData: formData 
            })).unwrap();
            
            navigate('/admin/reservations');
        } catch (error) {
            console.error('Error saving reservation:', error);
            
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
    
    const handleTabChange = (e, newValue) => {
        setActiveTab(newValue);
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
                            <Paper elevation={3}>
                                <Tabs value={activeTab} onChange={handleTabChange}>
                                    <Tab label="Detalles" />
                                    <Tab label="Pagos" />
                                </Tabs>

                                {activeTab === 1 && (
                                    <Alert severity="info" sx={{ mt: 2, mx: 2 }}>
                                        En esta pestaña solo puede registrar pagos y actualizar el estado de pago.
                                        Para modificar otros datos como tarifas o fechas, vaya a la pestaña &quot;Detalles&quot;.
                                    </Alert>
                                )}

                                <Box sx={{ mt: 2 }}>
                                    {activeTab === 0 ? (
                                        <ReservationForm
                                            initialData={selectedReservation}
                                            onSubmit={handleSubmit}
                                        />
                                    ) : (
                                        <PaymentSummary 
                                            reservation={selectedReservation}
                                            onPaymentRegistered={handlePaymentRegistered}
                                        />
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Payment summary
                                </Typography>
                                <PaymentSummary 
                                    reservation={id ? selectedReservation : null}
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
