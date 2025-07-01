import React from 'react';
import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import useDeviceDetection from '../../../hooks/useDeviceDetection';

const ServiceTable = ({ 
  selectedService,
  services = [],
  status,
  error,
  onEdit,
  onDelete
}) => {
  const { isMobile } = useDeviceDetection();

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'failed') {
    return (
      <Typography color="error" align="center" sx={{ mt: 2 }}>
        Error: {error}
      </Typography>
    );
  }

  if (services.length === 0) {
    return <Typography align="center" sx={{ mt: 2 }}>No items found.</Typography>;
  }

  const renderHeaders = () => {
    const headers = {
      cars: ['Brand', 'Model', 'Description', 'Price', 'Images', 'Actions'],
      yachts: ['Name', 'Description', 'Capacity', 'Price', 'Images', 'Actions'],
      apartments: ['Name', 'Description', 'Unit Number', 'Address', 'Capacity', 'Bathrooms', 'Bedrooms', 'Price', 'Images', 'Actions'],
      villas: ['Name', 'Description', 'Address', 'Capacity', 'Bathrooms', 'Bedrooms', 'Price', 'Images', 'Actions']
    };

    return (
      <TableRow>
        {(headers[selectedService] || []).map((header) => (
          <TableCell key={header}>{header}</TableCell>
        ))}
      </TableRow>
    );
  };

  const renderRow = (service) => {
    const renderCells = {
      cars: () => (
        <>
          <TableCell>{service.brand}</TableCell>
          <TableCell>{service.model}</TableCell>
          <TableCell>{service.description}</TableCell>
          <TableCell>${service.price}</TableCell>
          <TableCell>{service.images?.length || 0} images</TableCell>
        </>
      ),
      yachts: () => (
        <>
          <TableCell>{service.name}</TableCell>
          <TableCell>{service.description}</TableCell>
          <TableCell>{service.capacity}</TableCell>
          <TableCell>${service.price}</TableCell>
          <TableCell>{service.images?.length || 0} images</TableCell>
        </>
      ),
      apartments: () => (
        <>
          <TableCell>{service.name}</TableCell>
          <TableCell>{service.description}</TableCell>
          <TableCell>{service.unitNumber}</TableCell>
          <TableCell>{service.address}</TableCell>
          <TableCell>{service.capacity}</TableCell>
          <TableCell>{service.bathrooms}</TableCell>
          <TableCell>{service.rooms}</TableCell>
          <TableCell>${service.price}</TableCell>
          <TableCell>{service.images?.length || 0} images</TableCell>
        </>
      ),
      villas: () => (
        <>
          <TableCell>{service.name}</TableCell>
          <TableCell>{service.description}</TableCell>
          <TableCell>{service.address}</TableCell>
          <TableCell>{service.capacity}</TableCell>
          <TableCell>{service.bathrooms}</TableCell>
          <TableCell>{service.rooms}</TableCell>
          <TableCell>${service.price}</TableCell>
          <TableCell>{service.images?.length || 0} images</TableCell>
        </>
      )
    };

    const RenderCells = renderCells[selectedService] || renderCells.apartments;

    return (
      <TableRow key={service.id}>
        <RenderCells />
        <TableCell>
          <Button startIcon={<EditIcon />} onClick={() => onEdit(service)}>
            Edit
          </Button>
          <Button startIcon={<DeleteIcon />} onClick={() => onDelete(service)}>
            Delete
          </Button>
        </TableCell>
      </TableRow>
    );
  };

  // Función para renderizar tarjetas en la vista móvil
  const renderMobileCards = () => {
    return (
      <Grid container spacing={2}>
        {services.map((service) => {
          switch (selectedService) {
            case 'cars':
              return renderCarCard(service);
            case 'yachts':
              return renderYachtCard(service);
            case 'apartments':
              return renderPropertyCard(service, true);
            case 'villas':
              return renderPropertyCard(service, false);
            default:
              return renderPropertyCard(service, false);
          }
        })}
      </Grid>
    );
  };

  // Tarjetas para cada tipo de servicio
  const renderCarCard = (car) => (
    <Grid item xs={12} key={car.id}>
      <Card sx={{ bgcolor: '#1e1e1e', boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6">{car.brand} {car.model}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
            {car.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip label={`$${car.price}`} color="primary" />
            <Chip label={`${car.images?.length || 0} images`} sx={{ ml: 1 }} />
          </Box>
        </CardContent>
        <CardActions>
          <Button startIcon={<EditIcon />} onClick={() => onEdit(car)}>
            Edit
          </Button>
          <Button startIcon={<DeleteIcon />} onClick={() => onDelete(car)}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderYachtCard = (yacht) => (
    <Grid item xs={12} key={yacht.id}>
      <Card sx={{ bgcolor: '#1e1e1e', boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6">{yacht.name}</Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
            {yacht.description}
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Chip label={`Capacity: ${yacht.capacity}`} sx={{ mr: 1 }} />
            <Chip label={`$${yacht.price}`} color="primary" />
            <Chip label={`${yacht.images?.length || 0} images`} sx={{ ml: 1 }} />
          </Box>
        </CardContent>
        <CardActions>
          <Button startIcon={<EditIcon />} onClick={() => onEdit(yacht)}>
            Edit
          </Button>
          <Button startIcon={<DeleteIcon />} onClick={() => onDelete(yacht)}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const renderPropertyCard = (property, isApartment) => (
    <Grid item xs={12} key={property.id}>
      <Card sx={{ bgcolor: '#1e1e1e', boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6">{property.name}</Typography>
          
          {isApartment && property.unitNumber && (
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Unit: {property.unitNumber}
            </Typography>
          )}
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {property.address}
          </Typography>
          
          <Divider sx={{ my: 1 }} />
          
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            <Chip label={`${property.capacity} guests`} size="small" />
            <Chip label={`${property.rooms} bedrooms`} size="small" />
            <Chip label={`${property.bathrooms} bathrooms`} size="small" />
          </Stack>
          
          <Typography variant="body2" color="text.secondary" noWrap>
            {property.description}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Chip label={`$${property.price}`} color="primary" />
            <Chip label={`${property.images?.length || 0} images`} sx={{ ml: 1 }} />
          </Box>
        </CardContent>
        <CardActions>
          <Button startIcon={<EditIcon />} onClick={() => onEdit(property)}>
            Edit
          </Button>
          <Button startIcon={<DeleteIcon />} onClick={() => onDelete(property)}>
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  return (
    <Box sx={{ mt: 4 }}>
      {isMobile ? (
        // Vista móvil: Tarjetas
        renderMobileCards()
      ) : (
        // Vista desktop: Tabla completa
        <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e' }}>
          <Table size="small">
            <TableHead>
              {renderHeaders()}
            </TableHead>
            <TableBody>
              {services.map(renderRow)}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ServiceTable;