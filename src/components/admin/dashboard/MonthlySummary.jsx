import React from 'react';
import { useMonthlySummary } from '../../../hooks/useMonthlySummary';
import ReservationsTable from './ReservationsTable';
import PaymentsTable from './PaymentsTable';
import {
    Box,
    Paper,
    Typography,
    Select,
    MenuItem,
    Button,
    Grid,
    Alert,
    IconButton,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
];

const generateYearArray = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
        years.push(i);
    }
    return years;
};

const years = generateYearArray();

const MonthlySummary = () => {
    const {
        currentSummary,
        loading,
        error,
        success,
        pdfDownloading,
        emailSending,
        selectedMonth,
        selectedYear,
        handleMonthChange,
        handleYearChange,
        handleGenerateSummary,
        handleDownloadPDF,
        handleSendEmail,
        handleClearError,
        handleClearSuccess
    } = useMonthlySummary();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Extraer los valores del objeto summary
    const summaryData = currentSummary?.summary || {};
    const totalReservations = summaryData.totalReservations || 0;
    const totalPayments = summaryData.totalPayments || 0;
    const totalRevenue = summaryData.totalRevenue || 0;

    return (
        <Stack spacing={3}>
            <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4" component="h2">
                        Monthly Summary
                    </Typography>
                    <Box display="flex" gap={2}>
                        <Select
                            value={selectedMonth}
                            onChange={(e) => handleMonthChange(Number(e.target.value))}
                            size="small"
                        >
                            {months.map(month => (
                                <MenuItem key={month.value} value={month.value}>
                                    {month.label}
                                </MenuItem>
                            ))}
                        </Select>
                        <Select
                            value={selectedYear}
                            onChange={(e) => handleYearChange(Number(e.target.value))}
                            size="small"
                        >
                            {years.map(year => (
                                <MenuItem key={year} value={year}>
                                    {year}
                                </MenuItem>
                            ))}
                        </Select>
                    </Box>
                </Box>

                {error && (
                    <Alert 
                        severity="error" 
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={handleClearError}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                        sx={{ mb: 2 }}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert 
                        severity="success"
                        action={
                            <IconButton
                                aria-label="close"
                                color="inherit"
                                size="small"
                                onClick={handleClearSuccess}
                            >
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                        }
                        sx={{ mb: 2 }}
                    >
                        Operation successful
                    </Alert>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color="primary">
                                Total Reservations
                            </Typography>
                            <Typography variant="h4">
                                {totalReservations}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color="primary">
                                Total Payments
                            </Typography>
                            <Typography variant="h4">
                                {totalPayments}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6" color="primary">
                                Total Revenue
                            </Typography>
                            <Typography variant="h4">
                                {formatCurrency(totalRevenue)}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box display="flex" gap={2} mt={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGenerateSummary}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Summary'}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleDownloadPDF}
                        disabled={pdfDownloading}
                    >
                        {pdfDownloading ? 'Downloading...' : 'Download PDF'}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSendEmail}
                        disabled={emailSending}
                    >
                        {emailSending ? 'Sending...' : 'Send by Email'}
                    </Button>
                </Box>
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Reservations
                </Typography>
                <ReservationsTable reservations={currentSummary?.reservations || []} />
            </Paper>

            <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Payments
                </Typography>
                <PaymentsTable payments={currentSummary?.payments || []} />
            </Paper>
        </Stack>
    );
};

export default MonthlySummary; 