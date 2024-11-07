import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Grid2, Card, CardContent, CardActions, Button, CircularProgress, useMediaQuery, useTheme } from '@mui/material';
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

const MotionGrid = motion.create(Grid2);
const MotionCard = motion.create(Card);

function ServiceList() {
  const { t } = useTranslation();
  const { type } = useParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
            <Typography sx={{ mb: 1 }} variant="h6">{`${service.brand} ${service.model}`}</Typography>
            <Typography>{t('services.description')}: {service.description}</Typography>
          </>
        );
      case 'apartments':
      case 'villas':
        return (
          <>
            <Typography variant="h6">{service.name}</Typography>
            <Typography>{t('services.description')}: {service.description}</Typography>
            <Typography>{t('services.capacity')}: {service.capacity}</Typography>
            <Typography>{t('services.address')}: {service.address}</Typography>
          </>
        );
      case 'yachts':
        return (
          <>
            <Typography variant="h6">{service.name}</Typography>
            <Typography>{t('services.description')}: {service.description} {t('units.feet')}</Typography>
            <Typography>{t('services.capacity')}: {service.capacity} {t('units.people')}</Typography>
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
      <Container sx={{ py: 8 }} maxWidth="md">
        <Typography color="error">{error}</Typography>
        <Button component={Link} to="/" variant="contained" sx={{ mt: 2 }}>
          {t('navigation.backToHome')}
        </Button>
      </Container>
    );
  };

  if (!services || services.length === 0) {
    return (
      <Container sx={{ py: 8 }} maxWidth="md">
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
      <Grid2 container spacing={4} sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
        {services.map((service) => (
          <MotionGrid item xs={12} sm={6} md={4} lg={3} key={service.id}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <MotionCard sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: 400 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ImageCarousel 
              images={Array.isArray(service.images) ? service.images : [service.images]} 
              height={isMobile ? '250px' : '270px'}
              width='95%'
              objectPosition='center auto'
              />
              <CardContent sx={{ flexGrow: 1, mt: 2, ml: 2 }}>
                {renderServiceDetails(service)}
                <Typography sx={{ mt: 2 }}>
                  ${service.price ? parseFloat(service.price).toFixed(2) : t('general.notAvailable')}/{t('units.day')}
                </Typography>
              </CardContent>
              <CardActions>
                <Button sx={{ ml: 2, mb: 2 }} size="small" component={Link} to={`/services/${type}/${service.id}`}>{t('general.viewDetails')}</Button>
              </CardActions>
            </MotionCard>
          </MotionGrid>
        ))}
      </Grid2>
      <WhatsAppIcon phoneNumber={'1234567890'} />
    </Container>
  );
}

export default ServiceList;