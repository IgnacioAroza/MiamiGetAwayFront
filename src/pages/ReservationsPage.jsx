import React from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Paper
} from '@mui/material';
import ReservationList from '../components/admin/reservations/ReservationList';

const ReservationsPage = () => {
    return (
        <Container maxWidth="xl">
            <Box py={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Gestión de Reservas
                </Typography>
                
                <Paper>
                    <Box p={0}>
                        <ReservationList filter={{}} />
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default ReservationsPage; 