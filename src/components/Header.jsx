import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  useTheme, 
  useMediaQuery,
  Box
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LanguageIcon from '@mui/icons-material/Language';

import USFlag from '../assets/us-flag.svg';
import ESFlag from '../assets/es-flag.svg';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [langAnchorEl, setLangAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLangMenu = (event) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangClose = () => {
    setLangAnchorEl(null);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleLangClose();
  };

  const flagStyle = {
    width: '24px',
    height: '16px',
    marginRight: '8px',
    verticalAlign: 'middle'
  };

  return (
    <AppBar 
      position="fixed" 
      color="transparent" 
      elevation={0} 
      sx={{ 
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div">
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: isMobile ? '1.1rem' : '1.3rem' }}>
            {t('general.welcome')}
          </Link>
        </Typography>
        {isMobile ? (
          <>
            <Box>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label={t('navigation.language')}
                onClick={handleLangMenu}
                sx={{ mr: 2 }}
              >
                <LanguageIcon />
              </IconButton>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label={t('navigation.menu')}
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
            </Box>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose} component={Link} to="/services">{t('navigation.services')}</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/about">{t('navigation.about')}</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/aboutFounder">{t('navigation.aboutFounder')}</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/reviews">{t('navigation.reviews')}</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/contactUs">{t('navigation.contact')}</MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              color="inherit" 
              component={Link} 
              to="/services"
              sx={{ 
                mx: 1, 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.3s'
                } 
              }}
            >
              {t('navigation.services')}
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/about"
              sx={{ 
                mx: 1, 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.3s'
                } 
              }}
            >
              {t('navigation.about')}
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/reviews"
              sx={{ 
                mx: 1, 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.3s'
                } 
              }}
            >
              {t('navigation.reviews')}
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/aboutFounder"
              sx={{ 
                mx: 1, 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.3s'
                } 
              }}
            >
              {t('navigation.aboutFounder')}
            </Button>
            <Button 
              color="inherit" 
              component={Link} 
              to="/contactUs"
              sx={{ 
                mx: 1, 
                '&:hover': { 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transition: 'background-color 0.3s'
                } 
              }}
            >
              {t('navigation.contact')}
            </Button>
            <IconButton
              color="inherit"
              aria-label={t('navigation.language')}
              onClick={handleLangMenu}
              sx={{ ml: 1 }}
            >
              <LanguageIcon />
            </IconButton>
          </Box>
        )}
      </Toolbar>
      <Menu
        id="language-menu"
        anchorEl={langAnchorEl}
        open={Boolean(langAnchorEl)}
        onClose={handleLangClose}
        PaperProps={{
          sx: {
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1,
            },
          },
        }}
      >
        <MenuItem onClick={() => changeLanguage('en')}>
          <img src={USFlag} alt="US Flag" style={flagStyle} />
          English
        </MenuItem>
        <MenuItem onClick={() => changeLanguage('es')}>
          <img src={ESFlag} alt="ES Flag" style={flagStyle} />
          Español
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;