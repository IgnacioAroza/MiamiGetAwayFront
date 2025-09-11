import React, { useState } from 'react';
import {
    Grid,
    Typography,
    Divider,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Paper,
    Card,
    CardContent,
    CardHeader,
    IconButton,
} from '@mui/material';
import {
    Apartment as ApartmentIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
    AttachMoney as MoneyIcon,
    Receipt as ReceiptIcon,
    Notes as NotesIcon,
    Assessment as AssessmentIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enUS } from 'date-fns/locale';

// Componentes
import ApartmentSection from './sections/ApartmentSection';
import DateSection from './sections/DateSection';
import ClientSection from './sections/ClientSection';
import PricingSection from './sections/PricingSection';
import PaymentSection from './sections/PaymentSection';
import StatusSection from './sections/StatusSection';
import NotesSection from './sections/NotesSection';
import ReservationPaymentSummary from './sections/ReservationPaymentSummary';
import CreateUser from '../users/CreateUser';
import EditUser from '../users/EditUser';
import { useReservationForm } from '../../../hooks/useReservationForm';

const ReservationForm = ({ initialData, onSubmit }) => {
    const {
        formData,
        selectedApartment,
        selectedClient,
        apartments,
        clients,
        handleChange,
        handleDateChange,
        handleClientSelect,
        handleNewClientCreated,
        resetForm
    } = useReservationForm(initialData);

    const [openNewClientDialog, setOpenNewClientDialog] = useState(false);
    const [openEditClientDialog, setOpenEditClientDialog] = useState(false);

    // Manejadores de diálogos
    const handleOpenNewClientDialog = () => setOpenNewClientDialog(true);
    const handleCloseNewClientDialog = () => setOpenNewClientDialog(false);
    const handleOpenEditClientDialog = () => setOpenEditClientDialog(true);
    const handleCloseEditClientDialog = () => setOpenEditClientDialog(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        
        // Validar que los campos requeridos estén completos
        if (!formData.apartmentId) {
            alert('Please select an apartment');
            return;
        }
        
        if (!formData.checkInDate || !formData.checkOutDate) {
            alert('Please select both check-in and check-out dates');
            return;
        }
        
        if (!formData.clientName || !formData.clientEmail) {
            alert('Client name and email are required');
            return;
        }
        
        try {
            // Preparar datos para enviar
            const dataToSubmit = {
                apartmentId: Number(formData.apartmentId),
                clientId: formData.clientId ? Number(formData.clientId) : undefined,
                // Las fechas ya están en formato MM-DD-YYYY HH:mm, no es necesario convertirlas
                checkInDate: formData.checkInDate,
                checkOutDate: formData.checkOutDate,
                createdAt: new Date().toISOString(), // Esta fecha sí se mantiene en formato ISO para compatibilidad
                nights: Number(formData.nights),
                price: Number(formData.price),
                pricePerNight: Number(formData.price),
                cleaningFee: Number(formData.cleaningFee) || 0,
                cancellationFee: Number(formData.cancellationFee) || 0,
                parkingFee: Number(formData.parkingFee) || 0,
                otherExpenses: Number(formData.otherExpenses) || 0,
                taxes: Number(formData.taxes),
                totalAmount: Number(formData.totalAmount),
                amountPaid: Number(formData.amountPaid) || 0,
                amountDue: Number(formData.amountDue),
                status: formData.status,
                paymentStatus: formData.paymentStatus,
                notes: formData.notes,
                // Solo incluir datos del cliente si no hay clientId (cliente nuevo)
                ...(formData.clientId ? {} : {
                    clientName: formData.clientName,
                    clientEmail: formData.clientEmail,
                    clientPhone: formData.clientPhone,
                    clientAddress: formData.clientAddress,
                    clientCity: formData.clientCity,
                    clientCountry: formData.clientCountry,
                    clientNotes: formData.clientNotes
                })
            };
            
            onSubmit(dataToSubmit);
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            alert('Error al enviar el formulario');
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
            <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, bgcolor: '#1a1a1a', minHeight: '100vh' }}>
                <Grid container spacing={3}>
                    {/* Columna Izquierda */}
                    <Grid item xs={12} md={8}>
                        {/* Apartment Information */}
                        <Card sx={{ mb: 3, bgcolor: '#2a2a2a', color: '#fff' }}>
                            <CardHeader
                                avatar={<ApartmentIcon sx={{ color: '#fff' }} />}
                                title="Apartment Information"
                                sx={{ 
                                    bgcolor: '#333',
                                    '& .MuiCardHeader-title': { color: '#fff', fontWeight: 'bold' }
                                }}
                            />
                            <CardContent>
                                <ApartmentSection 
                                    formData={formData}
                                    apartments={apartments}
                                    selectedApartment={selectedApartment}
                                    onChange={handleChange}
                                />
                            </CardContent>
                        </Card>

                        {/* Reservation Dates */}
                        <Card sx={{ mb: 3, bgcolor: '#2a2a2a', color: '#fff' }}>
                            <CardHeader
                                avatar={<CalendarIcon sx={{ color: '#fff' }} />}
                                title="Reservation Dates"
                                sx={{ 
                                    bgcolor: '#333',
                                    '& .MuiCardHeader-title': { color: '#fff', fontWeight: 'bold' }
                                }}
                            />
                            <CardContent>
                                <DateSection 
                                    checkInDate={formData.checkInDate}
                                    checkOutDate={formData.checkOutDate}
                                    onDateChange={handleDateChange}
                                />
                            </CardContent>
                        </Card>

                        {/* Client Information */}
                        <Card sx={{ mb: 3, bgcolor: '#2a2a2a', color: '#fff' }}>
                            <CardHeader
                                avatar={<PersonIcon sx={{ color: '#fff' }} />}
                                title="Client Information"
                                sx={{ 
                                    bgcolor: '#333',
                                    '& .MuiCardHeader-title': { color: '#fff', fontWeight: 'bold' }
                                }}
                            />
                            <CardContent>
                                <ClientSection 
                                    formData={formData}
                                    clients={clients}
                                    selectedClient={selectedClient}
                                    onClientSelect={handleClientSelect}
                                    onNewClientCreated={handleNewClientCreated}
                                    onChange={handleChange}
                                    onOpenNewClient={handleOpenNewClientDialog}
                                    onOpenEditClient={handleOpenEditClientDialog}
                                />
                            </CardContent>
                        </Card>

                        {/* Prices and Extras */}
                        <Card sx={{ mb: 3, bgcolor: '#2a2a2a', color: '#fff' }}>
                            <CardHeader
                                avatar={<MoneyIcon sx={{ color: '#fff' }} />}
                                title="Prices and Extras"
                                sx={{ 
                                    bgcolor: '#333',
                                    '& .MuiCardHeader-title': { color: '#fff', fontWeight: 'bold' }
                                }}
                            />
                            <CardContent>
                                <PricingSection 
                                    formData={formData} 
                                    onChange={handleChange} 
                                />
                            </CardContent>
                        </Card>

                        {/* Reservation Notes */}
                        <Card sx={{ mb: 3, bgcolor: '#2a2a2a', color: '#fff' }}>
                            <CardHeader
                                avatar={<NotesIcon sx={{ color: '#fff' }} />}
                                title="Reservation Notes"
                                sx={{ 
                                    bgcolor: '#333',
                                    '& .MuiCardHeader-title': { color: '#fff', fontWeight: 'bold' }
                                }}
                            />
                            <CardContent>
                                <NotesSection
                                    formData={formData}
                                    onChange={handleChange}
                                />
                            </CardContent>
                        </Card>

                        {/* Reservation Status */}
                        <Card sx={{ mb: 3, bgcolor: '#2a2a2a', color: '#fff' }}>
                            <CardHeader
                                avatar={<AssessmentIcon sx={{ color: '#fff' }} />}
                                title="Reservation Status"
                                sx={{ 
                                    bgcolor: '#333',
                                    '& .MuiCardHeader-title': { color: '#fff', fontWeight: 'bold' }
                                }}
                            />
                            <CardContent>
                                <StatusSection 
                                    formData={formData} 
                                    onChange={handleChange} 
                                />
                            </CardContent>
                        </Card>

                        {/* Botones de Acción */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                onClick={resetForm}
                                size="large"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                variant="contained" 
                                color="success"
                                size="large"
                                sx={{ minWidth: '120px' }}
                            >
                                {initialData ? 'Save' : 'Create Reservation'}
                            </Button>
                        </Box>
                    </Grid>

                    {/* Columna Derecha - Payment Summary */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ bgcolor: '#2a2a2a', color: '#fff', position: 'sticky', top: 20 }}>
                            <CardHeader
                                avatar={<ReceiptIcon sx={{ color: '#fff' }} />}
                                title="Payment Summary"
                                action={
                                    <Box sx={{ 
                                        bgcolor: '#ff9800', 
                                        color: '#000', 
                                        px: 1.5, 
                                        py: 0.5, 
                                        borderRadius: 1,
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold'
                                    }}>
                                        PENDING
                                    </Box>
                                }
                                sx={{ 
                                    bgcolor: '#333',
                                    '& .MuiCardHeader-title': { color: '#fff', fontWeight: 'bold' }
                                }}
                            />
                            <CardContent>
                                {/* Payment Summary Data */}
                                <ReservationPaymentSummary formData={formData} />
                                
                                {/* Payment Registration Section */}
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>
                                        Payment Registration
                                    </Typography>
                                    <PaymentSection 
                                        formData={formData} 
                                        onChange={handleChange} 
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Diálogos */}
            <Dialog 
                open={openNewClientDialog} 
                onClose={handleCloseNewClientDialog} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#1e1e1e',
                        color: '#fff'
                    }
                }}
            >
                <DialogTitle>Add New Client</DialogTitle>
                <DialogContent>
                    <CreateUser 
                        isDialog={true}
                        onSuccess={(newClient) => {
                            handleNewClientCreated(newClient);
                            handleCloseNewClientDialog();
                        }}
                        onCancel={handleCloseNewClientDialog}
                    />
                </DialogContent>
            </Dialog>

            <Dialog 
                open={openEditClientDialog} 
                onClose={handleCloseEditClientDialog} 
                maxWidth="md" 
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#1e1e1e',
                        color: '#fff'
                    }
                }}
            >
                <DialogTitle>Edit Client</DialogTitle>
                <DialogContent>
                    <EditUser 
                        isDialog={true}
                        onSuccess={(updatedUser) => {
                            handleClientSelect(updatedUser);
                            handleCloseEditClientDialog();
                        }}
                        onCancel={handleCloseEditClientDialog}
                        initialData={selectedClient}
                    />
                </DialogContent>
            </Dialog>
        </LocalizationProvider>
    );
};

export default ReservationForm;
