import React from 'react';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip
} from '@mui/material';

const ReservationsTable = ({ reservations }) => {
    if (!reservations || reservations.length === 0) {
        return (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ p: 2 }}>
                No reservations found for this period
            </Typography>
        );
    }

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'N/A';
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const formatAmount = (amount) => {
        try {
            if (amount === undefined || amount === null) return '$0.00';
            return `$${Number(amount).toFixed(2)}`;
        } catch (error) {
            console.error('Error formatting amount:', error);
            return '$0.00';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
                return 'success';
            case 'checked_in':
                return 'warning';
            case 'checked_out':
                return 'info';
            case 'pending':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Client</TableCell>
                        <TableCell>Apartment</TableCell>
                        <TableCell>Check In</TableCell>
                        <TableCell>Check Out</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {reservations.map((reservation) => (
                        <TableRow 
                            key={reservation?.id || Math.random()}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {`${reservation?.clientName || 'N/A'} ${reservation?.clientLastName || ''}`}
                            </TableCell>
                            <TableCell>{reservation?.apartmentName || 'N/A'}</TableCell>
                            <TableCell>
                                {formatDate(reservation?.checkInDate)}
                            </TableCell>
                            <TableCell>
                                {formatDate(reservation?.checkOutDate)}
                            </TableCell>
                            <TableCell align="right">
                                {formatAmount(reservation?.totalAmount)}
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    label={reservation?.status || 'Unknown'}
                                    color={getStatusColor(reservation?.status)}
                                    size="small"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ReservationsTable; 