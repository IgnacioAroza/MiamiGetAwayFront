import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Container,
  useTheme,
  useMediaQuery } from '@mui/material';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const services = [
  { id: 1, nameKey: 'services.types.cars', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', path: '/services/cars' },
  { id: 2, nameKey: 'services.types.yachts', image: 'https://images.unsplash.com/photo-1540946485063-a40da27545f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', path: '/services/yachts' },
  { id: 3, nameKey: 'services.types.apartments', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', path: '/services/apartments' },
  { id: 4, nameKey: 'services.types.villas', image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80', path: '/services/villas' },
];

const MotionGrid = motion.create(Grid);

const ServiceCard = ({ service, isMobile, isTablet, delay = 0.3 }) => {
  const { t } = useTranslation();
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.05,
  });

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <MotionGrid
      item
      xs={12} 
      sm={6} 
      md={6} 
      lg={3} 
      ref={ref}
      animate={inView ? "visible" : "hidden"}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } },
        hidden: { opacity: 0, y: 20 }
      }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Card 
        component={Link} 
        to={service.path} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)',
            boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
          },
          textDecoration:'none',
        }}
      >
        <CardMedia
          component="img"
          sx={{
            height: isMobile ? 100 : isTablet ? 140 : 210,
            objectFit: 'cover',
          }}
          image={service.image}
          alt={t(service.nameKey)}
        />
        <CardContent sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontSize: isMobile ? '1rem' : isTablet ? '1.1rem' : '1.25rem',
              flexGrow: 1,
              textAlign: 'center',
            }}
          >
            {t(service.nameKey)}
          </Typography>
        </CardContent>
      </Card>
    </MotionGrid>
  );
};

const Services = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  return (
    <Container maxWidth="xl" sx={{ mt: 10, overflow: 'hidden' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 6 }}>
        {t('services.title')}
      </Typography>
        <Grid
        container 
        spacing={2} 
        justifyContent="center" 
        sx={{ 
          pb: 4, 
        }}>
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              isMobile={isMobile}
              isTablet={isTablet}
              delay={index * 0.1}
            />
          ))}
        </Grid>
    </Container>
  );
};

export default Services;