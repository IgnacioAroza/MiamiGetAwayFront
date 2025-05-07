import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid2, 
  TextField, 
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useTranslation } from 'react-i18next';
import { formatDateToString, formatDateForDisplay } from '../../utils/dateUtils';
import { enUS } from 'date-fns/locale';

import userService from '../../services/userService';

function BookingForm({ service }) {
  const { t } = useTranslation();
  const [openCalendar, setOpenCalendar] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [userData, setUserData] = useState({
    name: '',
    lastName: '',
    email: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Manejadores de cambio de fecha para usar el nuevo formato
  const handleStartDateChange = (date) => {
    if (date) {
      // Al seleccionar una fecha, convertirla a formato MM-DD-YYYY HH:mm
      const formattedDate = formatDateToString(date);
      setStartDate(formattedDate);
    } else {
      setStartDate(null);
    }
  };

  const handleEndDateChange = (date) => {
    if (date) {
      // Al seleccionar una fecha, convertirla a formato MM-DD-YYYY HH:mm
      const formattedDate = formatDateToString(date);
      setEndDate(formattedDate);
    } else {
      setEndDate(null);
    }
  };

  const resetForm = () => {
    setUserData({
      name: '',
      lastName: '',
      email: ''
    });
    setStartDate(null);
    setEndDate(null);
    setError('');
  };

  const handleSubmit = async (event) => {
    const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
    event.preventDefault();
    setError('');
    if (!userData.name || !userData.lastName || !userData.email) {
      setError(t('bookingForm.errors.incompleteFields'));
      return;
    }
    if (!startDate || !endDate) {
      setError(t('bookingForm.errors.selectDates'));
      return;
    }
    try {
      await userService.createUser(userData);
      // Formatear las fechas para mostrarlas en un formato más amigable para el mensaje
      const startDateFormatted = formatDateForDisplay(startDate, false); // sin hora
      const endDateFormatted = formatDateForDisplay(endDate, false); // sin hora
      
      const message =`Hola, me gustaría reservar ${service.name || `${service.brand} ${service.model}`} desde el ${startDateFormatted} hasta el ${endDateFormatted}. Mi nombre es ${userData.name} ${userData.lastName}.`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
      const mobileWhatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;

      window.location.href = mobileWhatsappUrl;

      setTimeout(() => {
        if (document.hidden) {
          console.log(userData);
        } else {
          window.location.href = whatsappUrl
        }
      }, 1000);

      resetForm();
    } catch (error) {
      console.error(t('bookingForm.errors.savingUserData'), error);
      setError(t('bookingForm.errors.tryAgain'));
    }
  };

  return (
    <Box sx={{ mt: 4, m: 4 }}>
      <Typography variant="h5" gutterBottom>{t('bookingForm.title')}</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid2 container spacing={2}>
        <Grid2 item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t('bookingForm.name')}
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            required
          />
        </Grid2>
        <Grid2 item xs={12} sm={6}>
          <TextField
            fullWidth
            label={t('bookingForm.lastName')}
            name="lastName"
            value={userData.lastName}
            onChange={handleInputChange}
            required
          />
        </Grid2>
        <Grid2 item xs={12}>
          <TextField
            fullWidth
            label={t('bookingForm.email')}
            name="email"
            type="email"
            value={userData.email}
            onChange={handleInputChange}
            required
          />
        </Grid2>
        <Grid2 item xs={12}>
          <Button variant="outlined" onClick={() => setOpenCalendar(true)}>
            {t('bookingForm.selectDates')}
          </Button>
        </Grid2>
        <Grid2 item xs={12}>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={!startDate || !endDate || !userData.name || !userData.lastName || !userData.email}
          >
            {t('bookingForm.reserve')}
          </Button>
        </Grid2>
      </Grid2>
      <Dialog open={openCalendar} onClose={() => setOpenCalendar(false)}>
        <DialogTitle>{t('bookingForm.selectReservationDates')}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enUS}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <DatePicker
                label={t('bookingForm.startDate')}
                // DatePicker espera un objeto Date, no un string
                value={startDate ? new Date(startDate) : null}
                onChange={handleStartDateChange}
                TextField={(params) => <TextField {...params} />}
                ampm={false} // Usar formato de 24 horas
              />
              <DatePicker
                label={t('bookingForm.endDate')}
                // DatePicker espera un objeto Date, no un string
                value={endDate ? new Date(endDate) : null}
                onChange={handleEndDateChange}
                TextField={(params) => <TextField {...params} />}
                ampm={false} // Usar formato de 24 horas
              />
            </Box>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCalendar(false)}>{t('general.cancel')}</Button>
          <Button onClick={() => setOpenCalendar(false)} color="primary">
            {t('general.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BookingForm;