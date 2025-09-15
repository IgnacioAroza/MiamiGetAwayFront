import React, { useState } from 'react';
import { Box, Paper, Typography, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import { useTheme } from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { useReservationTrends } from '../../../hooks/useReservationTrends';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <Box
                sx={{
                    backgroundColor: 'background.paper',
                    p: 1.5,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    boxShadow: 1
                }}
            >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {label} {data.isCurrentMonth ? '(Current)' : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Total Bookings: <strong>{data.reservations}</strong>
                </Typography>
                {parseFloat(data.revenue) > 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Revenue: <strong>${data.revenue}</strong>
                    </Typography>
                )}
                {data.percentageChange && (
                    <Typography
                        variant="body2"
                        color={data.percentageChange === 'NO DATA' ? 'text.secondary' :
                            data.percentageChange === 'NEW' ? 'success.main' :
                                parseFloat(data.percentageChange) >= 0 ? 'success.main' : 'error.main'}
                    >
                        {data.percentageChange === 'NO DATA' ? 'No data available' :
                            data.percentageChange === 'NEW' ? 'New bookings!' :
                                parseFloat(data.percentageChange) >= 0 ?
                                    `↑ ${data.percentageChange}%` :
                                    `↓ ${Math.abs(parseFloat(data.percentageChange))}%`} vs prev month
                    </Typography>
                )}
            </Box>
        );
    }
    return null;
};

const BookingTrendsChart = ({ reservations }) => {
    const theme = useTheme();
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    
    // Generar opciones de años específicos (2023-2027)
    const yearOptions = [2023, 2024, 2025, 2026, 2027];
    
    const trendData = useReservationTrends(reservations, selectedYear);

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    // Crear los segmentos de color
    const segments = trendData.map((point, index) => {
        if (index === trendData.length - 1) return null;
        
        const nextPoint = trendData[index + 1];
        const isIncreasing = nextPoint.reservations >= point.reservations;
        
        return {
            from: index,
            to: index + 1,
            color: isIncreasing ? theme.palette.success.main : theme.palette.error.main
        };
    }).filter(Boolean);

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 2 
            }}>
                <Typography variant="h5" component="h2">
                    Booking Trends
                </Typography>
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={selectedYear}
                        onChange={handleYearChange}
                        label="Year"
                    >
                        {yearOptions.map((year) => (
                            <MenuItem key={year} value={year}>
                                {year}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={trendData}
                        margin={{
                            top: 5,
                            right: 20,
                            left: 10,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
                            tick={{ fontSize: 11 }}
                        />
                        <YAxis
                            tick={{ fontSize: 11 }}
                            allowDecimals={false}
                            domain={[0, 'auto']}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="reservations"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                            name="Reservations"
                            segments={segments}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default BookingTrendsChart; 