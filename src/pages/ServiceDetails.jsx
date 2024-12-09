import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid2, Card, CardContent, Button, Box, useTheme, useMediaQuery, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

import ImageCarousel from '../components/images/ImageCarousel';
import BookingForm from '../components/form/BookingForm';
import WhatsAppButton from '../components/WhatsAppIcon';

import carService from '../services/carService';
import apartmentService from '../services/apartmentService';
import yachtService from '../services/yachtService';
import villaService from '../services/villaService';

import { BathtubOutlined, BedOutlined, DirectionsCar, LocationOn, People, Sailing } from '@mui/icons-material';

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
    const headingStyle = { fontSize: '1.5rem', fontWeight: 'bold' };
  
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h4" fontWeight="bold" textAlign="center" gutterBottom sx={{ ...headingStyle, fontSize: '2rem' }}>
        {type === 'cars' ? `${service.brand} ${service.model}` : service.name}
      </Typography>

      {(type === 'apartments' || type === 'villas') && (
        <>
          <Grid2 container spacing={2} alignItems="center">
            <Grid2 item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ fontSize: '1.5rem' }} />
                <Typography sx={textStyle}>{service.address}</Typography>
              </Box>
            </Grid2>
            <Grid2 item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People sx={{ fontSize: '1.5rem' }} />
                <Typography sx={textStyle}>
                  {t('services.capacity')}: {service.capacity} {t('units.people')}
                </Typography>
              </Box>
            </Grid2>
            <Grid2 item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BathtubOutlined sx={{ fontSize: '1.5rem' }} />
                <Typography sx={textStyle}>{service.bathrooms} {t('services.bathrooms')}</Typography>
              </Box>
            </Grid2>
            <Grid2 item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BedOutlined sx={{ fontSize: '1.5rem' }} />
                <Typography sx={textStyle}>{service.rooms} {t('services.rooms')}</Typography>
              </Box>
            </Grid2>
          </Grid2>
          <Divider />
        </>
      )}

      {type === 'cars' && (
          <>
            <Grid2 container spacing={2} alignItems="center">
              <Grid2 item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCar sx={{ fontSize: '1.5rem' }} />
                  <Typography sx={textStyle}>
                    {t('services.brand')}: {service.brand}
                  </Typography>
                </Box>
              </Grid2>
              <Grid2 item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCar sx={{ fontSize: '1.5rem' }} />
                  <Typography sx={textStyle}>
                    {t('services.model')}: {service.model}
                  </Typography>
                </Box>
              </Grid2>
            </Grid2>
            <Divider />
          </>
        )}

        {type === 'yachts' && (
          <>
            <Grid2 container spacing={2} alignItems="center">
              <Grid2 item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sailing sx={{ fontSize: '1.5rem' }} />
                  <Typography sx={textStyle}>
                    {t('services.capacity')}: {service.capacity} {t('units.people')}
                  </Typography>
                </Box>
              </Grid2>
            </Grid2>
            <Divider />
          </>
        )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom sx={headingStyle}>
          {t('services.description')}
        </Typography>
        <Typography sx={textStyle}>{service.description}</Typography>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        <Typography sx={{ mt: 2, fontWeight: 'bold', variant: 'h6', fontSize: '1.3rem' }}>
          ${service.price ? parseFloat(service.price).toFixed(2) : t('general.notAvailable')}/
          {type === 'yachts' ? t('units.hour') : t('units.day')}
        </Typography>
      </Box>
    </Box>
    );
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
    <Box sx={{ 
      py: 4, 
      minHeight: '100vh',
      mt: 8,
      bgcolor: 'background.default',
      color: 'text.primary'
    }}>
      <Container maxWidth="md">
        <MotionCard 
          sx={{ 
            width: '100%', 
            mb: 4,
            bgcolor: 'background.paper',
            borderRadius: 2,
            overflow: 'hidden'
          }}
          variants={{
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
          }}
          initial="hidden"
          animate="visible"
        >
          <ImageCarousel 
            images={Array.isArray(service.images) ? service.images : [service.images]} 
            width='95%' 
            height={isMobile ? '250px' : '480px'} 
            objectPosition='center center'
          />
          <CardContent sx={{ p: 4 }}>
            {renderServiceDetails()}
          </CardContent>
        </MotionCard>

        <BookingForm service={service} />

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={() => navigate(`/services/${type}`)}
          >
            {t('navigation.backTo', { type: t(`services.types.${type}`) })}
          </Button>
        </Box>
      </Container>
      <WhatsAppButton />
    </Box>
  );
}

export default ServiceDetails;