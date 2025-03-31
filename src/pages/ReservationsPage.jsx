import React, { useState } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    Tabs, 
    Tab, 
    Paper
} from '@mui/material';
import ReservationList from '../components/admin/reservations/ReservationList';

const ReservationsPage = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Container maxWidth="xl">
            <Box py={3}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Gestión de Reservas
                </Typography>
                
                <Paper>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        centered
                    >
                        <Tab label="Todas las Reservas" />
                        <Tab label="Pendientes" />
                        <Tab label="Confirmadas" />
                        <Tab label="Completadas" />
                    </Tabs>
                    
                    <Box p={0}>
                        {tabValue === 0 && <ReservationList filter={{}} />}
                        {tabValue === 1 && <ReservationList filter={{ status: 'pending' }} />}
                        {tabValue === 2 && <ReservationList filter={{ status: 'confirmed' }} />}
                        {tabValue === 3 && <ReservationList filter={{ status: 'completed' }} />}
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default ReservationsPage; 