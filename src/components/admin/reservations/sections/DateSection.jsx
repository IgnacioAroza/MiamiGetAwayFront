import React from 'react';
import { Grid, TextField } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { formatDateToString, parseStringToDate } from '../../../../utils/dateUtils';

const DateSection = ({ checkInDate, checkOutDate, onDateChange }) => {
    // Calcular la fecha mínima para el checkout (1 día después del checkin)
    const checkInDateObj = checkInDate ? parseStringToDate(checkInDate) : null;
    const minCheckoutDate = checkInDateObj ? new Date(checkInDateObj.getTime() + 24*60*60*1000) : null;

    // Función para manejar cambios de fecha y convertirlos al nuevo formato string
    const handleDateChange = (field) => (date) => {
        if (date) {
            // Convertir la fecha seleccionada al formato MM-DD-YYYY HH:mm
            const formattedDate = formatDateToString(date);
            onDateChange(field)(formattedDate);
        } else {
            onDateChange(field)(null);
        }
    };

    return (
        <>
            <Grid item xs={12} md={6}>
                <DateTimePicker
                    label="Check-in"
                    // Convertir el string a objeto Date para el componente
                    value={checkInDate ? parseStringToDate(checkInDate) : null}
                    onChange={handleDateChange('checkInDate')}
                    TextField={(params) => <TextField {...params} fullWidth />}
                    minDate={new Date()} // No permitir fechas en el pasado
                    ampm={false} // Usar formato de 24 horas en lugar de AM/PM
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <DateTimePicker
                    label="Check-out"
                    // Convertir el string a objeto Date para el componente
                    value={checkOutDate ? parseStringToDate(checkOutDate) : null}
                    onChange={handleDateChange('checkOutDate')}
                    TextField={(params) => <TextField {...params} fullWidth />}
                    minDate={minCheckoutDate || new Date()} // Mínimo 1 día después del checkin o la fecha actual
                    disabled={!checkInDate} // Deshabilitar hasta seleccionar checkin
                    ampm={false} // Usar formato de 24 horas en lugar de AM/PM
                />
            </Grid>
        </>
    );
};

export default DateSection;