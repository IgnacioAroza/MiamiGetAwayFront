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
    Skeleton,
    Alert,
    Card,
    CardContent,
    Divider,
    Stack
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '../../../utils/api';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const PaymentHistory = ({ payments = [], reservationId }) => {
    const { isMobile, isTablet } = useDeviceDetection();
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
                const response = await api.get(`/reservations/${reservationId}/payments`);
                
                if (response.data && Array.isArray(response.data)) {
                    setLoadedPayments(response.data);
                } else if (response.data && response.data.payments && Array.isArray(response.data.payments)) {
                    setLoadedPayments(response.data.payments);
                } else {
                    setLoadedPayments([]);
                }
            } catch (err) {
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
            return 'Fecha inválida';
        }
    };

    // Normalizar los nombres de propiedades para diferentes formatos
    const normalizedPayments = loadedPayments.map(payment => ({
        id: payment.id,
        date: payment.paymentDate,
        method: payment.paymentMethod || 'N/A',
        reference: payment.notes || '-',
        amount: payment.amount || 0
    }));

    // Renderizado de tarjetas para móviles
    const renderMobileCards = () => {
        return (
            <Stack spacing={2}>
                {normalizedPayments.map((payment) => (
                    <Card key={payment.id} variant="outlined" sx={{ bgcolor: '#333', borderColor: '#555' }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: '#bbb' }}>
                                    Date
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                    {formatDate(payment.date)}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1, borderColor: '#555' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: '#bbb' }}>
                                    Method
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                    {payment.method}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1, borderColor: '#555' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="subtitle2" sx={{ color: '#bbb' }}>
                                    Reference
                                </Typography>
                                <Typography variant="body2" sx={{ wordBreak: 'break-word', maxWidth: '60%', textAlign: 'right', color: '#fff' }}>
                                    {payment.reference}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 1, borderColor: '#555' }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0 }}>
                                <Typography variant="subtitle2" sx={{ color: '#bbb' }}>
                                    Amount
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#fff' }}>
                                    {formatCurrency(payment.amount)}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    };

    return (
        <Card sx={{ bgcolor: '#2a2a2a', borderRadius: 2, mt: 3 }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#fff', fontWeight: 600 }}>
                    Payment History
                </Typography>
            
            {loading ? (
                isMobile || isTablet ? (
                    <Stack spacing={2}>
                        {[...Array(3)].map((_, idx) => (
                            <Card key={idx} variant="outlined" sx={{ bgcolor: '#333', borderColor: '#555' }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Skeleton variant="text" width="40%" sx={{ bgcolor: '#444' }} />
                                    <Divider sx={{ my: 1, borderColor: '#555' }} />
                                    <Skeleton variant="text" width="30%" sx={{ bgcolor: '#444' }} />
                                    <Divider sx={{ my: 1, borderColor: '#555' }} />
                                    <Skeleton variant="text" width="60%" sx={{ bgcolor: '#444' }} />
                                    <Divider sx={{ my: 1, borderColor: '#555' }} />
                                    <Skeleton variant="text" width="20%" sx={{ bgcolor: '#444' }} />
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                ) : (
                    <TableContainer sx={{ bgcolor: '#2a2a2a' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    {['Date','Method','Reference','Amount'].map((h) => (
                                        <TableCell key={h} sx={{ color: '#fff', borderColor: '#444' }}>
                                            <Skeleton variant="text" width={100} sx={{ bgcolor: '#444' }} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {[...Array(4)].map((_, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell sx={{ borderColor: '#444' }}><Skeleton variant="text" width={120} sx={{ bgcolor: '#444' }} /></TableCell>
                                        <TableCell sx={{ borderColor: '#444' }}><Skeleton variant="text" width={100} sx={{ bgcolor: '#444' }} /></TableCell>
                                        <TableCell sx={{ borderColor: '#444' }}><Skeleton variant="text" width={220} sx={{ bgcolor: '#444' }} /></TableCell>
                                        <TableCell align="right" sx={{ borderColor: '#444' }}><Skeleton variant="text" width={80} sx={{ bgcolor: '#444' }} /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            ) : error ? (
                <Alert severity="error" sx={{ mt: 2, mb: 2, bgcolor: '#4a2c2c', color: '#ffcdd2' }}>
                    {error}
                </Alert>
            ) : normalizedPayments.length === 0 ? (
                <Typography align="center" sx={{ py: 2, color: '#ccc' }}>
                    There are no payments recorded for this reservation.
                </Typography>
            ) : isMobile || isTablet ? (
                renderMobileCards()
            ) : (
                <TableContainer sx={{ bgcolor: '#2a2a2a' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', borderColor: '#444', fontWeight: 600 }}>Date</TableCell>
                                <TableCell sx={{ color: '#fff', borderColor: '#444', fontWeight: 600 }}>Method</TableCell>
                                <TableCell sx={{ color: '#fff', borderColor: '#444', fontWeight: 600 }}>Reference</TableCell>
                                <TableCell align="right" sx={{ color: '#fff', borderColor: '#444', fontWeight: 600 }}>Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {normalizedPayments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell sx={{ color: '#fff', borderColor: '#444' }}>{formatDate(payment.date)}</TableCell>
                                    <TableCell sx={{ color: '#fff', borderColor: '#444' }}>{payment.method}</TableCell>
                                    <TableCell sx={{ color: '#fff', borderColor: '#444' }}>{payment.reference}</TableCell>
                                    <TableCell align="right" sx={{ color: '#fff', borderColor: '#444' }}>
                                        {formatCurrency(payment.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            </CardContent>
        </Card>
    );
};

export default PaymentHistory;
