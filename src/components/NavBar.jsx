import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  Tooltip,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CarRentalIcon from '@mui/icons-material/CarRental';
import SailingIcon from '@mui/icons-material/Sailing';
import ApartmentIcon from '@mui/icons-material/Apartment';
import HouseIcon from '@mui/icons-material/House';
import PeopleIcon from '@mui/icons-material/People';
import ReviewsIcon from '@mui/icons-material/Reviews';

const Navbar = ({ selectedService, onServiceSelect, onLogout }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleServiceSelect = (service) => {
    onServiceSelect(service);
    handleClose();
  };

  const serviceIcons = {
    cars: <CarRentalIcon />,
    yachts: <SailingIcon />,
    apartments: <ApartmentIcon />,
    villas: <HouseIcon />,
    users: <PeopleIcon />,
    reviews: <ReviewsIcon />
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 0, mr: 2 }}>
          Admin Dashboard
        </Typography>
        {isMobile ? (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenu}
            >
              <MenuIcon />
            </IconButton>
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
              {Object.entries(serviceIcons).map(([service, icon]) => (
                <MenuItem key={service} onClick={() => handleServiceSelect(service)}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {icon}
                    <Typography sx={{ ml: 1 }}>{service.charAt(0).toUpperCase() + service.slice(1)}</Typography>
                  </Box>
                </MenuItem>
              ))}
              <MenuItem onClick={onLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {Object.entries(serviceIcons).map(([service, icon]) => (
                <Tooltip key={service} title={service.charAt(0).toUpperCase() + service.slice(1)}>
                  <IconButton
                    color={selectedService === service ? 'secondary' : 'inherit'}
                    onClick={() => onServiceSelect(service)}
                  >
                    {icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button color="inherit" onClick={onLogout}>Logout</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;