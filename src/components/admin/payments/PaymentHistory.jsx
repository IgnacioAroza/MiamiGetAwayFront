import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../../utils/api';

const PaymentHistory = ({ payments = [], reservationId }) => {
    const [loadedPayments, setLoadedPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false); // Estado para controlar si ya se cargaron los datos

    // Cargar pagos directamente desde la API si se proporciona un ID de reserva
    useEffect(() => {
        // Si ya hemos intentado cargar con este ID o si no hay ID, no hacemos nada
        if (!reservationId || hasLoaded) {
            return;
        }

        const fetchPaymentsByReservationId = async () => {
            setLoading(true);
            setError(null);
            
            try {
                console.log(`Obteniendo pagos para la reserva ID: ${reservationId}`);
                const response = await api.get(`/reservations/${reservationId}/payments`);
                console.log('Pagos obtenidos:', response.data);
                
                if (response.data && Array.isArray(response.data)) {
                    setLoadedPayments(response.data);
                } else if (response.data && response.data.payments && Array.isArray(response.data.payments)) {
                    setLoadedPayments(response.data.payments);
                } else {
                    setLoadedPayments([]);
                    console.warn('La respuesta no contiene un array de pagos:', response.data);
                }
            } catch (err) {
                console.error('Error al obtener pagos:', err);
                setError(err.response?.data?.message || 'Error al cargar los pagos');
                setLoadedPayments([]);
            } finally {
                setLoading(false);
                setHasLoaded(true); // Marcamos que ya hemos intentado cargar
            }
        };

        fetchPaymentsByReservationId();
    }, [reservationId, hasLoaded]); // Solo depende del ID y del flag de carga

    // Efecto para actualizar cuando cambian los pagos externos
    useEffect(() => {
        if (payments && payments.length > 0 && !reservationId) {
            setLoadedPayments(payments);
            setHasLoaded(true);
        }
    }, [payments, reservationId]);

    // Efecto para reiniciar el estado cuando cambia el ID
    useEffect(() => {
        // Si cambia el ID, reseteamos el flag para permitir una nueva carga
        setHasLoaded(false);
        setLoadedPayments([]);
    }, [reservationId]);

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return '$0.00';
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD'
        }).format(Number(amount));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Fecha inválida';
        }
    };

    // Normalizar los nombres de propiedades para diferentes formatos
    const normalizedPayments = loadedPayments.map(payment => ({
        id: payment.id || Math.random().toString(36),
        date: payment.date || payment.paymentDate || payment.payment_date || payment.created_at || new Date().toISOString(),
        method: payment.method || payment.paymentMethod || payment.payment_method || 'N/A',
        reference: payment.reference || payment.paymentReference || payment.payment_reference || '-',
        amount: payment.amount || 0
    }));

    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                Historial de Pagos
            </Typography>
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress size={30} />
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                    {error}
                </Alert>
            ) : normalizedPayments.length === 0 ? (
                <Typography align="center" sx={{ py: 2 }}>
                    No hay pagos registrados para esta reserva
                </Typography>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Fecha</TableCell>
                                <TableCell>Método</TableCell>
                                <TableCell>Referencia</TableCell>
                                <TableCell align="right">Monto</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {normalizedPayments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{formatDate(payment.date)}</TableCell>
                                    <TableCell>{payment.method}</TableCell>
                                    <TableCell>{payment.reference}</TableCell>
                                    <TableCell align="right">
                                        {formatCurrency(payment.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default PaymentHistory;
