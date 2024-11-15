import React from 'react';
import { 
  Typography, 
  Container, 
  Box, 
  Grid, 
  Link, 
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import { Link as RouterLink } from 'react-router-dom';

import tiktokLogo from '../assets/tiktok-icon.svg';

const Footer = () => {
  const phoneNumber = import.meta.env.VITE_WHATSAPP_NUMBER;
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClick = () => {
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre sus servicios.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <Box 
      component="footer"
      sx={{ 
        bgcolor: '#262626',
        color: 'white',
        mt: 5,
        pt: 1,
        pb: 3
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo */}
          <Grid item xs={12}>
            <Box component="img" 
                 src="https://res.cloudinary.com/dcxa0ozit/image/upload/v1730483874/utils/logoSmoke.png" 
                 alt="logo" 
                 sx={{ height: 150, ml: -5 }}
            />
          </Grid>

          {/* Company Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary.light" gutterBottom>
              {t('footer.company')}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {[
                { text: t('footer.aboutUs'), path: '/about' },
                { text: t('footer.founder'), path: '/aboutFounder' },
                { text: t('footer.services'), path: '/services' },
              ].map((item) => (
                <li key={item.path}>
                  <Link
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    sx={{
                      display: 'block',
                      py: 0.5,
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.light' }
                    }}
                  >
                    {item.text}
                  </Link>
                </li>
              ))}
            </Box>
          </Grid>

          {/* Social Media */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary.light" gutterBottom>
              {t('footer.followUs')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link 
                href="https://www.instagram.com/miami.getaway/#" 
                target="_blank"
                color="inherit"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.light' }
                }}
              >
                <InstagramIcon sx={{ mr: 1 }} /> @Miami GetAway
              </Link>
              {/* <Link 
                href="https://facebook.com/luxuryservices" 
                target="_blank"
                color="inherit"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.light' }
                }}
              >
                <FacebookIcon sx={{ mr: 1 }} /> @luxuryservices
              </Link>
              <Link 
                href="https://tiktok.com/@luxuryservices" 
                target="_blank"
                color="inherit"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.light' }
                }}
              >
                <Box 
                  component="img" 
                  src={tiktokLogo} 
                  alt="TikTok"
                  sx={{ width: 24, height: 24, mr: 1, backgroundColor: '#ffffff' }}
                /> @luxuryservices
              </Link> */}
            </Box>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" color="primary.light" gutterBottom>
              {t('footer.contactUs')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Link 
                component="button"
                onClick={handleClick}
                color="inherit"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.light' }
                }}
              >
                <PhoneIcon sx={{ mr: 1 }} /> +{import.meta.env.VITE_WHATSAPP_NUMBER}
              </Link>
              <Link 
                href="mailto:boeroandboero@gmail.com"
                color="inherit"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.light' }
                }}
              >
                <EmailIcon sx={{ mr: 1 }} /> boeroandboero@gmail.com
              </Link>
              <Link 
                component="button"
                onClick={handleClick}
                color="inherit"
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  textDecoration: 'none',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  font: 'inherit',
                  '&:hover': { color: 'primary.light' }
                }}
              >
                <WhatsAppIcon sx={{ mr: 1 }} /> WhatsApp
              </Link>
            </Box>
          </Grid>          
        </Grid>

        {/* Copyright */}
        <Box 
          sx={{ 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            mt: 6,
            pt: 3,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="rgba(255, 255, 255, 0.7)">
            {t('footer.credit', { 
              defaultValue: 'Diseño web y programación de sitio web por Ignacio Aroza'
            })}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;