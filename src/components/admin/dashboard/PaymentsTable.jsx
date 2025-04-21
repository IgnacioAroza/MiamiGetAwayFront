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
    Typography
} from '@mui/material';

const PaymentsTable = ({ payments }) => {
    if (!payments || payments.length === 0) {
        return (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ p: 2 }}>
                No payments found for this period
            </Typography>
        );
    }

    const formatDate = (dateString) => {
        try {
            if (!dateString) return 'N/A';
            return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
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

    return (
        <TableContainer component={Paper} variant="outlined">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Client</TableCell>
                        <TableCell>Reservation ID</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Payment Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {payments.map((payment) => (
                        <TableRow 
                            key={payment?.id || Math.random()}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {`${payment?.clientName || 'N/A'} ${payment?.clientLastName || ''}`}
                            </TableCell>
                            <TableCell>
                                {payment?.reservationId ? `#${payment.reservationId}` : 'N/A'}
                            </TableCell>
                            <TableCell align="right">
                                {formatAmount(payment?.amount)}
                            </TableCell>
                            <TableCell>
                                {formatDate(payment?.paymentDate)}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default PaymentsTable; 