import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Grid } from '@mui/material';
import { fetchReservations } from '../../../redux/reservationSlice';
import StatsWidget from '../shared/StatsWidget';

const ReservationStats = () => {
    const dispatch = useDispatch();
    const { reservations } = useSelector(state => state.reservations);

    const stats = {
        onRent: reservations.filter(r => r.status === 'ON_RENT').length,
        getting: reservations.filter(r => r.status === 'GETTING').length,
        booked: reservations.filter(r => r.status === 'BOOKED').length,
        overbook: reservations.filter(r => r.status === 'OVERBOOK').length,
        returning: reservations.filter(r => r.status === 'RETURNING').length,
        overdue: reservations.filter(r => r.status === 'OVERDUE').length,
        pending: reservations.filter(r => r.status === 'PENDING').length,
        confirmed: reservations.filter(r => r.status === 'CONFIRMED').length,
        noShow: reservations.filter(r => r.status === 'NO_SHOW').length,
    };

    const getColorByStatus = (status) => {
        const colors = {
            onRent: '#4CAF50',      // Verde
            getting: '#2196F3',     // Azul
            booked: '#9C27B0',      // Morado
            overbook: '#F44336',    // Rojo
            returning: '#FF9800',   // Naranja
            overdue: '#D32F2F',     // Rojo oscuro
            pending: '#FFC107',     // Amarillo
            confirmed: '#8BC34A',   // Verde claro
            noShow: '#795548'       // Marrón
        };
        return colors[status.toLowerCase()] || '#757575'; // Gris por defecto
    };

    return (
        <Grid container spacing={2}>
            {Object.entries(stats).map(([key, value]) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
                    <StatsWidget 
                        title={key.toUpperCase()}
                        value={value}
                        color={getColorByStatus(key)}
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default ReservationStats;
