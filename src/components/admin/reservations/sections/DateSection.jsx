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
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <DateTimePicker
                    label="Check-in"
                    // Convertir el string a objeto Date para el componente
                    value={checkInDate ? parseStringToDate(checkInDate) : null}
                    onChange={handleDateChange('checkInDate')}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            sx: {
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#4A4747',
                                    borderRadius: 1,
                                    '& fieldset': { borderColor: '#717171' },
                                    '&:hover fieldset': { borderColor: '#717171' },
                                    '&.Mui-focused fieldset': { borderColor: '#717171' },
                                },
                                '& .MuiInputLabel-root': { 
                                    color: '#888',
                                    '&.Mui-focused': { color: '#888' }
                                },
                                '& .MuiOutlinedInput-input': { 
                                    color: '#fff',
                                    padding: '12px 16px'
                                },
                                '& .MuiSvgIcon-root': { color: '#ccc' },
                            }
                        },
                        popper: {
                            sx: {
                                '& .MuiPaper-root': {
                                    backgroundColor: '#333',
                                    color: '#fff',
                                },
                                '& .MuiPickersDay-root': {
                                    color: '#fff',
                                    '&:hover': { backgroundColor: '#444' },
                                    '&.Mui-selected': { 
                                        backgroundColor: '#555',
                                        color: '#fff'
                                    }
                                },
                                '& .MuiPickersCalendarHeader-root': {
                                    color: '#fff'
                                },
                                '& .MuiIconButton-root': {
                                    color: '#fff'
                                },
                                '& .MuiClock-root': {
                                    backgroundColor: '#333'
                                },
                                '& .MuiClockNumber-root': {
                                    color: '#fff'
                                }
                            }
                        }
                    }}
                    minDate={new Date()} // No permitir fechas en el pasado
                    ampm={false} // Usar formato de 24 horas en lugar de AM/PM
                />
            </Grid>

            <Grid item xs={6}>
                <DateTimePicker
                    label="Check-out"
                    // Convertir el string a objeto Date para el componente
                    value={checkOutDate ? parseStringToDate(checkOutDate) : null}
                    onChange={handleDateChange('checkOutDate')}
                    slotProps={{
                        textField: {
                            fullWidth: true,
                            sx: {
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: '#4A4747',
                                    borderRadius: 1,
                                    '& fieldset': { borderColor: '#717171' },
                                    '&:hover fieldset': { borderColor: '#717171' },
                                    '&.Mui-focused fieldset': { borderColor: '#717171' },
                                },
                                '& .MuiInputLabel-root': { 
                                    color: '#888',
                                    '&.Mui-focused': { color: '#888' }
                                },
                                '& .MuiOutlinedInput-input': { 
                                    color: '#fff',
                                    padding: '12px 16px'
                                },
                                '& .MuiSvgIcon-root': { color: '#ccc' },
                            }
                        },
                        popper: {
                            sx: {
                                '& .MuiPaper-root': {
                                    backgroundColor: '#333',
                                    color: '#fff',
                                },
                                '& .MuiPickersDay-root': {
                                    color: '#fff',
                                    '&:hover': { backgroundColor: '#444' },
                                    '&.Mui-selected': { 
                                        backgroundColor: '#555',
                                        color: '#fff'
                                    }
                                },
                                '& .MuiPickersCalendarHeader-root': {
                                    color: '#fff'
                                },
                                '& .MuiIconButton-root': {
                                    color: '#fff'
                                },
                                '& .MuiClock-root': {
                                    backgroundColor: '#333'
                                },
                                '& .MuiClockNumber-root': {
                                    color: '#fff'
                                }
                            }
                        }
                    }}
                    minDate={minCheckoutDate || new Date()} // Mínimo 1 día después del checkin o la fecha actual
                    disabled={!checkInDate} // Deshabilitar hasta seleccionar checkin
                    ampm={false} // Usar formato de 24 horas en lugar de AM/PM
                />
            </Grid>
        </Grid>
    );
};

export default DateSection;