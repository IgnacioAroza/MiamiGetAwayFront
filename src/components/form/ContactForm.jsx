import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Grid, 
  Snackbar,
  Alert
} from "@mui/material";
import { useTranslation } from "react-i18next";
import emailjs from '@emailjs/browser';

export default function ContactForm() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    e.preventDefault();
    setIsLoading(true);

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          from_name: `${formData.firstName} ${formData.lastName}`,
          from_email: formData.email,
          phone: formData.phone,
          message: formData.message,
        },
        publicKey
      );

      console.log();

      setSnackbarMessage("Mensaje enviado. Nos pondremos en contacto contigo pronto.");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: ""
      });
    } catch (error) {
      console.error('Error al enviar el email:', error);
      setSnackbarMessage("Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Card sx={{ maxWidth: '4xl', mx: 'auto', mt: 10 }}>
      <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
        <Typography variant="h4" component="h1" gutterBottom color="text.primary">
          {t('contactUs.title')}
        </Typography>
        <Typography variant="subtitle1" gutterBottom color="text.secondary">
          {t('contactUs.subtitle')}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="firstName"
                label={t('contactUs.name')}
                value={formData.firstName}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="lastName"
                label={t('contactUs.lastName')}
                value={formData.lastName}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="email"
                type="email"
                label={t('contactUs.email')}
                value={formData.email}
                onChange={handleChange}
                required
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="phone"
                type="tel"
                label={t('contactUs.phone')}
                value={formData.phone}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="message"
                label={t('contactUs.message')}
                value={formData.message}
                onChange={handleChange}
                required
                multiline
                rows={4}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  bgcolor: 'warning.main',
                  color: 'common.black',
                  '&:hover': {
                    bgcolor: 'warning.dark',
                  },
                }}
              >
                {isLoading ? t('contactUs.sending') : t('contactUs.send')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Card>
  );
}