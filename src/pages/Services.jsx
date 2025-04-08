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

// Definición estática de servicios para mostrar en la página principal
const services = [
  { id: 1, nameKey: 'services.types.cars', image: 'https://res.cloudinary.com/dbvpwfh07/image/upload/v1732024218/utils/Services/car.png', path: '/services/cars' },
  { id: 2, nameKey: 'services.types.yachts', image: 'https://res.cloudinary.com/dbvpwfh07/image/upload/v1732024229/utils/Services/yacht.png', path: '/services/yachts' },
  { id: 3, nameKey: 'services.types.apartments', image: 'https://res.cloudinary.com/dbvpwfh07/image/upload/v1732024735/utils/Services/apartment.png', path: '/services/apartments' },
  { id: 4, nameKey: 'services.types.villas', image: 'https://res.cloudinary.com/dbvpwfh07/image/upload/v1732024225/utils/Services/villa.png', path: '/services/villas' },
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