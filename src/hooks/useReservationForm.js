import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminApartments, selectAllApartments } from '../redux/adminApartmentSlice';
import { fetchUsers, selectAllUsers, selectUserStatus } from '../redux/userSlice';
import { formatDateToString, calculateNights } from '../utils/dateUtils';

export const useReservationForm = (initialData) => {
    const dispatch = useDispatch();
    const apartments = useSelector(selectAllApartments);
    const apartmentsStatus = useSelector(state => state.adminApartments.status);
    const clients = useSelector(selectAllUsers);
    const clientsStatus = useSelector(selectUserStatus);

    const [formData, setFormData] = useState({
        id: null, // Agregar el ID para reservas existentes
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

    // Estado para pago inicial en reservas nuevas
    const [initialPaymentData, setInitialPaymentData] = useState({
        amount: '',
        paymentMethod: 'cash',
        notes: ''
    });

    // Cargar datos iniciales
    useEffect(() => {
        if (apartmentsStatus === 'idle' || apartmentsStatus === 'failed') {
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
                id: initialData.id || initialData.reservationId, // Agregar el ID de la reserva
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

    // Calcular noches y precios derivados en un solo efecto para evitar renders en cascada
    useEffect(() => {
        if (!formData.checkInDate || !formData.checkOutDate) return;

        const nights = calculateNights(formData.checkInDate, formData.checkOutDate);
        const price = Number(formData.price);
        const cleaningFee = Number(formData.cleaningFee) || 0;
        const parkingFee = Number(formData.parkingFee) || 0;
        const otherExpenses = Number(formData.otherExpenses) || 0;
        const taxes = Number(formData.taxes) || 0;
        const amountPaid = Number(formData.amountPaid) || 0;

        // cancellationFee es un ítem aparte y NO suma al subtotal
        const subtotal = price * nights + cleaningFee + parkingFee + otherExpenses;
        const total = subtotal + taxes;
        const due = total - amountPaid;

        let paymentStatus = 'pending';
        if (due <= 0) paymentStatus = 'complete';
        else if (amountPaid > 0) paymentStatus = 'partial';

        const newTotalAmount = parseFloat(total.toFixed(2));
        const newAmountDue = parseFloat(due.toFixed(2));

        setFormData(prev => {
            if (
                prev.nights === nights &&
                prev.totalAmount === newTotalAmount &&
                prev.amountDue === newAmountDue &&
                prev.paymentStatus === paymentStatus
            ) return prev;

            return {
                ...prev,
                nights,
                totalAmount: newTotalAmount,
                amountDue: newAmountDue,
                paymentStatus
            };
        });
    }, [
        formData.checkInDate,
        formData.checkOutDate,
        formData.price,
        formData.cleaningFee,
        formData.parkingFee,
        formData.otherExpenses,
        formData.taxes,
        formData.amountPaid
    ]);

    const handleChange = useCallback((event) => {
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
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, [apartments]);

    const handleDateChange = useCallback((name) => (date) => {
        if (date) {
            const formattedDate = formatDateToString(date);
            setFormData(prev => ({ ...prev, [name]: formattedDate }));
        } else {
            setFormData(prev => ({ ...prev, [name]: null }));
        }
    }, []);

    const handleClientSelect = useCallback((client) => {
        setSelectedClient(client);
        if (client) {
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
    }, []);

    const handleNewClientCreated = useCallback((newClient) => {
        setSelectedClient(newClient);
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
    }, []);

    const handleInitialPaymentChange = useCallback((paymentData) => {
        setInitialPaymentData(paymentData);
        setFormData(prev => ({
            ...prev,
            amountPaid: paymentData.amount && paymentData.amount > 0
                ? parseFloat(paymentData.amount)
                : 0
        }));
    }, []);

    const resetForm = useCallback(() => {
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
        setInitialPaymentData({ amount: '', paymentMethod: 'cash', notes: '' });
    }, []);

    return {
        formData,
        selectedApartment,
        selectedClient,
        apartments,
        clients,
        initialPaymentData,
        handleChange,
        handleDateChange,
        handleClientSelect,
        handleNewClientCreated,
        handleInitialPaymentChange,
        resetForm
    };
};
