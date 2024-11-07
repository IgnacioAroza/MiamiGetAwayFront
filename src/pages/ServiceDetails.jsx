import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid2, Card, CardContent, Button, Box, useTheme, useMediaQuery } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import ImageCarousel from '../components/ImageCarousel';
import BookingForm from '../components/BookingForm';
import WhatsAppButton from '../components/WhatsAppIcon';

import carService from '../services/carService';
import apartmentService from '../services/apartmentService';
import yachtService from '../services/yachtService';
import villaService from '../services/villaService';

const MotionCard = motion.create(Card);
const MotionTypography = motion.create(Typography);

function ServiceDetails() {
  const { t } = useTranslation();
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchService = async () => {
      if (!type || !id) {
        setError('Invalid URL parameters');
        setLoading(false);
        return;
      }

      try {
        let data;
        switch (type) {
          case 'cars':
            data = await carService.getCarById(id);
            break;
          case 'apartments':
            data = await apartmentService.getApartmentById(id);
            break;
          case 'yachts':
            data = await yachtService.getYachtById(id);
            break;
          case 'villas':
            data = await villaService.getVillaById(id);
            break;
          default:
            throw new Error(t('errors.invalidServiceType', { type }));
        }
        setService(data);
      } catch (err) {
        console.error(t('errors.fetchingService'), err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [type, id, t]);

  const renderServiceDetails = () => {
    if (!service) return null;
  
    const textStyle = { fontSize: '1.2rem' };
  
    return (
      <>
        <Grid2 container spacing={2} direction="column" alignItems="center" justifyContent="center">
        {type === 'cars' && (
          <>
            <Grid2 item xs={12}>
              <Typography sx={textStyle}>{t('services.brand')}: {service.brand}</Typography>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography sx={textStyle}>{t('services.model')}: {service.model}</Typography>
            </Grid2>
          </>
        )}
        {(type === 'apartments' || type === 'villas') && (
          <>
            <Grid2 item xs={12}>
              <Typography sx={textStyle}>{t('services.name')}: {service.name}</Typography>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography sx={textStyle}>{t('services.address')}: {service.address}</Typography>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography sx={textStyle}>{t('services.capacity')}: {`${service.capacity} ${t('units.people')}`}</Typography>
            </Grid2>
          </>
        )}
        {type === 'yachts' && (
          <>
            <Grid2 item xs={12}>
              <Typography sx={textStyle}>{t('services.name')}: {service.name}</Typography>
            </Grid2>
            <Grid2 item xs={12}>
              <Typography sx={textStyle}>{t('services.capacity')}: {`${service.capacity} ${t('units.people')}`}</Typography>
            </Grid2>
          </>
        )}
      </Grid2>
  
        <Box sx={{ mt: 0, p: 2, borderRadius: '8px' }}>
          <Typography variant="h6" gutterBottom>{t('services.description')}</Typography>
          <Typography sx={{ fontSize: '1.2rem' }}>{service.description}</Typography>
        </Box>
      </>
    );
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15,
        mass: 1
      }
    }
  };
  

  if (loading) return <Typography>{t('general.loading')}</Typography>;
  if (error) return (
    <Container>
      <Typography color="error">{error}</Typography>
      <Button onClick={() => navigate('/')}>{t('navigation.backToHome')}</Button>
    </Container>
  );
  if (!service) return <Typography sx={{ mt: 10, ml: 4 }}>{t('services.noServiceFound')}</Typography>;

  return (
    <Box sx={{ py: 4, minHeight: '100vh', mt: 8  }}>
      <Container maxWidth="md">
        <MotionTypography component="h1" variant="h4" align="center" color="text.primary" gutterBottom
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {service.name || `${service.brand} ${service.model}`}
        </MotionTypography>
        <MotionCard sx={{ width: '100%', mb: 4 }}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <ImageCarousel 
            images={Array.isArray(service.images) ? service.images : [service.images]} 
            width='95%' 
            height={isMobile ? '250px' : '400px'} 
            objectPosition='center -12rem'
          />
          <CardContent>
            <Grid2 container spacing={2}>
              <Grid2 xs={12}>
                {renderServiceDetails()}
              </Grid2>
              <Grid2 xs={12} sx={{ ml: 2 }}>
                <Typography variant="h6" gutterBottom>{t('services.price')}</Typography>
                <Typography >${service.price ? parseFloat(service.price).toFixed(2) : t('general.notAvailable')}/{t('units.day')}</Typography>
              </Grid2>
            </Grid2>
          </CardContent>
        </MotionCard>
        <BookingForm service={service} />
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" onClick={() => navigate(`/services/${type}`)}>{t('navigation.backTo', { type: t(`services.types.${type}`) })}</Button>
        </Box>
      </Container>
      <WhatsAppButton phoneNumber={'1234567890'} />
    </Box>
  );
}

export default ServiceDetails;