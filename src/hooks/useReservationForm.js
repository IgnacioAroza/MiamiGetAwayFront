import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminApartments, selectAllApartments } from '../redux/adminApartmentSlice';
import { fetchUsers, selectAllUsers, selectUserStatus } from '../redux/userSlice';
import { formatDateToString, parseStringToDate, calculateNights } from '../utils/dateUtils';

export const useReservationForm = (initialData) => {
    const dispatch = useDispatch();
    const apartments = useSelector(selectAllApartments);
    const apartmentsStatus = useSelector(state => state.adminApartments.status);
    const clients = useSelector(selectAllUsers);
    const clientsStatus = useSelector(selectUserStatus);

    const [formData, setFormData] = useState({
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
        cancellationFee: 0,
        parkingFee: 0,
        otherExpenses: 0,
        taxes: 0,
        totalAmount: 0,
        amountPaid: 0,
        amountDue: 0,
        status: 'pending',
        paymentStatus: 'pending',
        notes: '',
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
            const formattedData = {
                apartmentId: initialData.apartmentId ? String(initialData.apartmentId) : '',
                name: initialData.apartmentName || '',
                unitNumber: initialData.unitNumber || '',
                clientId: initialData.clientId?.toString() || '',
                clientName: initialData.clientName ? `${initialData.clientName} ${initialData.clientLastname || ''}` : '',
                clientEmail: initialData.clientEmail || '',
                clientPhone: initialData.clientPhone || '',
                clientAddress: initialData.clientAddress || '',
                clientCity: initialData.clientCity || '',
                clientCountry: initialData.clientCountry || '',
                clientNotes: initialData.clientNotes || '',
                // Para fechas, ver si ya vienen en formato MM-DD-YYYY HH:mm o necesitan convertirse
                checkInDate: initialData.checkInDate || null,
                checkOutDate: initialData.checkOutDate || null,
                price: parseFloat(initialData.pricePerNight) || 0,
                pricePerNight: parseFloat(initialData.pricePerNight) || 0,
                nights: initialData.nights || 0,
                cleaningFee: parseFloat(initialData.cleaningFee) || 0,
                cancellationFee: parseFloat(initialData.cancellationFee) || 0,
                parkingFee: parseFloat(initialData.parkingFee) || 0,
                otherExpenses: parseFloat(initialData.otherExpenses) || 0,
                taxes: parseFloat(initialData.taxes) || 0,
                totalAmount: parseFloat(initialData.totalAmount) || 0,
                amountPaid: parseFloat(initialData.amountPaid) || 0,
                amountDue: parseFloat(initialData.amountDue) || 0,
                status: initialData.status || 'pending',
                paymentStatus: initialData.paymentStatus || 'pending',
                notes: initialData.notes || '',
            };

            setFormData(formattedData);

            if (initialData.apartmentId && apartments.length > 0) {
                const apartment = apartments.find(apt => apt.id === parseInt(initialData.apartmentId));
                if (apartment) {
                    setSelectedApartment(apartment);
                }
            }

            if (initialData.clientId && clients.length > 0) {
                const client = clients.find(c => c.id === parseInt(initialData.clientId));
                if (client) {
                    setSelectedClient(client);
                }
            }
        }
    }, [initialData, apartments, clients]);

    // Calcular noches cuando cambian las fechas
    useEffect(() => {
        if (formData.checkInDate && formData.checkOutDate) {
            // Usar la función de utilidad para calcular noches entre fechas
            const nights = calculateNights(formData.checkInDate, formData.checkOutDate);

            if (formData.nights !== nights) { // Evitar actualizaciones innecesarias
                setFormData(prev => ({
                    ...prev,
                    nights
                }));
            }
        }
    }, [formData.checkInDate, formData.checkOutDate, formData.nights]);

    // Calcular precios
    useEffect(() => {
        if (formData.nights > 0 && formData.price > 0) {
            const price = Number(formData.price);
            const nights = Number(formData.nights);
            const cleaningFee = Number(formData.cleaningFee) || 0;
            const parkingFee = Number(formData.parkingFee) || 0;
            const otherExpenses = Number(formData.otherExpenses) || 0;
            const amountPaid = Number(formData.amountPaid) || 0;

            const accommodationTotal = price * nights;
            // cancellationFee es un ítem aparte y NO suma al subtotal
            const subtotal = accommodationTotal + cleaningFee + parkingFee + otherExpenses;
            const taxRate = 0.07;

            // Solo calcular taxes si el campo está vacío o undefined
            let taxes;
            if (formData.taxes === '' || formData.taxes === undefined) {
                taxes = subtotal * taxRate;
            } else {
                taxes = Number(formData.taxes);
            }

            const total = subtotal + taxes;
            const due = total - amountPaid;

            let paymentStatus = 'pending';
            if (due <= 0) {
                paymentStatus = 'complete';
            } else if (amountPaid > 0) {
                paymentStatus = 'partial';
            }

            setFormData(prev => ({
                ...prev,
                taxes: formData.taxes === '' ? '' : parseFloat(taxes.toFixed(2)),
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
        formData.amountPaid,
        formData.taxes
    ]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        if (name === 'apartmentId') {
            const apartment = apartments.find(apt => apt.id === parseInt(value, 10));
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
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDateChange = (name) => (date) => {
        if (date) {
            // Convertir la fecha seleccionada al formato MM-DD-YYYY HH:mm
            const formattedDate = formatDateToString(date);
            setFormData(prev => ({
                ...prev,
                [name]: formattedDate
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        if (client) {
            // Manejar diferentes formatos de nombres (firstName/lastName o name/lastname)
            const fullName = `${client.firstName || client.name || ''} ${client.lastName || client.lastname || ''}`.trim();
            
            setFormData(prev => ({
                ...prev,
                clientId: client.id.toString(),
                clientName: fullName,
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

    const handleNewClientCreated = (newClient) => {
        // Seleccionar el nuevo cliente como cliente activo
        setSelectedClient(newClient);
        
        // Actualizar el formulario con los datos del nuevo cliente
        const fullName = `${newClient.name || newClient.firstName || ''} ${newClient.lastname || newClient.lastName || ''}`.trim();
        
        setFormData(prev => ({
            ...prev,
            clientId: newClient.id ? newClient.id.toString() : '',
            clientName: fullName,
            clientEmail: newClient.email,
            clientPhone: newClient.phone || '',
            clientAddress: newClient.address || '',
            clientCity: newClient.city || '',
            clientCountry: newClient.country || '',
            clientNotes: newClient.notes || ''
        }));
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
            cancellationFee: 0,
            parkingFee: 0,
            otherExpenses: 0,
            taxes: 0,
            totalAmount: 0,
            amountPaid: 0,
            amountDue: 0,
            status: 'pending',
            paymentStatus: 'pending',
            notes: '',
        });
        setSelectedApartment(null);
        setSelectedClient(null);
    };

    return {
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
    };
};
