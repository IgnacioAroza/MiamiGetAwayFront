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
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

// Componentes
import ApartmentSection from './sections/ApartmentSection';
import DateSection from './sections/DateSection';
import ClientSection from './sections/ClientSection';
import PricingSection from './sections/PricingSection';
import PaymentSection from './sections/PaymentSection';
import StatusSection from './sections/StatusSection';
import NotesSection from './sections/NotesSection';
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
                // Mantener las fechas en UTC sin convertir implícitamente a zona horaria local
                checkInDate: formData.checkInDate ? formData.checkInDate.toISOString() : null,
                checkOutDate: formData.checkOutDate ? formData.checkOutDate.toISOString() : null,
                createdAt: new Date().toISOString(),
                nights: Number(formData.nights),
                price: Number(formData.price),
                pricePerNight: Number(formData.price),
                cleaningFee: Number(formData.cleaningFee) || 0,
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

            // Log de los datos que se enviarán
            console.log('=== Datos a enviar en ReservationForm ===');
            console.log('ClientId:', dataToSubmit.clientId);
            console.log('Datos del cliente:', formData.clientId ? 'Solo se envía clientId' : {
                clientName: dataToSubmit.clientName,
                clientEmail: dataToSubmit.clientEmail,
                clientPhone: dataToSubmit.clientPhone,
                clientAddress: dataToSubmit.clientAddress,
                clientCity: dataToSubmit.clientCity,
                clientCountry: dataToSubmit.clientCountry,
                clientNotes: dataToSubmit.clientNotes
            });
            console.log('=======================================');
            
            onSubmit(dataToSubmit);
        } catch (error) {
            console.error('Error en handleSubmit:', error);
            alert('Error al enviar el formulario');
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Box component="form" onSubmit={handleSubmit} p={3}>
                <Grid container spacing={3}>
                    {/* Sección de Apartamento */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom>
                            Apartment Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>
                    
                    <ApartmentSection 
                        formData={formData}
                        apartments={apartments}
                        selectedApartment={selectedApartment}
                        onChange={handleChange}
                    />

                    {/* Sección de Fechas */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Reservation Dates
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <DateSection 
                        checkInDate={formData.checkInDate}
                        checkOutDate={formData.checkOutDate}
                        onDateChange={handleDateChange}
                    />

                    {/* Sección de Cliente */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Client Information
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

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

                    {/* Sección de Precios y Extras */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Prices and Extras
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>
                    
                    <PricingSection 
                        formData={formData} 
                        onChange={handleChange} 
                    />

                    {/* Sección de Notas */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Reservation Notes
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>

                    <NotesSection
                        formData={formData}
                        onChange={handleChange}
                    />

                    {/* Sección de Pago - Solo mostrar si es creación */}
                    {!initialData && (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Payment Information
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                            </Grid>
                            
                            <PaymentSection 
                                formData={formData} 
                                onChange={handleChange} 
                            />
                        </>
                    )}

                    {/* Sección de Estado */}
                    <Grid item xs={12}>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                            Reservation Status
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                    </Grid>
                    
                    <StatusSection 
                        formData={formData} 
                        onChange={handleChange} 
                    />

                    {/* Botones de Acción */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                onClick={resetForm}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" color="primary">
                                {initialData ? 'Update Reservation' : 'Create Reservation'}
                            </Button>
                        </Box>
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
                        onSuccess={handleNewClientCreated}
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
