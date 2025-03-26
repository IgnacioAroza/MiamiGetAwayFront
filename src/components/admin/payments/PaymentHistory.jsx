import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PaymentHistory = ({ payments }) => {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                Payment History
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Method</TableCell>
                            <TableCell>Reference</TableCell>
                            <TableCell align="right">Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payments.map((payment) => (
                            <TableRow key={payment.id}>
                                <TableCell>
                                    {format(new Date(payment.date), 'PPP', { locale: es })}
                                </TableCell>
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
        </Box>
    );
};

export default PaymentHistory;
