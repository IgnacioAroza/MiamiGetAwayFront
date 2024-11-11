import React, { useState, useEffect } from 'react';
import { Container, Box, useTheme, useMediaQuery } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import WhatsAppIcon from '../components/WhatsAppIcon';

import Services from './Services';
import About from './About';
import Reviews from '../components/ReviewsManager';
import AboutFounder from '../components/about/AboutFounder';
import ContactForm from '../components/form/ContactForm';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(false);

  useEffect(() => {
    const backgroundImage = new Image();
    backgroundImage.src = "https://res.cloudinary.com/dcxa0ozit/image/upload/v1730482060/utils/backgrounImage.jpg";
    backgroundImage.onload = () => {
      setIsBackgroundLoaded(true);
      setTimeout(() => setIsLogoVisible(true), 500);
    };
  }, []);

  const backgroundVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 2 } },
  };

  const logoVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { 
        duration: 1.5,
        ease: [0.6, 0.05, 0.01, 0.9],
      } 
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { 
        duration: 0.5,
        ease: [0.6, 0.05, 0.01, 0.9],
      }
    }
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <motion.div
        initial="hidden"
        animate={isBackgroundLoaded ? "visible" : "hidden"}
        variants={backgroundVariants} 
      >
      <Box
        sx={{
          height: { xs: '60vh', sm: '80vh', md: '100vh' },
          width: '100%',
          backgroundImage: 'url("https://res.cloudinary.com/dcxa0ozit/image/upload/v1730482060/utils/backgrounImage.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: isMobile ? 'scroll' : 'fixed',
          position: 'relative',
          opacity: isBackgroundLoaded ? 1 : 0,
          transition: 'opacity 2s ease-in-out',
        }}
      >
       <AnimatePresence>
          {isLogoVisible && (
            <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={logoVariants}
            style={{
              position: 'absolute',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
            }}
            >
              <Container 
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}
              >
                <Box 
                  component='img'
                  src='https://res.cloudinary.com/dcxa0ozit/image/upload/v1730483874/utils/logoSmoke.png'
                  alt='Miami Get Away Logo'
                  sx={{
                    maxWidth: '500px',
                    width: '100%',
                  }}
                />
              </Container>
          </motion.div>
          )}
        </AnimatePresence>
      </Box>
      </motion.div>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#1e1e1e',
      }}>
        <Container maxWidth="xl" sx={{ mt: -10 }}>
          <Services />
        </Container>
      </Box>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#121212',
      }}>
        <Container maxWidth="lg" sx={{ mt: -10 }}>
          <About />
        </Container>
      </Box>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#1e1e1e',
      }}>
        <Container sx={{ mt: -10 }}>
          <Reviews />
        </Container>
      </Box>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#121212',
      }}>
        <Container maxWidth="xl">
          <AboutFounder />
        </Container>
      </Box>

      <Box sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        backgroundColor: '#1e1e1e',
      }}>
        <Container sx={{ mt: -10 }}>
          <ContactForm />
        </Container>
      </Box>

      <WhatsAppIcon />
    </Box>
  );
};

export default Home;