import React, { useState, useEffect } from 'react';
import {
    Grid,
    Typography,
    Divider,
    Box,
    Button,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminApartments, selectAllApartments } from '../../../redux/adminApartmentSlice';
import { fetchUsers, selectAllUsers, selectUserStatus } from '../../../redux/userSlice';

// Componentes
import ApartmentSection from './sections/ApartmentSection';
import DateSection from './sections/DateSection';
import ClientSection from './sections/ClientSection';
import PricingSection from './sections/PricingSection';
import PaymentSection from './sections/PaymentSection';
import StatusSection from './sections/StatusSection';

const ReservationForm = ({ initialData, onSubmit }) => {
    const dispatch = useDispatch();
    const apartments = useSelector(selectAllApartments);
    const apartmentsStatus = useSelector(state => state.adminApartments.status);
    const clients = useSelector(selectAllUsers);
    const clientsStatus = useSelector(selectUserStatus);
    
    const [formData, setFormData] = useState({
        // Datos del apartamento
        apartmentId: '',
        name: '',
        unitNumber: '',
        
        // Datos del cliente
        clientId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        clientCity: '',
        clientCountry: '',
        clientNotes: '',
        
        // Fechas
        checkInDate: null,
        checkOutDate: null,
        
        // Precios y pagos
        price: 0,
        nights: 0,
        cleaningFee: 0,
        parkingFee: 0,
        otherExpenses: 0,
        taxes: 0,
        totalAmount: 0,
        amountPaid: 0,
        amountDue: 0,
        
        // Estado
        status: 'pending',
        paymentStatus: 'pending',
    });

    const [selectedApartment, setSelectedApartment] = useState(null);
    const [selectedClient, setSelectedClient] = useState(null);

    // Cargar datos iniciales
    useEffect(() => {
        if (apartmentsStatus === 'idle') {
            dispatch(fetchAdminApartments());
        }
        
        if (clientsStatus === 'idle') {
            dispatch(fetchUsers());
        }
    }, [dispatch, apartmentsStatus, clientsStatus]);

    // Cargar datos iniciales si los hay
    useEffect(() => {
        if (initialData) {            
            // Adaptar datos del servidor al formato del formulario
            const formattedData = {
                // IDs y relaciones
                apartmentId: initialData.apartment_id?.toString() || '',
                name: initialData.apartment_name || '',
                unitNumber: initialData.unit_number || '',
                
                // Datos del cliente
                clientId: initialData.client_id?.toString() || '',
                clientName: initialData.client_name ? `${initialData.client_name} ${initialData.client_lastname || ''}` : '',
                clientEmail: initialData.client_email || '',
                clientPhone: initialData.client_phone || '',
                clientAddress: initialData.client_address || '',
                clientCity: initialData.client_city || '',
                clientCountry: initialData.client_country || '',
                clientNotes: initialData.client_notes || '',
                
                // Fechas
                checkInDate: initialData.check_in_date ? new Date(initialData.check_in_date) : null,
                checkOutDate: initialData.check_out_date ? new Date(initialData.check_out_date) : null,
                
                // Precios y pagos
                price: parseFloat(initialData.price_per_night) || 0,
                nights: initialData.nights || 0,
                cleaningFee: parseFloat(initialData.cleaning_fee) || 0,
                parkingFee: parseFloat(initialData.parking_fee) || 0,
                otherExpenses: parseFloat(initialData.other_expenses) || 0,
                taxes: parseFloat(initialData.taxes) || 0,
                totalAmount: parseFloat(initialData.total_amount) || 0,
                amountPaid: parseFloat(initialData.amount_paid) || 0,
                amountDue: parseFloat(initialData.amount_due) || 0,
                
                // Estado
                status: initialData.status || 'pending',
                paymentStatus: initialData.payment_status || 'pending',
            };
            
            setFormData(formattedData);
            
            if (initialData.apartment_id) {
                const apartment = apartments.find(apt => apt.id === parseInt(initialData.apartment_id));
                if (apartment) {
                    setSelectedApartment(apartment);
                }
            }
            
            if (initialData.client_id) {
                const client = clients.find(c => c.id === parseInt(initialData.client_id));
                if (client) {
                    setSelectedClient(client);
                }
            }
        }
    }, [initialData, apartments, clients]);

    // Calcular noches cuando cambian las fechas
    useEffect(() => {
        if (formData.checkInDate && formData.checkOutDate) {
            // Asegurar que los objetos son Date
            const checkIn = new Date(formData.checkInDate);
            const checkOut = new Date(formData.checkOutDate);
            
            // Calcular la diferencia en milisegundos
            const differenceMs = checkOut - checkIn;
            
            // Convertir a días (86400000 = 24 * 60 * 60 * 1000)
            const nights = Math.max(1, Math.round(differenceMs / 86400000));
            
            setFormData(prev => ({
                ...prev,
                nights
            }));
        }
    }, [formData.checkInDate, formData.checkOutDate]);

    // Calcular precios
    useEffect(() => {
        if (formData.nights > 0 && formData.price > 0) {
            // Convertir strings a numbers para evitar problemas de cálculo
            const price = Number(formData.price);
            const nights = Number(formData.nights);
            const cleaningFee = Number(formData.cleaningFee) || 0;
            const parkingFee = Number(formData.parkingFee) || 0;
            const otherExpenses = Number(formData.otherExpenses) || 0;
            const amountPaid = Number(formData.amountPaid) || 0;
            
            // Calcular subtotal (alojamiento + extras)
            const accommodationTotal = price * nights;
            const subtotal = accommodationTotal + cleaningFee + parkingFee + otherExpenses;
            
            // Calcular impuestos
            const taxRate = 0.07;
            const taxes = subtotal * taxRate;
            
            // Calcular total y saldo pendiente
            const total = subtotal + taxes;
            const due = total - amountPaid;
            
            // Determinar estado de pago basado en el saldo pendiente
            let paymentStatus = 'pending';
            if (due <= 0) {
                paymentStatus = 'complete';
            } else if (amountPaid > 0) {
                paymentStatus = 'partial';
            }
            
            // Actualizar SOLO los campos calculados, no tocar los inputs como parkingFee
            setFormData(prev => ({
                ...prev,
                taxes: parseFloat(taxes.toFixed(2)),
                totalAmount: parseFloat(total.toFixed(2)),
                amountDue: parseFloat(due.toFixed(2)),
                paymentStatus
            }));
        }
    }, [
        formData.price, 
        formData.nights, 
        formData.cleaningFee, 
        formData.parkingFee, 
        formData.otherExpenses,
        formData.amountPaid
    ]);

    // Manejar cambios en el formulario
    const handleChange = (event) => {
        const { name, value } = event.target;
        
        console.log(`Campo modificado: ${name}, valor: ${value}`);
        
        if (name === 'apartmentId') {
            const apartment = apartments.find(apt => apt.id === value);
            if (apartment) {
                setSelectedApartment(apartment);
                setFormData(prev => ({
                    ...prev,
                    apartmentId: value,
                    name: apartment.name || '',
                    unitNumber: apartment.unitNumber || '',
                    price: apartment.price || 0,
                    cleaningFee: apartment.cleaningFee || 0
                }));
            } else {
                setSelectedApartment(null);
                setFormData(prev => ({
                    ...prev,
                    apartmentId: value,
                    name: '',
                    unitNumber: '',
                    price: 0,
                    cleaningFee: 0
                }));
            }
        } else {
            // Procesar todos los campos de manera uniforme
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Manejar cambio de fechas
    const handleDateChange = (name) => (date) => {
        setFormData(prev => ({
            ...prev,
            [name]: date
        }));
    };

    // Manejar selección de cliente
    const handleClientSelect = (client) => {
        setSelectedClient(client);
        if (client) {
            setFormData(prev => ({
                ...prev,
                clientId: client.id,
                clientName: `${client.firstName} ${client.lastName}`,
                clientEmail: client.email,
                clientPhone: client.phone,
                clientAddress: client.address || '',
                clientCity: client.city || '',
                clientCountry: client.country || '',
                clientNotes: client.notes || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                clientId: '',
                clientName: '',
                clientEmail: '',
                clientPhone: '',
                clientAddress: '',
                clientCity: '',
                clientCountry: '',
                clientNotes: ''
            }));
        }
    };

    // Actualizar datos del cliente desde un cliente recién creado
    const handleNewClientCreated = (newClient) => {
        handleClientSelect({
            id: newClient.id,
            firstName: newClient.name,
            lastName: newClient.lastname,
            email: newClient.email,
            phone: newClient.phone || '',
            address: newClient.address || '',
            city: newClient.city || '',
            country: newClient.country || '',
            notes: newClient.notes || ''
        });
    };

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
                // ID y relaciones
                apartmentId: Number(formData.apartmentId),
                clientId: formData.clientId ? Number(formData.clientId) : undefined,
                
                // Fechas
                checkInDate: formData.checkInDate ? new Date(formData.checkInDate).toISOString() : null,
                checkOutDate: formData.checkOutDate ? new Date(formData.checkOutDate).toISOString() : null,
                createdAt: new Date().toISOString(),
                
                // Cantidades numéricas - asegurar que sean números, no strings
                nights: Number(formData.nights),
                price: Number(formData.price),
                pricePerNight: Number(formData.price),
                cleaningFee: Number(formData.cleaningFee) || 0,
                parkingFee: Number(formData.parkingFee) || 0, // Usar Number explícitamente
                otherExpenses: Number(formData.otherExpenses) || 0,
                taxes: Number(formData.taxes),
                totalAmount: Number(formData.totalAmount),
                amountPaid: Number(formData.amountPaid) || 0,
                amountDue: Number(formData.amountDue),
                
                // Estados
                status: formData.status,
                paymentStatus: formData.paymentStatus,
                
                // Datos adicionales del cliente
                clientName: formData.clientName,
                clientEmail: formData.clientEmail,
                clientPhone: formData.clientPhone,
                clientAddress: formData.clientAddress,
                clientCity: formData.clientCity,
                clientCountry: formData.clientCountry,
                clientNotes: formData.clientNotes
            };
            
            console.log('Enviando datos de reserva:', dataToSubmit);
            
            // Llamar a la función de envío proporcionada
            onSubmit(dataToSubmit);
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            alert('Error al enviar el formulario');
        }
    };

    const resetForm = () => {
        setFormData({
            apartmentId: '',
            name: '',
            unitNumber: '',
            clientId: '',
            clientName: '',
            clientEmail: '',
            clientPhone: '',
            clientAddress: '',
            clientCity: '',
            clientCountry: '',
            clientNotes: '',
            checkInDate: null,
            checkOutDate: null,
            price: 0,
            nights: 0,
            cleaningFee: 0,
            parkingFee: 0,
            otherExpenses: 0,
            taxes: 0,
            totalAmount: 0,
            amountPaid: 0,
            amountDue: 0,
            status: 'pending',
            paymentStatus: 'pending',
        });
        setSelectedApartment(null);
        setSelectedClient(null);
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

                    {/* Sección de Pago - Solo mostrar si es creación (initialData NO existe) */}
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
        </LocalizationProvider>
    );
};

export default ReservationForm;
