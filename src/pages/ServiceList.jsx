import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import ImageCarousel from '../components/images/ImageCarousel';
import WhatsAppIcon from '../components/WhatsAppIcon';

import carService from '../services/carService';
import apartmentService from '../services/apartmentService';
import yachtService from '../services/yachtService';
import villaService from '../services/villaService';

import { BathtubOutlined, BedOutlined } from '@mui/icons-material';

const MotionGrid = motion.create(Grid);
const MotionCard = motion.create(Card);

function ServiceList() {
  const { t } = useTranslation();
  const { type } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  useEffect(() => {
    const fetchServices = async () => {
      if (!type) {
        setError('Invalid service type');
        setLoading(false);
        return;
      }

      try {
        let data;
        switch (type) {
          case 'cars':
            data = await carService.getAllCars();
            break;
          case 'apartments':
            data = await apartmentService.getAllApartments();
            break;
          case 'yachts':
            data = await yachtService.getAllYachts();
            break;
          case 'villas':
            data = await villaService.getAllVillas();
            break;
          default:
            throw new Error(t('errors.invalidServiceType', { type }));
        }
        
        setServices(data);
      } catch (err) {
        console.error(t('errors.fetchingServices'), err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [t, type]);

  const renderServiceDetails = (service) => {
    switch (type) {
      case 'cars':
        return (
          <>
            <Typography sx={{ mb: 1 }} variant="h5" fontWeight= 'bold'>{`${service.brand} ${service.model}`}</Typography>
            <Typography>{t('services.description')}: {service.description}</Typography>
            <Typography sx={{ mt: 2, fontWeight: 'bold', variant: 'h6', fontSize: '1.3rem' }}>
              ${service.price ? parseFloat(service.price).toFixed(2) : t('general.notAvailable')}/{t('units.day')}
            </Typography>
          </>
        );
      case 'apartments':
      case 'villas':
        return (
          <>
            <Typography variant="h5" fontWeight= 'bold'>{service.name}</Typography>
            <Typography>{t('services.description')}: {service.description}</Typography>
            <Typography>{t('services.capacity')}: {service.capacity}</Typography>
            <Typography>{t('services.address')}: {service.address}</Typography>
            <Typography sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <BathtubOutlined sx={{ mr: 1 }} /> {service.bathrooms} {t('services.bathrooms')}
            </Typography>
            <Typography sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <BedOutlined sx={{ mr: 1 }} /> {service.rooms} {t('services.rooms')}
            </Typography>
            <Typography sx={{ mt: 2, fontWeight: 'bold', variant: 'h6', fontSize: '1.3rem' }}>
              ${service.price ? parseFloat(service.price).toFixed(2) : t('general.notAvailable')}/{t('units.day')}
            </Typography>
          </>
        );
      case 'yachts':
        return (
          <>
            <Typography variant="h5" fontWeight= 'bold'>{service.name}</Typography>
            <Typography>{t('services.description')}: {service.description} {t('units.feet')}</Typography>
            <Typography>{t('services.capacity')}: {service.capacity} {t('units.people')}</Typography>
            <Typography sx={{ mt: 2, fontWeight: 'bold', variant: 'h6', fontSize: '1.3rem' }}>
              ${service.price ? parseFloat(service.price).toFixed(2) : t('general.notAvailable')}/
              {type === 'yachts' ? t('units.hour') : t('units.day')}
            </Typography>
          </>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }} maxWidth="md">
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} maxWidth="md">
        <Typography color="error">{error}</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          {t('navigation.backToHome')}
        </Button>
      </Container>
    );
  };

  if (!services || services.length === 0) {
    return (
      <Container sx={{ py: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '20vw' }} maxWidth="md">
        <Typography>{t('services.noServicesFound')}</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          {t('navigation.backToHome')}
        </Button>
      </Container>
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

  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      <Typography component="h1" variant="h2" align="center" color="text.primary" fontWeight='400' gutterBottom>
        {t(`services.types.${type}`)}
      </Typography>
      <Grid container spacing={4} sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
        {services.map((service) => (
          <MotionGrid item xs={12} sm={6} md={4} key={service.id }
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            component={Link}
            to={`/services/${type}/${service.id}`}
            sx={{ textDecoration: 'none' }}
          >
            <MotionCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ImageCarousel 
              images={Array.isArray(service.images) ? service.images : [service.images]} 
              height={isMobile ? '250px' : isTablet ? '220px' : '250px'}
              width='95%'
              aspectRatio='16/9'
              />
              <CardContent sx={{ flexGrow: 1, mt: 2, ml: 2 }}>
                {renderServiceDetails(service)}
              </CardContent>
              <CardActions>
                <Button sx={{ ml: 2, mb: 2 }} size="mediun" component={Link} variant='outlined' to={`/services/${type}/${service.id}`}>{t('general.viewDetails')}</Button>
              </CardActions>
            </MotionCard>
          </MotionGrid>
        ))}
      </Grid>
      <WhatsAppIcon />
    </Container>
  );
}

export default ServiceList;