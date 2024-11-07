import React, { useState, useEffect } from 'react';
import { Container, Box, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

import WhatsAppIcon from '../components/WhatsAppIcon';

import Services from './Services';
import About from './About';
import Reviews from '../components/ReviewsManager';
import AboutFounder from '../components/AboutFounder';

const Home = () => {
  const theme = useTheme();
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [isLogoVisible, setIsLogoVisible] = useState(false);

  useEffect(() => {
    const backgroundImage = new Image();
    backgroundImage.src = "https://res.cloudinary.com/dcxa0ozit/image/upload/v1730482060/utils/backgrounImage.jpg";
    backgroundImage.onload = () => {
      setIsBackgroundLoaded(true);
      setTimeout(() => setIsLogoVisible(true), 1000);
    };
  }, []);

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        sx={{
          height: { xs: '60vh', sm: '80vh', md: '100vh' },
          width: '100%',
          backgroundImage: 'url("https://res.cloudinary.com/dcxa0ozit/image/upload/v1730482060/utils/backgrounImage.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          position: 'relative',
          opacity: isBackgroundLoaded ? 1 : 0,
          transition: 'opacity 2s ease-in-out',
        }}
      >
       <AnimatePresence>
          {isLogoVisible && (
            <motion.div
              initial={{ opacity: 50, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ 
                duration: 2.5, 
                ease: [0.6, 0.05, -0.01, 0.9],
                opacity: { duration: 2 }
              }}
            >
              <Container 
                sx={{
                  position: 'absolute',
                  top: '70%',
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

      <WhatsAppIcon phoneNumber={'1234567890'} />
    </Box>
  );
};

export default Home;