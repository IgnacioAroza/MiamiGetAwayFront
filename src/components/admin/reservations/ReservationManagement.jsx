import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Container, Grid, Paper } from '@mui/material';
import { fetchReservations, updateReservation, createReservation } from '../../../redux/reservationSlice';
import ReservationStats from './ReservationStats';
import ReservationForm from './ReservationForm';
import PaymentSummary from '../payments/PaymentSummary';

const ReservationManagement = () => {
    const dispatch = useDispatch();
    const { reservations, loading, error } = useSelector(state => state.reservations);
    const selectedReservation = useSelector(state => state.reservations.selectedReservation);

    useEffect(() => {
        dispatch(fetchReservations());
    }, [dispatch]);

    const handleReservationSubmit = (formData) => {
        if (selectedReservation) {
            dispatch(updateReservation({ id: selectedReservation.id, reservationData: formData }));
        } else {
            dispatch(createReservation(formData));
        }
    };

    return (
        <Container maxWidth="xl">
            <Box py={3}>
                <ReservationStats />
                <Grid container spacing={3} mt={2}>
                    <Grid item xs={12} md={8}>
                        <Paper elevation={3}>
                            <ReservationForm 
                                onSubmit={handleReservationSubmit}
                                initialData={selectedReservation}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper elevation={3}>
                            <PaymentSummary 
                                reservation={selectedReservation}
                            />
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default ReservationManagement;
