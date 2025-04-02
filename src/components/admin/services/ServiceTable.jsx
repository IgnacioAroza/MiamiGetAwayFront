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
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ServiceTable = ({ 
  selectedService,
  services = [],
  status,
  error,
  onEdit,
  onDelete
}) => {
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
    return <Typography align="center" sx={{ mt: 2 }}>No se encontraron elementos.</Typography>;
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

  return (
    <TableContainer component={Paper} sx={{ bgcolor: '#1e1e1e', mt: 4 }}>
      <Table size="small">
        <TableHead>
          {renderHeaders()}
        </TableHead>
        <TableBody>
          {services.map(renderRow)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ServiceTable; 