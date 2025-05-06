import React from 'react';
import { Grid, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const DateSection = ({ checkInDate, checkOutDate, onDateChange }) => {
    // Calcular la fecha mínima para el checkout (1 día después del checkin)
    const minCheckoutDate = checkInDate ? new Date(checkInDate.getTime() + 24*60*60*1000) : null;

    // Función para convertir fechas a UTC
    const handleDateChangeUTC = (field) => (date) => {
        if (date) {
            const utcDate = new Date(Date.UTC(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                date.getHours(),
                date.getMinutes(),
                date.getSeconds()
            ));
            onDateChange(field)(utcDate);
        } else {
            onDateChange(field)(null);
        }
    };

    return (
        <>
            <Grid item xs={12} md={6}>
                <DateTimePicker
                    label="Check-in"
                    value={checkInDate ? new Date(checkInDate) : null} // Asegurar que se use la fecha exacta del servidor
                    onChange={handleDateChangeUTC('checkInDate')}
                    TextField={(params) => <TextField {...params} fullWidth />}
                    minDate={new Date()} // No permitir fechas en el pasado
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <DateTimePicker
                    label="Check-out"
                    value={checkOutDate}
                    onChange={onDateChange('checkOutDate')}
                    TextField={(params) => <TextField {...params} fullWidth />}
                    minDate={minCheckoutDate || new Date()} // Mínimo 1 día después del checkin o la fecha actual
                    disabled={!checkInDate} // Deshabilitar hasta seleccionar checkin
                />
            </Grid>
        </>
    );
};

export default DateSection;